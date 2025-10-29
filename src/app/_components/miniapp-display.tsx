"use client"
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface MiniAppData {
  name: string
  desc: string
  qrCode: string
  preview: string | string[] // 支持单图或多图
  platform?: string
}

interface MiniAppProps { miniapp: MiniAppData }

function normalizePreviews(p: string | string[]): string[] {
  if (Array.isArray(p)) return p.filter(Boolean)
  return p ? [p] : []
}

export default function MiniAppDisplay({ miniapp }: MiniAppProps) {
  const previews = normalizePreviews(miniapp.preview)
  const [active, setActive] = React.useState(0)
  const current = previews[active]
  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow border-border/60">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[2fr_1fr] gap-0">
          {/* 左侧：预览框 */}
          <div className="relative bg-gradient-to-br from-muted/50 to-muted p-6 md:p-8 flex items-center justify-center">
            <div className="flex flex-col gap-3 w-full max-w-[300px]">
              <div className="relative w-full aspect-[9/16] bg-background rounded-2xl shadow-2xl overflow-hidden border-4 border-foreground/10">
                {current ? (
                  <Image
                    src={current}
                    alt={`${miniapp.name} 预览 ${active + 1}`}
                    className="w-full h-full object-cover"
                    width={375}
                    height={667}
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">暂无预览</div>
                )}
              </div>
              {previews.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {previews.map((p, idx) => (
                    <button
                      key={p + idx}
                      type="button"
                      onClick={() => setActive(idx)}
                      className={"relative aspect-[9/16] rounded-md overflow-hidden border transition-all " + (idx === active ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-foreground/40')}
                      aria-label={`预览 ${idx + 1}`}
                    >
                      <Image src={p} alt={`${miniapp.name} 缩略图 ${idx + 1}`} fill className="object-cover" sizes="60px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：二维码和简介 */}
          <div className="p-6 md:p-8 flex flex-col justify-center gap-6 bg-card">
            {/* 标题 */}
            <div>
              <h3 className="text-2xl font-cal mb-2">{miniapp.name}</h3>
              {miniapp.platform && (
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {miniapp.platform}
                </p>
              )}
            </div>

            {/* 二维码 */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-40 h-40 bg-white p-2 rounded-lg shadow-md">
                {miniapp.qrCode ? (
                  <Image
                    src={miniapp.qrCode}
                    alt={`${miniapp.name} 二维码`}
                    fill
                    sizes="160px"
                    className="object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">二维码</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                扫码体验小程序
              </p>
            </div>

            {/* 简介 */}
            {miniapp.desc && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {miniapp.desc}
                </p>
                {previews.length > 1 && (
                  <p className="text-[11px] mt-2 text-muted-foreground">共 {previews.length} 张预览，当前第 {active + 1} 张</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
