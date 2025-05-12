"use client"

import { useState } from "react"
import { EmployeesSection } from "@/components/employees-section"
// Import other sections as needed

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("employees")

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar - Keep your existing sidebar code */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Keep your existing header code */}

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Render different sections based on activeSection */}
          {activeSection === "employees" && <EmployeesSection />}

          {/* Keep your other sections as they are */}
        </main>
      </div>
    </div>
  )
}
