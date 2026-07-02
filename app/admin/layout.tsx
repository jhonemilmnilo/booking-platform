import * as React from "react"
import AdminSidebar from "./_components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0b0c10] flex">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
