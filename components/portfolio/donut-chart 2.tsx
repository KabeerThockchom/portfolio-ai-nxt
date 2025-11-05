"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DonutChartData } from "@/types/portfolio"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface DonutChartProps {
  data: DonutChartData
  title: string
  subtitle?: string
}

export function DonutChart({ data, title, subtitle }: DonutChartProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const textColor = isDarkMode ? "#FFFFFF" : "#333333"

  const options = {
    chart: {
      type: "donut" as const,
      background: "transparent",
    },
    labels: data.labels,
    colors: data.colors || [
      "#FFE600", // EY Yellow
      "#FFFFFF", // White
      "#CCCCCC", // EY Light gray
      "#999999", // EY Medium gray
      "#666666", // Darker medium gray
      "#333333", // EY Dark gray
      "#E6E6E6", // Very light gray
      "#B3B3B3", // Light-medium gray
    ],
    legend: {
      position: "bottom" as const,
      labels: {
        colors: textColor,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%"
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              fontWeight: 600,
              color: textColor,
              formatter: function (w: any) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                return `$${total.toLocaleString()}`
              },
            },
            value: {
              color: textColor,
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom" as const,
          },
        },
      },
    ],
    theme: {
      mode: (isDarkMode ? "dark" : "light") as const,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Chart options={options} series={data.series} type="donut" height={350} />
      </CardContent>
    </Card>
  )
}
