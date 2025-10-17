"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Bot, Send, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: Date.now() + '_u', role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    const assistantId = Date.now() + '_a'
    const encoder = new TextDecoder()
    let acc = ''
    // 预先放入一条空的 assistant 消息用于增量更新
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content })
      })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += encoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: acc } : m))
      }
    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Error: ' + e.message } : m))
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0" aria-label="Open AI Chat">
          <Bot />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>AI Assistant</DialogTitle>
        <DialogDescription className="text-xs">Ask anything. Demo local mock reply.</DialogDescription>
        <Separator />
        <div className="h-72 overflow-y-auto space-y-3 pr-1">
          {messages.map(m => (
            <div key={m.id} className={cn('text-sm flex', m.role === 'user' ? 'justify-end' : 'justify-start')}> 
              <div className={cn('rounded-md px-3 py-2 max-w-[80%] whitespace-pre-wrap',
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>{m.content}</div>
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
          className="flex gap-2 pt-2"
        >
          <input
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <Button type="submit" disabled={loading || !input.trim()} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
