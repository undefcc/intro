import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    // 简单 mock：回显 + 时间戳
    const reply = `You said: ${prompt}\n(assistant mock at ${new Date().toLocaleTimeString()})`
    return NextResponse.json({ reply })
  } catch (e: any) {
    return NextResponse.json({ reply: 'Error parsing request: ' + e.message }, { status: 400 })
  }
}
