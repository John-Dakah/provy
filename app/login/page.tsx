"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [activeTab, setActiveTab] = useState("login")
  const [verificationCheckInProgress, setVerificationCheckInProgress] = useState(false)

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: "",
    terms: false,
  })

  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target
    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle register form input changes
  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target
    setRegisterData({
      ...registerData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Check password strength when password field changes
    if (name === "password") {
      checkPasswordStrength(value)
    }
  }

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0

    // Length check
    if (password.length >= 8) strength += 1

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1

    // Contains number
    if (/[0-9]/.test(password)) strength += 1

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    setPasswordStrength(strength)
  }

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) throw error

      // Get the user data to check if email is verified
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        throw new Error("Failed to get user data")
      }

      // Check if email is verified in user metadata
      const isVerified = userData.user?.email_confirmed_at || userData.user?.user_metadata?.email_verified === true

      if (!isVerified) {
        // Email is not verified, redirect to verification page
        router.push(`/verify-email?email=${loginData.email}`)
        return
      }

      // Email is verified, redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      setError(error.message || "Failed to login. Please check your credentials.")
      setLoading(false)
    }
  }

  // Handle register form submission
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate password strength
    if (passwordStrength < 3) {
      setError("Please use a stronger password.")
      setLoading(false)
      return
    }

    // Validate terms acceptance
    if (!registerData.terms) {
      setError("You must accept the terms and conditions.")
      setLoading(false)
      return
    }

    try {
      // Call our server-side API to handle registration
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          password: registerData.password,
          company: registerData.company,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Show success message
      setSuccess("Registration successful! Please check your email for a verification code.")

      // Redirect to verification page
      router.push(`/verify-email?userId=${data.userId}&email=${registerData.email}`)

      // Clear form
      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        company: "",
        terms: false,
      })
    } catch (error) {
      console.error("Registration error:", error)
      setError(error.message || "Failed to register. Please try again.")
      setLoading(false)
    }
  }

  // Handle password reset
  const handleResetPassword = async () => {
    if (!loginData.email) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess("Password reset instructions have been sent to your email.")
    } catch (error) {
      setError(error.message || "Failed to send reset instructions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
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

            {verificationCheckInProgress ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <h2 className="text-xl font-bold">Checking Email Verification</h2>
                <p className="text-slate-500 text-center">
                  Please wait while we check if your email has been verified. This may take a moment...
                </p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          required
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-500" />
                          )}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          name="rememberMe"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                          checked={loginData.rememberMe}
                          onChange={handleLoginChange}
                        />
                        <Label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Button className="w-full" type="submit" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Registration form fields remain the same */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          name="firstName"
                          placeholder="John"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          name="lastName"
                          placeholder="Doe"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input
                        id="email-register"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Password</Label>
                      <div className="relative">
                        <Input
                          id="password-register"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          required
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-500" />
                          )}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>

                      {/* Password strength indicator */}
                      {registerData.password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full ${
                                  level <= passwordStrength
                                    ? level <= 2
                                      ? "bg-red-500"
                                      : level <= 3
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            {passwordStrength === 0 && "Very weak"}
                            {passwordStrength === 1 && "Weak"}
                            {passwordStrength === 2 && "Fair"}
                            {passwordStrength === 3 && "Good"}
                            {passwordStrength === 4 && "Strong"}
                            {passwordStrength === 5 && "Very strong"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Password should be at least 8 characters with uppercase, lowercase, numbers, and special
                            characters.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Your company name"
                        value={registerData.company}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        name="terms"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        checked={registerData.terms}
                        onChange={handleRegisterChange}
                        required
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{" "}
                        <Link href="#" className="text-blue-600 hover:text-blue-500">
                          terms and conditions
                        </Link>
                      </Label>
                    </div>
                    <Button className="w-full" type="submit" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      <footer className="py-6 border-t border-slate-200 dark:border-slate-800">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} WorkForce. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
