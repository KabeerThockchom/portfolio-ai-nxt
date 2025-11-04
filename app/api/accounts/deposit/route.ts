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

    const depositAmount = parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
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
    const newBalance = currentBalance + depositAmount

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
        transType: "DEPOSIT",
        date: new Date().toISOString(),
        units: null,
        pricePerUnit: null,
        cost: depositAmount,
        description: description || "Cash deposit",
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: {
        accountId: parseInt(accountId),
        accountName: account[0].accountName,
        depositAmount,
        previousBalance: currentBalance,
        newBalance,
        transactionId: transaction[0].transId,
        timestamp: transaction[0].date,
      },
    })
  } catch (error: any) {
    console.error("Error processing deposit:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process deposit" },
      { status: 500 }
    )
  }
}
