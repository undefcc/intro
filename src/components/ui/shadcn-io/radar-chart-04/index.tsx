"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A radar chart with a custom label"

const chartData = [
  { month: "Vue", desktop: 80 },
  { month: "React", desktop: 70 },
  { month: "PC", desktop: 80 },
  { month: "Mobile", desktop: 90 },
  { month: "DataBase", desktop: 50 },
  { month: "Nodejs", desktop: 60 },
]

const chartConfig = {
  desktop: {
    label: "Preference",
    color: "var(--chart-2)",
  }
} satisfies ChartConfig

export function ChartRadarLabelCustom() {
  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">Radar Chart - Custom Label</h3>
        <p className="text-sm text-muted-foreground">
          Showing total visitors for the last 6 months
        </p>
      </div> */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-square w-72 sm:w-80 h-auto"
        >
          <RadarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            }}
          >
            <defs>
              <radialGradient id="radarFill" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.70} />
                <stop offset="60%" stopColor="#60a5fa" stopOpacity={0.40} />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.18} />
              </radialGradient>
              <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis
              dataKey="month"
              tick={({ x, y, textAnchor, index, ...props }) => {
                const data = chartData[index]

                return (
                  <text
                    x={x}
                    y={Number(y) - 4}
                    textAnchor={textAnchor}
                    fontSize={12}
                    fontWeight={500}
                    fill="var(--muted-foreground)"
                    style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}
                    {...props}
                  >
                    <tspan x={x} dy={"0.9rem"}>{data.month}</tspan>
                  </text>
                )
              }}
            />
            <PolarGrid
              gridType="polygon"
              stroke="hsl(var(--border))"
              radialLines={false}
            />
            <Radar
              dataKey="desktop"
              fill="url(#radarFill)"
              stroke="url(#radarStroke)"
              strokeWidth={2.2}
              fillOpacity={0.78}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ChartContainer>
      </div>
      <div className="flex items-center justify-center mt-2">
        <div className="text-xs px-2 py-1 rounded-md bg-muted/50 border border-border/60 flex items-center gap-1">
          <span className="font-medium">Skill Radar</span>
          <TrendingUp className="w-3 h-3 text-primary" />
        </div>
      </div>
      {/* <div className="flex flex-col gap-1 text-sm text-center mt-2">
        <div className="flex items-center justify-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-2 leading-none">
          January - June 2024
        </div>
      </div> */}
    </div>
  )
}