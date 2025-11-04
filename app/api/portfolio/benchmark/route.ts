import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { BenchmarkRequest, BenchmarkResponse } from "@/types/portfolio"
import { getHistoricalPrices } from "@/lib/services/price-service"

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

// Helper to get closest price on or before a target date from price array
function getClosestPrice(
  prices: Array<{ date: string; closePrice: number }>,
  targetDate: Date
): number {
  const targetDateStr = targetDate.toISOString().split("T")[0]

  // Filter prices on or before target date
  const validPrices = prices.filter(p => p.date <= targetDateStr)

  if (validPrices.length === 0) {
    return 0
  }

  // Return the closest (most recent) price
  return validPrices[validPrices.length - 1].closePrice
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

    // Get the base URL from the request to handle dynamic ports in development
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}://${host}`

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

    // Fetch historical prices for all holdings and benchmark upfront (with caching)
    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    // Create price map: symbol -> prices array
    const priceMap = new Map<string, Array<{ date: string; closePrice: number }>>()

    // Fetch prices for each holding
    await Promise.all(
      holdings.map(async ({ asset_type }) => {
        if (!asset_type) return

        const prices = await getHistoricalPrices(
          asset_type.assetTicker,
          startDateStr,
          endDateStr,
          baseUrl
        )
        priceMap.set(asset_type.assetTicker, prices)
      })
    )

    // Fetch benchmark prices
    const benchmarkPrices = await getHistoricalPrices(
      benchmark,
      startDateStr,
      endDateStr,
      baseUrl
    )

    // Calculate portfolio values for each period
    const comparison = periods.map((date) => {
      // Calculate total portfolio value at this date
      let totalPortfolioValue = 0

      for (const { user_portfolio, asset_type } of holdings) {
        if (!asset_type) continue

        const prices = priceMap.get(asset_type.assetTicker) || []
        const price = getClosestPrice(prices, date)
        const value = user_portfolio.assetTotalUnits * price
        totalPortfolioValue += value
      }

      // Get benchmark price at this date
      const benchmarkPrice = getClosestPrice(benchmarkPrices, date)

      return {
        date: date.toISOString().split("T")[0],
        portfolioValue: totalPortfolioValue,
        benchmarkPrice,
      }
    })

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
