"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { createEmployee, updateEmployee, getDepartments, getCurrentUser } from "@/app/actions/employee-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Department, Employee } from "@/types/employee"

interface EmployeeFormDialogProps {
  isOpen: boolean
  onClose: () => void
  employee?: Employee
  onSuccess: () => void
}

export function EmployeeFormDialog({ isOpen, onClose, employee, onSuccess }: EmployeeFormDialogProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [customDepartment, setCustomDepartment] = useState("")
  const [formData, setFormData] = useState({
    id: employee?.id || "",
    user_id: employee?.user_id || "",
    department_id: employee?.department_id || "",
    position: employee?.position || "",
    status: employee?.status || "Active",
    location: employee?.location || "",
    start_date: employee?.start_date ? new Date(employee.start_date).toISOString().split("T")[0] : "",
  })

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const departmentsData = await getDepartments()
        const userData = await getCurrentUser()
        setDepartments(departmentsData)
        setCurrentUser(userData)

        if (!employee && userData) {
          setFormData((prev) => ({
            ...prev,
            user_id: userData.id,
          }))
        }
      }

      fetchData()
    }
  }, [isOpen, employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, value.toString())
        }
      })

      const result = employee ? await updateEmployee(formDataObj) : await createEmployee(formDataObj)

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error || "An error occurred")
      }
    } catch (error) {
      alert("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{employee ? "Edit Employee" : "Add New Employee"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                value={formData.department_id}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                <option value="none">None</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
                <option value="custom">+ Add Custom</option>
              </select>
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium mb-1">
                Position
              </label>
              <Input
                id="position"
                name="position"
                placeholder="Enter position"
                value={formData.position}
                onChange={handleChange}
              />
            </div>
          </div>

          {formData.department_id === "custom" && (
            <div>
              <label htmlFor="customDepartment" className="block text-sm font-medium mb-1">
                Custom Department Name <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  id="customDepartment"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="Enter department name"
                  required
                />
                <Button
                  type="button"
                  onClick={async () => {
                    // Here you would add logic to create a new department
                    // For now, we'll just show an alert
                    alert(`Creating new department: ${customDepartment}`)
                    // In a real implementation, you would call an API to create the department
                    // and then update the formData.department_id with the new ID
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <Input
                id="location"
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : employee ? "Update Employee" : "Add Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
