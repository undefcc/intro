import { AGENT_SYSTEM_PROMPT, AGENT_FUNCTIONS, executeFunctionCall } from '@/lib/ai-agent-config'

type Message = {
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string
  name?: string
  function_call?: any
}

export async function POST(req: Request) {
  try {
    const { prompt, messages: historyMessages } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return new Response('Invalid prompt', { status: 400 })
    }

    const apiKey = process.env.AI_302_API_KEY
    if (!apiKey) {
      return new Response('API key not configured', { status: 500 })
    }

    const encoder = new TextEncoder()

    // 构建消息历史，包含 system prompt
    const messages: Message[] = [
      {
        role: 'system',
        content: AGENT_SYSTEM_PROMPT
      },
      // 如果有历史消息，添加进来
      ...(historyMessages || []),
      {
        role: 'user',
        content: prompt
      }
    ]

    // 调用 302.AI Deepseek API，启用 tool calling
    const response = await fetch('https://api.302.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        tools: AGENT_FUNCTIONS.map(fn => ({
          type: 'function',
          function: fn
        })),
        tool_choice: 'auto', // 让模型自动决定是否调用工具
        stream: true
      })
    })

    if (!response.ok) {
      return new Response(`API error: ${response.statusText}`, { status: response.status })
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        controller.enqueue(encoder.encode('event: start\ndata: stream-begin\n\n'))

        let toolCallBuffer = { name: '', arguments: '' }
        let isToolCall = false

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // 如果是 tool call，需要将结果发送回 AI 让它继续生成回答
                  if (isToolCall && toolCallBuffer.name) {
                    console.log('[Tool Call] 开始执行工具:', toolCallBuffer.name)
                    console.log('[Tool Call] 参数:', toolCallBuffer.arguments)
                    try {
                      const args = JSON.parse(toolCallBuffer.arguments || '{}')
                      const result = executeFunctionCall(toolCallBuffer.name, args)
                      console.log('[Tool Call] 执行成功，结果大小:', JSON.stringify(result).length, '字符')
                      
                      // 构建新的消息，包含工具调用结果
                      const messagesWithToolResult = [
                        ...messages,
                        {
                          role: 'assistant' as const,
                          content: null,
                          tool_calls: [{
                            id: 'call_' + Date.now(),
                            type: 'function' as const,
                            function: {
                              name: toolCallBuffer.name,
                              arguments: toolCallBuffer.arguments
                            }
                          }]
                        },
                        {
                          role: 'tool' as const,
                          tool_call_id: 'call_' + Date.now(),
                          content: JSON.stringify(result)
                        }
                      ]
                      
                      // 重新调用 API，让 AI 基于结果生成友好的回答
                      console.log('[Tool Call] 发送工具结果给 AI，等待生成友好回答...')
                      const followUpResponse = await fetch('https://api.302.ai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                          'Accept': 'application/json',
                          'Authorization': `Bearer ${apiKey}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          model: 'deepseek-chat',
                          messages: messagesWithToolResult,
                          stream: true
                        })
                      })
                      
                      if (followUpResponse.ok && followUpResponse.body) {
                        const followUpReader = followUpResponse.body.getReader()
                        const followUpDecoder = new TextDecoder()
                        let followUpBuffer = ''
                        
                        while (true) {
                          const { done: followUpDone, value: followUpValue } = await followUpReader.read()
                          if (followUpDone) break
                          
                          followUpBuffer += followUpDecoder.decode(followUpValue, { stream: true })
                          const followUpEvents = followUpBuffer.split(/\n\n/)
                          followUpBuffer = followUpEvents.pop() || ''
                          
                          for (const evt of followUpEvents) {
                            const lines = evt.split(/\n/)
                            const dataLine = lines.find(l => l.startsWith('data:'))
                            if (!dataLine) continue
                            
                            const payload = dataLine.replace(/^data:\s?/, '')
                            if (payload === '[DONE]') break
                            
                            try {
                              const json = JSON.parse(payload)
                              const content = json.choices?.[0]?.delta?.content
                              if (content) {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`))
                              }
                            } catch (e) {
                              // 忽略解析错误
                            }
                          }
                        }
                      }
                    } catch (e: any) {
                      console.error('[Tool Call] 执行失败:', e.message)
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(`\n[工具调用错误: ${e.message}]`)}\n\n`))
                    }
                  } else if (isToolCall) {
                    console.log('[Tool Call] 未触发工具调用 (isToolCall=false)')
                  }
                  
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  break
                }

                try {
                  const json = JSON.parse(data)
                  const delta = json.choices?.[0]?.delta
                  
                  // 检查是否有 tool_calls (新版 API)
                  if (delta?.tool_calls?.[0]) {
                    if (!isToolCall) {
                      console.log('[Tool Call] 触发工具调用 (tool_calls)')
                    }
                    isToolCall = true
                    const toolCall = delta.tool_calls[0]
                    if (toolCall.function?.name) {
                      toolCallBuffer.name = toolCall.function.name
                      console.log('[Tool Call] 工具名称:', toolCallBuffer.name)
                    }
                    if (toolCall.function?.arguments) {
                      toolCallBuffer.arguments += toolCall.function.arguments
                    }
                  }
                  // 兼容旧版 function_call
                  else if (delta?.function_call) {
                    if (!isToolCall) {
                      console.log('[Tool Call] 触发工具调用 (function_call)')
                    }
                    isToolCall = true
                    if (delta.function_call.name) {
                      toolCallBuffer.name = delta.function_call.name
                      console.log('[Tool Call] 工具名称:', toolCallBuffer.name)
                    }
                    if (delta.function_call.arguments) {
                      toolCallBuffer.arguments += delta.function_call.arguments
                    }
                  }
                  
                  // 正常内容
                  const content = delta?.content
                  if (content && !isToolCall) {
                    const escapedContent = JSON.stringify(content)
                    controller.enqueue(encoder.encode(`data: ${escapedContent}\n\n`))
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
        } catch (e) {
          console.error('Stream error:', e)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      }
    })
  } catch (e: any) {
    return new Response('Error: ' + e.message, { status: 500 })
  }
}
