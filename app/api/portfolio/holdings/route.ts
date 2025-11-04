import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userPortfolio, assetType, assetHistory } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import type { PortfolioHolding, PortfolioHoldingsResponse } from "@/types/portfolio"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    // Get all portfolio holdings for the user
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, parseInt(userId)))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Enrich holdings with latest prices and calculate current values
    const enrichedHoldings: PortfolioHolding[] = await Promise.all(
      holdings.map(async (holding) => {
        const { user_portfolio, asset_type } = holding

        if (!asset_type) {
          return {
            ...user_portfolio,
            latestClosePrice: 0,
            currentAmount: 0,
            gainLoss: 0,
            gainLossPercent: 0,
          } as PortfolioHolding
        }

        // Get latest price from asset_history
        const latestPriceRecord = await db
          .select()
          .from(assetHistory)
          .where(eq(assetHistory.assetId, asset_type.assetId))
          .orderBy(desc(assetHistory.date))
          .limit(1)

        const latestClosePrice = latestPriceRecord[0]?.closePrice || 0
        const currentAmount = user_portfolio.assetTotalUnits * latestClosePrice
        const gainLoss = currentAmount - user_portfolio.investmentAmount
        const gainLossPercent =
          user_portfolio.investmentAmount > 0
            ? (gainLoss / user_portfolio.investmentAmount) * 100
            : 0

        return {
          ...user_portfolio,
          asset: asset_type,
          latestClosePrice,
          currentAmount,
          gainLoss,
          gainLossPercent,
        } as PortfolioHolding
      })
    )

    // Calculate totals
    const totalValue = enrichedHoldings.reduce(
      (sum, h) => sum + (h.currentAmount || 0),
      0
    )
    const totalInvested = enrichedHoldings.reduce(
      (sum, h) => sum + h.investmentAmount,
      0
    )
    const totalGainLoss = totalValue - totalInvested
    const totalGainLossPercent =
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

    const response: PortfolioHoldingsResponse = {
      success: true,
      data: {
        holdings: enrichedHoldings,
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching portfolio holdings:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch holdings",
      },
      { status: 500 }
    )
  }
}
