"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GaugeChartData } from "@/types/portfolio"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface GaugeChartProps {
  data: GaugeChartData
  title: string
  subtitle?: string
}

export function GaugeChart({ data, title, subtitle }: GaugeChartProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const textColor = isDarkMode ? "#FFFFFF" : "#333333"
  const trackColor = isDarkMode ? "#999999" : "#CCCCCC"

  const getRiskLevel = (score: number) => {
    if (score <= 2) return { label: "Low Risk", color: "#FFE600" }
    if (score <= 4) return { label: "Moderate Risk", color: "#CCCCCC" }
    if (score <= 6) return { label: "Medium Risk", color: "#999999" }
    if (score <= 8) return { label: "High Risk", color: "#666666" }
    return { label: "Very High Risk", color: "#333333" }
  }

  const riskLevel = getRiskLevel(data.value)

  const options = {
    chart: {
      type: "radialBar" as const,
      background: "transparent",
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: "70%",
          background: "transparent",
        },
        track: {
          background: trackColor,
          strokeWidth: "97%",
        },
        dataLabels: {
          name: {
            offsetY: -10,
            show: true,
            color: textColor,
            fontSize: "17px",
          },
          value: {
            formatter: function (val: number) {
              // Convert percentage back to score (0-10)
              return ((val / 100) * 10).toFixed(1)
            },
            color: riskLevel.color,
            fontSize: "36px",
            fontWeight: "bold",
            show: true,
            offsetY: 10,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: [riskLevel.color],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round" as const,
    },
    labels: [data.label],
    colors: [riskLevel.color],
  }

  // Convert score (0-10) to percentage (0-100)
  const series = [(data.value / data.max) * 100]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="radialBar" height={300} />
        <div className="text-center mt-4">
          <p className="text-lg font-semibold" style={{ color: riskLevel.color }}>
            {riskLevel.label}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Risk Score: {data.value.toFixed(1)} / {data.max}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-center">
          <div>
            <div className="h-2 rounded" style={{ backgroundColor: "#FFE600" }}></div>
            <div className="mt-1">0-2</div>
          </div>
          <div>
            <div className="h-2 rounded" style={{ backgroundColor: "#CCCCCC" }}></div>
            <div className="mt-1">2-4</div>
          </div>
          <div>
            <div className="h-2 rounded" style={{ backgroundColor: "#999999" }}></div>
            <div className="mt-1">4-6</div>
          </div>
          <div>
            <div className="h-2 rounded" style={{ backgroundColor: "#666666" }}></div>
            <div className="mt-1">6-8</div>
          </div>
          <div>
            <div className="h-2 rounded" style={{ backgroundColor: "#333333" }}></div>
            <div className="mt-1">8-10</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
