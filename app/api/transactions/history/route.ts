import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userTransactions, userAccounts, assetType } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const accountId = searchParams.get("accountId")
    const transType = searchParams.get("type") // Filter by type: BUY, SELL, DEPOSIT, WITHDRAW, or "all"

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    // Build query
    let query = db
      .select({
        transId: userTransactions.transId,
        userId: userTransactions.userId,
        accountId: userTransactions.accountId,
        accountName: userAccounts.accountName,
        accountType: userAccounts.accountType,
        assetId: userTransactions.assetId,
        assetTicker: assetType.assetTicker,
        assetName: assetType.assetName,
        transType: userTransactions.transType,
        date: userTransactions.date,
        units: userTransactions.units,
        pricePerUnit: userTransactions.pricePerUnit,
        cost: userTransactions.cost,
        description: userTransactions.description,
      })
      .from(userTransactions)
      .leftJoin(userAccounts, eq(userTransactions.accountId, userAccounts.accountId))
      .leftJoin(assetType, eq(userTransactions.assetId, assetType.assetId))
      .where(eq(userTransactions.userId, parseInt(userId)))
      .orderBy(desc(userTransactions.date))

    const transactions = await query

    // Filter by account if provided
    let filteredTransactions = transactions
    if (accountId) {
      filteredTransactions = transactions.filter(
        (t) => t.accountId === parseInt(accountId)
      )
    }

    // Filter by type if provided (and not "all")
    if (transType && transType !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.transType === transType.toUpperCase()
      )
    }

    // Format transactions for frontend
    const formattedTransactions = filteredTransactions.map((t) => ({
      transactionId: t.transId,
      userId: t.userId,
      accountId: t.accountId,
      accountName: t.accountName || "N/A",
      accountType: t.accountType || "N/A",
      type: t.transType,
      date: t.date,
      symbol: t.assetTicker || "N/A",
      assetName: t.assetName || "N/A",
      quantity: t.units,
      pricePerShare: t.pricePerUnit,
      amount: t.cost,
      description: t.description,
      // Color coding hint for UI
      isPositive: t.transType === "DEPOSIT" || t.transType === "SELL",
      isNegative: t.transType === "WITHDRAW" || t.transType === "BUY",
    }))

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        totalTransactions: formattedTransactions.length,
        summary: {
          totalDeposits: formattedTransactions
            .filter((t) => t.type === "DEPOSIT")
            .reduce((sum, t) => sum + t.amount, 0),
          totalWithdrawals: formattedTransactions
            .filter((t) => t.type === "WITHDRAW")
            .reduce((sum, t) => sum + t.amount, 0),
          totalBuys: formattedTransactions
            .filter((t) => t.type === "BUY")
            .reduce((sum, t) => sum + t.amount, 0),
          totalSells: formattedTransactions
            .filter((t) => t.type === "SELL")
            .reduce((sum, t) => sum + t.amount, 0),
        },
      },
    })
  } catch (error: any) {
    console.error("Error fetching transaction history:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transaction history" },
      { status: 500 }
    )
  }
}
