"use client"

import { useEffect } from "react"
import { MessageSquare, Users, MoreHorizontal, CheckCircle2, Clock3, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

// Initial data
const initialEmployees = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.j@example.com",
    department: "Engineering",
    status: "Active",
    location: "New York",
    position: "Senior Developer",
    startDate: "2022-03-15",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.g@example.com",
    department: "Design",
    status: "Active",
    location: "Remote",
    position: "UI/UX Designer",
    startDate: "2021-11-08",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "James Wilson",
    email: "james.w@example.com",
    department: "Marketing",
    status: "On Leave",
    location: "Chicago",
    position: "Marketing Manager",
    startDate: "2020-06-22",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Sarah Lee",
    email: "sarah.l@example.com",
    department: "HR",
    status: "Active",
    location: "Boston",
    position: "HR Specialist",
    startDate: "2023-01-10",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Robert Chen",
    email: "robert.c@example.com",
    department: "Sales",
    status: "Active",
    location: "San Francisco",
    position: "Sales Representative",
    startDate: "2022-09-05",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const initialTasks = [
  {
    id: 1,
    title: "Update employee handbook",
    assignee: "Sarah Johnson",
    dueDate: "Today",
    priority: "High",
    status: "in-progress",
    progress: 75,
    description: "Review and update the employee handbook with new policies and procedures.",
  },
  {
    id: 2,
    title: "Review Q3 performance reports",
    assignee: "Michael Chen",
    dueDate: "Tomorrow",
    priority: "Medium",
    status: "in-progress",
    progress: 45,
    description: "Analyze Q3 performance data and prepare summary for management meeting.",
  },
  {
    id: 3,
    title: "Prepare onboarding materials",
    assignee: "Emily Rodriguez",
    dueDate: "Sep 15",
    priority: "Low",
    status: "not-started",
    progress: 0,
    description: "Create onboarding materials for new hires starting next month.",
  },
  {
    id: 4,
    title: "Finalize budget proposal",
    assignee: "David Kim",
    dueDate: "Sep 12",
    priority: "High",
    status: "in-progress",
    progress: 90,
    description: "Complete the budget proposal for the next fiscal year.",
  },
  {
    id: 5,
    title: "Schedule team building event",
    assignee: "Jessica Lee",
    dueDate: "Sep 20",
    priority: "Medium",
    status: "in-progress",
    progress: 30,
    description: "Plan and schedule the quarterly team building event.",
  },
]

const initialVacancies = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "New York / Remote",
    type: "Full-time",
    postedDate: "2023-08-15",
    applicants: 24,
    status: "Open",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    postedDate: "2023-08-20",
    applicants: 18,
    status: "Open",
  },
  {
    id: 3,
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Chicago",
    type: "Full-time",
    postedDate: "2023-08-10",
    applicants: 32,
    status: "Open",
  },
  {
    id: 4,
    title: "HR Coordinator",
    department: "HR",
    location: "Boston",
    type: "Part-time",
    postedDate: "2023-08-05",
    applicants: 15,
    status: "Reviewing",
  },
]

