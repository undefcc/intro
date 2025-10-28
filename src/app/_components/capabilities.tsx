"use client"
import { Smartphone, Globe2, Code, Gamepad2 } from "lucide-react"

interface CapabilityItem {
  title: string
  icon: React.ReactNode
  desc?: string
}

const items: CapabilityItem[] = [
  { title: "WeChat / Alipay Mini Program", icon: <Smartphone className="w-4 h-4" /> },
  { title: "Cross-platform Web App (Taro / Uniapp)", icon: <Globe2 className="w-4 h-4" /> },
  { title: "HarmonyOS Native (ArkTS)", icon: <Code className="w-4 h-4" /> },
  { title: "HTML5 Game (Cocos / Egret)", icon: <Gamepad2 className="w-4 h-4" /> },
]

export default function Capabilities() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map(item => (
        <div
          key={item.title}
          className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 hover:bg-muted/70 transition-colors px-3 py-2"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-background/60 shadow-sm text-primary">
            {item.icon}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-foreground">{item.title}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
