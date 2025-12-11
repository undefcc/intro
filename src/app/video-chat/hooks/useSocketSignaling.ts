"use client"
import { useCallback } from 'react'
import type { Socket } from 'socket.io-client'

// 模块级单例，防止 React 重渲染时重复创建
let globalSocket: Socket | null = null
let connecting = false

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

export function useSocketSignaling(): SocketSignaling {
  const connect = useCallback(async () => {
    if (globalSocket?.connected || connecting) return
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
  }, [])

  const joinRoom = useCallback((roomId: string) => {
    globalSocket?.emit('join', roomId)
  }, [])

  const onOffer = useCallback((handler: (sdp: RTCSessionDescriptionInit) => void) => {
    globalSocket?.on('signal:offer', (payload: { sdp: RTCSessionDescriptionInit }) => handler(payload.sdp))
  }, [])

  const onAnswer = useCallback((handler: (sdp: RTCSessionDescriptionInit) => void) => {
    globalSocket?.on('signal:answer', (payload: { sdp: RTCSessionDescriptionInit }) => handler(payload.sdp))
  }, [])

  const onIce = useCallback(
    (handler: (payload: { candidate: RTCIceCandidateInit; side: 'offer' | 'answer' }) => void) => {
      globalSocket?.on('signal:ice', handler)
    },
    [],
  )

  const onPeerJoined = useCallback((handler: () => void) => {
    globalSocket?.on('peer:joined', handler)
  }, [])

  const sendOffer = useCallback((roomId: string, sdp: RTCSessionDescriptionInit) => {
    globalSocket?.emit('signal:offer', { roomId, sdp })
  }, [])

  const sendAnswer = useCallback((roomId: string, sdp: RTCSessionDescriptionInit) => {
    globalSocket?.emit('signal:answer', { roomId, sdp })
  }, [])

  const sendIce = useCallback((roomId: string, side: 'offer' | 'answer', candidate: RTCIceCandidateInit) => {
    globalSocket?.emit('signal:ice', { roomId, side, candidate })
  }, [])

  return { connect, disconnect, joinRoom, onOffer, onAnswer, onIce, onPeerJoined, sendOffer, sendAnswer, sendIce }
}
