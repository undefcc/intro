"use client"
import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  const [open, setOpen] = React.useState(false)
  const startXRef = React.useRef<number | null>(null)
  const deltaXRef = React.useRef(0)
  const threshold = 50 // 滑动生效阈值

  function handlePointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX
    deltaXRef.current = 0
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (startXRef.current == null) return
    deltaXRef.current = e.clientX - startXRef.current
  }
  function handlePointerUp() {
    if (startXRef.current == null) return
    const dx = deltaXRef.current
    if (Math.abs(dx) > threshold && previews.length > 1) {
      if (dx < 0) {
        next()
      } else {
        prev()
      }
    }
    startXRef.current = null
    deltaXRef.current = 0
  }

  const next = React.useCallback(() => {
    setActive(a => (a + 1) % previews.length)
  }, [previews.length])
  const prev = React.useCallback(() => {
    setActive(a => (a - 1 + previews.length) % previews.length)
  }, [previews.length])
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, previews.length, next, prev])
  return (
    <>
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow border-border/60">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[2fr_1fr] gap-0">
          {/* 左侧：预览框 */}
          <div className="relative bg-gradient-to-br from-muted/50 to-muted p-6 md:p-8 flex items-center justify-center">
            <div className="flex flex-col gap-3 w-full max-w-[300px]">
              <button
                type="button"
                onClick={() => current && setOpen(true)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="group relative w-full aspect-[9/16] bg-background rounded-2xl shadow-2xl overflow-hidden border-4 border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="打开预览大图"
              >
                {current ? (
                  <>
                    <Image
                      src={current}
                      alt={`${miniapp.name} 预览 ${active + 1}`}
                      className="w-full h-full object-contain bg-black/5"
                      width={375}
                      height={667}
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end justify-center">
                      <span className="mb-2 text-[11px] px-2 py-1 rounded bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">点击放大</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">暂无预览</div>
                )}
              </button>
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
                      <Image src={p} alt={`${miniapp.name} 缩略图 ${idx + 1}`} fill className="object-contain bg-muted" sizes="60px" />
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
  <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90vw] w-auto p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-[min(420px,70vw)] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-border touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {current && (
              <Image
                src={current}
                alt={`${miniapp.name} 大图 ${active + 1}`}
                fill
                sizes="420px"
                className="object-contain bg-black/10"
                priority
              />
            )}
          </div>
          {previews.length > 1 && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={prev} disabled={previews.length < 2}>上一张</Button>
              <div className="text-xs text-muted-foreground">{active + 1} / {previews.length}</div>
              <Button variant="outline" size="sm" onClick={next} disabled={previews.length < 2}>下一张</Button>
            </div>
          )}
          {previews.length > 1 && (
            <div className="grid grid-cols-6 gap-2 max-w-[420px] w-full">
              {previews.map((p, idx) => (
                <button
                  key={p + idx}
                  onClick={() => setActive(idx)}
                  className={"relative aspect-[9/16] rounded-md overflow-hidden border " + (idx === active ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-foreground/40')}
                  aria-label={`选择第 ${idx + 1} 张`}
                >
                  <Image src={p} alt={`缩略图 ${idx + 1}`} fill sizes="70px" className="object-contain bg-muted" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
