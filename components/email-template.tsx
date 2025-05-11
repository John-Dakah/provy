import type React from "react"

interface EmailTemplateProps {
  verificationCode: string
  userName: string
  companyName: string
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ verificationCode, userName, companyName }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div
          style={{
            display: "inline-block",
            position: "relative",
            width: "40px",
            height: "40px",
            marginRight: "10px",
            verticalAlign: "middle",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#2563eb",
              borderRadius: "6px",
              transform: "rotate(45deg)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: "4px",
              backgroundColor: "#3b82f6",
              borderRadius: "3px",
              transform: "rotate(45deg)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              inset: "8px",
              backgroundColor: "#60a5fa",
              borderRadius: "3px",
              transform: "rotate(45deg)",
            }}
          ></div>
        </div>
        <span style={{ fontSize: "24px", fontWeight: "bold", verticalAlign: "middle" }}>WorkForce</span>
      </div>

      <h2 style={{ color: "#333", textAlign: "center" }}>Your Verification Code</h2>

      <p style={{ color: "#555", lineHeight: "1.5" }}>Hello {userName},</p>

      <p style={{ color: "#555", lineHeight: "1.5" }}>
        Thank you for signing up for WorkForce! To complete your registration and access all features, please use the
        verification code below:
      </p>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
            fontSize: "32px",
            fontWeight: "bold",
            letterSpacing: "5px",
          }}
        >
          {verificationCode}
        </div>
        <p style={{ color: "#777", fontSize: "14px", marginTop: "10px" }}>This code will expire in 30 minutes</p>
      </div>

      <p style={{ color: "#555", lineHeight: "1.5" }}>
        If you didn't create an account with WorkForce, you can safely ignore this email.
      </p>

      <div
        style={{
          marginTop: "30px",
          paddingTop: "20px",
          borderTop: "1px solid #e0e0e0",
          textAlign: "center",
          color: "#888",
          fontSize: "12px",
        }}
      >
        <p>© {new Date().getFullYear()} WorkForce. All rights reserved.</p>
        <p>{companyName}</p>
      </div>
    </div>
  )
}
