"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmployeeRow } from "@/components/employee-row"
import { EmployeeFormDialog } from "@/components/employee-form-dialog"
import { getEmployees } from "@/app/actions/employee-actions"
import type { EmployeeWithDetails } from "@/types/employee"

export function EmployeesSection() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const itemsPerPage = 5

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  // Filter employees based on search query
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (employee.location && employee.location.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEditEmployee = (id: string) => {
    setSelectedEmployeeId(id)
    setShowEmployeeDialog(true)
  }

  const selectedEmployee = selectedEmployeeId ? employees.find((emp) => emp.id === selectedEmployeeId) : undefined

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Directory</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Search employees..."
              className="w-64 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter</Button>
          <Button
            className="gap-1"
            onClick={() => {
              setSelectedEmployeeId(null)
              setShowEmployeeDialog(true)
            }}
          >
            <Plus size={16} /> Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="grid grid-cols-6 p-4 bg-slate-50 dark:bg-slate-900 border-b text-sm font-medium">
              <div className="col-span-2">Employee</div>
              <div>Department</div>
              <div>Status</div>
              <div>Location</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="p-4 text-center">Loading employees...</div>
              ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <EmployeeRow
                    key={employee.id}
                    id={employee.id}
                    name={employee.name}
                    email={employee.email}
                    department={employee.department}
                    status={employee.status}
                    location={employee.location}
                    onEdit={handleEditEmployee}
                    onDelete={fetchEmployees}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">
                  No employees found. Add your first employee to get started.
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <EmployeeFormDialog
        isOpen={showEmployeeDialog}
        onClose={() => setShowEmployeeDialog(false)}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />
    </div>
  )
}
