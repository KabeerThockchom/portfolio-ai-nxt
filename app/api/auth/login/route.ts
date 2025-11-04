import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/**
 * Authentication endpoint - Login
 * GET /api/auth/login?email_id=xxx&password=yyy
 *
 * Simple authentication matching PortfolioAIEY pattern
 * Uses GET with query params (quick integration, not production-secure)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email_id = searchParams.get("email_id")
    const password = searchParams.get("password")

    // Validate required parameters
    if (!email_id || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      )
    }

    // Query user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email_id))
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

    // Plain text password comparison (as per quick integration requirement)
    if (password !== dbUser.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password",
        },
        { status: 401 }
      )
    }

    // Transform database field names to match PortfolioAIEY response format
    const responseUser = {
      user_id: dbUser.userId,
      name: dbUser.name,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      dob: dbUser.dob,
      phone_number: dbUser.phoneNumber,
    }

    // Return success response matching PortfolioAIEY format
    return NextResponse.json({
      data: responseUser,
      message: "success",
    })

  } catch (error) {
    console.error("Login error:", error)
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
