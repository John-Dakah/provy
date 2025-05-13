"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
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
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  User,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  CheckCheck,
  AlertCircle,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button as UIButton } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function EmployeeDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/login")
          return
        }

        // Verify user is an employee
        const role = user.user_metadata?.role
        if (role !== "employee") {
          router.push("/dashboard")
          return
        }

        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error("Error getting user:", error)
        router.push("/login")
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <h2 className="text-xl font-semibold">Loading employee dashboard...</h2>
          <p className="text-slate-500">Please wait while we prepare your dashboard.</p>
        </div>
      </div>
    )
  }

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
          <UIButton variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("overview")}>
            <LayoutDashboard size={18} />
            Dashboard
          </UIButton>
          <UIButton variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("tasks")}>
            <FileText size={18} />
            My Tasks
          </UIButton>
          <UIButton variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("attendance")}>
            <Clock size={18} />
            Attendance
          </UIButton>
          <UIButton variant="ghost" className="justify-start gap-2" onClick={() => setActiveTab("schedule")}>
            <Calendar size={18} />
            Schedule
          </UIButton>
          <UIButton variant="ghost" className="justify-start gap-2">
            <MessageSquare size={18} />
            Messages
          </UIButton>
          <UIButton variant="ghost" className="justify-start gap-2">
            <FileCheck size={18} />
            Documents
          </UIButton>
          <UIButton variant="ghost" className="justify-start gap-2">
            <User size={18} />
            Profile
          </UIButton>
          <UIButton variant="ghost" className="justify-start gap-2">
            <Settings size={18} />
            Settings
          </UIButton>
        </div>
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>MG</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Maria Garcia</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Designer</p>
            </div>
            <UIButton
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            >
              <LogOut size={18} />
            </UIButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 md:px-6">
          <UIButton variant="outline" size="icon" className="md:hidden mr-2">
            <Menu />
          </UIButton>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <UIButton variant="outline" size="icon">
              <Bell size={18} />
            </UIButton>
            <Avatar className size="icon">
              <Bell size={18} />
            </Avatar>
            <Avatar className="h-8 w-8 md:hidden">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>MG</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Employee Dashboard</h1>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">My Tasks</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Tasks Completed"
                  value="18"
                  description="This month"
                  icon={<CheckCheck className="h-4 w-4 text-green-600" />}
                />
                <StatsCard
                  title="Attendance Rate"
                  value="98%"
                  description="Last 30 days"
                  icon={<Clock className="h-4 w-4 text-blue-600" />}
                />
                <StatsCard
                  title="Upcoming PTO"
                  value="3 days"
                  description="Sep 15-17"
                  icon={<Calendar className="h-4 w-4 text-amber-600" />}
                />
                <StatsCard
                  title="Performance Score"
                  value="92"
                  description="+5 from last review"
                  icon={<Activity className="h-4 w-4 text-purple-600" />}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle>My Performance</CardTitle>
                    <CardDescription>Task completion and efficiency metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px] flex items-end gap-2">
                      {[75, 82, 90, 85, 92, 88].map((value, i) => (
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
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Meetings and deadlines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Team Meeting</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Today, 2:00 PM</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Conference Room A</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 bg-amber-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Project Deadline</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tomorrow, 5:00 PM</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Website Redesign</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Performance Review</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Sep 20, 10:00 AM</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">With Manager</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">My Tasks</h2>
                <div className="flex gap-2">
                  <select className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300">
                    <option>All Tasks</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  <UIButton variant="outline">Filter</UIButton>
                </div>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <EmployeeTaskItem
                        title="Website Redesign - Homepage"
                        dueDate="Today"
                        priority="High"
                        status="in-progress"
                        progress={75}
                      />
                      <EmployeeTaskItem
                        title="Create Social Media Graphics"
                        dueDate="Tomorrow"
                        priority="Medium"
                        status="in-progress"
                        progress={45}
                      />
                      <EmployeeTaskItem
                        title="Update Brand Guidelines"
                        dueDate="Sep 15"
                        priority="Low"
                        status="not-started"
                        progress={0}
                      />
                      <EmployeeTaskItem
                        title="Design Email Newsletter Template"
                        dueDate="Sep 12"
                        priority="High"
                        status="completed"
                        progress={100}
                      />
                      <EmployeeTaskItem
                        title="Create Icons for Mobile App"
                        dueDate="Sep 20"
                        priority="Medium"
                        status="in-progress"
                        progress={30}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Attendance History</h2>
                <div className="flex gap-2">
                  <UIButton variant="outline" size="sm">
                    <ChevronLeft size={16} />
                    Previous Month
                  </UIButton>
                  <UIButton variant="outline" size="sm">
                    Next Month
                    <ChevronRight size={16} />
                  </UIButton>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>September 2025</CardTitle>
                  <CardDescription>Attendance record for the current month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-sm font-medium py-2">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = i + 1
                      const isWeekend = day % 7 === 0 || day % 7 === 1
                      const isPast = day <= 9
                      const isToday = day === 9

                      let status = ""
                      if (isPast) {
                        status = isWeekend ? "weekend" : "present"
                        if (day === 5) status = "late"
                      }

                      return (
                        <div
                          key={day}
                          className={`h-16 border rounded-md p-1 ${
                            isToday
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-800"
                          } ${isWeekend ? "bg-slate-50 dark:bg-slate-900" : ""}`}
                        >
                          <div className="text-sm">{day}</div>
                          {status === "present" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 text-xs"
                              >
                                Present
                              </Badge>
                            </div>
                          )}
                          {status === "late" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-xs"
                              >
                                Late
                              </Badge>
                            </div>
                          )}
                          {status === "weekend" && (
                            <div className="mt-1 flex justify-center">
                              <Badge
                                variant="outline"
                                className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 text-xs"
                              >
                                Weekend
                              </Badge>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Present: 18</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span>Late: 1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Absent: 0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <span>Weekend: 8</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">My Schedule</h2>
                <div className="flex gap-2">
                  <UIButton variant="outline">
                    <CalendarDays size={16} className="mr-2" />
                    View Calendar
                  </UIButton>
                  <UIButton>
                    <Plus size={16} className="mr-2" />
                    Request Time Off
                  </UIButton>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Upcoming Schedule</CardTitle>
                  <CardDescription>Your work schedule for the next two weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ScheduleItem
                      date="Monday, Sep 9"
                      shifts={[{ time: "9:00 AM - 5:00 PM", type: "Regular" }]}
                      isToday={true}
                    />
                    <ScheduleItem date="Tuesday, Sep 10" shifts={[{ time: "9:00 AM - 5:00 PM", type: "Regular" }]} />
                    <ScheduleItem date="Wednesday, Sep 11" shifts={[{ time: "9:00 AM - 5:00 PM", type: "Regular" }]} />
                    <ScheduleItem date="Thursday, Sep 12" shifts={[{ time: "9:00 AM - 5:00 PM", type: "Regular" }]} />
                    <ScheduleItem date="Friday, Sep 13" shifts={[{ time: "9:00 AM - 5:00 PM", type: "Regular" }]} />
                    <ScheduleItem
                      date="Monday, Sep 16"
                      shifts={[{ time: "All Day", type: "PTO" }]}
                      notes="Approved Time Off"
                    />
                    <ScheduleItem
                      date="Tuesday, Sep 17"
                      shifts={[{ time: "All Day", type: "PTO" }]}
                      notes="Approved Time Off"
                    />
                    <ScheduleItem
                      date="Wednesday, Sep 18"
                      shifts={[{ time: "All Day", type: "PTO" }]}
                      notes="Approved Time Off"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
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

function EmployeeTaskItem({ title, dueDate, priority, status, progress }) {
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
    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
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

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </button>
  )
}
