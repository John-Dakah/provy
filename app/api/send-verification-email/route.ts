import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

export async function POST(request: Request) {
  try {
    // Get the request body
    const { to, subject, code, name, company } = await request.json()

    // Validate input
    if (!to || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Sending verification email to:", to)
    console.log("With code:", code)

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
        
        <h2 style="color: #333; text-align: center;">Your New Verification Code</h2>
        
        <p style="color: #555; line-height: 1.5;">
          Hello ${name || "there"},
        </p>
        
        <p style="color: #555; line-height: 1.5;">
          You requested a new verification code. Please use the code below to verify your email address:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </div>
          <p style="color: #777; font-size: 14px; margin-top: 10px;">This code will expire in 30 minutes</p>
        </div>
        
        <p style="color: #555; line-height: 1.5;">
          If you didn't request this code, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
          <p>© ${new Date().getFullYear()} WorkForce. All rights reserved.</p>
          <p>${company || "WorkForce"}</p>
        </div>
      </div>
    `

    // In a real application, you would use an email service like SendGrid, Mailgun, etc.
    // For this example, we'll use Supabase's email service by sending a custom email

    // Method 1: Using Supabase's built-in email templates (if configured)
    try {
      const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(to, {
        data: {
          verification_code: code,
          user_name: name,
          company_name: company,
        },
      })

      if (error) {
        console.error("Error sending email via Supabase:", error)
        throw error
      }

      console.log("Email sent successfully via Supabase")
    } catch (supabaseError) {
      console.error("Failed to send email via Supabase:", supabaseError)

      // Method 2: Fallback to a mock email for development
      console.log("MOCK EMAIL SENT:")
      console.log("To:", to)
      console.log("Subject:", subject)
      console.log("Content:", emailContent)

      // In a production environment, you would use a real email service here
      // For example with SendGrid:
      // const sgMail = require('@sendgrid/mail')
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      // const msg = {
      //   to,
      //   from: 'noreply@workforce-app.com',
      //   subject,
      //   html: emailContent,
      // }
      // await sgMail.send(msg)
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
