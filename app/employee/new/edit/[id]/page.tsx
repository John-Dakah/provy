import { notFound } from "next/navigation"
import { EmployeeForm } from "@/components/employee-form-dialog"
import { supabase } from "@/lib/supabase"

interface EditEmployeePageProps {
  params: {
    id: string
  }
}

async function getEmployee(id: string) {
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const employee = await getEmployee(params.id)

  if (!employee) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
      <EmployeeForm employee={employee} isEditing={true} />
    </div>
  )
}
