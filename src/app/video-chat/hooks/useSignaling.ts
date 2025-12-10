import { useCallback } from 'react'

type SignalingAction = 
  | { type: 'create', roomId: string }
  | { type: 'join', roomId: string }
  | { type: 'offer', roomId: string, data: RTCSessionDescriptionInit }
  | { type: 'answer', roomId: string, data: RTCSessionDescriptionInit }
  | { type: 'ice-candidate', roomId: string, data: { type: 'offer' | 'answer', candidate: RTCIceCandidateInit } }

export function useSignaling() {
  const sendSignal = useCallback(async (action: SignalingAction) => {
    const response = await fetch('/api/signaling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action.type, roomId: action.roomId, data: 'data' in action ? action.data : undefined })
    })

    if (!response.ok) {
      throw new Error(`Signaling failed: ${response.statusText}`)
    }

    return response.json()
  }, [])

  const getOffer = useCallback(async (roomId: string) => {
    const response = await fetch(`/api/signaling?action=get-offer&roomId=${roomId}`)
    const { success, data } = await response.json()
    if (!success || !data) {
      throw new Error('No offer found')
    }
    return data as RTCSessionDescriptionInit
  }, [])

  const getAnswer = useCallback(async (roomId: string) => {
    const response = await fetch(`/api/signaling?action=get-answer&roomId=${roomId}`)
    const { success, data } = await response.json()
    return success && data ? data as RTCSessionDescriptionInit : null
  }, [])

  const getIceCandidates = useCallback(async (roomId: string, type: 'offer' | 'answer') => {
    const response = await fetch(`/api/signaling?action=get-ice-candidates&roomId=${roomId}&type=${type}`)
    const { success, data } = await response.json()
    return success && data ? data as RTCIceCandidateInit[] : []
  }, [])

  return {
    sendSignal,
    getOffer,
    getAnswer,
    getIceCandidates
  }
}
