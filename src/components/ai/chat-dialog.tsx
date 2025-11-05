"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Bot, Send, Loader2, Copy, Check, FileCode } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// 简单的 markdown 渲染：使用动态 import 避免 SSR 问题（组件是 client）
// 为避免新增依赖在服务端打包问题，这里用懒加载方式；若项目未安装 react-markdown/remark-gfm 需要先安装。
// 这里直接假设已安装，若未安装会报错提醒。
let ReactMarkdown: any = (props: any) => <>{props.children}</>
(async () => {
  try {
    const RM = await import('react-markdown')
    const gfm = (await import('remark-gfm')).default
    const Base = RM.default || RM
    const DynamicReactMarkdown = (props: any) => <Base remarkPlugins={[gfm]} {...props} />;
    (DynamicReactMarkdown as any).displayName = 'DynamicReactMarkdown'
    ReactMarkdown = DynamicReactMarkdown
  } catch (e) {
    const Fallback = (props: any) => <>{props.children}</>
    Fallback.displayName = 'MarkdownFallback'
    ReactMarkdown = Fallback
  }
})()

export default function ChatDialog() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const sendingRef = useRef(false) // 进一步防止竞态
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function cancelStreaming() {
    abortRef.current?.abort()
    abortRef.current = null
    sendingRef.current = false
    setLoading(false)
  }

  async function send() {
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
          acc += (acc ? '\n' : '') + payload
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

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // 打开时自动聚焦输入框
  useEffect(() => {
    if (open) {
      // 延迟一帧等待内容渲染
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null)

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedBlockId(id)
      setTimeout(() => setCopiedBlockId(null), 2000)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }, [])
  const injectDemo = () => {
    const demo = `## Markdown 测试\n\n**粗体**、_斜体_、~~删除线~~、以及 \`inline code\`。\n\n### 列表\n- 项目 A\n- 项目 B\n- 项目 C\n\n### 表格\n| 名称 | 值 | 说明 |\n| ---- | --- | ---- |\n| foo | 123 | 示例 |\n| bar | 456 | 示例 |\n\n### 代码块 (ts)\n\n\`\`\`ts\nfunction greet(name: string): string {\n  return 'Hello ' + name.toUpperCase()\n}\nconsole.log(greet('world'))\n\`\`\`\n\n### 代码块 (bash)\n\n\`\`\`bash\n# 安装依赖\nnpm install react-markdown remark-gfm\n\n# 运行开发服务器\nnpm run dev\n\`\`\`\n\n> 引用：这是一个引用区块。\n\n完成。`
    const assistantMsg: Message = { id: Date.now() + '_demo', role: 'assistant', content: demo }
    setMessages(prev => [...prev, assistantMsg])
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  function renderAssistantContent(content: string, id: string) {
    if (ReactMarkdown) {
      return (
        <ReactMarkdown
          components={{
            code({ inline, className, children, ...props }: any) {
              const text = String(children)
              const langMatch = /language-(\w+)/.exec(className || '')
              const blockId = id + '_' + Math.random().toString(36).slice(2)
              if (inline) return <code className={className}>{children}</code>
              return (
                <div className="group relative my-2">
                  <pre className={cn('overflow-auto rounded-md bg-black/80 text-[13px] p-3 text-white', className)} {...props}>{text}</pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(text, blockId)}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-white/10 hover:bg-white/20 text-white px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy code"
                  >
                    {copiedBlockId === blockId ? <><Check className="h-3 w-3"/>Copied</> : <><Copy className="h-3 w-3"/>Copy</>}
                  </button>
                  {langMatch && (
                    <span className="absolute top-2 left-2 text-[10px] px-1 py-0.5 bg-white/10 rounded text-white">{langMatch[1]}</span>
                  )}
                </div>
              )
            }
          }}
        >
          {content}
        </ReactMarkdown>
      )
    }
    return content
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0" aria-label="Open AI Chat">
          <Bot />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[900px] lg:w-[1024px] max-h-[85vh] flex flex-col">
        <DialogTitle>AI Assistant</DialogTitle>
        <DialogDescription className="text-xs">Ask anything. Demo local mock reply.</DialogDescription>
        <Separator />
        <div className="flex items-center justify-end gap-2 -mt-2 mb-2">
          <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={injectDemo}>
            <FileCode className="h-3 w-3 mr-1"/> Demo Markdown
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 mt-2">
          {messages.map(m => (
            <div key={m.id} className={cn('text-sm flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn('rounded-md px-3 py-2 max-w-[80%] whitespace-pre-wrap',
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}
              >
                {m.role === 'assistant' ? renderAssistantContent(m.content, m.id) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start text-sm">
              <div className="rounded-md px-3 py-2 bg-muted flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin"/>Thinking...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={e => { e.preventDefault(); send(); }}
          className="flex gap-2 pt-3"
        >
          <input
            ref={inputRef}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-[16px] leading-tight focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            placeholder="Type a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          {loading ? (
            <Button type="button" onClick={cancelStreaming} size="sm" variant="destructive">
              <Loader2 className="h-4 w-4 animate-spin mr-1"/> Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()} size="sm">
              <Send className="h-4 w-4"/>
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
