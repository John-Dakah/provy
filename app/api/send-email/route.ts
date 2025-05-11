import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()

    // Validate inputs
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, or html" }, { status: 400 })
    }

    // Create a transporter using Gmail
    // Note: For production, you should use an "App Password" for Gmail
    // https://support.google.com/accounts/answer/185833
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
      },
    })

    // Send the email
    const info = await transporter.sendMail({
      from: `"WorkForce" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email", details: error.message }, { status: 500 })
  }
}
