import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userAccounts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Fetch all accounts for the user
    const accounts = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.userId, parseInt(userId)))
      .orderBy(userAccounts.isDefault, userAccounts.accountName)

    return NextResponse.json({
      success: true,
      data: {
        accounts: accounts.map((acc) => ({
          accountId: acc.accountId,
          accountName: acc.accountName,
          accountType: acc.accountType,
          cashBalance: acc.cashBalance,
          isDefault: acc.isDefault,
          createdAt: acc.createdAt,
        })),
        totalCash: accounts.reduce((sum, acc) => sum + acc.cashBalance, 0),
      },
    })
  } catch (error: any) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    )
  }
}
