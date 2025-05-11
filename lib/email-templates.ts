// Email templates for Supabase Auth

export const emailTemplates = {
  // Verification code email template
  verificationCodeEmail: {
    subject: "WorkForce - Your Email Verification Code",
    content: `
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
          Hello {{user_name}},
        </p>
        
        <p style="color: #555; line-height: 1.5;">
          Thank you for signing up for WorkForce! To complete your registration and access all features, please use the verification code below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            {{verification_code}}
          </div>
          <p style="color: #777; font-size: 14px; margin-top: 10px;">This code will expire in 30 minutes</p>
        </div>
        
        <p style="color: #555; line-height: 1.5;">
          If you didn't create an account with WorkForce, you can safely ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
          <p>© ${new Date().getFullYear()} WorkForce. All rights reserved.</p>
          <p>{{company_name}} | <a href="{{site_url}}" style="color: #2563eb; text-decoration: none;">Visit our website</a></p>
        </div>
      </div>
    `,
  },

  // Password reset email template
  resetPasswordEmail: {
    subject: "Reset Your WorkForce Password",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; position: relative; width: 40px; height: 40px; margin-right: 10px; vertical-align: middle;">
            <div style="position: absolute; inset: 0; background-color: #2563eb; border-radius: 6px; transform: rotate(45deg);"></div>
            <div style="position: absolute; inset: 4px; background-color: #3b82f6; border-radius: 3px; transform: rotate(45deg);"></div>
            <div style="position: absolute; inset: 8px; background-color: #60a5fa; border-radius: 3px; transform: rotate(45deg);"></div>
          </div>
          <span style="font-size: 24px; font-weight: bold; vertical-align: middle;">WorkForce</span>
        </div>
        
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        
        <p style="color: #555; line-height: 1.5;">
          Hello {{user_name}},
        </p>
        
        <p style="color: #555; line-height: 1.5;">
          We received a request to reset your password for your WorkForce account. Click the button below to set a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{reset_password_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="color: #555; line-height: 1.5;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
          <p>© ${new Date().getFullYear()} WorkForce. All rights reserved.</p>
          <p>{{company_name}} | <a href="{{site_url}}" style="color: #2563eb; text-decoration: none;">Visit our website</a></p>
        </div>
      </div>
    `,
  },
}
