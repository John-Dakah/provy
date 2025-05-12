import { EmployeeForm } from "@/components/employee-form-dialog"

export default function NewEmployeePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Employee</h1>
      <EmployeeForm />
    </div>
  )
}
