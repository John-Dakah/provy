"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ManagerDashboardContent from "@/components/manager-dashboard-content"
import { Loader2 } from "lucide-react"

export default function ManagerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/login")
          return
        }

        // Verify user is a manager
        const role = user.user_metadata?.role
        if (role !== "manager" && role !== "admin") {
          router.push("/dashboard")
          return
        }

        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error("Error getting user:", error)
        router.push("/login")
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <h2 className="text-xl font-semibold">Loading manager dashboard...</h2>
          <p className="text-slate-500">Please wait while we prepare your dashboard.</p>
        </div>
      </div>
    )
  }

  return <ManagerDashboardContent user={user} />
}
