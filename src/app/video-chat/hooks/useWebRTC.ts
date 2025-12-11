import { useState, useRef, useCallback, useEffect } from 'react'

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]

export function useWebRTC() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // 初始化本地媒体流
  const startLocalStream = useCallback(async () => {
    try {
      // 先尝试获取视频和音频
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      return stream
    } catch (error) {
      console.error('Error accessing video/audio:', error)
      
      // 如果失败，尝试只获取音频
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        })
        setLocalStream(audioStream)
        console.log('Only audio available, no video')
        return audioStream
      } catch (audioError) {
        console.error('Error accessing audio:', audioError)
        // 即使没有媒体设备，也返回一个空流，允许纯数据通道连接
        console.log('No media devices available, proceeding with data channel only')
        return new MediaStream()
      }
    }
  }, [])

  // 创建 PeerConnection
  const createPeerConnection = useCallback((
    onTrack: (event: RTCTrackEvent) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ) => {
    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS })

    pc.ontrack = onTrack
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate)
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState)
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setIsConnected(true)
      }
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        setIsConnected(false)
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
    }

    // 添加 transceiver 声明可以接收音视频（即使本地没有摄像头/麦克风）
    // 这样即使一方没有设备，也能接收对方的流
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })

    setPeerConnection(pc)
    return pc
  }, [])

  // 添加本地流到 PeerConnection
  const addLocalStream = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach(track => {
      // 查找已有的 transceiver（之前创建的 recvonly）
      const transceiver = pc.getTransceivers().find(
        t => t.receiver.track?.kind === track.kind && !t.sender.track
      )
      if (transceiver) {
        // 替换为本地轨道，并改为双向
        transceiver.sender.replaceTrack(track)
        transceiver.direction = 'sendrecv'
      } else {
        // 如果没有找到匹配的 transceiver，直接添加
        pc.addTrack(track, stream)
      }
    })
  }, [])

  // 处理远程流
  const handleRemoteTrack = useCallback((event: RTCTrackEvent) => {
    const stream = event.streams[0]
    setRemoteStream(stream)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream
    }
  }, [])

  // 清理资源
  const cleanup = useCallback(() => {
    setPeerConnection(prev => {
      if (prev) {
        prev.close()
      }
      return null
    })
    setLocalStream(prev => {
      if (prev) {
        prev.getTracks().forEach(track => track.stop())
      }
      return null
    })
    setRemoteStream(prev => {
      if (prev) {
        prev.getTracks().forEach(track => track.stop())
      }
      return null
    })
    setIsConnected(false)
  }, [])

  return {
    peerConnection,
    localStream,
    remoteStream,
    isConnected,
    localVideoRef,
    remoteVideoRef,
    startLocalStream,
    createPeerConnection,
    addLocalStream,
    handleRemoteTrack,
    cleanup
  }
}
