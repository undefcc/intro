"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Bot, FileCode, SendIcon, Square } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Conversation, ConversationContent } from '@/components/ui/shadcn-io/ai/conversation'
import { Message as AIMessage, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit
} from '@/components/ui/shadcn-io/ai/prompt-input'
import { Response } from '@/components/ui/shadcn-io/ai/response'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
  isRetryable?: boolean
  lastEventId?: string  // SSE 断点续传的 ID
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 你好！我是 cc 的 AI 助手。

我可以帮你了解：
- cc 的技术栈和专业技能
- 他参与的项目和作品
- 技术博客和学习笔记
- 开源工具和贡献

试试问我：
- "介绍一下 cc 的项目经验"
- "cc 擅长什么技术？"
- "有哪些微信小程序项目？"
- "推荐一些博客文章"`
}

const EXAMPLE_QUESTIONS = [
  "介绍一下 cc",
  "有哪些项目？",
  "擅长什么技术？",
  "如何联系？"
]

export default function ChatDialog() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [retryInfo, setRetryInfo] = useState<{messageId: string, prompt: string, lastEventId?: string} | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const sendingRef = useRef(false)

  function cancelStreaming() {
    abortRef.current?.abort()
    abortRef.current = null
    sendingRef.current = false
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent, retryMessageId?: string, lastEventId?: string) {
    e?.preventDefault()
    if (!input.trim() && !retryMessageId) return
    if (loading || sendingRef.current) return
    
    let userMsg: Message
    let assistantId: string
    
    if (retryMessageId) {
      // 重试模式：查找原始消息
      const msgIndex = messages.findIndex(m => m.id === retryMessageId)
      if (msgIndex === -1) return
      
      // 找到对应的用户消息
      userMsg = messages[msgIndex - 1] as Message
      assistantId = retryMessageId
      
      // 重试时清空错误内容，保留断点续传的内容
      setMessages(prev => prev.map(m => {
        if (m.id === assistantId) {
          // 如果有 lastEventId 说明是断点续传，保留内容；否则清空
          const retainedContent = lastEventId ? m.content : ''
          return { ...m, isError: false, isRetryable: false, content: retainedContent }
        }
        return m
      }))
    } else {
      // 正常发送模式
      userMsg = { id: Date.now() + '_u', role: 'user', content: input.trim() }
      assistantId = Date.now() + '_a'
      setMessages(prev => [...prev, userMsg])
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
      setInput('')
    }
    
    setLoading(true)
    sendingRef.current = true
    const encoder = new TextDecoder()
    // 断点续传时保留已有内容，否则从空开始
    let acc = lastEventId ? (messages.find(m => m.id === assistantId)?.content || '') : ''
    let currentEventId = lastEventId || ''
    
    try {
      const controller = new AbortController()
      abortRef.current = controller
      
      // 构建历史消息（排除欢迎消息和当前用户消息）
      const historyMessages = messages
        .filter(m => m.id !== 'welcome') // 排除欢迎消息
        .map(m => ({ role: m.role, content: m.content }))
      
      // 构建请求头，如果有 lastEventId 则添加
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (lastEventId) {
        headers['Last-Event-ID'] = lastEventId
      }
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          prompt: userMsg.content,
          messages: historyMessages.length > 0 ? historyMessages : undefined,
          lastEventId: lastEventId  // 传递给后端用于断点续传
        }),
        signal: controller.signal
      })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += encoder.decode(value, { stream: true })
        // SSE 按空行分隔事件
        const events = buffer.split(/\n\n/)
        // 保留最后一个可能未完整的片段
        buffer = events.pop() || ''
        for (const evt of events) {
          const lines = evt.split(/\n/) // 可能包含 event: / data: / id:
          
          // 解析 SSE 字段
          let eventId: string | undefined
          let dataLine = lines.find(l => l.startsWith('data:'))
          const idLine = lines.find(l => l.startsWith('id:'))
          
          if (idLine) {
            eventId = idLine.replace(/^id:\s?/, '')
            currentEventId = eventId  // 更新当前事件 ID
          }
          
          if (!dataLine) continue
          const payload = dataLine.replace(/^data:\s?/, '')
          if (payload === '[DONE]') {
            buffer = ''
            setRetryInfo(null)  // 成功完成，清除重试信息
            break
          }
          // 忽略 start 事件载荷 stream-begin
          if (payload === 'stream-begin') continue
          
          // 解析 JSON 字符串以获取原始内容（包括换行符）
          let actualContent = payload
          try {
            // 如果 payload 是 JSON 字符串，解析它
            if (payload.startsWith('"') && payload.endsWith('"')) {
              actualContent = JSON.parse(payload)
            }
          } catch (e) {
            // 如果解析失败，使用原始 payload
            actualContent = payload
          }
          
          acc += actualContent
          setMessages(prev => prev.map(m => 
            m.id === assistantId ? { ...m, content: acc, lastEventId: currentEventId } : m
          ))
        }
      }
    } catch (e: any) {
      const isNetworkError = e.name === 'AbortError' || e.message.includes('network') || e.message.includes('fetch')
      
      // 保存重试信息（无论是否有 eventId，只要是网络错误就可以重试）
      if (isNetworkError) {
        setRetryInfo({
          messageId: assistantId,
          prompt: userMsg.content,
          lastEventId: currentEventId || undefined  // 如果没有收到任何事件，则为 undefined
        })
      }
      
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { 
          ...m, 
          content: acc,  // 保留已接收的内容
          isError: true,
          isRetryable: isNetworkError,
          lastEventId: currentEventId || undefined
        } : m
      ))
    } finally {
      setLoading(false)
      sendingRef.current = false
      abortRef.current = null
    }
  }
  
  // 重试函数
  function handleRetry(messageId: string) {
    const msg = messages.find(m => m.id === messageId)
    if (!msg || !retryInfo) return
    
    handleSubmit(null as any, messageId, msg.lastEventId)
  }

  const injectDemo = () => {
    const demo = `## Markdown 测试

