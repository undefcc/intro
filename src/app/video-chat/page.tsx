"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VideoChatProvider } from './context/VideoChatContext'
import { ControlPanel } from './components/ControlPanel'
import { MediaSection } from './components/MediaSection'

function VideoChatContent() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
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

        {/* 主体内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ControlPanel />
          <MediaSection />
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
