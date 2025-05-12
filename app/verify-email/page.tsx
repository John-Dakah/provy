"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2, RefreshCw, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const userId = searchParams.get("userId")

  const [verificationCode, setVerificationCode] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("pending") // pending, checking, success, error
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(300) // 5 minutes countdown
  const [isResending, setIsResending] = useState(false)

  // Format countdown as MM:SS
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle countdown
  useEffect(() => {
    if (countdown > 0 && verificationStatus === "pending") {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, verificationStatus])

  // Handle verification code submission
  const handleVerifyCode = async (e) => {
    e.preventDefault()

    if (!email) {
      setError("Email address is missing. Please go back to login.")
      return
    }

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code")
      return
    }

    setVerificationStatus("checking")
    setError("")

    try {
      // Get user metadata to check verification code
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        throw new Error("Failed to get user information. Please try logging in again.")
      }

      const storedCode = userData.user.user_metadata?.verification_code
      const expiresAt = userData.user.user_metadata?.verification_code_expires_at

      // Check if code is expired
      if (expiresAt && new Date(expiresAt) < new Date()) {
        setError("Verification code has expired. Please request a new one.")
        setVerificationStatus("error")
        return
      }

      // Check if code matches
      if (verificationCode !== storedCode) {
        setError("Invalid verification code. Please try again.")
        setVerificationStatus("error")
        return
      }

      // Update user as verified
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          email_verified: true,
        },
      })

      if (updateError) {
        throw new Error("Failed to verify email. Please try again.")
      }

      // Verification successful
      setVerificationStatus("success")

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Verification error:", error)
      setError(error.message || "Failed to verify email. Please try again.")
      setVerificationStatus("error")
    }
  }

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!email) {
      setError("Email address is missing. Please go back to login.")
      return
    }

    setIsResending(true)
    setError("")

    try {
      // Call our API to resend the verification code
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification code")
      }

      // Reset countdown
      setCountdown(300)
      setVerificationStatus("pending")
      setSuccess("A new verification code has been sent to your email. It should arrive within a minute.")
    } catch (error) {
      console.error("Resend error:", error)
      setError(error.message || "Failed to resend verification code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-blue-600 rounded-md rotate-45 transform origin-center"></div>
                  <div className="absolute inset-1 bg-blue-500 rounded-sm rotate-45 transform origin-center"></div>
                  <div className="absolute inset-2 bg-blue-400 rounded-sm rotate-45 transform origin-center"></div>
                </div>
                <h1 className="text-xl font-bold">WorkForce</h1>
              </div>
            </div>

            <div className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">Missing Information</h2>
                <Alert variant="destructive">
                  <AlertDescription>Email address is missing. Please go back to login.</AlertDescription>
                </Alert>
                <div className="flex gap-4 mt-4">
                  <Button asChild>
                    <Link href="/login">Back to Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-blue-600 rounded-md rotate-45 transform origin-center"></div>
                <div className="absolute inset-1 bg-blue-500 rounded-sm rotate-45 transform origin-center"></div>
                <div className="absolute inset-2 bg-blue-400 rounded-sm rotate-45 transform origin-center"></div>
              </div>
              <h1 className="text-xl font-bold">WorkForce</h1>
            </div>
          </div>

          <div className="text-center">
            {verificationStatus === "checking" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <h2 className="text-2xl font-bold">Verifying Your Email</h2>
                <p className="text-slate-500">Please wait while we verify your email address...</p>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold">Email Verified!</h2>
                <p className="text-slate-500">
                  Your email has been successfully verified. You will be redirected to your dashboard.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <p className="text-slate-500 mt-2">Please try again or contact support if the problem persists.</p>
                <div className="flex gap-4 mt-4">
                  <Button variant="outline" onClick={() => setVerificationStatus("pending")}>
                    Try Again
                  </Button>
                  <Button asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            )}

            {verificationStatus === "pending" && (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                  <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">Verify Your Email</h2>
                <p className="text-slate-500">
                  We've sent a verification code to <strong>{email}</strong>. Please enter the code below to verify your
                  account.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300">
                  <p>
                    <strong>Important:</strong> The code should arrive in your inbox within a minute. Please check your
                    spam folder if you don't see it.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-2 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-900">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleVerifyCode} className="w-full mt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="verification-code" className="text-sm font-medium">
                          Verification Code
                        </label>
                        <span className="text-sm text-slate-500">Time remaining: {formatCountdown()}</span>
                      </div>
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        className="text-center text-xl tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Verify Email
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-sm"
                      >
                        {isResending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Resending code...
                          </>
                        ) : (
                          "Didn't receive a code? Resend"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
