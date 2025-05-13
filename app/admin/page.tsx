"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  UserPlus,
  UserCog,
  Shield,
  LogOut,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string; role: string; status: string }[]>([])
  const [filteredUsers, setFilteredUsers] = useState<{ id: string; email: string; full_name: string; role: string; status: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // New user form state
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "manager",
    company: "",
  })

  // Edit user form state
  const [editUser, setEditUser] = useState({
    id: "",
    fullName: "",
    email: "",
    role: "",
    status: "",
  })

  // Fetch current user
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) throw error
        setCurrentUser(user)
      } catch (error) {
        console.error("Error fetching current user:", error)
        router.push("/login")
      }
    }
    getCurrentUser()
  }, [router])

  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true)

        // Get all users from the users table
        const { data, error } = await supabase
          .from("users")
          .select(`
            id,
            email,
            full_name,
            role,
            company_id,
            created_at,
            updated_at,
            last_login,
            companies (name)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Get auth status for each user
        const usersWithStatus = await Promise.all(
          data.map(async (user) => {
            // Get user auth data
            const { data: authData, error: authError } = await supabase.auth.admin.getUserById(user.id)

            if (authError) {
              console.error(`Error fetching auth data for user ${user.id}:`, authError)
              return {
                ...user,
                status: "Unknown",
                email_verified: false,
              }
            }

            return {
              ...user,
              status: authData?.user?.banned ? "Banned" : authData?.user?.email_confirmed_at ? "Active" : "Pending",
              email_verified: !!authData?.user?.email_confirmed_at,
            }
          }),
        )

        setUsers(usersWithStatus)
        setFilteredUsers(usersWithStatus)
        setTotalPages(Math.ceil(usersWithStatus.length / itemsPerPage))
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  // Filter users based on search query, role filter, and status filter
  useEffect(() => {
    let result = users

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(result)
    setTotalPages(Math.ceil(result.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, roleFilter, statusFilter, users])

  // Get paginated users
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Handle form input changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditUserChange = (e) => {
    const { name, value } = e.target
    setEditUser((prev) => ({ ...prev, [name]: value }))
  }

  // Handle role change in select dropdown
  const handleRoleChange = (value) => {
    setEditUser((prev) => ({ ...prev, role: value }))
  }

  // Handle status change in select dropdown
  const handleStatusChange = (value) => {
    setEditUser((prev) => ({ ...prev, status: value }))
  }

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault()

    try {
      // Call our registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          password: newUser.password,
          company: newUser.company || "Default Company",
          role: newUser.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add user")
      }

      toast({
        title: "Success",
        description: "User added successfully. Verification email has been sent.",
      })

      // Reset form and close dialog
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "manager",
        company: "",
      })
      setShowAddUserDialog(false)

      // Refresh user list
      const { data: updatedUsers, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(updatedUsers)
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle edit user form submission
  const handleEditUser = async (e) => {
    e.preventDefault()

    try {
      // Update user in the database
      const { error } = await supabase
        .from("users")
        .update({
          full_name: editUser.fullName,
          role: editUser.role,
        })
        .eq("id", editUser.id)

      if (error) throw error

      // If status is changed to "Banned", update auth user
      if (editUser.status === "Banned") {
        const { error: banError } = await supabase.auth.admin.updateUserById(editUser.id, { banned: true })
        if (banError) throw banError
      }

      // If status is changed from "Banned" to "Active", update auth user
      if (editUser.status === "Active" && selectedUser.status === "Banned") {
        const { error: unbanError } = await supabase.auth.admin.updateUserById(editUser.id, { banned: false })
        if (unbanError) throw unbanError
      }

      toast({
        title: "Success",
        description: "User updated successfully.",
      })

      // Reset form and close dialog
      setEditUser({
        id: "",
        fullName: "",
        email: "",
        role: "",
        status: "",
      })
      setShowEditUserDialog(false)

      // Refresh user list
      const { data: updatedUsers, error: refreshError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (refreshError) throw refreshError
      setUsers(updatedUsers)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id)
      if (authError) throw authError

      // Delete user from database
      const { error: dbError } = await supabase.from("users").delete().eq("id", selectedUser.id)

      if (dbError) throw dbError

      toast({
        title: "Success",
        description: "User deleted successfully.",
      })

      // Close dialog and refresh user list
      setShowDeleteUserDialog(false)
      setSelectedUser(null)

      // Update local state
      setUsers(users.filter((user) => user.id !== selectedUser.id))
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Open edit user dialog
  const openEditUserDialog = (user) => {
    setSelectedUser(user)
    setEditUser({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setShowEditUserDialog(true)
  }

  // Open delete user dialog
  const openDeleteUserDialog = (user) => {
    setSelectedUser(user)
    setShowDeleteUserDialog(true)
  }

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
      case "manager":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
      case "employee":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400"
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
      case "Pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
      case "Banned":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-red-600 rounded-md rotate-45 transform origin-center"></div>
              <div className="absolute inset-1 bg-red-500 rounded-sm rotate-45 transform origin-center"></div>
              <div className="absolute inset-2 bg-red-400 rounded-sm rotate-45 transform origin-center"></div>
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-2">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveTab("users")}
          >
            <Users size={18} />
            Users
          </Button>
          <Button
            variant={activeTab === "roles" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveTab("roles")}
          >
            <UserCog size={18} />
            Roles & Permissions
          </Button>
          <Button
            variant={activeTab === "security" ? "default" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveTab("security")}
          >
            <Shield size={18} />
            Security
          </Button>
        </div>
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>
                {currentUser?.user_metadata?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "AD"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{currentUser?.user_metadata?.full_name || "Admin"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
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
          <div className="md:hidden flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-red-600 rounded-md rotate-45 transform origin-center"></div>
              <div className="absolute inset-1 bg-red-500 rounded-sm rotate-45 transform origin-center"></div>
              <div className="absolute inset-2 bg-red-400 rounded-sm rotate-45 transform origin-center"></div>
            </div>
            <h1 className="text-xl font-bold">Admin</h1>
          </div>
          <div className="relative w-full max-w-md ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Avatar className="h-8 w-8 ml-4 md:hidden">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button className="gap-1" onClick={() => setShowAddUserDialog(true)}>
                  <UserPlus size={16} /> Add User
                </Button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="role-filter" className="whitespace-nowrap">
                    Role:
                  </Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger id="role-filter" className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter" className="whitespace-nowrap">
                    Status:
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter" className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download size={14} /> Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSearchQuery("")
                      setRoleFilter("all")
                      setStatusFilter("all")
                    }}
                  >
                    <RefreshCw size={14} /> Reset Filters
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-7 p-4 bg-slate-50 dark:bg-slate-900 border-b text-sm font-medium">
                      <div className="col-span-2">User</div>
                      <div>Role</div>
                      <div>Status</div>
                      <div>Created</div>
                      <div>Last Login</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="grid grid-cols-7 p-4 items-center">
                            <div className="col-span-2 flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex justify-end gap-2">
                              <Skeleton className="h-8 w-8 rounded-md" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          </div>
                        ))
                      ) : paginatedUsers.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <Users className="h-10 w-10 text-slate-400" />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold">No users found</h3>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Add a new user to get started"}
                          </p>
                          <Button className="mt-6" onClick={() => setShowAddUserDialog(true)}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                          </Button>
                        </div>
                      ) : (
                        paginatedUsers.map((user) => (
                          <div key={user.id} className="grid grid-cols-7 p-4 items-center">
                            <div className="col-span-2 flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                <AvatarFallback>
                                  {user.full_name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                              </div>
                            </div>
                            <div>
                              <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                              </Badge>
                            </div>
                            <div>
                              <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                                {user.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(user.created_at)}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(user.last_login)}
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditUserDialog(user)}
                                title="Edit User"
                              >
                                <Edit size={16} />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditUserDialog(user)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserCog className="mr-2 h-4 w-4" /> Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Resend Verification
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => openDeleteUserDialog(user)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
                {!isLoading && filteredUsers.length > 0 && (
                  <CardFooter className="flex justify-between border-t p-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Showing {paginatedUsers.length} of {filteredUsers.length} users
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

          {/* Roles Tab */}
          {activeTab === "roles" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Roles & Permissions</h1>

              <Tabs defaultValue="roles">
                <TabsList>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Roles</CardTitle>
                      <CardDescription>Manage the roles available in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-md border p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-red-500" /> Administrator
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">
                                Full access to all system features and settings
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              System
                            </Badge>
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold flex items-center">
                                <UserCog className="h-4 w-4 mr-2 text-blue-500" /> Manager
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">
                                Can manage employees, tasks, and view reports
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Default
                            </Badge>
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold flex items-center">
                                <Users className="h-4 w-4 mr-2 text-green-500" /> Employee
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">
                                Limited access to personal tasks and information
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Basic
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Permission Matrix</CardTitle>
                      <CardDescription>Configure what each role can access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900">
                              <th className="border px-4 py-2 text-left">Permission</th>
                              <th className="border px-4 py-2 text-center">Admin</th>
                              <th className="border px-4 py-2 text-center">Manager</th>
                              <th className="border px-4 py-2 text-center">Employee</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border px-4 py-2">View Dashboard</td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-4 py-2">Manage Users</td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-4 py-2">Manage Employees</td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-4 py-2">Create Tasks</td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-4 py-2">View Reports</td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              </td>
                            </tr>
                            <tr>
                              <td className="border px-4 py-2">System Settings</td>
                              <td className="border px-4 py-2 text-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              </td>
                              <td className="border px-4 py-2 text-center">
                                <X className="h-4 w-4 text-red-500 mx-auto" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Security Settings</h1>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Password Policy</CardTitle>
                    <CardDescription>Configure password requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="min-length">Minimum Length</Label>
                      <div className="flex items-center">
                        <Input id="min-length" type="number" className="w-16 text-center" defaultValue="8" />
                        <span className="ml-2 text-sm text-slate-500">characters</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Require Uppercase</Label>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Require Numbers</Label>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Require Special Characters</Label>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="expiry">Password Expiry</Label>
                      <div className="flex items-center">
                        <Input id="expiry" type="number" className="w-16 text-center" defaultValue="90" />
                        <span className="ml-2 text-sm text-slate-500">days</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Login Security</CardTitle>
                    <CardDescription>Configure login and session settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Two-Factor Authentication</Label>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-attempts">Max Login Attempts</Label>
                      <Input id="max-attempts" type="number" className="w-16 text-center" defaultValue="5" />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="lockout">Lockout Duration</Label>
                      <div className="flex items-center">
                        <Input id="lockout" type="number" className="w-16 text-center" defaultValue="30" />
                        <span className="ml-2 text-sm text-slate-500">minutes</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="session">Session Timeout</Label>
                      <div className="flex items-center">
                        <Input id="session" type="number" className="w-16 text-center" defaultValue="60" />
                        <span className="ml-2 text-sm text-slate-500">minutes</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Remember Me Functionality</Label>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Security Audit Log</CardTitle>
                  <CardDescription>Recent security events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 border-b">
                      <div>
                        <p className="font-medium">User Login</p>
                        <p className="text-sm text-slate-500">User johnariphiosd@gmail.com logged in successfully</p>
                      </div>
                      <div className="text-sm text-slate-500">Today, 10:23 AM</div>
                    </div>

                    <div className="flex items-center justify-between p-2 border-b">
                      <div>
                        <p className="font-medium">Password Changed</p>
                        <p className="text-sm text-slate-500">Admin changed their password</p>
                      </div>
                      <div className="text-sm text-slate-500">Yesterday, 3:45 PM</div>
                    </div>

                    <div className="flex items-center justify-between p-2 border-b">
                      <div>
                        <p className="font-medium">Failed Login Attempt</p>
                        <p className="text-sm text-slate-500">
                          Multiple failed login attempts for user alex.j@example.com
                        </p>
                      </div>
                      <div className="text-sm text-slate-500">Sep 10, 2023, 8:12 AM</div>
                    </div>

                    <div className="flex items-center justify-between p-2 border-b">
                      <div>
                        <p className="font-medium">User Created</p>
                        <p className="text-sm text-slate-500">New user maria.g@example.com was created</p>
                      </div>
                      <div className="text-sm text-slate-500">Sep 8, 2023, 11:30 AM</div>
                    </div>

                    <div className="flex items-center justify-between p-2">
                      <div>
                        <p className="font-medium">Role Changed</p>
                        <p className="text-sm text-slate-500">
                          User james.w@example.com role changed from Employee to Manager
                        </p>
                      </div>
                      <div className="text-sm text-slate-500">Sep 5, 2023, 2:15 PM</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">View Full Audit Log</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive a verification email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={newUser.firstName}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={newUser.lastName}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  required
                />
                <p className="text-xs text-slate-500">
                  Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  name="role"
                  value={newUser.role}
                  onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Company name"
                  value={newUser.company}
                  onChange={handleNewUserChange}
                />
                <p className="text-xs text-slate-500">Leave blank to use default company.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and settings.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={editUser.fullName}
                  onChange={handleEditUserChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editUser.email}
                  onChange={handleEditUserChange}
                  disabled
                />
                <p className="text-xs text-slate-500">
                  Email cannot be changed. User must re-register with a new email.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={editUser.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editUser.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center gap-3 p-4 border rounded-md bg-red-50">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>
                    {selectedUser.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser.full_name}</div>
                  <div className="text-sm text-slate-500">{selectedUser.email}</div>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-500">
                This will permanently delete the user account, including all associated data.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteUserDialog(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
