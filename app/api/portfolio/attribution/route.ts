import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userPortfolio, assetType, assetHistory } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import type {
  ReturnsAttributionRequest,
  ReturnsAttributionResponse,
} from "@/types/portfolio"

// Simplified returns attribution
// Full implementation requires historical data analysis

export async function POST(request: Request) {
  try {
    const body: ReturnsAttributionRequest = await request.json()
    const { userId, dimension } = body

    if (!userId || !dimension) {
      return NextResponse.json(
        { success: false, error: "userId and dimension are required" },
        { status: 400 }
      )
    }

    // Get current holdings with returns
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    const enrichedHoldings = await Promise.all(
      holdings.map(async ({ user_portfolio, asset_type }) => {
        if (!asset_type) return null

        const latestPriceRecord = await db
          .select()
          .from(assetHistory)
          .where(eq(assetHistory.assetId, asset_type.assetId))
          .orderBy(desc(assetHistory.date))
          .limit(1)

        const latestClosePrice = latestPriceRecord[0]?.closePrice || 0
        const currentAmount = user_portfolio.assetTotalUnits * latestClosePrice
        const gainLoss = currentAmount - user_portfolio.investmentAmount
        const weightedReturn =
          (gainLoss / user_portfolio.investmentAmount) *
          (currentAmount / 100) // Simplified weight

        return {
          asset: asset_type,
          currentAmount,
          weightedReturn,
          gainLoss,
        }
      })
    )

    const validHoldings = enrichedHoldings.filter((h) => h !== null)

    // Aggregate by dimension
    const attributionMap = new Map()

    for (const holding of validHoldings) {
      let key = ""
      switch (dimension) {
        case "asset_class":
          key = holding.asset?.assetClass || "Unknown"
          break
        case "sector":
          key = "General" // Simplified - would need sector breakdown
          break
        case "ticker":
          key = holding.asset?.assetTicker || "Unknown"
          break
        default:
          key = holding.asset?.assetClass || "Unknown"
      }

      if (attributionMap.has(key)) {
        const existing = attributionMap.get(key)
        existing.contribution += holding.gainLoss
        existing.weightedReturn += holding.weightedReturn
      } else {
        attributionMap.set(key, {
          dimension,
          label: key,
          contribution: holding.gainLoss,
          weightedReturn: holding.weightedReturn,
        })
      }
    }

    const attribution = Array.from(attributionMap.values())
    const totalReturn = attribution.reduce((sum, a) => sum + a.contribution, 0)

    // Create waterfall chart data
    const chartData = {
      categories: [
        ...attribution.map((a) => a.label),
        "Total Return",
      ],
      data: [...attribution.map((a) => a.contribution), totalReturn],
    }

    const response: ReturnsAttributionResponse = {
      success: true,
      data: {
        attribution,
        totalReturn,
        chartData,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error calculating returns attribution:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate returns attribution",
      },
      { status: 500 }
    )
  }
}
