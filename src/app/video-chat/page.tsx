"use client"

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VideoChatProvider, useVideoChatContext } from './context/VideoChatContext'
import { ControlPanel } from './components/ControlPanel'
import { MediaSection } from './components/MediaSection'

function VideoChatContent() {
  const { callStatus, joinRoom } = useVideoChatContext()
  const searchParams = useSearchParams()
  const isInCall = callStatus !== 'idle'

  // 检查 URL 参数，自动加入房间
  useEffect(() => {
    const roomParam = searchParams?.get('room')
    if (roomParam && callStatus === 'idle') {
      // 延迟一点执行，确保组件完全初始化
      const timer = setTimeout(() => {
        joinRoom(roomParam)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, callStatus, joinRoom])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-cal mb-2">WebRTC 视频对讲</h1>
            <p className="text-muted-foreground text-sm">
              点对点实时视频通话
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </header>

        {/* 主体内容 - 垂直布局 */}
        <div className="space-y-4">
          {/* 通话中：显示视频和聊天 */}
          {isInCall && <MediaSection />}
          
          {/* 控制面板始终显示 */}
          <ControlPanel isInCall={isInCall} />
        </div>
      </div>
    </div>
  )
}

export default function VideoChat() {
  return (
    <VideoChatProvider>
      <VideoChatContent />
    </VideoChatProvider>
  )
}
