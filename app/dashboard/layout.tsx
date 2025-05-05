"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Activity,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
  X,
  FlaskRoundIcon as Flask,
  Pill,
  CreditCard,
  BarChart4,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { signOut } from "../actions/auth"
import { ErrorBoundary } from "@/components/error-boundary"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isMobile = useMobile()
  const [role, setRole] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/")
          return
        }

        // Get role from user metadata
        const userRole = user.user_metadata?.role

        if (userRole) {
          setRole(userRole)
        } else {
          // If no role in metadata, check the users table
          const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

          if (userData?.role) {
            setRole(userData.role)
          } else {
            // No role found, redirect to login
            router.push("/")
            return
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/")
        return
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      roles: ["doctor", "nurse", "lab", "pharmacist", "admin", "reception", "cashier"],
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: <Users className="h-5 w-5" />,
      roles: ["doctor", "nurse", "reception", "admin"],
    },
    {
      title: "Appointments",
      href: "/dashboard/appointments",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["doctor", "reception", "admin"],
    },
    {
      title: "Medical Records",
      href: "/dashboard/medical-records",
      icon: <FileText className="h-5 w-5" />,
      roles: ["doctor", "nurse", "admin"],
    },
    {
      title: "Lab Tests",
      href: "/dashboard/lab-tests",
      icon: <Flask className="h-5 w-5" />,
      roles: ["doctor", "lab", "admin"],
    },
    {
      title: "Prescriptions",
      href: "/dashboard/prescriptions",
      icon: <ClipboardList className="h-5 w-5" />,
      roles: ["doctor", "pharmacist", "admin"],
    },
    {
      title: "Pharmacy",
      href: "/dashboard/pharmacy",
      icon: <Pill className="h-5 w-5" />,
      roles: ["pharmacist", "admin"],
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: <CreditCard className="h-5 w-5" />,
      roles: ["reception", "cashier", "admin"],
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: <Package className="h-5 w-5" />,
      roles: ["pharmacist", "admin"],
    },
    {
      title: "User Management",
      href: "/dashboard/users",
      icon: <UserPlus className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: <BarChart4 className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Activity Log",
      href: "/dashboard/activity",
      icon: <Activity className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
    },
  ]

  // Filter nav items based on user role
  const filteredNavItems = role ? navItems.filter((item) => item.roles.includes(role)) : []

  const getRoleName = (role: string | null): string => {
    switch (role) {
      case "doctor":
        return "Doctor"
      case "nurse":
        return "Nurse"
      case "lab":
        return "Lab Technician"
      case "pharmacist":
        return "Pharmacist"
      case "admin":
        return "Administrator"
      case "reception":
        return "Receptionist"
      case "cashier":
        return "Cashier"
      default:
        return "User"
    }
  }

  const getInitials = (role: string | null): string => {
    return role ? getRoleName(role).substring(0, 2).toUpperCase() : "US"
  }

  const handleLogout = async () => {
    await signOut()
  }

  const SidebarContent = () => {
    return (
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
            {filteredNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-purple-900 hover:bg-purple-50",
                  item.href === window.location.pathname ? "bg-purple-50 text-purple-900" : "",
                )}
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
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-purple-600 h-12 w-12"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar for desktop */}
        {!isMobile && (
          <aside className="w-64 border-r bg-white">
            <Suspense fallback={<div>Loading...</div>}>
              <SidebarContent />
            </Suspense>
          </aside>
        )}

        {/* Mobile sidebar with sheet */}
        {isMobile && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute left-4 top-3 z-50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Suspense fallback={<div>Loading...</div>}>
                <SidebarContent />
              </Suspense>
            </SheetContent>
          </Sheet>
        )}

        {/* Main content */}
        <main className="flex-1">
          <div className="flex h-14 items-center border-b bg-white px-4">
            {isMobile && <div className="w-10" />} {/* Spacer for mobile menu button */}
            <div className="ml-4 text-lg font-medium">{getRoleName(role)} Dashboard</div>
          </div>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
