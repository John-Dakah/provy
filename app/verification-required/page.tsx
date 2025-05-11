"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function VerificationRequiredPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handle resend verification email
  const handleResendVerification = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not found. Please log in again.")
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      })

      if (error) throw error

      setSuccess("Verification email has been resent. Please check your inbox.")
    } catch (error) {
      setError(error.message || "Failed to resend verification email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    setLoading(true)

    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      setError("Failed to log out. Please try again.")
      setLoading(false)
    }
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
            <div className="rounded-full bg-blue-100 p-3 mx-auto w-fit dark:bg-blue-900 mb-4">
              <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Email Verification Required</h2>
            <p className="text-slate-500 mb-6">
              Please verify your email address to access your account. We've sent a verification link to your email.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-900">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button className="w-full" onClick={handleResendVerification} disabled={loading}>
                {loading ? "Sending..." : "Resend Verification Email"}
              </Button>

              <Button variant="outline" className="w-full" onClick={handleLogout} disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              If you're having trouble, please{" "}
              <Link href="/contact" className="text-blue-600 hover:text-blue-500">
                contact support
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
