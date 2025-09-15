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
  { month: "Nodejs", desktop: 60 },
  { month: "DataBase", desktop: 30 },
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
          className="aspect-square w-80 h-80"
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
                    y={index === 0 ? Number(y) - 10 : Number(y)}
                    textAnchor={textAnchor}
                    fontSize={13}
                    fontWeight={500}
                    fill="var(--foreground)"
                    {...props}
                  >
                    {/* <tspan fill="var(--foreground)">{data.desktop}</tspan>
                    <tspan fill="var(--muted-foreground)">/</tspan>
                    <tspan fill="var(--foreground)">{data.mobile}</tspan> */}
                    <tspan
                      x={x}
                      dy={"1rem"}
                      fontSize={12}
                      fill="var(--muted-foreground)"
                    >
                      {data.month}
                    </tspan>
                  </text>
                )
              }}
            />

            <PolarGrid />
            <Radar
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
            />
            <Radar dataKey="mobile" fill="var(--color-mobile)" />
          </RadarChart>
        </ChartContainer>
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