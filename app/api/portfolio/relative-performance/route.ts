import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
  relativeBenchmarks,
} from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type {
  RelativePerformanceRequest,
  RelativePerformanceResponse,
} from "@/types/portfolio"
import { getHistoricalPrices } from "@/lib/services/price-service"

// Helper to get price at a specific date or closest before from price array
function getPriceAtDate(
  prices: Array<{ date: string; closePrice: number }>,
  targetDate: Date
): number | null {
  const targetDateStr = targetDate.toISOString().split("T")[0]

  // Filter prices on or before target date
  const validPrices = prices.filter(p => p.date <= targetDateStr)

  if (validPrices.length === 0) {
    return null
  }

  // Return the closest (most recent) price
  return validPrices[validPrices.length - 1].closePrice
}

// Helper to calculate date range based on period
function getDateRange(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case "1w":
      startDate.setDate(startDate.getDate() - 7)
      break
    case "1m":
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case "3m":
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case "6m":
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    case "2y":
      startDate.setFullYear(startDate.getFullYear() - 2)
      break
    case "3y":
      startDate.setFullYear(startDate.getFullYear() - 3)
      break
    case "5y":
      startDate.setFullYear(startDate.getFullYear() - 5)
      break
    default:
      startDate.setFullYear(startDate.getFullYear() - 1)
  }

  return { startDate, endDate }
}

export async function POST(request: Request) {
  try {
    const body: RelativePerformanceRequest = await request.json()
    const { userId, period } = body

    if (!userId || !period) {
      return NextResponse.json(
        { success: false, error: "userId and period are required" },
        { status: 400 }
      )
    }

    // Get the base URL from the request to handle dynamic ports in development
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}://${host}`

    const { startDate, endDate } = getDateRange(period)

    // Get user's portfolio holdings
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Fetch historical prices for all holdings and benchmarks upfront (with caching)
    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    // Create price map: symbol -> prices array
    const priceMap = new Map<string, Array<{ date: string; closePrice: number }>>()

    // Get benchmark mapping for each holding
    const benchmarkMap = new Map<string, string>()
    await Promise.all(
      holdings.map(async ({ asset_type }) => {
        if (!asset_type) return

        // Find relative benchmark
        const benchmarks = await db
          .select()
          .from(relativeBenchmarks)
          .where(eq(relativeBenchmarks.assetTicker, asset_type.assetTicker))
          .limit(1)

        const relativeBenchmark =
          benchmarks.length > 0 ? benchmarks[0].relativeBenchmark : "^GSPC"

        benchmarkMap.set(asset_type.assetTicker, relativeBenchmark)
      })
    )

    // Fetch prices for all holdings
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

    // Fetch prices for all unique benchmarks
    const uniqueBenchmarks = Array.from(new Set(benchmarkMap.values()))
    await Promise.all(
      uniqueBenchmarks.map(async (benchmark) => {
        const prices = await getHistoricalPrices(
          benchmark,
          startDateStr,
          endDateStr,
          baseUrl
        )
        priceMap.set(benchmark, prices)
      })
    )

    // Calculate returns for each holding
    const performance = holdings.map(({ user_portfolio, asset_type }) => {
        if (!asset_type) return null

        const relativeBenchmark = benchmarkMap.get(asset_type.assetTicker) || "^GSPC"

        // Get prices from map
        const holdingPrices = priceMap.get(asset_type.assetTicker) || []
        const benchmarkPrices = priceMap.get(relativeBenchmark) || []

        // Get historical prices for the holding
        const startPrice = getPriceAtDate(holdingPrices, startDate)
        const endPrice = getPriceAtDate(holdingPrices, endDate)

        // Get historical prices for the benchmark
        const benchmarkStartPrice = getPriceAtDate(benchmarkPrices, startDate)
        const benchmarkEndPrice = getPriceAtDate(benchmarkPrices, endDate)

        // Calculate returns
        const portfolioReturn =
          startPrice && endPrice
            ? ((endPrice - startPrice) / startPrice) * 100
            : 0

        const benchmarkReturn =
          benchmarkStartPrice && benchmarkEndPrice
            ? ((benchmarkEndPrice - benchmarkStartPrice) / benchmarkStartPrice) *
              100
            : 0

        const outperformance = portfolioReturn - benchmarkReturn

        return {
          ticker: asset_type.assetTicker,
          assetName: asset_type.assetName,
          portfolioReturn: Math.round(portfolioReturn * 100) / 100,
          benchmarkReturn: Math.round(benchmarkReturn * 100) / 100,
          relativeBenchmark,
          outperformance: Math.round(outperformance * 100) / 100,
        }
      })

    const validPerformance = performance.filter((p) => p !== null)

    const response: RelativePerformanceResponse = {
      success: true,
      data: {
        performance: validPerformance,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error calculating relative performance:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate relative performance",
      },
      { status: 500 }
    )
  }
}
