import { NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  console.log("SendGrid API key set for test")
} else {
  console.warn("SendGrid API key not found for test")
}

export async function GET(request: Request) {
  // Get email from query parameter
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
  }

  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "SendGrid API key is not configured",
        envVars: {
          SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? "Set" : "Not set",
          EMAIL_FROM: process.env.EMAIL_FROM || "Not set",
        },
      })
    }

    // Create a test email
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || "noreply@workforce-app.com",
      subject: "WorkForce Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Email Configuration Test</h2>
          <p style="color: #555; line-height: 1.5;">
            This is a test email to verify that your WorkForce email configuration is working correctly.
          </p>
          <p style="color: #555; line-height: 1.5;">
            If you're receiving this email, it means your SendGrid integration is properly set up!
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} WorkForce. All rights reserved.</p>
            <p>Test sent at: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    }

    // Send the test email
    console.log("Sending test email to:", email)
    const response = await sgMail.send(msg)
    console.log("SendGrid test response:", response[0].statusCode)

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        statusCode: response[0].statusCode,
        headers: response[0].headers,
      },
    })
  } catch (error) {
    console.error("Test email error:", error)

    // Extract SendGrid specific error details if available
    let errorDetails = {}
    if (error.response && error.response.body) {
      errorDetails = {
        statusCode: error.code,
        body: error.response.body,
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email: " + (error.message || "Unknown error"),
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
