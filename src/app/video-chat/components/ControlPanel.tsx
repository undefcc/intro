import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RoomControls } from './RoomControls'
import { CallControls } from './CallControls'

interface ControlPanelProps {
  isInCall?: boolean
}

export function ControlPanel({ isInCall = false }: ControlPanelProps) {
  return (
    <Card className={isInCall ? '' : 'max-w-md mx-auto'}>
      <CardHeader>
        <CardTitle>控制面板</CardTitle>
        <CardDescription>
          {isInCall ? '通话控制' : '创建或加入房间开始通话'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoomControls />
        <CallControls />
        
        {!isInCall && (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
