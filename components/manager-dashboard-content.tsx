"use client"

// Import the original dashboard content
// This is a modified version of the dashboard.tsx file you provided
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
  MoreHorizontal,
  X,
  UserPlus,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

// Initial data (same as in your original file)
// ... (all the initial data from your original file)

export default function ManagerDashboardContent({ user }) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks] = useState([])
  const [vacancies, setVacancies] = useState([])
  const [messages, setMessages] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
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
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  // Fetch employees from Supabase
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setIsLoading(true)

        // Get the company ID of the current user
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", user.id)
          .single()

        if (userError) throw userError

        // Get all employees from the same company
        const { data, error } = await supabase
          .from("users")
          .select(`
            id,
            email,
            full_name,
            role,
            created_at,
            employees (
              id,
              department_id,
              position,
              status,
              location,
              start_date,
              departments (name)
            )
          `)
          .eq("company_id", userData.company_id)
          .eq("role", "employee")

        if (error) throw error

        // Format the data to match our expected structure
        const formattedEmployees = data.map((user) => ({
          id: user.id,
          name: user.full_name,
          email: user.email,
          department: user.employees?.[0]?.departments?.name || "Unassigned",
          status: user.employees?.[0]?.status || "Active",
          location: user.employees?.[0]?.location || "Not specified",
          position: user.employees?.[0]?.position || "Not specified",
          startDate: user.employees?.[0]?.start_date || user.created_at.split("T")[0],
          avatar: "/placeholder.svg?height=40&width=40",
        }))

        setEmployees(formattedEmployees)
      } catch (error) {
        console.error("Error fetching employees:", error)
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchEmployees()
    }
  }, [user])

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
  const handleAddEmployee = async (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      // Validate required fields
      if (!newEmployee.name || !newEmployee.email || !newEmployee.password || !newEmployee.department) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Get the company ID of the current user
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single()

      if (userError) throw userError

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newEmployee.email,
        password: newEmployee.password,
        email_confirm: true, // Auto-confirm email for employees
        user_metadata: {
          full_name: newEmployee.name,
          role: "employee",
        },
      })

      if (authError) throw authError

      // Create user record in the users table
      const { error: userInsertError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: newEmployee.email,
          full_name: newEmployee.name,
          role: "employee",
          company_id: userData.company_id,
        },
      ])

      if (userInsertError) throw userInsertError

      // Get or create department
      let departmentId
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id")
        .eq("name", newEmployee.department)
        .eq("company_id", userData.company_id)
        .single()

      if (deptError) {
        // Department doesn't exist, create it
        const { data: newDeptData, error: newDeptError } = await supabase
          .from("departments")
          .insert([
            {
              name: newEmployee.department,
              company_id: userData.company_id,
            },
          ])
          .select("id")
          .single()

        if (newDeptError) throw newDeptError
        departmentId = newDeptData.id
      } else {
        departmentId = deptData.id
      }

      // Create employee record
      const { error: empError } = await supabase.from("employees").insert([
        {
          user_id: authData.user.id,
          department_id: departmentId,
          position: newEmployee.position || "Not specified",
          status: newEmployee.status,
          location: newEmployee.location || "Not specified",
          start_date: newEmployee.startDate || new Date().toISOString().split("T")[0],
        },
      ])

      if (empError) throw empError

      toast({
        title: "Success",
        description: `Employee ${newEmployee.name} has been added successfully.`,
      })

      // Reset form
      setNewEmployee({
        name: "",
        email: "",
        password: "",
        department: "",
        position: "",
        location: "",
        status: "Active",
        startDate: "",
      })

      // Close dialog
      setShowEmployeeDialog(false)

      // Refresh employee list
      const { data: refreshData, error: refreshError } = await supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          role,
          created_at,
          employees (
            id,
            department_id,
            position,
            status,
            location,
            start_date,
            departments (name)
          )
        `)
        .eq("company_id", userData.company_id)
        .eq("role", "employee")

      if (refreshError) throw refreshError

      // Format the data to match our expected structure
      const formattedEmployees = refreshData.map((user) => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        department: user.employees?.[0]?.departments?.name || "Unassigned",
        status: user.employees?.[0]?.status || "Active",
        location: user.employees?.[0]?.location || "Not specified",
        position: user.employees?.[0]?.position || "Not specified",
        startDate: user.employees?.[0]?.start_date || user.created_at.split("T")[0],
        avatar: "/placeholder.svg?height=40&width=40",
      }))

      setEmployees(formattedEmployees)

      // Add notification
      const newNotification = {
        id: notifications.length + 1,
        title: "New employee added",
        description: `${newEmployee.name} has been added to the ${newEmployee.department} department`,
        time: "Just now",
        type: "employee",
        read: false,
      }
      setNotifications([newNotification, ...notifications])
    } catch (error) {
      console.error("Error adding employee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
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

  // The rest of the component is the same as your original dashboard.tsx
  // Just replace "John Doe" with user.user_metadata.full_name and "Admin" with "Manager"

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
              <AvatarFallback>
                {user.user_metadata?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "M"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.user_metadata?.full_name || "Manager"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manager</p>
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
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* The rest of your dashboard content goes here */}
          {/* This is the same as in your original dashboard.tsx */}
          {/* Just update the "Add Employee" dialog to include password field */}

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
                    <UserPlus size={16} /> Add Employee
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
                      {isLoading ? (
                        <div className="p-8 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                          <p className="mt-2 text-sm text-slate-500">Loading employees...</p>
                        </div>
                      ) : paginatedEmployees.length === 0 ? (
                        <div className="p-8 text-center">
                          <Users className="h-12 w-12 mx-auto text-slate-300" />
                          <h3 className="mt-2 text-lg font-medium">No employees found</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {searchQuery ? "Try a different search term" : "Add your first employee to get started"}
                          </p>
                          <Button className="mt-4" onClick={() => setShowEmployeeDialog(true)}>
                            <UserPlus size={16} className="mr-2" /> Add Employee
                          </Button>
                        </div>
                      ) : (
                        paginatedEmployees.map((employee) => (
                          <EmployeeRow
                            key={employee.id}
                            name={employee.name}
                            email={employee.email}
                            department={employee.department}
                            status={employee.status}
                            location={employee.location}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
                {!isLoading && paginatedEmployees.length > 0 && (
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
                )}
              </Card>
            </div>
          )}

          {/* Add Employee Dialog - Updated to include password */}
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
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={newEmployee.password}
                      onChange={handleEmployeeInputChange}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                    </p>
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

          {/* The rest of your dialogs and components */}
        </main>
      </div>
    </div>
  )
}

// Helper components like EmployeeRow, TaskItem, etc. go here
// These are the same as in your original dashboard.tsx

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

// Include all the other helper components from your original dashboard.tsx

function EmployeeRow({ name, email, department, status, location }) {
  return (
    <div className="grid grid-cols-6 p-4 hover:bg-slate-100 dark:hover:bg-slate-900">
      <div className="col-span-2 flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=40&width=40" />
          <AvatarFallback>
            {name
              ?.split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
        </div>
      </div>
      <div>{department}</div>
      <div>
        <Badge variant={status === "Active" ? "default" : status === "On Leave" ? "secondary" : "destructive"}>
          {status}
        </Badge>
      </div>
      <div>{location}</div>
      <div className="text-right font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
