export interface Employee {
  id: string
  user_id: string
  department_id: string | null
  position: string | null
  status: "Active" | "On Leave" | "Inactive"
  location: string | null
  start_date: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeWithDetails extends Employee {
  name: string
  email: string
  department: string | null
}

export interface Department {
  id: string
  name: string
  description: string | null
}
