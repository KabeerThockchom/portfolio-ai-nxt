import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/connection"
import { users } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * Voice Authentication endpoint
 * GET /api/auth/voice-login?name=xxx&dob=yyyy-mm-dd
 *
 * Authenticate user via full name and date of birth
 * Used by AI voice assistant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const dob = searchParams.get("dob")

    // Validate required parameters
    if (!name || !dob) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and date of birth are required",
        },
        { status: 400 }
      )
    }

    // Query user by name and date of birth
    const matchingUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.name, name), eq(users.dob, dob)))

    // Check for no match
    if (!matchingUsers || matchingUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No user found with this name and date of birth",
        },
        { status: 404 }
      )
    }

    // Check for multiple matches (should not happen with unique users)
    if (matchingUsers.length > 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Multiple users found with this name and date of birth. Please contact support.",
        },
        { status: 409 } // Conflict
      )
    }

    const dbUser = matchingUsers[0]

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
