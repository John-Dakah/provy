import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Create a transporter based on environment
const getTransporter = () => {
  // If Gmail credentials are provided, use Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log("Using Gmail transporter")
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }
  // Otherwise, use Ethereal for testing
  console.log("Using Ethereal test transporter")
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "ethereal_user", // Will be replaced with actual test credentials
      pass: "ethereal_password",
    },
  })
}

export async function POST(request: Request) {
  try {
    // Get the request body
    const { to, subject, html } = await request.json()

    // Validate input
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Sending email to:", to)

    // Create test account if using Ethereal
    let testAccount = null
    let transporter = null

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Creating Ethereal test account...")
      testAccount = await nodemailer.createTestAccount()

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })

      console.log("Ethereal test account created:", testAccount.user)
    } else {
      transporter = getTransporter()
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"WorkForce" <noreply@workforce-app.com>',
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)

    // For Ethereal, provide the preview URL
    let previewUrl = null
    if (testAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info)
      console.log("Preview URL:", previewUrl)
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      previewUrl,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
