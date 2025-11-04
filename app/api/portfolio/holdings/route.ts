import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userPortfolio, assetType } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
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

        // Get latest real-time price
        let latestClosePrice = 0

        // For Cash, always use $1.00 (no need to fetch from API)
        if (asset_type.assetClass === "Cash") {
          latestClosePrice = 1.0
        } else {
          // Get real-time price from Yahoo Finance API for other assets
          try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
            const quoteResponse = await fetch(`${baseUrl}/api/stock/quote?symbol=${asset_type.assetTicker}`)

            // Check if response is OK before parsing
            if (!quoteResponse.ok) {
              console.warn(`Quote API returned ${quoteResponse.status} for ${asset_type.assetTicker}`)
              latestClosePrice = 0
            } else {
              const quoteData = await quoteResponse.json()

              if (quoteData.success && quoteData.data?.price) {
                latestClosePrice = quoteData.data.price
              } else {
                console.warn(`Failed to fetch real-time price for ${asset_type.assetTicker}: ${quoteData.error || 'Unknown error'}`)
                latestClosePrice = 0
              }
            }
          } catch (error) {
            console.error(`Error fetching real-time price for ${asset_type.assetTicker}:`, error)
            latestClosePrice = 0
          }
        }
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
