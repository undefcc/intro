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
}

export default function ChatDialog() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading || sendingRef.current) return
    const userMsg: Message = { id: Date.now() + '_u', role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    sendingRef.current = true
    const assistantId = Date.now() + '_a'
    const encoder = new TextDecoder()
    let acc = ''
    // 预先放入一条空的 assistant 消息用于增量更新
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
    try {
      const controller = new AbortController()
      abortRef.current = controller
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content }),
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
          const lines = evt.split(/\n/) // 可能包含 event: / data:
          let dataLine = lines.find(l => l.startsWith('data:'))
          if (!dataLine) continue
            const payload = dataLine.replace(/^data:\s?/, '')
          if (payload === '[DONE]') {
            buffer = ''
            break
          }
          // 忽略 start 事件载荷 stream-begin
          if (payload === 'stream-begin') continue
          acc += payload
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: acc } : m))
        }
      }
    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Error: ' + e.message } : m))
    } finally {
      setLoading(false)
      sendingRef.current = false
      abortRef.current = null
    }
  }

  const injectDemo = () => {
    const demo = `## Markdown 测试\n\n**粗体**、_斜体_、~~删除线~~、以及 \`inline code\`。\n\n### 列表\n- 项目 A\n- 项目 B\n- 项目 C\n\n### 表格\n| 名称 | 值 | 说明 |\n| ---- | --- | ---- |\n| foo | 123 | 示例 |\n| bar | 456 | 示例 |\n\n### 代码块 (ts)\n\n\`\`\`ts\nfunction greet(name: string): string {\n  return 'Hello ' + name.toUpperCase()\n}\nconsole.log(greet('world'))\n\`\`\`\n\n### 代码块 (bash)\n\n\`\`\`bash\n# 安装依赖\nnpm install react-markdown remark-gfm\n\n# 运行开发服务器\nnpm run dev\n\`\`\`\n\n> 引用：这是一个引用区块。\n\n完成。`
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
          <DialogTitle>AI Assistant</DialogTitle>
          <DialogDescription className="text-xs mt-1">Ask anything. Demo local mock reply.</DialogDescription>
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={injectDemo}>
              <FileCode className="h-3 w-3 mr-1"/> Demo Markdown
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <Conversation className="flex-1 min-h-0">
            <ConversationContent className="p-4">
              {messages.map(m => (
                <AIMessage key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === 'assistant' ? (
                      <Response>{m.content}</Response>
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
