import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userAccounts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const accountId = parseInt(params.id)

    if (isNaN(accountId)) {
      return NextResponse.json({ success: false, error: "Invalid account ID" }, { status: 400 })
    }

    // Fetch account
    const account = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.accountId, accountId))
      .limit(1)

    if (account.length === 0) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        accountId: account[0].accountId,
        accountName: account[0].accountName,
        accountType: account[0].accountType,
        cashBalance: account[0].cashBalance,
      },
    })
  } catch (error: any) {
    console.error("Error fetching account balance:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch account balance" },
      { status: 500 }
    )
  }
}
