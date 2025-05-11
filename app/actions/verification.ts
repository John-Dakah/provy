"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

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

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; position: relative; width: 40px; height: 40px; margin-right: 10px; vertical-align: middle;">
            <div style="position: absolute; inset: 0; background-color: #2563eb; border-radius: 6px; transform: rotate(45deg);"></div>
            <div style="position: absolute; inset: 4px; background-color: #3b82f6; border-radius: 3px; transform: rotate(45deg);"></div>
            <div style="position: absolute; inset: 8px; background-color: #60a5fa; border-radius: 3px; transform: rotate(45deg);"></div>
          </div>
          <span style="font-size: 24px; font-weight: bold; vertical-align: middle;">WorkForce</span>
        </div>
        
        <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
        
        <p style="color: #555; line-height: 1.5;">
          Hello ${userData.full_name || "there"},
        </p>
        
        <p style="color: #555; line-height: 1.5;">
          You requested a verification code. Please use the code below to verify your email address:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${newVerificationCode}
          </div>
          <p style="color: #777; font-size: 14px; margin-top: 10px;">This code will expire in 30 minutes</p>
        </div>
        
        <p style="color: #555; line-height: 1.5;">
          If you didn't request this code, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
          <p>© ${new Date().getFullYear()} WorkForce. All rights reserved.</p>
          <p>${companyName}</p>
        </div>
      </div>
    `

    // Send the email using our simple API route
    try {
      const response = await fetch(
        new URL("/api/send-email", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            subject: "Your WorkForce Verification Code",
            html: emailContent,
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send email")
      }

      const emailResult = await response.json()
      console.log("Email sent successfully:", emailResult)
    } catch (emailSendError) {
      console.error("Error sending email:", emailSendError)
      throw new Error("Failed to send verification email. Please try again.")
    }

    return { success: true, message: "Verification code sent successfully" }
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
