"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Copy, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useVideoChat } from './hooks/useVideoChat'

export default function VideoChat() {
  const [isCopied, setIsCopied] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')

  const {
    roomId,
    callStatus,
    isVideoEnabled,
    isAudioEnabled,
    isConnected,
    localVideoRef,
    remoteVideoRef,
    remoteStream,
    localStream,
    dataChannel,
    messages,
    messagesContainerRef,
    createRoom,
    joinRoom,
    toggleVideo,
    toggleAudio,
    hangUp,
    sendMessage
  } = useVideoChat()

  const copyRoomId = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleSendMessage = () => {
    if (sendMessage(messageInput)) {
      setMessageInput('')
    }
  }

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      joinRoom(joinRoomId.trim())
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-cal mb-2">WebRTC 视频对讲</h1>
            <p className="text-muted-foreground text-sm">
              点对点实时视频通话 (开发演示版本)
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 控制面板 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>控制面板</CardTitle>
              <CardDescription>
                创建或加入房间开始通话
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {callStatus === 'idle' && (
                <>
                  <Button 
                    onClick={createRoom} 
                    className="w-full"
                    size="lg"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    创建房间
                  </Button>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">加入房间</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="输入房间 ID"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                      />
                      <Button 
                        onClick={handleJoinRoom}
                        disabled={!joinRoomId}
                      >
                        加入
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {callStatus === 'calling' && roomId && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium">房间 ID</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-background rounded text-sm">
                        {roomId}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={copyRoomId}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      分享此 ID 给对方以加入通话
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse text-center">
                      <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm">等待对方加入...</p>
                    </div>
                  </div>
                </div>
              )}

              {callStatus !== 'idle' && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium mb-3">通话控制</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isVideoEnabled ? "default" : "destructive"}
                        onClick={toggleVideo}
                        className="w-full"
                      >
                        {isVideoEnabled ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <VideoOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant={isAudioEnabled ? "default" : "destructive"}
                        onClick={toggleAudio}
                        className="w-full"
                      >
                        {isAudioEnabled ? (
                          <Mic className="h-4 w-4" />
                        ) : (
                          <MicOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={hangUp}
                      className="w-full"
                    >
                      <PhoneOff className="mr-2 h-4 w-4" />
                      挂断
                    </Button>
                  </div>

                  {isConnected && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400 text-center">
                        ✓ 已连接
                      </p>
                    </div>
                  )}
                </>
              )}

              <Separator />

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">使用说明：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>点击"创建房间"生成房间ID</li>
                  <li>分享房间ID给对方</li>
                  <li>对方输入房间ID点击"加入"即可通话</li>
                  <li>需要允许浏览器访问摄像头和麦克风</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 视频和消息区域 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 消息聊天区 */}
            {callStatus !== 'idle' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">消息</CardTitle>
                  <CardDescription>
                    {dataChannel?.readyState === 'open' ? '✓ 数据通道已连接' : '等待数据通道连接...'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 消息列表 */}
                  <div 
                    ref={messagesContainerRef}
                    className="h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-muted/30"
                  >
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        暂无消息
                      </p>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 ${
                              msg.isSelf
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 发送消息 */}
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="输入消息..."
                      disabled={!dataChannel || dataChannel.readyState !== 'open'}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || !dataChannel || dataChannel.readyState !== 'open'}
                    >
                      发送
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 远程视频 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">远程视频</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!remoteStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">等待连接...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 本地视频 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">本地视频</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!localStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">未开启摄像头</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