**粗体**、_斜体_、~~删除线~~、以及 \`inline code\`。

### 列表
- 项目 A
- 项目 B
- 项目 C

---

### 个人每周运动计划

| 星期 | 运动项目 | 时长 (分钟) | 完成情况 |
| :--- | :--- | :--- | :--- |
| 周一 | 慢跑 | 30 | ✅ |
| 周二 | 瑜伽 | 45 | ✅ |
| 周三 | 游泳 | 60 | ❌ |
| 周四 | 休息 | 0 | ✅ |
| 周五 | 力量训练 | 40 | ⏳ |
| 周六 | 骑行 | 90 | ❌ |
| 周日 | 徒步 | 120 | ⏳ |

---

### 代码块 (ts)

\`\`\`ts
function greet(name: string): string {
  return 'Hello ' + name.toUpperCase()
}
console.log(greet('world'))
\`\`\`

### 代码块 (bash)

\`\`\`bash
# 安装依赖
npm install react-markdown remark-gfm

# 运行开发服务器
npm run dev
\`\`\`

> 引用：这是一个引用区块。

完成。`
    const assistantMsg: Message = { id: Date.now() + '_demo', role: 'assistant', content: demo }
    setMessages(prev => [...prev, assistantMsg])
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0" aria-label="Open AI Chat">
          <Bot />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl h-[85vh] flex flex-col gap-0 p-0">
        <div className="flex-shrink-0 px-6 pt-6 pb-3 border-b">
          <DialogTitle>CC's AI助手🤖</DialogTitle>
          <DialogDescription className="text-xs mt-1">
            我是 cc 的个人 AI 智能体，可以帮你了解他的项目、技能和经验
          </DialogDescription>
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {EXAMPLE_QUESTIONS.map((question, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => {
                    setInput(question)
                  }}
                  disabled={loading}
                >
                  {question}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <Conversation className="flex-1 min-h-0">
            <ConversationContent className="p-4">
              {messages.map(m => (
                <AIMessage key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === 'assistant' ? (
                      <>
                        {m.content && <Response>{m.content}</Response>}
                        {m.isError && m.isRetryable && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-destructive">❌ 网络错误，消息发送失败</p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetry(m.id)}
                                disabled={loading}
                                className="h-8"
                              >
                                {m.lastEventId ? '🔄 从断点继续' : '🔄 重试'}
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {m.lastEventId ? `已接收 ${m.lastEventId} 条消息` : '点击重试'}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      m.content
                    )}
                  </MessageContent>
                </AIMessage>
              ))}
            </ConversationContent>
          </Conversation>
          <div className="flex-shrink-0 p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="relative">
              <PromptInputTextarea
                value={input}
                onChange={(e: React.FormEvent<HTMLTextAreaElement>) => setInput(e.currentTarget.value)}
                placeholder="Type your message..."
                className="pr-11 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                maxHeight={120}
              />
              <div className="absolute right-1.5 bottom-1.5">
                {loading ? (
                  <Button 
                    type="button" 
                    onClick={cancelStreaming}
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7 rounded-md"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={!input.trim()} 
                    size="icon"
                    className="h-7 w-7 rounded-md"
                  >
                    <SendIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
