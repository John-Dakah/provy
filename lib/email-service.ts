import sgMail from "@sendgrid/mail"

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  console.log("SendGrid API key set")
} else {
  console.warn("SendGrid API key not found in environment variables")
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    console.log("Attempting to send email to:", to)
    console.log("From:", from || process.env.EMAIL_FROM || "default-from@example.com")

    // Use SendGrid if API key is available
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to,
        from: from || process.env.EMAIL_FROM || "johnariphiosd@gmail.com",
        subject,
        html,
      }

      console.log("Sending email via SendGrid...")

      try {
        const response = await sgMail.send(msg)
        console.log("Email sent successfully via SendGrid:", response[0]?.statusCode)
        return {
          success: true,
          messageId: response[0]?.headers["x-message-id"],
          service: "sendgrid",
        }
      } catch (sendGridError) {
        console.error("SendGrid error details:", sendGridError)
        if (sendGridError.response) {
          console.error("SendGrid API error response:", sendGridError.response.body)
        }
        throw sendGridError
      }
    }
    // Fallback to Nodemailer if SendGrid is not configured
    else {
      console.log("SendGrid not configured, attempting to use Nodemailer...")

      try {
        // Call our Nodemailer API route
        const response = await fetch(
          new URL("/api/send-email", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to,
              subject,
              html,
            }),
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to send email via Nodemailer")
        }

        const result = await response.json()
        console.log("Email sent via Nodemailer:", result)

        return {
          success: true,
          messageId: result.messageId,
          service: "nodemailer",
          previewUrl: result.previewUrl,
        }
      } catch (nodemailerError) {
        console.error("Nodemailer error:", nodemailerError)
        throw nodemailerError
      }
    }
  } catch (error) {
    console.error("Error sending email:", error)

    // Log the email content to console as a fallback
    console.log("=== EMAIL CONTENT (FALLBACK) ===")
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML: ${html}`)
    console.log("=======================================")

    return {
      success: false,
      error: error.message || "Unknown error",
      messageId: `failed-${Date.now()}`,
      service: "failed",
      previewHtml: html,
    }
  }
}

/**
 * Send a verification code email
 */
export async function sendVerificationEmail({
  email,
  code,
  userName,
  companyName,
}: {
  email: string
  code: string
  userName: string
  companyName: string
}) {
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
        Hello ${userName || "there"},
      </p>
      
      <p style="color: #555; line-height: 1.5;">
        Thank you for signing up for WorkForce! To complete your registration and access all features, please use the verification code below:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${code}
        </div>
        <p style="color: #777; font-size: 14px; margin-top: 10px;">This code will expire in 30 minutes</p>
      </div>
      
      <p style="color: #555; line-height: 1.5;">
        If you didn't create an account with WorkForce, you can safely ignore this email.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
        <p>© ${new Date().getFullYear()} WorkForce. All rights reserved.</p>
        <p>${companyName || "WorkForce"}</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: "Your WorkForce Verification Code",
    html: emailContent,
  })
}
