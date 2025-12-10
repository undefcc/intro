import { NextRequest } from 'next/server'

// 内存存储：房间信息
const rooms = new Map<string, {
  offer?: RTCSessionDescriptionInit
  answer?: RTCSessionDescriptionInit
  iceCandidates: { type: 'offer' | 'answer', candidate: RTCIceCandidateInit }[]
}>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, roomId, data } = body

    switch (action) {
      case 'create':
        // 创建房间
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            iceCandidates: []
          })
          return Response.json({ success: true, roomId })
        }
        return Response.json({ success: false, error: 'Room already exists' }, { status: 400 })

      case 'join':
        // 加入房间
        if (rooms.has(roomId)) {
          return Response.json({ success: true, roomId })
        }
        return Response.json({ success: false, error: 'Room not found' }, { status: 404 })

      case 'offer':
        // 保存 offer
        const roomOffer = rooms.get(roomId)
        if (roomOffer) {
          roomOffer.offer = data
          return Response.json({ success: true })
        }
        return Response.json({ success: false, error: 'Room not found' }, { status: 404 })

      case 'answer':
        // 保存 answer
        const roomAnswer = rooms.get(roomId)
        if (roomAnswer) {
          roomAnswer.answer = data
          return Response.json({ success: true })
        }
        return Response.json({ success: false, error: 'Room not found' }, { status: 404 })

      case 'ice-candidate':
        // 保存 ICE candidate
        const roomIce = rooms.get(roomId)
        if (roomIce) {
          roomIce.iceCandidates.push(data)
          return Response.json({ success: true })
        }
        return Response.json({ success: false, error: 'Room not found' }, { status: 404 })

      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Signaling error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return Response.json({ success: false, error: 'Room ID required' }, { status: 400 })
    }

    const room = rooms.get(roomId)
    if (!room) {
      return Response.json({ success: false, error: 'Room not found' }, { status: 404 })
    }

    switch (action) {
      case 'get-offer':
        return Response.json({ success: true, data: room.offer })

      case 'get-answer':
        return Response.json({ success: true, data: room.answer })

      case 'get-ice-candidates':
        const type = searchParams.get('type') as 'offer' | 'answer'
        const candidates = room.iceCandidates.filter(c => c.type === type)
        return Response.json({ success: true, data: candidates.map(c => c.candidate) })

      default:
        return Response.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Signaling error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 定期清理超过1小时的房间
const oneHour = 60 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  
  for (const [roomId] of rooms) {
    // 简单清理策略：清空所有房间（实际应用中应该记录创建时间）
    if (rooms.size > 100) {
      rooms.clear()
      break
    }
  }
}, oneHour)
