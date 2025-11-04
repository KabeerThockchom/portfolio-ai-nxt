import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { users } from "@/lib/db/schema"

/**
 * Users list endpoint
 * GET /api/users?skip=0&limit=10
 *
 * Returns list of all users (for admin/management view)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "100")

    // Fetch users with pagination
    const allUsers = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(skip)

    // Transform to response format (excluding passwords for list view)
    const responseUsers = allUsers.map(user => ({
      user_id: user.userId,
      name: user.name,
      username: user.username,
      email: user.email,
      dob: user.dob,
      phone_number: user.phoneNumber,
    }))

    return NextResponse.json({
      success: true,
      data: responseUsers,
      count: responseUsers.length,
      message: "success",
    })

  } catch (error) {
    console.error("Users list error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