const initialMessages = [
  {
    id: 1,
    sender: "Alex Johnson",
    subject: "Team Meeting Follow-up",
    content: "Here are the action items from our team meeting yesterday...",
    date: "Today, 10:30 AM",
    read: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    sender: "Maria Garcia",
    subject: "Design Review Request",
    content: "Could you please review the latest design mockups for the new feature?",
    date: "Today, 9:15 AM",
    read: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    sender: "HR Department",
    subject: "New Policy Announcement",
    content: "We're updating our remote work policy effective next month...",
    date: "Yesterday, 4:45 PM",
    read: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    sender: "IT Support",
    subject: "System Maintenance Notice",
    content: "The HR system will be down for maintenance this Saturday from 10 PM to 2 AM.",
    date: "Yesterday, 2:30 PM",
    read: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    sender: "David Kim",
    subject: "Budget Approval",
    content: "The Q4 budget has been approved. You can proceed with the planned activities.",
    date: "Sep 7, 11:20 AM",
    read: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const initialNotifications = [
  {
    id: 1,
    title: "New task assigned",
    description: "Project X documentation review",
    time: "10 minutes ago",
    type: "task",
    read: false,
  },
  {
    id: 2,
    title: "Meeting reminder",
    description: "Weekly team sync at 2:00 PM",
    time: "1 hour ago",
    type: "meeting",
    read: false,
  },
  {
    id: 3,
    title: "Attendance alert",
    description: "3 employees absent without notice",
    time: "2 hours ago",
    type: "alert",
    read: false,
  },
  {
    id: 4,
    title: "New employee joined",
    description: "Emma Watson joined the Design team",
    time: "Yesterday",
    type: "employee",
    read: true,
  },
  {
    id: 5,
    title: "System update",
    description: "The system will be updated tonight at 11 PM",
    time: "Yesterday",
    type: "system",
    read: true,
  },
]

const attendanceData = {
  currentMonth: "September 2023",
  days: 30,
  weekStart: 5, // 0 = Sunday, 1 = Monday, etc.
  records: [
    { day: 1, status: "present" },
    { day: 2, status: "present" },
    { day: 3, status: "weekend" },
    { day: 4, status: "weekend" },
    { day: 5, status: "present" },
    { day: 6, status: "present" },
    { day: 7, status: "present" },
    { day: 8, status: "late" },
    { day: 9, status: "present" },
    { day: 10, status: "weekend" },
    { day: 11, status: "weekend" },
    { day: 12, status: "present" },
    { day: 13, status: "present" },
    { day: 14, status: "present" },
    { day: 15, status: "present" },
    { day: 16, status: "present" },
    { day: 17, status: "weekend" },
    { day: 18, status: "weekend" },
    { day: 19, status: "present" },
    { day: 20, status: "present" },
    { day: 21, status: "present" },
    { day: 22, status: "present" },
    { day: 23, status: "present" },
    { day: 24, status: "weekend" },
    { day: 25, status: "weekend" },
    { day: 26, status: "present" },
    { day: 27, status: "present" },
    { day: 28, status: "present" },
    { day: 29, status: "present" },
    { day: 30, status: "present" },
  ],
  summary: {
    present: 20,
    late: 1,
    absent: 0,
    weekend: 8,
    leave: 1,
  },
}

const scheduleData = [
  {
    date: "Monday, Sep 11",
    shifts: [{ time: "9:00 AM - 5:00 PM", type: "Regular" }],
    isToday: true,
  },
  {
    date: "Tuesday, Sep 12",
    shifts: [{ time: "9:00 AM - 5:00 PM", type: "Regular" }],
  },
  {
    date: "Wednesday, Sep 13",
    shifts: [{ time: "9:00 AM - 5:00 PM", type: "Regular" }],
  },
  {
    date: "Thursday, Sep 14",
    shifts: [{ time: "9:00 AM - 5:00 PM", type: "Regular" }],
  },
  {
    date: "Friday, Sep 15",
    shifts: [{ time: "9:00 AM - 5:00 PM", type: "Regular" }],
  },
  {
    date: "Monday, Sep 18",
    shifts: [{ time: "All Day", type: "PTO" }],
    notes: "Approved Time Off",
  },
  {
    date: "Tuesday, Sep 19",
    shifts: [{ time: "All Day", type: "PTO" }],
    notes: "Approved Time Off",
  },
  {
    date: "Wednesday, Sep 20",
    shifts: [{ time: "All Day", type: "PTO" }],
    notes: "Approved Time Off",
  },
]

const reportsData = [
  {
    id: 1,
    title: "Monthly Attendance Summary",
    description: "Overview of employee attendance patterns for the current month",
    lastUpdated: "Sep 10, 2023",
    type: "Attendance",
  },
  {
    id: 2,
    title: "Department Performance",
    description: "Comparative analysis of performance metrics across departments",
    lastUpdated: "Sep 8, 2023",
    type: "Performance",
  },
  {
    id: 3,
    title: "Recruitment Analytics",
    description: "Insights into hiring funnel and recruitment efficiency",
    lastUpdated: "Sep 5, 2023",
    type: "Recruitment",
  },
  {
    id: 4,
    title: "Employee Turnover Report",
    description: "Analysis of employee retention and turnover rates",
    lastUpdated: "Aug 28, 2023",
    type: "HR",
  },
  {
    id: 5,
    title: "Training Compliance",
    description: "Status of mandatory training completion across the organization",
    lastUpdated: "Aug 25, 2023",
    type: "Compliance",
  },
]

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    async function checkUserRole() {
      try {
        // Get the current user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          // No user, redirect to login
          router.push("/login")
          return
        }

        // Get user role from metadata
        const role = user.user_metadata?.role || "employee"

        // Redirect based on role
        if (role === "admin") {
          router.push("/admin")
        } else if (role === "manager") {
          router.push("/manager-dashboard")
        } else {
          router.push("/employee-dashboard")
        }
      } catch (error) {
        console.error("Error checking user role:", error)
        router.push("/login")
      }
    }

    checkUserRole()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <h2 className="text-xl font-semibold">Loading your dashboard...</h2>
        <p className="text-slate-500">Please wait while we redirect you to the appropriate dashboard.</p>
      </div>
    </div>
  )
}

function StatsCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </CardContent>
    </Card>
  )
}

function TaskItem({ title, assignee, dueDate, priority, status, progress }) {
  const priorityColors = {
    High: "text-red-500 bg-red-50 dark:bg-red-950",
    Medium: "text-amber-500 bg-amber-50 dark:bg-amber-950",
    Low: "text-green-500 bg-green-50 dark:bg-green-950",
  }

  const statusIcons = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    "in-progress": <Clock3 className="h-4 w-4 text-amber-500" />,
    "not-started": <AlertCircle className="h-4 w-4 text-slate-500" />,
    blocked: <XCircle className="h-4 w-4 text-red-500" />,
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-slate-950 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Assigned to: {assignee}</span>
            <span>•</span>
            <span>Due: {dueDate}</span>
          </div>
        </div>
        <Badge className={priorityColors[priority]}>{priority}</Badge>
      </div>
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1 text-xs">
          <div className="flex items-center gap-1">
            {statusIcons[status]}
            <span>
              {status === "in-progress"
                ? "In Progress"
                : status === "not-started"
                  ? "Not Started"
                  : status === "completed"
                    ? "Completed"
                    : "Blocked"}
            </span>
          </div>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  )
}

function EmployeeRow({ name, email, department, status, location }) {
  const statusColors = {
    Active: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    "On Leave": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Inactive: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400",
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
      <div>{department}</div>
      <div>
        <Badge variant="outline" className={statusColors[status]}>
          {status}
        </Badge>
      </div>
      <div>{location}</div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon">
          <MessageSquare size={16} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Edit Details</DropdownMenuItem>
            <DropdownMenuItem>Assign Tasks</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function ScheduleItem({ date, shifts, notes, isToday = false }) {
  return (
    <div
      className={`p-4 border rounded-lg ${isToday ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-800"}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{date}</h3>
          <div className="space-y-1 mt-1">
            {shifts.map((shift, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge
                  variant={shift.type === "PTO" ? "outline" : "default"}
                  className={
                    shift.type === "PTO" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400" : ""
                  }
                >
                  {shift.type}
                </Badge>
                <span className="text-sm">{shift.time}</span>
              </div>
            ))}
          </div>
          {notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{notes}</p>}
        </div>
        {isToday && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
            Today
          </Badge>
        )}
      </div>
    </div>
  )
}

function VacancyItem({ title, department, location, type, postedDate, applicants, status }) {
  const statusColors = {
    Open: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    Reviewing: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    Closed: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400",
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-slate-950 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{department}</span>
            <span>•</span>
            <span>{location}</span>
            <span>•</span>
            <span>{type}</span>
          </div>
        </div>
        <Badge variant="outline" className={statusColors[status]}>
          {status}
        </Badge>
      </div>
      <div className="mt-3 flex justify-between items-center text-sm">
        <div className="text-slate-500 dark:text-slate-400">Posted: {new Date(postedDate).toLocaleDateString()}</div>
        <div className="flex items-center gap-1">
          <Users size={14} className="text-blue-500" />
          <span>{applicants} applicants</span>
        </div>
      </div>
    </div>
  )
}

function MessageItem({ sender, subject, content, date, read, avatar }) {
  return (
    <div
      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${read ? "" : "bg-blue-50 dark:bg-blue-950/30"}`}
    >
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={avatar || "/placeholder.svg"} />
          <AvatarFallback>
            {sender
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className={`font-medium truncate ${read ? "" : "font-semibold"}`}>{sender}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">{date}</span>
          </div>
          <p className={`text-sm truncate ${read ? "" : "font-medium"}`}>{subject}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{content}</p>
        </div>
      </div>
    </div>
  )
}

function ReportItem({ title, description, lastUpdated, type }) {
  const typeColors = {
    Attendance: "text-blue-600",
    Performance: "text-green-600",
    Recruitment: "text-purple-600",
    HR: "text-amber-600",
    Compliance: "text-red-600",
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-slate-950 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <Badge className={`bg-slate-100 ${typeColors[type]}`}>{type}</Badge>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="text-xs text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</div>
        <Button variant="outline" size="sm">
          View Report
        </Button>
      </div>
    </div>
  )
}

function Menu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
