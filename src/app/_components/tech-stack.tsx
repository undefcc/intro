"use client"
import { Boxes, Code2, Database, GitBranch, Globe, Layers, Server, Cpu, Box, CloudCog, Terminal, Component } from "lucide-react"
import React, { useEffect, useState } from "react"

interface TechItem {
  name: string
  icon: React.ReactNode
  category?: string
  color?: string
}

const techList: TechItem[] = [
  { name: "HTML", icon: <Globe className="w-5 h-5" />, color: "text-orange-500" },
  { name: "CSS", icon: <Layers className="w-5 h-5" />, color: "text-sky-500" },
  { name: "JavaScript", icon: <Code2 className="w-5 h-5" />, color: "text-yellow-500" },
  { name: "TypeScript", icon: <Code2 className="w-5 h-5" />, color: "text-blue-600" },
  { name: "Vue", icon: <Component className="w-5 h-5" />, color: "text-emerald-600" },
  { name: "React", icon: <Component className="w-5 h-5" />, color: "text-cyan-500" },
  { name: "Next.js", icon: <Terminal className="w-5 h-5" />, color: "text-neutral-800 dark:text-neutral-200" },
  { name: "Node.js", icon: <Server className="w-5 h-5" />, color: "text-green-600" },
  { name: "Nest.js", icon: <Boxes className="w-5 h-5" />, color: "text-rose-600" },
  { name: "Express", icon: <Server className="w-5 h-5" />, color: "text-zinc-600" },
  { name: "Redis", icon: <Database className="w-5 h-5" />, color: "text-red-600" },
  { name: "MySQL", icon: <Database className="w-5 h-5" />, color: "text-blue-500" },
  { name: "MongoDB", icon: <Database className="w-5 h-5" />, color: "text-green-700" },
  { name: "Docker", icon: <Box className="w-5 h-5" />, color: "text-sky-600" },
  { name: "Git", icon: <GitBranch className="w-5 h-5" />, color: "text-orange-600" },
  { name: "Linux", icon: <Terminal className="w-5 h-5" />, color: "text-yellow-600" },
]

export default function TechStack() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {techList.map((t, idx) => {
          const delay = idx * 40 // ms
          return (
            <div
              key={t.name}
              style={mounted ? { animation: `fadeUp 500ms cubic-bezier(.22,.82,.24,1) ${delay}ms forwards` } : { opacity: 0, transform: 'translateY(12px)' }}
              className="group flex flex-col items-center justify-center gap-1 rounded-md border border-border/60 bg-muted/40 hover:bg-muted/70 transition-colors p-2 shadow-[inset_0_0_0_1px_var(--border)] will-change-transform"
              title={t.name}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-md bg-background/60 group-hover:shadow-sm group-hover:scale-105 transition-transform ${t.color}`}>{t.icon}</div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground truncate w-full text-center">{t.name}</span>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /><span>Backend & Infra</span></div>
        <div className="flex items-center gap-1"><CloudCog className="w-3 h-3" /><span>DevOps & Cloud</span></div>
        <div className="flex items-center gap-1"><Globe className="w-3 h-3" /><span>Frontend UI/SPA</span></div>
      </div>
      {/* 动画关键帧放在组件内，避免全局污染 */}
      <style jsx>{`
        @keyframes fadeUp {
          0% {opacity:0; transform:translateY(14px) scale(.98)}
          55% {opacity:1; transform:translateY(-2px) scale(1)}
          100% {opacity:1; transform:translateY(0) scale(1)}
        }
      `}</style>
    </div>
  )
}
