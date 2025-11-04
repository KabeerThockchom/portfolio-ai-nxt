import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userAccounts, userTransactions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accountId, amount, description } = body

    if (!accountId || amount === undefined || amount === null) {
      return NextResponse.json(
        { success: false, error: "accountId and amount are required" },
        { status: 400 }
      )
    }

    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      )
    }

    // Fetch account
    const account = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.accountId, parseInt(accountId)))
      .limit(1)

    if (account.length === 0) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }

    const userId = account[0].userId
    const currentBalance = account[0].cashBalance

    // Validate sufficient balance
    if (currentBalance < withdrawAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient funds. Available balance: $${currentBalance.toLocaleString()}`,
        },
        { status: 400 }
      )
    }

    const newBalance = currentBalance - withdrawAmount

    // Update account balance
    await db
      .update(userAccounts)
      .set({ cashBalance: newBalance })
      .where(eq(userAccounts.accountId, parseInt(accountId)))

    // Create transaction record
    const transaction = await db
      .insert(userTransactions)
      .values({
        userId,
        accountId: parseInt(accountId),
        assetId: null,
        transType: "WITHDRAW",
        date: new Date().toISOString(),
        units: null,
        pricePerUnit: null,
        cost: withdrawAmount,
        description: description || "Cash withdrawal",
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: {
        accountId: parseInt(accountId),
        accountName: account[0].accountName,
        withdrawAmount,
        previousBalance: currentBalance,
        newBalance,
        transactionId: transaction[0].transId,
        timestamp: transaction[0].date,
      },
    })
  } catch (error: any) {
    console.error("Error processing withdrawal:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process withdrawal" },
      { status: 500 }
    )
  }
}
