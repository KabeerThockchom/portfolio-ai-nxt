import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/**
 * Single user detail endpoint
 * GET /api/users/[id]
 *
 * Returns details for a specific user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      )
    }

    // Fetch user by ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1)

    if (!user || user.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      )
    }

    const dbUser = user[0]

    // Transform to response format
    const responseUser = {
      user_id: dbUser.userId,
      name: dbUser.name,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      dob: dbUser.dob,
      phone_number: dbUser.phoneNumber,
    }

    return NextResponse.json({
      data: responseUser,
      message: "success",
    })

  } catch (error) {
    console.error("User detail error:", error)
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
