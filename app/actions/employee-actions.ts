"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

export async function createEmployee(formData: FormData) {
  const user_id = formData.get("user_id") as string
  const department_id = (formData.get("department_id") as string) || null
  const position = (formData.get("position") as string) || null
  const status = formData.get("status") as "Active" | "On Leave" | "Inactive"
  
  const location = (formData.get("location") as string) || null
  const start_date = (formData.get("start_date") as string) || null

  try {
    const { error } = await supabase.from("employees").insert({
      user_id,
      department_id: department_id === "none" ? null : department_id,
      position,
      status,
      location,
      start_date: start_date ? new Date(start_date).toISOString() : null,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateEmployee(formData: FormData) {
  const id = formData.get("id") as string
  const department_id = (formData.get("department_id") as string) || null
  const position = (formData.get("position") as string) || null
  const status = formData.get("status") as "Active" | "On Leave" | "Inactive"
  const location = (formData.get("location") as string) || null
  const start_date = (formData.get("start_date") as string) || null

  try {
    const { error } = await supabase
      .from("employees")
      .update({
        department_id: department_id === "none" ? null : department_id,
        position,
        status,
        location,
        start_date: start_date ? new Date(start_date).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteEmployee(id: string) {
  try {
    const { error } = await supabase.from("employees").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getEmployees() {
  try {
    const { data: employees, error } = await supabase.from("employees").select(`
        *,
        users:user_id (
          full_name,
          email
        ),
        departments:department_id (
          name
        )
      `)

    if (error) {
      console.error("Error fetching employees:", error)
      return []
    }

    return employees.map((employee) => ({
      id: employee.id,
      user_id: employee.user_id,
      department_id: employee.department_id,
      position: employee.position,
      status: employee.status,
      location: employee.location,
      start_date: employee.start_date,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
      name: employee.users?.full_name || "Unknown",
      email: employee.users?.email || "No email",
      department: employee.departments?.name || null,
    }))
  } catch (error) {
    console.error("Error fetching employees:", error)
    return []
  }
}

export async function getDepartments() {
  try {
    const { data: departments, error } = await supabase.from("departments").select("*")

    if (error) {
      console.error("Error fetching departments:", error)
      return []
    }

    return departments
  } catch (error) {
    console.error("Error fetching departments:", error)
    return []
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export async function getUsers() {
  try {
    const { data: users, error } = await supabase.from("users").select("id, full_name, email")

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}
