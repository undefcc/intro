import React from 'react'
import { useVideoChatContext } from '../context/VideoChatContext'
import { ChatPanel } from './ChatPanel'
import { VideoPlayer } from './VideoPlayer'

export function MediaSection() {
  const { 
    callStatus, 
    localVideoRef, 
    remoteVideoRef, 
    localStream, 
    remoteStream 
  } = useVideoChatContext()

  return (
    <div className="lg:col-span-2 space-y-4">
      {/* 消息聊天区 */}
      {callStatus !== 'idle' && <ChatPanel />}

      {/* 远程视频 */}
      <VideoPlayer
        videoRef={remoteVideoRef}
        stream={remoteStream}
        title="远程视频"
      />

      {/* 本地视频 */}
      <VideoPlayer
        videoRef={localVideoRef}
        stream={localStream}
        title="本地视频"
        muted
        placeholder="未开启摄像头"
      />
    </div>
  )
}
