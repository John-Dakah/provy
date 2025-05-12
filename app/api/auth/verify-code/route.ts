import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { email, code, userId } = body

    console.log("Verification request received:", { email, code: "******", userId: userId || "not provided" })

    // Validate required fields
    if (!email || !code) {
      console.error("Missing required fields")
      return NextResponse.json({ success: false, message: "Email and verification code are required" }, { status: 400 })
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      console.error("Invalid code format")
      return NextResponse.json({ success: false, message: "Verification code must be 6 digits" }, { status: 400 })
    }

    // Step 1: Find the user by email
    let user
    try {
      // First try to get the user from auth.users
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          email: email,
        },
      })

      if (authError) {
        throw new Error(`Error fetching auth user: ${authError.message}`)
      }

      if (authUser && authUser.users && authUser.users.length > 0) {
        user = authUser.users[0]
        console.log("Found user in auth.users:", user.id)
      } else {
        // If not found in auth.users, try the custom users table
        const { data: customUser, error: customError } = await supabaseAdmin
          .from("users")
          .select("id, email")
          .eq("email", email)
          .single()

        if (customError) {
          throw new Error(`Error fetching custom user: ${customError.message}`)
        }

        if (!customUser) {
          throw new Error("User not found")
        }

        // Now get the auth user by ID
        const { data: authUserById, error: authByIdError } = await supabaseAdmin.auth.admin.getUserById(customUser.id)

        if (authByIdError) {
          throw new Error(`Error fetching auth user by ID: ${authByIdError.message}`)
        }

        user = authUserById.user
        console.log("Found user in custom users table:", user.id)
      }
    } catch (error) {
      console.error("Error finding user:", error)
      return NextResponse.json(
        { success: false, message: "User not found. Please try registering again." },
        { status: 404 },
      )
    }

    if (!user) {
      console.error("User not found after all attempts")
      return NextResponse.json(
        { success: false, message: "User not found. Please try registering again." },
        { status: 404 },
      )
    }

    // Step 2: Check the verification code
    console.log("User metadata:", user.user_metadata)

    const storedCode = user.user_metadata?.verification_code
    const expiresAt = user.user_metadata?.verification_code_expires_at

    if (!storedCode) {
      console.error("No verification code found in user metadata")
      return NextResponse.json(
        {
          success: false,
          message: "No verification code found. Please request a new code.",
        },
        { status: 400 },
      )
    }

    // Check if code is expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      console.error("Verification code expired")
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new code.",
        },
        { status: 400 },
      )
    }

    // Check if code matches
    if (code !== storedCode) {
      console.error("Code mismatch. Provided:", code, "Stored:", storedCode)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code. Please check and try again.",
        },
        { status: 400 },
      )
    }

    console.log("Verification code is valid")

    // Step 3: Update user as verified
    try {
      // Update user metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          email_verified: true,
          verification_completed_at: new Date().toISOString(),
        },
        email_confirm: true,
      })

      if (updateError) {
        throw new Error(`Error updating user: ${updateError.message}`)
      }

      console.log("Updated user metadata")

      // Update verification record if it exists
      try {
        await supabaseAdmin
          .from("email_verifications")
          .update({
            verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        console.log("Updated verification record")
      } catch (verificationError) {
        // Non-critical error, just log it
        console.warn("Error updating verification record:", verificationError)
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        userId: user.id,
      })
    } catch (error) {
      console.error("Error updating user verification status:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update verification status. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in verification process:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
