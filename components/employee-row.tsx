"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteEmployee } from "@/app/actions/employee-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface EmployeeRowProps {
  id: string
  name: string
  email: string
  department: string | null
  status: string
  location: string | null
  onEdit: (id: string) => void
  onDelete: () => void
}

export function EmployeeRow({ id, name, email, department, status, location, onEdit, onDelete }: EmployeeRowProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const statusColors = {
    Active: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    "On Leave": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Inactive: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400",
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this employee?")) {
      setIsDeleting(true)
      try {
        const result = await deleteEmployee(id)
        if (result.success) {
          onDelete()
        } else {
          alert(result.error || "An error occurred while deleting the employee.")
        }
      } catch (error) {
        alert("An unexpected error occurred")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="grid grid-cols-6 p-4 items-center">
      <div className="col-span-2 flex items-center gap-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" />
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{email}</div>
        </div>
      </div>
      <div>{department || "N/A"}</div>
      <div>
        <Badge variant="outline" className={statusColors[status as keyof typeof statusColors] || ""}>
          {status}
        </Badge>
      </div>
      <div>{location || "N/A"}</div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon">
          <MessageSquare size={16} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDeleting}>
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
