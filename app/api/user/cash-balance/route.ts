import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userPortfolio, assetType, assetHistory } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import type { CashBalanceResponse } from "@/types/portfolio"

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

    const userIdNum = parseInt(userId)

    // Get cash holdings (asset_class = "Cash")
    const cashHoldings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userIdNum))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))
      .then((results) =>
        results.filter(
          ({ asset_type }) =>
            asset_type?.assetClass?.toLowerCase() === "cash"
        )
      )

    // Calculate total cash balance (sum of all cash holdings)
    const cashBalance = cashHoldings.reduce((sum, { user_portfolio }) => {
      return sum + (user_portfolio.assetTotalUnits || 0)
    }, 0)

    // Get all portfolio holdings to calculate total portfolio value
    const allHoldings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userIdNum))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    // Calculate total portfolio value with latest prices
    let totalPortfolioValue = 0
    let totalInvested = 0

    for (const { user_portfolio, asset_type } of allHoldings) {
      totalInvested += user_portfolio.investmentAmount

      if (!asset_type) continue

      // Cash is already at face value
      if (asset_type.assetClass?.toLowerCase() === "cash") {
        totalPortfolioValue += user_portfolio.assetTotalUnits
      } else {
        // Get latest price for non-cash assets
        const latestPriceRecord = await db
          .select()
          .from(assetHistory)
          .where(eq(assetHistory.assetId, asset_type.assetId))
          .orderBy(desc(assetHistory.date))
          .limit(1)

        const latestClosePrice = latestPriceRecord[0]?.closePrice || 0
        totalPortfolioValue += user_portfolio.assetTotalUnits * latestClosePrice
      }
    }

    const response: CashBalanceResponse = {
      success: true,
      data: {
        userId: userIdNum,
        cashBalance,
        totalPortfolioValue,
        totalInvested,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching cash balance:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch cash balance",
      },
      { status: 500 }
    )
  }
}
