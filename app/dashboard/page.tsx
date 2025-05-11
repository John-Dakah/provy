"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  Bell,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  Briefcase,
  Search,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Mail,
  FileBarChart,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

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
  const [activeSection, setActiveSection] = useState("overview")
  const [employees, setEmployees] = useState(initialEmployees)
  const [tasks, setTasks] = useState(initialTasks)
  const [vacancies, setVacancies] = useState(initialVacancies)
  const [messages, setMessages] = useState(initialMessages)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    location: "",
    status: "Active",
    startDate: "",
  })
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
    status: "not-started",
    description: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter employees based on search query
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle form input changes
  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target
    setNewEmployee((prev) => ({ ...prev, [name]: value }))
  }

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target
    setNewTask((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submissions
  const handleAddEmployee = (e) => {
    e.preventDefault()
    const id = employees.length > 0 ? Math.max(...employees.map((emp) => emp.id)) + 1 : 1
    const fullName = newEmployee.name.trim()

    if (!fullName || !newEmployee.email || !newEmployee.department) {
      alert("Please fill in all required fields")
      return
    }

    const newEmployeeData = {
      id,
      name: fullName,
      email: newEmployee.email,
      department: newEmployee.department,
      position: newEmployee.position || "Not specified",
      location: newEmployee.location || "Not specified",
      status: newEmployee.status,
      startDate: newEmployee.startDate || new Date().toISOString().split("T")[0],
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setEmployees([...employees, newEmployeeData])
    setNewEmployee({
      name: "",
      email: "",
      department: "",
      position: "",
      location: "",
      status: "Active",
      startDate: "",
    })

    // Add notification
    const newNotification = {
      id: notifications.length + 1,
      title: "New employee added",
      description: `${fullName} has been added to the ${newEmployee.department} department`,
      time: "Just now",
      type: "employee",
      read: false,
    }
    setNotifications([newNotification, ...notifications])

    setShowEmployeeDialog(false)
  }

  const handleAddTask = (e) => {
    e.preventDefault()

    if (!newTask.title || !newTask.assignee || !newTask.dueDate) {
      alert("Please fill in all required fields")
      return
    }

    const id = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1
    const newTaskData = {
      id,
      title: newTask.title,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: newTask.status,
      progress: newTask.status === "completed" ? 100 : newTask.status === "in-progress" ? 50 : 0,
      description: newTask.description,
    }

    setTasks([...tasks, newTaskData])
    setNewTask({
      title: "",
      assignee: "",
      dueDate: "",
      priority: "Medium",
      status: "not-started",
      description: "",
    })

    // Add notification
    const newNotification = {
      id: notifications.length + 1,
      title: "New task created",
      description: `"${newTask.title}" has been assigned to ${newTask.assignee}`,
      time: "Just now",
      type: "task",
      read: false,
    }
    setNotifications([newNotification, ...notifications])

    setShowTaskDialog(false)
  }

  // Handle logout
  const handleLogout = () => {
    router.push("/login")
  }

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  // Count unread notifications
  const unreadNotificationsCount = notifications.filter((notification) => !notification.read).length

  // Effect to prevent scrolling when dialog is open
  useEffect(() => {
    if (showTaskDialog || showEmployeeDialog) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showTaskDialog, showEmployeeDialog])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-blue-600 rounded-md rotate-45 transform origin-center"></div>
              <div className="absolute inset-1 bg-blue-500 rounded-sm rotate-45 transform origin-center"></div>
              <div className="absolute inset-2 bg-blue-400 rounded-sm rotate-45 transform origin-center"></div>
            </div>
            <h1 className="text-xl font-bold">WorkForce</h1>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-2">
          <Button
            variant={activeSection === "overview" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("overview")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Button>
          <Button
            variant={activeSection === "tasks" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("tasks")}
          >
            <FileText size={18} />
            Tasks
          </Button>
          <Button
            variant={activeSection === "employees" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("employees")}
          >
            <Users size={18} />
            Employees
          </Button>
          <Button
            variant={activeSection === "attendance" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("attendance")}
          >
            <Clock size={18} />
            Attendance
          </Button>
          <Button
            variant={activeSection === "schedule" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("schedule")}
          >
            <Calendar size={18} />
            Schedule
          </Button>
          <Button
            variant={activeSection === "vacancies" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("vacancies")}
          >
            <Briefcase size={18} />
            Vacancies
          </Button>
          <Button
            variant={activeSection === "messages" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("messages")}
          >
            <MessageSquare size={18} />
            Messages
          </Button>
          <Button
            variant={activeSection === "reports" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("reports")}
          >
            <Activity size={18} />
            Reports
          </Button>
          <Button
            variant={activeSection === "settings" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveSection("settings")}
          >
            <Settings size={18} />
            Settings
          </Button>
        </div>
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 md:px-6">
          <Button variant="outline" size="icon" className="md:hidden mr-2">
            <Menu />
          </Button>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 rounded-md shadow-lg border border-slate-200 dark:border-slate-800 z-50">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead}>
                      Mark all as read
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 ${
                            !notification.read ? "bg-blue-50 dark:bg-blue-950/30" : ""
                          }`}
                        >
                          <div className="flex justify-between">
                            <h4 className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-slate-500">{notification.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{notification.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 w-full">
                      View all notifications
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Avatar className="h-8 w-8 md:hidden">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Dashboard Overview */}
          {activeSection === "overview" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Dashboard Overview</h1>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total Employees"
                  value={employees.length.toString()}
                  description={`+${Math.floor(employees.length * 0.12)} from last month`}
                  icon={<Users className="h-4 w-4 text-blue-600" />}
                />
                <StatsCard
                  title="Active Tasks"
                  value={tasks.filter((t) => t.status !== "completed").length.toString()}
                  description={`${tasks.filter((t) => t.dueDate === "Today").length} due today`}
                  icon={<FileText className="h-4 w-4 text-green-600" />}
                />
                <StatsCard
                  title="Attendance Rate"
                  value="94%"
                  description="3% higher than target"
                  icon={<Clock className="h-4 w-4 text-amber-600" />}
                />
                <StatsCard
                  title="Open Positions"
                  value={vacancies.length.toString()}
                  description={`${vacancies.filter((v) => v.postedDate > "2023-08-15").length} new this week`}
                  icon={<Briefcase className="h-4 w-4 text-purple-600" />}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle>Department Performance</CardTitle>
                    <CardDescription>Task completion rates by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px] flex items-end gap-2">
                      {[85, 65, 92, 78, 56, 70].map((value, i) => (
                        <div key={i} className="relative flex-1 group">
                          <div
                            className="absolute inset-x-0 bottom-0 bg-blue-100 dark:bg-blue-950 rounded-t-md transition-all duration-500 ease-out group-hover:bg-blue-200 dark:group-hover:bg-blue-900"
                            style={{ height: `${value}%` }}
                          >
                            <div
                              className="absolute inset-x-0 bottom-0 bg-blue-500 rounded-t-md transition-all duration-500 ease-out group-hover:bg-blue-600"
                              style={{ height: `${value * 0.7}%` }}
                            ></div>
                          </div>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            {value}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Engineering</span>
                      <span>Design</span>
                      <span>Marketing</span>
                      <span>Sales</span>
                      <span>Support</span>
                      <span>HR</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>Latest updates and alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {notifications.slice(0, 3).map((notification, index) => (
                      <div key={index} className="flex gap-3">
                        <div
                          className={`w-1 rounded-full ${
                            notification.type === "task"
                              ? "bg-blue-500"
                              : notification.type === "meeting"
                                ? "bg-amber-500"
                                : notification.type === "alert"
                                  ? "bg-red-500"
                                  : notification.type === "employee"
                                    ? "bg-green-500"
                                    : "bg-purple-500"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{notification.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {activeSection === "tasks" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Task Management</h1>
                <Button className="gap-1" onClick={() => setShowTaskDialog(true)}>
                  <Plus size={16} /> Add Task
                </Button>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Active Tasks</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Sort by priority</DropdownMenuItem>
                          <DropdownMenuItem>Sort by due date</DropdownMenuItem>
                          <DropdownMenuItem>Filter by assignee</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          title={task.title}
                          assignee={task.assignee}
                          dueDate={task.dueDate}
                          priority={task.priority}
                          status={task.status}
                          progress={task.progress}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Employees Section */}
          {activeSection === "employees" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Employee Directory</h1>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search employees..."
                    className="w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline">Filter</Button>
                  <Button className="gap-1" onClick={() => setShowEmployeeDialog(true)}>
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
                      {paginatedEmployees.map((employee) => (
                        <EmployeeRow
                          key={employee.id}
                          name={employee.name}
                          email={employee.email}
                          department={employee.department}
                          status={employee.status}
                          location={employee.location}
                        />
                      ))}
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
            </div>
          )}

          {/* Attendance Section */}
          {activeSection === "attendance" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Attendance Management</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft size={16} className="mr-1" />
                    Previous Month
                  </Button>
                  <Button variant="outline" size="sm">
                    Next Month
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>{attendanceData.currentMonth}</CardTitle>
                  <CardDescription>Attendance record for the current month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-sm font-medium py-2">
                        {day}
                      </div>
                    ))}

                    {/* Empty cells for days before the 1st of the month */}
                    {Array.from({ length: attendanceData.weekStart }, (_, i) => (
                      <div key={`empty-${i}`} className="h-16 border border-transparent rounded-md p-1"></div>
                    ))}

                    {/* Calendar days */}
                    {attendanceData.records.map((record) => {
                      const isToday = record.day === 9 // Assuming day 9 is today

                      return (
                        <div
                          key={record.day}
                          className={`h-16 border rounded-md p-1 ${
                            isToday
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-800"
                          } ${record.status === "weekend" ? "bg-slate-50 dark:bg-slate-900" : ""}`}
                        >
                          <div className="text-sm">{record.day}</div>
                          {record.status === "present" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 text-xs"
                              >
                                Present
                              </Badge>
                            </div>
                          )}
                          {record.status === "late" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-xs"
                              >
                                Late
                              </Badge>
                            </div>
                          )}
                          {record.status === "weekend" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 text-xs"
                              >
                                Weekend
                              </Badge>
                            </div>
                          )}
                          {record.status === "absent" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 text-xs"
                              >
                                Absent
                              </Badge>
                            </div>
                          )}
                          {record.status === "leave" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400 text-xs"
                              >
                                Leave
                              </Badge>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Present: {attendanceData.summary.present}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span>Late: {attendanceData.summary.late}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Absent: {attendanceData.summary.absent}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Leave: {attendanceData.summary.leave}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <span>Weekend: {attendanceData.summary.weekend}</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Schedule Section */}
          {activeSection === "schedule" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Work Schedule</h1>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <CalendarDays size={16} className="mr-2" />
                    View Calendar
                  </Button>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Request Time Off
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Upcoming Schedule</CardTitle>
                  <CardDescription>Your work schedule for the next two weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduleData.map((item, index) => (
                      <ScheduleItem
                        key={index}
                        date={item.date}
                        shifts={item.shifts}
                        notes={item.notes}
                        isToday={item.isToday}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vacancies Section */}
          {activeSection === "vacancies" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Job Vacancies</h1>
                <Button className="gap-1">
                  <Plus size={16} /> Post New Job
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Open Positions</CardTitle>
                  <CardDescription>Current job openings across all departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vacancies.map((vacancy) => (
                      <VacancyItem
                        key={vacancy.id}
                        title={vacancy.title}
                        department={vacancy.department}
                        location={vacancy.location}
                        type={vacancy.type}
                        postedDate={vacancy.postedDate}
                        applicants={vacancy.applicants}
                        status={vacancy.status}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Section */}
          {activeSection === "messages" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Messages</h1>
                <Button className="gap-1">
                  <Mail size={16} className="mr-1" /> Compose
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Inbox</CardTitle>
                  <CardDescription>Your recent messages and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 divide-y">
                    {messages.map((message) => (
                      <MessageItem
                        key={message.id}
                        sender={message.sender}
                        subject={message.subject}
                        content={message.content}
                        date={message.date}
                        read={message.read}
                        avatar={message.avatar}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Section */}
          {activeSection === "reports" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <Button className="gap-1">
                  <FileBarChart size={16} className="mr-1" /> Generate Report
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Available Reports</CardTitle>
                  <CardDescription>Access and download detailed reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportsData.map((report) => (
                      <ReportItem
                        key={report.id}
                        title={report.title}
                        description={report.description}
                        lastUpdated={report.lastUpdated}
                        type={report.type}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Settings</h1>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input id="email" type="email" defaultValue="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium">
                        Role
                      </label>
                      <Input id="role" defaultValue="Administrator" disabled />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="current-password" className="text-sm font-medium">
                        Current Password
                      </label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm font-medium">
                        New Password
                      </label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirm New Password
                      </label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between space-x-2">
                        <label htmlFor="email-notifications" className="flex flex-col space-y-1">
                          <span className="font-medium">Email Notifications</span>
                          <span className="text-sm text-slate-500">Receive notifications via email</span>
                        </label>
                        <input
                          type="checkbox"
                          id="email-notifications"
                          className="h-4 w-4 rounded border-slate-300"
                          defaultChecked
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <label htmlFor="sms-notifications" className="flex flex-col space-y-1">
                          <span className="font-medium">SMS Notifications</span>
                          <span className="text-sm text-slate-500">Receive notifications via SMS</span>
                        </label>
                        <input type="checkbox" id="sms-notifications" className="h-4 w-4 rounded border-slate-300" />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <label htmlFor="task-notifications" className="flex flex-col space-y-1">
                          <span className="font-medium">Task Assignments</span>
                          <span className="text-sm text-slate-500">Notify when assigned to a task</span>
                        </label>
                        <input
                          type="checkbox"
                          id="task-notifications"
                          className="h-4 w-4 rounded border-slate-300"
                          defaultChecked
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <label htmlFor="system-notifications" className="flex flex-col space-y-1">
                          <span className="font-medium">System Updates</span>
                          <span className="text-sm text-slate-500">Notify about system changes</span>
                        </label>
                        <input
                          type="checkbox"
                          id="system-notifications"
                          className="h-4 w-4 rounded border-slate-300"
                          defaultChecked
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Task Dialog */}
      {showTaskDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Task</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTaskDialog(false)}>
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={handleTaskInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={handleTaskInputChange}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium mb-1">
                    Assignee <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="assignee"
                    name="assignee"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    value={newTask.assignee}
                    onChange={handleTaskInputChange}
                    required
                  >
                    <option value="">Select assignee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={handleTaskInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    value={newTask.priority}
                    onChange={handleTaskInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    value={newTask.status}
                    onChange={handleTaskInputChange}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowTaskDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Dialog */}
      {showEmployeeDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Employee</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowEmployeeDialog(false)}>
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  value={newEmployee.name}
                  onChange={handleEmployeeInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newEmployee.email}
                  onChange={handleEmployeeInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="department"
                    name="department"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    value={newEmployee.department}
                    onChange={handleEmployeeInputChange}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Support">Support</option>
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
                    value={newEmployee.position}
                    onChange={handleEmployeeInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter location"
                    value={newEmployee.location}
                    onChange={handleEmployeeInputChange}
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
                    value={newEmployee.status}
                    onChange={handleEmployeeInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={newEmployee.startDate}
                  onChange={handleEmployeeInputChange}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowEmployeeDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Employee</Button>
              </div>
            </form>
          </div>
        </div>
      )}
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
