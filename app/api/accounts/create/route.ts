import { NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { userAccounts } from "@/lib/db/schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, accountName, accountType } = body

    if (!userId || !accountName || !accountType) {
      return NextResponse.json(
        { success: false, error: "userId, accountName, and accountType are required" },
        { status: 400 }
      )
    }

    // Validate account type
    const validTypes = ["checking", "savings", "brokerage"]
    if (!validTypes.includes(accountType)) {
      return NextResponse.json(
        { success: false, error: `Account type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Create new account
    const newAccount = await db
      .insert(userAccounts)
      .values({
        userId: parseInt(userId),
        accountName,
        accountType,
        cashBalance: 0,
        isDefault: false,
        createdAt: new Date().toISOString(),
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: {
        accountId: newAccount[0].accountId,
        accountName: newAccount[0].accountName,
        accountType: newAccount[0].accountType,
        cashBalance: newAccount[0].cashBalance,
        isDefault: newAccount[0].isDefault,
        createdAt: newAccount[0].createdAt,
      },
    })
  } catch (error: any) {
    console.error("Error creating account:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create account" },
      { status: 500 }
    )
  }
}
