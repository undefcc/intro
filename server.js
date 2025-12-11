const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
// 生产环境绑定 0.0.0.0 允许外部访问，开发环境用 localhost
const hostname = dev ? 'localhost' : '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)
const socketPort = parseInt(process.env.SOCKET_PORT || '3001', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Next.js HTTP 服务器
  const nextServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // 独立的 Socket.IO 服务器
  const socketServer = createServer()
  const io = new Server(socketServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
  })
  
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('join', (roomId) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
      socket.to(roomId).emit('peer:joined', { socketId: socket.id })
    })

    socket.on('signal:offer', ({ roomId, sdp }) => {
      console.log(`Offer from ${socket.id} to room ${roomId}`)
      socket.to(roomId).emit('signal:offer', { sdp })
    })

    socket.on('signal:answer', ({ roomId, sdp }) => {
      console.log(`Answer from ${socket.id} to room ${roomId}`)
      socket.to(roomId).emit('signal:answer', { sdp })
    })

    socket.on('signal:ice', ({ roomId, candidate, side }) => {
      socket.to(roomId).emit('signal:ice', { candidate, side })
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, 'reason:', reason)
    })
  })

  // 启动 Next.js 服务器
  nextServer.listen(port, () => {
    console.log(`> Next.js ready on http://${hostname}:${port}`)
  })

  // 启动 Socket.IO 服务器
  socketServer.listen(socketPort, () => {
    console.log(`> Socket.IO ready on http://${hostname}:${socketPort}`)
  })
})
