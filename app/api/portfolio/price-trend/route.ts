import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import {
  userPortfolio,
  assetType,
  assetHistory,
} from "@/lib/db/schema"
import { eq, and, desc, gte } from "drizzle-orm"

export interface PriceTrendRequest {
  userId: string
  tickers?: string[] // Optional: specific tickers to analyze
  timeHistory: number // Years of history to fetch
}

export interface PriceTrendData {
  ticker: string
  assetName: string
  priceHistory: Array<{
    date: string
    price: number
    percentChange: number // % change from start
  }>
  startPrice: number
  currentPrice: number
  totalReturn: number
  totalReturnPercent: number
}

export interface PriceTrendResponse {
  success: boolean
  data?: {
    trends: PriceTrendData[]
    chartData: {
      categories: string[]
      series: Array<{
        name: string
        data: number[]
      }>
    }
  }
  error?: string
}

export async function POST(request: Request) {
  try {
    const body: PriceTrendRequest = await request.json()
    const { userId, tickers, timeHistory = 2 } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    // Get user's portfolio holdings
    let holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Filter by specific tickers if provided
    if (tickers && tickers.length > 0) {
      holdings = holdings.filter(
        ({ asset_type }) =>
          asset_type && tickers.includes(asset_type.assetTicker)
      )
    }

    // Calculate start date
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - timeHistory)

    // Fetch price trends for each holding
    const trends: PriceTrendData[] = await Promise.all(
      holdings.map(async ({ user_portfolio, asset_type }) => {
        if (!asset_type) return null

        // Fetch historical prices
        const prices = await db
          .select()
          .from(assetHistory)
          .where(
            and(
              eq(assetHistory.assetId, asset_type.assetId),
              gte(assetHistory.date, startDate.toISOString().split("T")[0])
            )
          )
          .orderBy(assetHistory.date)

        if (prices.length === 0) return null

        const startPrice = prices[0].closePrice
        const currentPrice = prices[prices.length - 1].closePrice
        const totalReturn = currentPrice - startPrice
        const totalReturnPercent = (totalReturn / startPrice) * 100

        const priceHistory = prices.map((p) => ({
          date: p.date,
          price: p.closePrice,
          percentChange: ((p.closePrice - startPrice) / startPrice) * 100,
        }))

        return {
          ticker: asset_type.assetTicker,
          assetName: asset_type.assetName,
          priceHistory,
          startPrice,
          currentPrice,
          totalReturn: Math.round(totalReturn * 100) / 100,
          totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
        }
      })
    )

    const validTrends = trends.filter((t): t is PriceTrendData => t !== null)

    if (validTrends.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          trends: [],
          chartData: { categories: [], series: [] },
        },
      })
    }

    // Create chart data (all holdings share the same date axis)
    const categories = validTrends[0].priceHistory.map((p) => p.date)
    const series = validTrends.map((trend) => ({
      name: trend.assetName,
      data: trend.priceHistory.map((p) => p.percentChange),
    }))

    const response: PriceTrendResponse = {
      success: true,
      data: {
        trends: validTrends,
        chartData: {
          categories,
          series,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching price trends:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch price trends",
      },
      { status: 500 }
    )
  }
}
