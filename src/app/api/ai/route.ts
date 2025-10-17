export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return new Response('Invalid prompt', { status: 400 })
    }

    // 模拟分段生成的文本块
    const chunks = [
      `You said: ${prompt}\n`,
      'Thinking about your input...\n',
      'Here is a mock answer: ',
      'This is a streamed response demo ',
      '— built with ReadableStream in Next.js Route Handler. ',
      `(time: ${new Date().toLocaleTimeString()})`
    ]

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        let i = 0
        function push() {
          if (i < chunks.length) {
            controller.enqueue(encoder.encode(chunks[i]))
            i++
            setTimeout(push, 300) // 每300ms发送一段
          } else {
            controller.close()
          }
        }
        push()
      }
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  } catch (e: any) {
    return new Response('Error: ' + e.message, { status: 500 })
  }
}
