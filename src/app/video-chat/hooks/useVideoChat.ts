import { useState, useCallback } from 'react'
import { useWebRTC } from './useWebRTC'
import { useDataChannel } from './useDataChannel'
import { useSocketSignaling } from './useSocketSignaling'

export function useVideoChat() {
  const [roomId, setRoomId] = useState('')
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)

  const {
    localStream,
    startLocalStream,
    createPeerConnection,
    addLocalStream,
    handleRemoteTrack,
    cleanup: webrtcCleanup,
    ...webrtcRest
  } = useWebRTC()

  const { setupDataChannel, ...dataChannelRest } = useDataChannel()
  const signaling = useSocketSignaling()

  // 创建房间
  const createRoom = useCallback(async () => {
    try {
      const stream = localStream || await startLocalStream()
      // 即使没有媒体流，也允许创建房间（纯数据通道模式）
      
      const newRoomId = Math.random().toString(36).substring(2, 9)
      await signaling.connect()

      const handleIceCandidate = async (candidate: RTCIceCandidate) => {
        signaling.sendIce(newRoomId, 'offer', candidate.toJSON())
      }

      const pc = createPeerConnection(handleRemoteTrack, handleIceCandidate)

      // 创建数据通道
      const channel = pc.createDataChannel('chat', { ordered: true })
      setupDataChannel(channel)

      // 添加本地媒体流（即使为空也要调用，以设置 recvonly transceiver）
      addLocalStream(pc, stream || new MediaStream())

      // 发送 offer 的函数，可重复调用
      const sendOfferToRoom = async () => {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        signaling.sendOffer(newRoomId, offer)
      }

      // 先注册事件监听，再加入房间
      signaling.onAnswer(async (answer) => {
        if (pc.remoteDescription === null) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
          setCallStatus('connected')
        }
      })

      signaling.onIce(async ({ candidate, side }) => {
        if (side === 'answer') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.error('Failed to add ICE candidate', err)
          }
        }
      })

      // 当有新成员加入时重发 offer
      signaling.onPeerJoined(async () => {
        await sendOfferToRoom()
      })

      // 加入房间后发送 offer
      signaling.joinRoom(newRoomId)
      await sendOfferToRoom()

      setRoomId(newRoomId)
      setCallStatus('calling')
    } catch (error) {
      console.error('Error creating room:', error)
      alert('创建房间失败，请重试')
    }
  }, [localStream, startLocalStream, createPeerConnection, handleRemoteTrack, addLocalStream, setupDataChannel, signaling])

  // 加入房间
  const joinRoom = useCallback(async (id: string) => {
    try {
      const stream = localStream || await startLocalStream()
      // 即使没有媒体流，也允许加入房间（纯数据通道模式）
      
      await signaling.connect()

      const handleIceCandidate = async (candidate: RTCIceCandidate) => {
        signaling.sendIce(id, 'answer', candidate.toJSON())
      }

      const pc = createPeerConnection(handleRemoteTrack, handleIceCandidate)

      // 监听数据通道
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel)
      }

      // 添加本地媒体流（即使为空也要调用，以设置 recvonly transceiver）
      addLocalStream(pc, stream || new MediaStream())
      
      // 先注册事件监听
      signaling.onOffer(async (offer) => {
        if (pc.signalingState !== 'stable' || pc.remoteDescription) return
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        signaling.sendAnswer(id, answer)
        setCallStatus('connected')
      })

      signaling.onIce(async ({ candidate, side }) => {
        if (side === 'offer') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (err) {
            console.error('Failed to add ICE candidate', err)
          }
        }
      })

      // 加入房间，触发创建方重发 offer
      signaling.joinRoom(id)
      setRoomId(id)
      setCallStatus('calling')
    } catch (error) {
      console.error('Error joining room:', error)
      alert('加入房间失败，请检查房间ID是否正确')
      setCallStatus('idle')
    }
  }, [localStream, startLocalStream, signaling, createPeerConnection, handleRemoteTrack, setupDataChannel, addLocalStream])

  // 切换视频
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream])

  // 切换音频
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [localStream])

  // 挂断
  const hangUp = useCallback(() => {
    console.log('Hanging up...')
    dataChannelRest.cleanup()
    webrtcCleanup()
    setCallStatus('idle')
    setRoomId('')
  }, [dataChannelRest, webrtcCleanup])

  return {
    roomId,
    setRoomId,
    callStatus,
    isVideoEnabled,
    isAudioEnabled,
    createRoom,
    joinRoom,
    toggleVideo,
    toggleAudio,
    hangUp,
    localStream,
    ...webrtcRest,
    ...dataChannelRest
  }
}
