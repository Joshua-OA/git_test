"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Activity, Calendar, ClipboardList, FileText, Home, LogOut, Menu, Package,
  Settings, Users, X, FlaskRoundIcon as Flask, Pill, CreditCard, BarChart4, UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useMobile()

  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const paramRole = searchParams.get("role")
    if (paramRole) {
      localStorage.setItem("user_role", paramRole)
      setRole(paramRole)
      setIsLoading(false)
    } else {
      const stored = localStorage.getItem("user_role")
      if (stored) {
        setRole(stored)
        setIsLoading(false)
      } else {
        router.push("/")
      }
    }
  }, [searchParams, router])

  const navItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5" />, roles: ["doctor", "nurse", "lab", "pharmacist", "admin", "reception", "cashier"] },
    { title: "Patients", href: "/dashboard/patients", icon: <Users className="h-5 w-5" />, roles: ["doctor", "nurse", "reception", "admin"] },
    { title: "Appointments", href: "/dashboard/appointments", icon: <Calendar className="h-5 w-5" />, roles: ["doctor", "reception", "admin"] },
    { title: "Medical Records", href: "/dashboard/medical-records", icon: <FileText className="h-5 w-5" />, roles: ["doctor", "nurse", "admin"] },
    { title: "Lab Tests", href: "/dashboard/lab-tests", icon: <Flask className="h-5 w-5" />, roles: ["doctor", "lab", "admin"] },
    { title: "Prescriptions", href: "/dashboard/prescriptions", icon: <ClipboardList className="h-5 w-5" />, roles: ["doctor", "pharmacist", "admin"] },
    { title: "Pharmacy", href: "/dashboard/pharmacy", icon: <Pill className="h-5 w-5" />, roles: ["pharmacist", "admin"] },
    { title: "Payments", href: "/dashboard/payments", icon: <CreditCard className="h-5 w-5" />, roles: ["reception", "cashier", "admin"] },
    { title: "Inventory", href: "/dashboard/inventory", icon: <Package className="h-5 w-5" />, roles: ["pharmacist", "admin"] },
    { title: "User Management", href: "/dashboard/users", icon: <UserPlus className="h-5 w-5" />, roles: ["admin"] },
    { title: "Reports", href: "/dashboard/reports", icon: <BarChart4 className="h-5 w-5" />, roles: ["admin"] },
    { title: "Activity Log", href: "/dashboard/activity", icon: <Activity className="h-5 w-5" />, roles: ["admin"] },
    { title: "Settings", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" />, roles: ["admin"] },
  ]

  const getRoleName = (role: string | null) => {
    switch (role) {
      case "doctor": return "Doctor"
      case "nurse": return "Nurse"
      case "lab": return "Lab Technician"
      case "pharmacist": return "Pharmacist"
      case "admin": return "Administrator"
      case "reception": return "Receptionist"
      case "cashier": return "Cashier"
      default: return "User"
    }
  }

  const getInitials = (role: string | null) => {
    return role ? getRoleName(role).substring(0, 2).toUpperCase() : "US"
  }

  const handleLogout = () => {
    localStorage.removeItem("user_role")
    router.push("/")
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/images/luxe-clinic-logo.png" alt="Luxe Clinic GH Logo" width={120} height={48} priority />
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.filter(item => role && item.roles.includes(role)).map((item, index) => (
            <Link
              key={index}
              href={`${item.href}?role=${role}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-purple-900 hover:bg-purple-50"
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt={getRoleName(role)} />
            <AvatarFallback className="bg-purple-100 text-purple-900">{getInitials(role)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{getRoleName(role)}</span>
            <span className="text-xs text-gray-500">Role-based access</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isMobile && (
        <aside className="w-64 border-r bg-white">
          <SidebarContent />
        </aside>
      )}

      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute left-4 top-3 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      <main className="flex-1">
        <div className="flex h-14 items-center border-b bg-white px-4">
          {isMobile && <div className="w-10" />}
          <div className="ml-4 text-lg font-medium">{getRoleName(role)} Dashboard</div>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
