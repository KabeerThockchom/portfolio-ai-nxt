import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
  assetHistory,
} from "@/lib/db/schema"
import { eq, and, desc, lte } from "drizzle-orm"
import type { BenchmarkRequest, BenchmarkResponse } from "@/types/portfolio"

// Helper to calculate time periods based on interval
function getTimePeriods(
  startDate: Date,
  endDate: Date,
  interval: "weekly" | "monthly" | "quarterly" | "yearly"
): Date[] {
  const periods: Date[] = []
  let current = new Date(endDate)

  while (current >= startDate) {
    periods.push(new Date(current))

    switch (interval) {
      case "weekly":
        current.setDate(current.getDate() - 7)
        break
      case "monthly":
        current.setMonth(current.getMonth() - 1)
        break
      case "quarterly":
        current.setMonth(current.getMonth() - 3)
        break
      case "yearly":
        current.setFullYear(current.getFullYear() - 1)
        break
    }
  }

  return periods.reverse()
}

// Helper to get closest price on or before a target date
async function getClosestPrice(
  assetId: number,
  targetDate: Date
): Promise<number> {
  const prices = await db
    .select()
    .from(assetHistory)
    .where(
      and(
        eq(assetHistory.assetId, assetId),
        lte(assetHistory.date, targetDate.toISOString().split("T")[0])
      )
    )
    .orderBy(desc(assetHistory.date))
    .limit(1)

  return prices[0]?.closePrice || 0
}

export async function POST(request: Request) {
  try {
    const body: BenchmarkRequest = await request.json()
    const { userId, benchmark, period, history } = body

    if (!userId || !benchmark || !period || !history) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, benchmark, period, and history are required",
        },
        { status: 400 }
      )
    }

    // Get benchmark asset ID
    const benchmarkAssets = await db
      .select()
      .from(assetType)
      .where(eq(assetType.assetTicker, benchmark))
      .limit(1)

    if (benchmarkAssets.length === 0) {
      return NextResponse.json(
        { success: false, error: `Benchmark ${benchmark} not found` },
        { status: 404 }
      )
    }

    const benchmarkAssetId = benchmarkAssets[0].assetId

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - history)

    // Get time periods based on interval
    const periods = getTimePeriods(startDate, endDate, period)

    // Get user's portfolio holdings
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Calculate portfolio values for each period
    const comparison = await Promise.all(
      periods.map(async (date) => {
        // Calculate total portfolio value at this date
        let totalPortfolioValue = 0

        for (const { user_portfolio, asset_type } of holdings) {
          if (!asset_type) continue

          const price = await getClosestPrice(asset_type.assetId, date)
          const value = user_portfolio.assetTotalUnits * price
          totalPortfolioValue += value
        }

        // Get benchmark price at this date
        const benchmarkPrice = await getClosestPrice(benchmarkAssetId, date)

        return {
          date: date.toISOString().split("T")[0],
          portfolioValue: totalPortfolioValue,
          benchmarkPrice,
        }
      })
    )

    // Index to 100 at start
    const basePortfolioValue = comparison[0].portfolioValue || 1
    const baseBenchmarkPrice = comparison[0].benchmarkPrice || 1

    const indexedComparison = comparison.map((item) => ({
      date: item.date,
      portfolioValue: (item.portfolioValue / basePortfolioValue) * 100,
      benchmarkValue: (item.benchmarkPrice / baseBenchmarkPrice) * 100,
      portfolioReturn: ((item.portfolioValue - basePortfolioValue) / basePortfolioValue) * 100,
      benchmarkReturn: ((item.benchmarkPrice - baseBenchmarkPrice) / baseBenchmarkPrice) * 100,
    }))

    // Create chart data
    const chartData = {
      categories: indexedComparison.map((c) => c.date),
      portfolioSeries: indexedComparison.map((c) => c.portfolioValue),
      benchmarkSeries: indexedComparison.map((c) => c.benchmarkValue),
      portfolioReturnSeries: indexedComparison.map((c) => c.portfolioReturn),
      benchmarkReturnSeries: indexedComparison.map((c) => c.benchmarkReturn),
    }

    const response: BenchmarkResponse = {
      success: true,
      data: {
        comparison: indexedComparison,
        chartData,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error benchmarking portfolio:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to benchmark portfolio",
      },
      { status: 500 }
    )
  }
}
