export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return new Response('Invalid prompt', { status: 400 })
    }

    const encoder = new TextEncoder()
    const wantMarkdown = /markdown|md|demo|代码|示例/i.test(prompt)

    let chunks: string[]
    if (wantMarkdown) {
      chunks = [
        '## 👋 Markdown 流式示例',
        `**你输入的内容：** ${prompt}`,
        '',
        '下面演示一个多段流式的 *Markdown* 响应：',
        '### 列表',
        '- 第一项',
        '- 第二项',
        '- 第三项',
        '',
        '### 代码 (TypeScript)',
        '```ts',
        'function add(a: number, b: number) {',
        '  return a + b',
        '}',
        'console.log(add(2, 3))',
        '```',
        '',
        '### Bash 命令',
        '```bash',
        'npm install react-markdown remark-gfm',
        'npm run dev',
        '```',
        '',
        '> 引用：这是一段引用内容。',
        '',
        '**完成。**'
      ]
    } else {
      chunks = [
        `You said: ${prompt}`,
        'Thinking about your input...',
        'Here is a mock answer:',
        'This is a streamed response demo',
        '— built with Server-Sent Events.',
        `(time: ${new Date().toLocaleTimeString()})`
      ]
    }

    const stream = new ReadableStream({
      start(controller) {
        let i = 0
        const send = () => {
          if (i < chunks.length) {
            const data = `data: ${chunks[i]}\n\n`
            controller.enqueue(encoder.encode(data))
            i++
            setTimeout(send, 300)
          } else {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          }
        }
        // 发送一个事件头，方便客户端识别开始
        controller.enqueue(encoder.encode('event: start\ndata: stream-begin\n\n'))
        send()
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
