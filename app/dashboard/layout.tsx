"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { DashboardProvider, useDashboard } from "./DashboardContext"
import { 
  LayoutDashboard, 
  Store, 
  Menu as HamburgerIcon, 
  ShoppingBag, 
  Users, 
  Wallet, 
  Ticket, 
  Settings as SettingsIcon, 
  UserCheck, 
  Bell, 
  LogOut, 
  ChevronRight, 
  ShieldCheck
} from "lucide-react"

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { orders, outlets, notifications } = useDashboard()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("nirago_user_role") || "Owner"
      const name = localStorage.getItem("nirago_user_name") || "Master Admin"
      setUserRole(role)
      setUserName(name)
    }
  }, [])

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  // Authentication check
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("nirago_admin_logged_in")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("nirago_admin_logged_in")
    localStorage.removeItem("nirago_user_role")
    localStorage.removeItem("nirago_user_name")
    router.push("/login")
  }

  // Map active route name for top header breadcrumbs
  const getActiveTabName = () => {
    if (pathname === "/dashboard") return "overview"
    return pathname.replace("/dashboard/", "")
  }

  const activeTab = getActiveTabName()

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, path: "/dashboard" },
    { id: "orders", label: "Orders Engine", icon: ShoppingBag, path: "/dashboard/orders", badge: orders.filter(o => o.status === "PLACED" || o.status === "PREPARING").length },
    { id: "menu", label: "Menu Management", icon: HamburgerIcon, path: "/dashboard/menu" },
    { id: "outlets", label: "Outlet Network", icon: Store, path: "/dashboard/outlets", badge: outlets.length },
    { id: "customers", label: "Customer List", icon: Users, path: "/dashboard/customers" },
    { id: "wallets", label: "Wallet & Plans", icon: Wallet, path: "/dashboard/wallets" },
    { id: "coupons", label: "Discount Coupons", icon: Ticket, path: "/dashboard/coupons" },
    { id: "staff", label: "Delivery Staff", icon: UserCheck, path: "/dashboard/staff" },
    { id: "users", label: "Admin Team Control", icon: ShieldCheck, path: "/dashboard/users" },
    { id: "rules", label: "Global Configurations", icon: SettingsIcon, path: "/dashboard/rules" },
  ]

  const [rolePermissions, setRolePermissions] = useState<{ [role: string]: string[] }>({
    "Owner": ["overview", "orders", "menu", "outlets", "customers", "wallets", "coupons", "staff", "users", "rules"],
    "Admin": ["overview", "orders", "menu", "outlets", "customers", "wallets", "coupons", "staff", "users"],
    "Manager": ["overview", "orders", "menu", "outlets", "customers", "coupons", "staff"],
    "Kitchen Staff": ["orders"],
    "Delivery Staff": ["overview", "orders"],
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPerms = localStorage.getItem("nirago_role_permissions")
      if (savedPerms) {
        try {
          const parsed = JSON.parse(savedPerms)
          if (parsed["Delivery Staff"] && !parsed["Delivery Staff"].includes("overview")) {
            parsed["Delivery Staff"] = ["overview", ...parsed["Delivery Staff"]]
            localStorage.setItem("nirago_role_permissions", JSON.stringify(parsed))
          }
          setRolePermissions(parsed)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [pathname])

  useEffect(() => {
    if (typeof window !== "undefined" && userRole) {
      const currentTab = getActiveTabName()
      const savedPerms = localStorage.getItem("nirago_role_permissions")
      let perms = rolePermissions
      if (savedPerms) {
        try {
          perms = JSON.parse(savedPerms)
        } catch (e) {
          console.error(e)
        }
      }
      
      const allowed = perms[userRole] || []
      // Don't block Owner (absolute bypass), and only block sub-pages if not allowed
      if (userRole !== "Owner" && currentTab !== "overview" && currentTab !== "" && !allowed.includes(currentTab)) {
        const fallback = allowed[0] ? `/dashboard/${allowed[0]}` : "/dashboard"
        router.push(fallback)
      }
    }
  }, [pathname, userRole])

  const allowedItems = rolePermissions[userRole] || []

  const filteredNavItems = navItems.filter(item => {
    if (userRole === "Owner") return true
    if (item.id === "overview") return true
    return allowedItems.includes(item.id)
  }).map(item => {
    if (userRole === "Delivery Staff" && item.id === "orders") {
      return { 
        ...item, 
        label: "My Deliveries",
        badge: orders.filter(o => o.deliveryStaff === userName && o.status === "OUT_FOR_DELIVERY").length
      }
    }
    return item
  })

  const renderSidebar = (onItemClick?: () => void) => (
    <div className="flex flex-col justify-between h-full bg-[#f5f5e6]">
      <div>
        {/* Logo & Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#d2d2c4] gap-3 bg-[#e6e6d8]/30">
          <div className="h-9 w-9 bg-[#556B2F] rounded-lg flex items-center justify-center text-[#FFFFF0] font-bold text-lg shadow-sm">
            N
          </div>
          <div>
            <h1 className="font-bold text-[#556B2F] tracking-tight leading-none text-base">NIRAGO</h1>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              {userRole === "Delivery Staff" ? "Rider Portal" : "Control Panel"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar">
          {filteredNavItems.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.path
            return (
              <Link
                key={`tab-${tab.id}`}
                href={tab.path}
                onClick={onItemClick}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  isActive 
                    ? "bg-[#556B2F] text-[#FFFFF0] shadow-sm" 
                    : "text-[#2d3822]/80 hover:bg-[#e6e6d8] hover:text-[#556B2F]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#FFFFF0]" : "text-[#556B2F]")} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs font-bold rounded-full",
                    isActive ? "bg-[#FFFFF0] text-[#556B2F]" : "bg-[#556B2F] text-[#FFFFF0]"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#d2d2c4] bg-[#e6e6d8]/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-[#556B2F]/20">
            <AvatarFallback className="bg-[#556B2F] text-[#FFFFF0] font-bold text-xs">
              {userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-none truncate text-[#2d3822]">{userName}</p>
            <span className="text-[10px] text-neutral-500 truncate block">{userRole}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-neutral-500 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-[#FFFFF0] text-[#2d3822] font-sans overflow-hidden">
      
      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className={cn(
        "hidden md:flex bg-[#f5f5e6] border-r border-[#d2d2c4] flex-col justify-between shrink-0 shadow-sm transition-all duration-300",
        isSidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"
      )}>
        {renderSidebar()}
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#d2d2c4] bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6] h-8.5 w-8.5">
                  <HamburgerIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-[#f5f5e6] border-r border-[#d2d2c4] h-full" showCloseButton={false}>
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Nirago Admin control panel routing options</SheetDescription>
                </SheetHeader>
                {renderSidebar(() => setIsMobileOpen(false))}
              </SheetContent>
            </Sheet>

            {/* Desktop Sidebar Toggle Button */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6] h-8.5 w-8.5 items-center justify-center cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <HamburgerIcon className="h-5 w-5" />
            </Button>

            <span className="text-[10px] md:text-xs font-semibold text-neutral-400">NIRAGO CONTROL</span>
            <ChevronRight className="h-3 w-3 text-neutral-400" />
            <span className="text-[10px] md:text-xs font-semibold text-[#556B2F] uppercase tracking-wider">{activeTab}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 bg-[#f5f5e6] px-2 md:px-2.5 py-1 rounded-md border border-[#d2d2c4] text-[10px] md:text-xs font-semibold text-[#556B2F]">
              <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse mr-0.5 md:mr-1" />
              <span className="hidden sm:inline">Outlet Brand Active</span>
              <span className="sm:hidden">Active</span>
            </div>

            <Link href="/dashboard/notifications" passHref>
              <Button variant="outline" size="icon" className="h-8 md:h-8.5 w-8 md:w-8.5 relative border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6]" title="Notifications">
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none shadow-sm">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Dynamic Pages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FFFFF0]">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
