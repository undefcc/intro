import { useState, useCallback } from 'react'
import { useWebRTC } from './useWebRTC'
import { useDataChannel } from './useDataChannel'
import { useSignaling } from './useSignaling'

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
  const { sendSignal, getOffer, getAnswer, getIceCandidates } = useSignaling()

  // 创建房间
  const createRoom = useCallback(async () => {
    try {
      const stream = localStream || await startLocalStream()
      // 即使没有媒体流，也允许创建房间（纯数据通道模式）
      
      const newRoomId = Math.random().toString(36).substring(2, 9)
      await sendSignal({ type: 'create', roomId: newRoomId })

      const handleIceCandidate = async (candidate: RTCIceCandidate) => {
        await sendSignal({
          type: 'ice-candidate',
          roomId: newRoomId,
          data: { type: 'offer', candidate: candidate.toJSON() }
        })
      }

      const pc = createPeerConnection(handleRemoteTrack, handleIceCandidate)

      // 创建数据通道
      const channel = pc.createDataChannel('chat', { ordered: true })
      setupDataChannel(channel)

      // 只在有媒体轨道时添加到连接
      if (stream && stream.getTracks().length > 0) {
        addLocalStream(pc, stream)
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await sendSignal({ type: 'offer', roomId: newRoomId, data: offer })

      setRoomId(newRoomId)
      setCallStatus('calling')

      // 轮询 answer
      let attempts = 0
      let lastCandidateCount = 0

      const poll = async () => {
        if (attempts >= 60 || !pc || pc.signalingState === 'closed') return
        attempts++

        try {
          const answer = await getAnswer(newRoomId)
          if (answer && pc.remoteDescription === null) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer))
            setCallStatus('connected')
          }

          const candidates = await getIceCandidates(newRoomId, 'answer')
          if (candidates.length > lastCandidateCount) {
            for (let i = lastCandidateCount; i < candidates.length; i++) {
              await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
            }
            lastCandidateCount = candidates.length
          }

          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            return
          }
        } catch (error) {
          console.error('Error polling for answer:', error)
        }

        setTimeout(poll, 1000)
      }

      poll()
    } catch (error) {
      console.error('Error creating room:', error)
      alert('创建房间失败，请重试')
    }
  }, [localStream, startLocalStream, createPeerConnection, handleRemoteTrack, addLocalStream, setupDataChannel, sendSignal, getAnswer, getIceCandidates])

  // 加入房间
  const joinRoom = useCallback(async (id: string) => {
    try {
      const stream = localStream || await startLocalStream()
      // 即使没有媒体流，也允许加入房间（纯数据通道模式）
      
      await sendSignal({ type: 'join', roomId: id })
      const offer = await getOffer(id)

      const handleIceCandidate = async (candidate: RTCIceCandidate) => {
        await sendSignal({
          type: 'ice-candidate',
          roomId: id,
          data: { type: 'answer', candidate: candidate.toJSON() }
        })
      }

      const pc = createPeerConnection(handleRemoteTrack, handleIceCandidate)

      // 监听数据通道
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel)
      }

      // 只在有媒体轨道时添加到连接
      if (stream && stream.getTracks().length > 0) {
        addLocalStream(pc, stream)
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await sendSignal({ type: 'answer', roomId: id, data: answer })

      setCallStatus('connected')

      // 轮询 offer ICE candidates
      let lastCandidateCount = 0
      let attempts = 0

      const poll = async () => {
        if (attempts >= 60 || !pc || pc.signalingState === 'closed') return
        attempts++

        try {
          const candidates = await getIceCandidates(id, 'offer')
          if (candidates.length > lastCandidateCount) {
            for (let i = lastCandidateCount; i < candidates.length; i++) {
              await pc.addIceCandidate(new RTCIceCandidate(candidates[i]))
            }
            lastCandidateCount = candidates.length
          }

          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            return
          }
        } catch (error) {
          console.error('Error polling for ICE candidates:', error)
        }

        setTimeout(poll, 1000)
      }

      poll()
    } catch (error) {
      console.error('Error joining room:', error)
      alert('加入房间失败，请检查房间ID是否正确')
      setCallStatus('idle')
    }
  }, [localStream, startLocalStream, sendSignal, getOffer, createPeerConnection, handleRemoteTrack, setupDataChannel, addLocalStream, getIceCandidates])

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
