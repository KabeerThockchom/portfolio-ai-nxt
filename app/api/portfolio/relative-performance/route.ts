import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
  relativeBenchmarks,
  assetHistory,
} from "@/lib/db/schema"
import { eq, and, desc, lte } from "drizzle-orm"
import type {
  RelativePerformanceRequest,
  RelativePerformanceResponse,
} from "@/types/portfolio"

// Helper to get price at a specific date or closest before
async function getPriceAtDate(
  assetTicker: string,
  targetDate: Date
): Promise<number | null> {
  const asset = await db
    .select()
    .from(assetType)
    .where(eq(assetType.assetTicker, assetTicker))
    .limit(1)

  if (asset.length === 0) return null

  const prices = await db
    .select()
    .from(assetHistory)
    .where(
      and(
        eq(assetHistory.assetId, asset[0].assetId),
        lte(assetHistory.date, targetDate.toISOString().split("T")[0])
      )
    )
    .orderBy(desc(assetHistory.date))
    .limit(1)

  return prices[0]?.closePrice || null
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

    const { startDate, endDate } = getDateRange(period)

    // Get user's portfolio holdings
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Calculate returns for each holding
    const performance = await Promise.all(
      holdings.map(async ({ user_portfolio, asset_type }) => {
        if (!asset_type) return null

        // Find relative benchmark
        const benchmarks = await db
          .select()
          .from(relativeBenchmarks)
          .where(eq(relativeBenchmarks.assetTicker, asset_type.assetTicker))
          .limit(1)

        const relativeBenchmark =
          benchmarks.length > 0 ? benchmarks[0].relativeBenchmark : "SPX"

        // Get historical prices for the holding
        const startPrice = await getPriceAtDate(asset_type.assetTicker, startDate)
        const endPrice = await getPriceAtDate(asset_type.assetTicker, endDate)

        // Get historical prices for the benchmark
        const benchmarkStartPrice = await getPriceAtDate(relativeBenchmark, startDate)
        const benchmarkEndPrice = await getPriceAtDate(relativeBenchmark, endDate)

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
    )

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
