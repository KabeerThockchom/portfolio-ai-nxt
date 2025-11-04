"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RelativePerformance } from "@/types/portfolio"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface RelativePerformanceChartProps {
  data: RelativePerformance[]
  title?: string
  subtitle?: string
}

export function RelativePerformanceChart({
  data,
  title = "Relative Performance",
  subtitle = "Outperformance vs benchmarks"
}: RelativePerformanceChartProps) {

  // Prepare chart data
  const categories = data.map(item => item.assetName)
  const seriesData = data.map(item => item.outperformance)

  // Create colors array (green for positive, red for negative)
  const colors = data.map(item => item.outperformance >= 0 ? "#10b981" : "#ef4444")

  const options = {
    chart: {
      type: "bar" as const,
      background: "transparent",
      toolbar: {
        show: true,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true, // Each bar gets its own color
        barHeight: "70%",
        dataLabels: {
          position: "top" as const,
        },
      },
    },
    colors: colors,
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val >= 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`
      },
      offsetX: 0,
      style: {
        fontSize: "11px",
        colors: ["#fff"],
      },
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Outperformance (%)",
      },
      labels: {
        formatter: function (val: number) {
          return val.toFixed(1) + "%"
        },
        style: {
          colors: "#999999",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#999999",
          fontSize: "12px",
        },
        maxWidth: 200,
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      custom: function({ seriesIndex, dataPointIndex, w }: any) {
        const item = data[dataPointIndex]

        return `
          <div style="background: #1a1a1a; padding: 12px; border-radius: 4px; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); min-width: 200px;">
            <div style="font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 6px; font-size: 13px;">
              ${item.assetName}
            </div>

            <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #ccc; font-size: 12px;">Benchmark:</span>
              <span style="font-weight: 500; font-size: 12px; margin-left: 8px;">${item.relativeBenchmark}</span>
            </div>

            <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #ccc; font-size: 12px;">Portfolio Return:</span>
              <span style="font-weight: 500; font-size: 12px; margin-left: 8px; color: ${item.portfolioReturn >= 0 ? '#10b981' : '#ef4444'};">
                ${item.portfolioReturn >= 0 ? '+' : ''}${item.portfolioReturn.toFixed(2)}%
              </span>
            </div>

            <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #ccc; font-size: 12px;">Benchmark Return:</span>
              <span style="font-weight: 500; font-size: 12px; margin-left: 8px; color: ${item.benchmarkReturn >= 0 ? '#10b981' : '#ef4444'};">
                ${item.benchmarkReturn >= 0 ? '+' : ''}${item.benchmarkReturn.toFixed(2)}%
              </span>
            </div>

            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #ccc; font-size: 12px; font-weight: 600;">Outperformance:</span>
              <span style="font-weight: 700; font-size: 14px; margin-left: 8px; color: ${item.outperformance >= 0 ? '#10b981' : '#ef4444'};">
                ${item.outperformance >= 0 ? '+' : ''}${item.outperformance.toFixed(2)}%
              </span>
            </div>
          </div>
        `
      },
    },
    legend: {
      show: false, // Hide legend since each bar is different
    },
    grid: {
      borderColor: "#333333",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  }

  const series = [
    {
      name: "Outperformance",
      data: seriesData,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Chart
          options={options}
          series={series}
          type="bar"
          height={Math.max(350, data.length * 50)} // Dynamic height based on number of items
        />
      </CardContent>
    </Card>
  )
}
