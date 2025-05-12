import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  console.log("SendGrid API key set")
} else {
  console.warn("SendGrid API key not found")
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    console.log("Resending verification code to:", email)

    // Generate a new 6-digit verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

    console.log("Generated new code:", newVerificationCode)

    // Step 1: Find the user by email
    let user
    let userData = null

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

        // Get additional user data if needed
        const { data: customUser, error: customError } = await supabaseAdmin
          .from("users")
          .select("id, full_name, company_id")
          .eq("id", user.id)
          .single()

        if (!customError) {
          userData = customUser
        }
      } else {
        // If not found in auth.users, try the custom users table
        const { data: customUser, error: customError } = await supabaseAdmin
          .from("users")
          .select("id, email, full_name, company_id")
          .eq("email", email)
          .single()

        if (customError) {
          throw new Error(`Error fetching custom user: ${customError.message}`)
        }

        if (!customUser) {
          throw new Error("User not found")
        }

        userData = customUser

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

    // Get company name if available
    let companyName = "WorkForce"
    if (userData?.company_id) {
      try {
        const { data: companyData, error: companyError } = await supabaseAdmin
          .from("companies")
          .select("name")
          .eq("id", userData.company_id)
          .single()

        if (!companyError && companyData) {
          companyName = companyData.name
        }
      } catch (error) {
        console.warn("Error fetching company name:", error)
        // Continue anyway, we'll use the default
      }
    }

    // Update user metadata with new verification code
    try {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          verification_code: newVerificationCode,
          verification_code_expires_at: expiresAt.toISOString(),
          email_verified: false,
        },
      })

      if (updateError) {
        throw new Error(`Error updating user metadata: ${updateError.message}`)
      }

      console.log("Updated user metadata with new code")
    } catch (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ success: false, message: "Failed to update verification code" }, { status: 500 })
    }

    // Update or insert into email_verifications table
    try {
      const { error: verificationError } = await supabaseAdmin.from("email_verifications").upsert(
        {
          user_id: user.id,
          email,
          verification_code: newVerificationCode,
          expires_at: expiresAt,
          verified: false,
          verified_at: null,
        },
        { onConflict: "user_id" },
      )

      if (verificationError) {
        console.warn("Error updating verification record:", verificationError)
        // Continue anyway, as this is not critical
      } else {
        console.log("Updated verification record in database")
      }
    } catch (error) {
      console.warn("Error with verification record:", error)
      // Continue anyway, as this is not critical
    }

    // Send the verification email using SendGrid
    try {
      const fullName = userData?.full_name || user.user_metadata?.full_name || "there"

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
          
          <h2 style="color: #333; text-align: center;">Your New Verification Code</h2>
          
          <p style="color: #555; line-height: 1.5;">
            Hello ${fullName},
          </p>
          
          <p style="color: #555; line-height: 1.5;">
            You requested a new verification code. To complete your registration and access all features, please use the verification code below:
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

      if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid to send the email
        const msg = {
          to: email,
          from: process.env.EMAIL_FROM || "noreply@workforce-app.com",
          subject: "Your New WorkForce Verification Code",
          html: emailContent,
        }

        console.log("Sending verification email via SendGrid to:", email)
        const response = await sgMail.send(msg)
        console.log("SendGrid response:", response[0].statusCode)
      } else {
        // Fallback to Supabase's email service
        console.log("SendGrid API key not found, using Supabase email service")
        await supabaseAdmin.auth.admin.generateLink({
          type: "signup",
          email,
          options: {
            data: {
              verification_code: newVerificationCode,
              full_name: fullName,
              company: companyName,
            },
          },
        })
      }

      console.log("Verification email sent successfully")
      return NextResponse.json({
        success: true,
        message: "Verification code sent successfully",
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification email. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to resend verification code. Please try again.",
      },
      { status: 500 },
    )
  }
}
