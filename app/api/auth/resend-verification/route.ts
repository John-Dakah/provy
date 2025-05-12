import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Resending verification code for:", email)

    // Get the user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, full_name, company_id")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

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

    // Generate a new verification code
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

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
      return NextResponse.json({ error: "Failed to update verification code" }, { status: 500 })
    }

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

    // Send the verification email
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
          Hello ${userData.full_name || "there"},
        </p>
        
        <p style="color: #555; line-height: 1.5;">
          You requested a new verification code. Please use the code below to verify your email address:
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

    try {
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
          type: "magiclink",
          email,
          options: {
            data: {
              verification_code: newVerificationCode,
            },
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent successfully",
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json(
        {
          error: "Failed to send verification email: " + (emailError.message || "Unknown error"),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      {
        error: "Failed to resend verification code: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    )
  }
}
