"use client"
import { useCallback, useRef } from 'react'
import type { Socket } from 'socket.io-client'

// 模块级单例，防止 React 重渲染时重复创建
let globalSocket: Socket | null = null
let connecting = false

// 事件处理器存储
const handlers = {
  offer: null as ((sdp: RTCSessionDescriptionInit) => void) | null,
  answer: null as ((sdp: RTCSessionDescriptionInit) => void) | null,
  ice: null as ((payload: { candidate: RTCIceCandidateInit; side: 'offer' | 'answer' }) => void) | null,
  peerJoined: null as (() => void) | null,
}

export type SocketSignaling = {
  connect: () => Promise<void>
  disconnect: () => void
  joinRoom: (roomId: string) => void
  onOffer: (handler: (sdp: RTCSessionDescriptionInit) => void) => void
  onAnswer: (handler: (sdp: RTCSessionDescriptionInit) => void) => void
  onIce: (handler: (payload: { candidate: RTCIceCandidateInit; side: 'offer' | 'answer' }) => void) => void
  onPeerJoined: (handler: () => void) => void
  sendOffer: (roomId: string, sdp: RTCSessionDescriptionInit) => void
  sendAnswer: (roomId: string, sdp: RTCSessionDescriptionInit) => void
  sendIce: (roomId: string, side: 'offer' | 'answer', candidate: RTCIceCandidateInit) => void
}

// 设置一次性的 socket 事件监听
function setupSocketListeners(socket: Socket) {
  socket.off('signal:offer')
  socket.off('signal:answer')
  socket.off('signal:ice')
  socket.off('peer:joined')
  
  socket.on('signal:offer', (payload: { sdp: RTCSessionDescriptionInit }) => {
    console.log('[Socket] Received offer')
    handlers.offer?.(payload.sdp)
  })
  
  socket.on('signal:answer', (payload: { sdp: RTCSessionDescriptionInit }) => {
    console.log('[Socket] Received answer')
    handlers.answer?.(payload.sdp)
  })
  
  socket.on('signal:ice', (payload: { candidate: RTCIceCandidateInit; side: 'offer' | 'answer' }) => {
    console.log('[Socket] Received ICE candidate, side:', payload.side)
    handlers.ice?.(payload)
  })
  
  socket.on('peer:joined', (payload: { socketId: string }) => {
    console.log('[Socket] Peer joined:', payload.socketId)
    handlers.peerJoined?.()
  })
}

export function useSocketSignaling(): SocketSignaling {
  const connect = useCallback(async () => {
    if (globalSocket?.connected) return
    if (connecting) {
      // 等待现有连接完成
      await new Promise(resolve => setTimeout(resolve, 100))
      if (globalSocket?.connected) return
    }
    
    connecting = true
    
    // Dynamic import to avoid ESM/CJS issues with socket.io-client in Next.js
    const { io } = await import('socket.io-client')
    
    return new Promise<void>((resolve) => {
      // 连接到 Socket.IO 服务器
      // 生产环境通过 NEXT_PUBLIC_SOCKET_URL 配置，默认同域名 3001 端口
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL 
        || `${window.location.protocol}//${window.location.hostname}:3001`
      const socket = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })
      
      globalSocket = socket
      setupSocketListeners(socket)
      
      socket.on('connect', () => {
        console.log('Socket.IO connected:', socket.id)
        connecting = false
        resolve()
      })
      
      socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message)
        connecting = false
      })
      
      socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason)
      })
      
      // Fallback timeout
      setTimeout(() => {
        connecting = false
        resolve()
      }, 2000)
    })
  }, [])

  const disconnect = useCallback(() => {
    globalSocket?.disconnect()
    globalSocket = null
    // 清空处理器
    handlers.offer = null
    handlers.answer = null
    handlers.ice = null
    handlers.peerJoined = null
  }, [])

  const joinRoom = useCallback((roomId: string) => {
    console.log('[Socket] Joining room:', roomId)
    globalSocket?.emit('join', roomId)
  }, [])

  // 注册处理器（替换旧的）
  const onOffer = useCallback((handler: (sdp: RTCSessionDescriptionInit) => void) => {
    handlers.offer = handler
  }, [])

  const onAnswer = useCallback((handler: (sdp: RTCSessionDescriptionInit) => void) => {
    handlers.answer = handler
  }, [])

  const onIce = useCallback(
    (handler: (payload: { candidate: RTCIceCandidateInit; side: 'offer' | 'answer' }) => void) => {
      handlers.ice = handler
    },
    [],
  )

  const onPeerJoined = useCallback((handler: () => void) => {
    handlers.peerJoined = handler
  }, [])

  const sendOffer = useCallback((roomId: string, sdp: RTCSessionDescriptionInit) => {
    console.log('[Socket] Sending offer to room:', roomId)
    globalSocket?.emit('signal:offer', { roomId, sdp })
  }, [])

  const sendAnswer = useCallback((roomId: string, sdp: RTCSessionDescriptionInit) => {
    console.log('[Socket] Sending answer to room:', roomId)
    globalSocket?.emit('signal:answer', { roomId, sdp })
  }, [])

  const sendIce = useCallback((roomId: string, side: 'offer' | 'answer', candidate: RTCIceCandidateInit) => {
    console.log('[Socket] Sending ICE candidate, side:', side)
    globalSocket?.emit('signal:ice', { roomId, side, candidate })
  }, [])

  return { connect, disconnect, joinRoom, onOffer, onAnswer, onIce, onPeerJoined, sendOffer, sendAnswer, sendIce }
}
