import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get the current user
export async function getCurrentUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error.message)
    return null
  }

  if (!session) {
    return null
  }

  return session.user
}

// Helper function to get user profile data
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      employees (
        *,
        department:departments (*)
      )
    `)
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error getting user profile:", error.message)
    return null
  }

  return data
}

// Helper function to check if email is verified
export async function isEmailVerified() {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return false
    }

    // Check if email is confirmed in the user metadata
    if (userData.user.user_metadata?.email_verified === true) {
      return true
    }

    // Check if email_confirmed_at is set
    return userData.user.email_confirmed_at != null
  } catch (error) {
    console.error("Error checking email verification:", error)
    return false
  }
}
