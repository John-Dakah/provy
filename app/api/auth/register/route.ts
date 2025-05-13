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
    const { firstName, lastName, email, password, company } = await request.json()

    // Validate input
    if (!firstName || !lastName || !email || !password || !company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Registration attempt for:", email)

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now

    // Step 1: Register user with Supabase Auth
    // Important: We set email_confirm to false to prevent auto-verification
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require our custom verification
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        company,
        verification_code: verificationCode,
        verification_code_expires_at: verificationExpiry.toISOString(),
        email_verified: false,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("User created:", authData.user.id)

    // Step 2: Create company record
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert([{ name: company }])
      .select()

    if (companyError) {
      console.error("Company creation error:", companyError)
      return NextResponse.json({ error: "Failed to create company: " + companyError.message }, { status: 500 })
    }

    if (!companyData || companyData.length === 0) {
      console.error("Company data is empty after insert")
      return NextResponse.json({ error: "Failed to create company: No data returned" }, { status: 500 })
    }

    console.log("Company created:", companyData[0].id)

    // Step 3: Create user record with company ID
    const { error: userError } = await supabaseAdmin.from("users").insert([
      {
        id: authData.user.id,
        email,
        full_name: `${firstName} ${lastName}`,
        company_id: companyData[0].id,
        role: "admin", // First user is admin
      },
    ])

    if (userError) {
      console.error("User record creation error:", userError)
      return NextResponse.json({ error: "Failed to create user record: " + userError.message }, { status: 500 })
    }

    // Step 4: Create a verification record in a new table
    const { error: verificationError } = await supabaseAdmin.from("email_verifications").insert([
      {
        user_id: authData.user.id,
        email,
        verification_code: verificationCode,
        expires_at: verificationExpiry,
        verified: false,
      },
    ])

    if (verificationError) {
      console.error("Verification record creation error:", verificationError)
      // Continue anyway, as this is not critical
    }

    // Step 5: Send verification email with SendGrid
    try {
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
          
          <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
          
          <p style="color: #555; line-height: 1.5;">
            Hello ${firstName} ${lastName},
          </p>
          
          <p style="color: #555; line-height: 1.5;">
            Thank you for signing up for WorkForce! To complete your registration and access all features, please use the verification code below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
              ${verificationCode}
            </div>
            <p style="color: #777; font-size: 14px; margin-top: 10px;">This code will expire in 30 minutes</p>
          </div>
          
          <p style="color: #555; line-height: 1.5;">
            If you didn't create an account with WorkForce, you can safely ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} WorkForce. All rights reserved.</p>
            <p>${company}</p>
          </div>
        </div>
      `

      if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid to send the email
        const msg = {
          to: email,
          from: process.env.EMAIL_FROM || "noreply@workforce-app.com",
          subject: "Your WorkForce Verification Code",
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
                  password, // Include the password field
                  options: {
                    data: {
                      verification_code: verificationCode,
                      full_name: `${firstName} ${lastName}`,
                      company: company,
                    },
                  },
                })
      }

      console.log("Verification email sent successfully")
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Continue anyway, as the user can request a new code
    }

    console.log("User record created and verification email sent successfully")
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email for a verification code.",
      userId: authData.user.id,
      email: email,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
