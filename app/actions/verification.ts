"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { sendVerificationEmail } from "@/lib/email-service"

// Create a Supabase admin client with the service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

// Create a regular Supabase client for the current user
const getSupabase = () => {
  const cookieStore = cookies()
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

/**
 * Server action to resend a verification code
 */
export async function resendVerificationCode(email: string) {
  try {
    console.log("Resending verification code to:", email)

    // Generate a new 6-digit verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

    console.log("Generated new code:", newVerificationCode)

    // Get the user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, full_name, company_id")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      throw new Error("User not found")
    }

    console.log("Found user:", userData.id)

    // Get company name
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("name")
      .eq("id", userData.company_id)
      .single()

    if (companyError) {
      console.error("Error fetching company:", companyError)
      // Continue anyway, we'll just use a generic company name
    }

    const companyName = companyData?.name || "WorkForce"
    console.log("Company name:", companyName)

    // Update user metadata with new verification code
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.id, {
      user_metadata: {
        verification_code: newVerificationCode,
        verification_code_expires_at: expiresAt.toISOString(),
        email_verified: false,
      },
    })

    if (updateError) {
      console.error("Error updating user metadata:", updateError)
      throw new Error("Failed to update verification code")
    }

    console.log("Updated user metadata with new code")

    // Update or insert into email_verifications table
    const { error: verificationError } = await supabaseAdmin.from("email_verifications").upsert(
      {
        user_id: userData.id,
        email,
        verification_code: newVerificationCode,
        expires_at: expiresAt,
        verified: false,
        verified_at: null,
      },
      { onConflict: "user_id" },
    )

    if (verificationError) {
      console.error("Error updating verification record:", verificationError)
      // Continue anyway, as this is not critical
    }

    console.log("Updated verification record in database")

    // Send the verification email using our email service
    try {
      const emailResult = await sendVerificationEmail({
        email,
        code: newVerificationCode,
        userName: userData.full_name || "there",
        companyName,
      })

      console.log("Email sent successfully:", emailResult)

      return {
        success: true,
        message: "Verification code sent successfully",
        emailService: emailResult.service,
        previewHtml: emailResult.previewHtml, // Only in development mode
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      throw new Error("Failed to send verification email. Please try again.")
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return {
      success: false,
      message: error.message || "Failed to resend verification code. Please try again.",
    }
  }
}

/**
 * Server action to verify a code
 */
export async function verifyEmailCode(email: string, code: string) {
  try {
    console.log("Verifying code for email:", email)
    console.log("Code to verify:", code)

    // Get the user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      throw new Error("User not found")
    }

    console.log("Found user:", userData.id)

    // Get the user metadata to check the verification code
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userData.id)

    if (authError) {
      console.error("Error fetching user auth data:", authError)
      throw new Error("Failed to get user information")
    }

    console.log("Got user auth data")

    // Check if code matches the one in user metadata
    const storedCode = authData.user.user_metadata?.verification_code
    const expiresAt = authData.user.user_metadata?.verification_code_expires_at

    console.log("Stored code:", storedCode)
    console.log("Expires at:", expiresAt)

    // Check if code is expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      console.error("Code expired")
      throw new Error("Verification code has expired. Please request a new one.")
    }

    // Check if code matches
    if (code !== storedCode) {
      console.error("Code mismatch")
      throw new Error("Invalid verification code. Please try again.")
    }

    console.log("Code verified successfully")

    // Update verification record
    const { error: updateVerificationError } = await supabaseAdmin
      .from("email_verifications")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", userData.id)

    if (updateVerificationError) {
      console.error("Error updating verification record:", updateVerificationError)
      // Continue anyway, as this is not critical
    }

    console.log("Updated verification record")

    // Update user metadata
    const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(userData.id, {
      user_metadata: {
        email_verified: true,
      },
      email_confirm: true,
    })

    if (updateUserError) {
      console.error("Error updating user:", updateUserError)
      throw new Error("Failed to verify email")
    }

    console.log("Updated user metadata")

    return { success: true, message: "Email verified successfully" }
  } catch (error) {
    console.error("Verification error:", error)
    return {
      success: false,
      message: error.message || "Failed to verify email. Please try again.",
    }
  }
}
