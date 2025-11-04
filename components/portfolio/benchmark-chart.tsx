"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BenchmarkChartData } from "@/types/portfolio"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface BenchmarkChartProps {
  data: BenchmarkChartData
  benchmarkName: string
  title: string
  subtitle?: string
}

export function BenchmarkChart({ data, benchmarkName, title, subtitle }: BenchmarkChartProps) {
  const options = {
    chart: {
      type: "line" as const,
      background: "transparent",
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    stroke: {
      width: [3, 3],
      curve: "smooth" as const,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.categories,
      title: {
        text: "Time Period",
      },
      labels: {
        style: {
          colors: "#999999",
        },
      },
    },
    yaxis: {
      title: {
        text: "Indexed Performance (Base 100)",
      },
      labels: {
        formatter: function (val: number) {
          return val.toFixed(0)
        },
        style: {
          colors: "#999999",
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
      },
      // Force dark background and white text in both light and dark modes
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const date = w.globals.categoryLabels[dataPointIndex]
        const portfolio = series[0][dataPointIndex]
        const benchmark = series[1][dataPointIndex]

        return `
          <div style="background: #1a1a1a; padding: 10px; border-radius: 4px; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <div style="font-weight: 600; margin-bottom: 6px; border-bottom: 1px solid #333; padding-bottom: 4px;">${date}</div>
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #FFE600; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #ccc;">Your Portfolio:</span>
              <span style="font-weight: 600; margin-left: 8px;">${portfolio.toFixed(2)}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #CCCCCC; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #ccc;">SPX:</span>
              <span style="font-weight: 600; margin-left: 8px;">${benchmark.toFixed(2)}</span>
            </div>
          </div>
        `
      },
    },
    legend: {
      position: "top" as const,
      horizontalAlign: "left" as const,
      labels: {
        colors: "#999999",
      },
    },
    colors: ["#FFE600", "#CCCCCC"],
    grid: {
      borderColor: "#CCCCCC",
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
  }

  const series = [
    {
      name: "Your Portfolio",
      data: data.portfolioSeries,
    },
    {
      name: benchmarkName,
      data: data.benchmarkSeries,
    },
  ]

  // Calculate outperformance
  const latestPortfolio = data.portfolioSeries[data.portfolioSeries.length - 1]
  const latestBenchmark = data.benchmarkSeries[data.benchmarkSeries.length - 1]
  const outperformance = latestPortfolio - latestBenchmark

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="line" height={350} />
        <div className="mt-4 flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Your Portfolio</p>
            <p className="text-2xl font-bold text-primary">
              {((latestPortfolio - 100)).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{benchmarkName}</p>
            <p className="text-2xl font-bold text-[#999999]">
              {((latestBenchmark - 100)).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Outperformance</p>
            <p
              className={`text-2xl font-bold ${
                outperformance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {outperformance >= 0 ? "+" : ""}
              {outperformance.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
