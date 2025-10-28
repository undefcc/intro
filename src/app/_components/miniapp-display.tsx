"use client"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface MiniAppProps {
  miniapp: {
    name: string;
    desc: string;
    qrCode: string; // 小程序二维码图片地址
    preview: string; // 小程序预览图
    platform?: string; // 平台：微信/支付宝/抖音等
  }
}

export default function MiniAppDisplay({ miniapp }: MiniAppProps) {
  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow border-border/60">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[2fr_1fr] gap-0">
          {/* 左侧：预览框 */}
          <div className="relative bg-gradient-to-br from-muted/50 to-muted p-6 md:p-8 flex items-center justify-center">
            <div className="relative w-full max-w-[280px] aspect-[9/16] bg-background rounded-2xl shadow-2xl overflow-hidden border-4 border-foreground/10">
              {miniapp.preview ? (
                <Image
                  src={miniapp.preview}
                  alt={`${miniapp.name} 预览`}
                  className="w-full h-full object-cover"
                  width={375}
                  height={667}
                  onError={(e) => {
                    if (e?.currentTarget) {
                      e.currentTarget.src = `https://via.placeholder.com/375x667/e2e8f0/64748b?text=${encodeURIComponent(miniapp.name)}`
                    }
                  }}
                  priority={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  暂无预览
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
                  <img
                    src={miniapp.qrCode}
                    alt={`${miniapp.name} 二维码`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/200x200/ffffff/000000?text=QR+Code`
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    二维码
                  </div>
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
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
