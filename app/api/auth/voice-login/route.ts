import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/**
 * Voice Authentication endpoint
 * GET /api/auth/voice-login?phone=xxx&dob=yyyy-mm-dd
 *
 * Authenticate user via phone number and date of birth
 * Used by AI voice assistant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const dob = searchParams.get("dob")

    // Validate required parameters
    if (!phone || !dob) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and date of birth are required",
        },
        { status: 400 }
      )
    }

    // Query user by phone number
    const user = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phone))
      .limit(1)

    if (!user || user.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found with this phone number",
        },
        { status: 404 }
      )
    }

    const dbUser = user[0]

    // Verify date of birth
    if (dob !== dbUser.dob) {
      return NextResponse.json(
        {
          success: false,
          message: "Date of birth does not match",
        },
        { status: 401 }
      )
    }

    // Transform database field names to match response format
    const responseUser = {
      user_id: dbUser.userId,
      name: dbUser.name,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      dob: dbUser.dob,
      phone_number: dbUser.phoneNumber,
    }

    // Return success response
    return NextResponse.json({
      data: responseUser,
      message: "success",
    })

  } catch (error) {
    console.error("Voice login error:", error)
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
