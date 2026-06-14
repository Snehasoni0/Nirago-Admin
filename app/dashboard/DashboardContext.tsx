"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"

// Types based on the API Contract
export interface Outlet {
  id: string
  name: string
  address: string
  status: "ACTIVE" | "INACTIVE"
  contact: string
}

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  status: "ACTIVE" | "INACTIVE"
  description: string
}

export interface Order {
  id: string
  customerName: string
  items: string
  total: number
  paymentMethod: "CASH" | "CARD" | "UPI"
  status: "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REJECTED"
  estimatedMinutes?: number
  deliveryStaff?: string
  outlet: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  walletBalance: number
  membership: "NONE" | "SILVER" | "GOLD" | "PREMIUM"
  status: "ACTIVE" | "BLOCKED"
}

export interface DeliveryStaff {
  id: string
  name: string
  phone: string
  status: "ACTIVE" | "INACTIVE"
}

export interface Coupon {
  id: string
  code: string
  discount: string
  minOrder: number
  status: "ACTIVE" | "INACTIVE"
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  password?: string
  role: "Owner" | "Admin" | "Manager" | "Kitchen Staff" | "Delivery Staff"
  status: "ACTIVE" | "INACTIVE"
}

export interface GlobalRules {
  gst: number
  packagingCharge: number
  deliveryChargeBase: number
  storeTimings: string
  cashOnDelivery: boolean
  maintenanceMode: boolean
}

export interface SystemNotification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: 'order' | 'system' | 'wallet' | 'outlet'
}

interface DashboardContextType {
  outlets: Outlet[]
  setOutlets: React.Dispatch<React.SetStateAction<Outlet[]>>
  menuItems: MenuItem[]
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>
  categories: { id: string; name: string; status: string; icon: string }[]
  setCategories: React.Dispatch<React.SetStateAction<{ id: string; name: string; status: string; icon: string }[]>>
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  customers: Customer[]
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>
  deliveryStaff: DeliveryStaff[]
  setDeliveryStaff: React.Dispatch<React.SetStateAction<DeliveryStaff[]>>
  coupons: Coupon[]
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>
  auditLogs: AuditLog[]
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>
  adminUsers: AdminUser[]
  setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>
  globalRules: GlobalRules
  setGlobalRules: React.Dispatch<React.SetStateAction<GlobalRules>>
  notifications: SystemNotification[]
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>
  addLog: (action: string, details: string) => void
  handleAddOutlet: (name: string, address: string, contact?: string) => boolean
  handleAddMenuItem: (name: string, category: string, price: number, description?: string) => void
  handleAddCoupon: (code: string, discount: string, minOrder: number) => void
  handleAddAdminUser: (name: string, email: string, password?: string, role?: AdminUser["role"]) => void
  toggleOutletStatus: (id: string) => void
  toggleMenuItemStatus: (id: string) => void
  toggleCouponStatus: (id: string) => void
  toggleCustomerStatus: (id: string) => void
  updateOrderStatus: (orderId: string, nextStatus: Order["status"]) => void
  assignStaffToOrder: (orderId: string, staffName: string) => void
  setOrderEstTime: (orderId: string, minutes: number) => void
  handleWalletTransaction: (customerId: string, amount: number, type: "CREDIT" | "DEBIT") => void
  updateGlobalSettings: (field: keyof GlobalRules, value: any) => void
  handleDeleteStaffUser: (id: string) => void
  handleUpdateStaffRole: (id: string, newRole: AdminUser["role"]) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  deleteNotification: (id: string) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [outlets, setOutlets] = useState<Outlet[]>([
    { id: "1", name: "Nirago Elite (Connaught Place)", address: "Block A, CP, New Delhi", status: "ACTIVE", contact: "+91 98765 43210" },
    { id: "2", name: "Nirago Express (GK-2)", address: "M-Block Market, Greater Kailash 2, New Delhi", status: "ACTIVE", contact: "+91 98765 43211" },
    { id: "3", name: "Nirago Bistro (DLF Phase 3)", address: "Cyber Hub, Sector 24, Gurugram", status: "ACTIVE", contact: "+91 98765 43212" },
  ])

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: "1", name: "Truffle Mushroom Risotto", category: "Main Course", price: 549, status: "ACTIVE", description: "Creamy arborio rice with rich black truffle paste and wild forest mushrooms." },
    { id: "2", name: "Avocado Sourdough Toast", category: "Appetizers", price: 349, status: "ACTIVE", description: "Freshly smashed Hass avocados on wood-fired sourdough with cherry tomatoes." },
    { id: "3", name: "Pistachio Rose Latte", category: "Drinks", price: 249, status: "ACTIVE", description: "Double espresso with textured milk, floral rose extract, and ground pistachios." },
    { id: "4", name: "Saffron Tres Leches", category: "Desserts", price: 399, status: "ACTIVE", description: "Soft sponge cake soaked in saffron-infused triple milk blend." },
  ])

  const [categories, setCategories] = useState([
    { id: "1", name: "Appetizers", status: "ACTIVE", icon: "🌮" },
    { id: "2", name: "Main Course", status: "ACTIVE", icon: "🍝" },
    { id: "3", name: "Drinks", status: "ACTIVE", icon: "☕" },
    { id: "4", name: "Desserts", status: "ACTIVE", icon: "🍰" },
  ])

  const [orders, setOrders] = useState<Order[]>([
    { id: "#1024", customerName: "Rahul Sharma", items: "1x Truffle Mushroom Risotto, 1x Pistachio Latte", total: 798, paymentMethod: "UPI", status: "PLACED", outlet: "Nirago Elite (Connaught Place)" },
    { id: "#1023", customerName: "Priya Patel", items: "2x Avocado Sourdough Toast", total: 698, paymentMethod: "CARD", status: "PREPARING", estimatedMinutes: 20, outlet: "Nirago Express (GK-2)" },
    { id: "#1022", customerName: "Vikram Singh", items: "1x Saffron Tres Leches", total: 399, paymentMethod: "CASH", status: "DELIVERED", outlet: "Nirago Bistro (DLF Phase 3)" },
    { id: "#1021", customerName: "Sneha Reddy", items: "1x Truffle Mushroom Risotto", total: 549, paymentMethod: "UPI", status: "OUT_FOR_DELIVERY", deliveryStaff: "Amit Kumar", outlet: "Nirago Elite (Connaught Place)" },
  ])

  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Aarav Mehta", email: "aarav@gmail.com", phone: "+91 99887 76655", walletBalance: 1250, membership: "PREMIUM", status: "ACTIVE" },
    { id: "2", name: "Ananya Sen", email: "ananya.sen@outlook.com", phone: "+91 98989 89898", walletBalance: 450, membership: "GOLD", status: "ACTIVE" },
    { id: "3", name: "Karan Johar", email: "karan@dharmaprod.com", phone: "+91 90000 11111", walletBalance: 0, membership: "NONE", status: "BLOCKED" },
    { id: "4", name: "Diya Malik", email: "diya@yahoo.com", phone: "+91 97777 88888", walletBalance: 3200, membership: "SILVER", status: "ACTIVE" },
  ])

  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>([
    { id: "1", name: "Amit Kumar", phone: "+91 91111 22222", status: "ACTIVE" },
    { id: "2", name: "Rajesh Yadav", phone: "+91 93333 44444", status: "ACTIVE" },
    { id: "3", name: "Suresh Pal", phone: "+91 95555 66666", status: "INACTIVE" },
  ])

  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: "1", code: "NIRAGO50", discount: "50% OFF up to ₹150", minOrder: 300, status: "ACTIVE" },
    { id: "2", code: "WELCOME100", discount: "Flat ₹100 OFF", minOrder: 500, status: "ACTIVE" },
    { id: "3", code: "LUNCHSPECIAL", discount: "15% OFF", minOrder: 250, status: "INACTIVE" },
  ])

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "1", timestamp: "2026-06-13 13:02:11", user: "admin@nirago.com", action: "Settings Change", details: "GST tax rate updated from 5% to 18%" },
    { id: "2", timestamp: "2026-06-13 12:45:00", user: "admin@nirago.com", action: "Order Update", details: "Order #1021 status marked as OUT_FOR_DELIVERY" },
    { id: "3", timestamp: "2026-06-13 11:30:15", user: "admin@nirago.com", action: "Customer Blocked", details: "Customer Karan Johar blocked due to payment failure history" },
  ])

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    { id: "1", name: "Siddharth Goel", email: "siddharth@nirago.com", password: "Password123", role: "Owner", status: "ACTIVE" },
    { id: "2", name: "Rohan Khanna", email: "rohan@nirago.com", password: "Password123", role: "Manager", status: "ACTIVE" },
    { id: "3", name: "Chef Vikas", email: "vikas@nirago.com", password: "Password123", role: "Kitchen Staff", status: "ACTIVE" },
    { id: "4", name: "Amit Kumar", email: "amit@nirago.com", password: "Password123", role: "Delivery Staff", status: "ACTIVE" },
  ])

  const [globalRules, setGlobalRules] = useState<GlobalRules>({
    gst: 5,
    packagingCharge: 30,
    deliveryChargeBase: 40,
    storeTimings: "09:00 AM - 11:00 PM",
    cashOnDelivery: true,
    maintenanceMode: false,
  })

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "1",
      title: "New Order Placed",
      description: "Order #1024 has been placed by Rahul Sharma (totaling ₹798). Needs acceptance.",
      timestamp: "2026-06-13 13:05:00",
      read: false,
      type: "order",
    },
    {
      id: "2",
      title: "Global GST Config Updated",
      description: "GST tax rate updated from 5% to 18% by admin@nirago.com.",
      timestamp: "2026-06-13 13:02:11",
      read: true,
      type: "system",
    },
    {
      id: "3",
      title: "Wallet Adjustment",
      description: "Manually credited ₹1250 to Aarav Mehta's wallet.",
      timestamp: "2026-06-13 12:48:00",
      read: false,
      type: "wallet",
    },
    {
      id: "4",
      title: "New Outlet Added",
      description: "Nirago Bistro (DLF Phase 3) was registered in the outlet network.",
      timestamp: "2026-06-13 11:15:00",
      read: true,
      type: "outlet",
    },
  ])

  // Add Log Helper
  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: "admin@nirago.com",
      action,
      details
    }
    setAuditLogs(prev => [newLog, ...prev])
  }

  // Handle Outlet Add
  const handleAddOutlet = (name: string, address: string, contact?: string): boolean => {
    if (outlets.length >= 9) {
      return false
    }
    const added: Outlet = {
      id: (outlets.length + 1).toString(),
      name,
      address,
      contact: contact || "+91 99999 99999",
      status: "ACTIVE"
    }
    setOutlets(prev => [...prev, added])
    addLog("Outlet Added", `Created new outlet: ${name}`)
    return true
  }

  // Handle Menu Item Add
  const handleAddMenuItem = (name: string, category: string, price: number, description?: string) => {
    const added: MenuItem = {
      id: (menuItems.length + 1).toString(),
      name,
      category,
      price,
      status: "ACTIVE",
      description: description || "Freshly cooked gourmet specialty."
    }
    setMenuItems(prev => [...prev, added])
    addLog("Menu Item Added", `Created new menu listing: ${name} (₹${price})`)
  }

  // Handle Coupon Add
  const handleAddCoupon = (code: string, discount: string, minOrder: number) => {
    const added: Coupon = {
      id: (coupons.length + 1).toString(),
      code: code.toUpperCase(),
      discount,
      minOrder,
      status: "ACTIVE"
    }
    setCoupons(prev => [...prev, added])
    addLog("Coupon Added", `Created promotional coupon code: ${code}`)
  }

  // Handle Add Admin User
  const handleAddAdminUser = (name: string, email: string, password?: string, role?: AdminUser["role"]) => {
    const added: AdminUser = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      password: password || "Password123",
      role: role || "Manager",
      status: "ACTIVE"
    }
    setAdminUsers(prev => [...prev, added])
    addLog("Staff Registered", `Registered new staff member: ${name} as ${role || "Manager"} with custom credentials.`)
  }

  // Toggle statuses
  const toggleOutletStatus = (id: string) => {
    setOutlets(prev => prev.map(o => {
      if (o.id === id) {
        const nextStatus = o.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        addLog("Outlet Status Toggled", `${o.name} set to ${nextStatus}`)
        return { ...o, status: nextStatus }
      }
      return o
    }))
  }

  const toggleMenuItemStatus = (id: string) => {
    setMenuItems(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        addLog("Menu Item Status Toggled", `${m.name} set to ${nextStatus}`)
        return { ...m, status: nextStatus }
      }
      return m
    }))
  }

  const toggleCouponStatus = (id: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        addLog("Coupon Status Toggled", `Coupon ${c.code} set to ${nextStatus}`)
        return { ...c, status: nextStatus }
      }
      return c
    }))
  }

  const toggleCustomerStatus = (id: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"
        addLog("Customer Account Status Changed", `Account of ${c.name} was ${nextStatus === "BLOCKED" ? "Blocked/Suspended" : "Re-activated"}`)
        return { ...c, status: nextStatus }
      }
      return c
    }))
  }

  // Update order status
  const updateOrderStatus = (orderId: string, nextStatus: Order["status"]) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        addLog("Order Status Updated", `Order ${orderId} progressed to ${nextStatus}`)
        return { ...o, status: nextStatus }
      }
      return o
    }))
  }

  // Assign delivery personnel
  const assignStaffToOrder = (orderId: string, staffName: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        addLog("Delivery Rider Assigned", `Rider ${staffName} manually assigned to Order ${orderId}`)
        return { ...o, deliveryStaff: staffName }
      }
      return o
    }))
  }

  // Set Estimated delivery time
  const setOrderEstTime = (orderId: string, minutes: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        addLog("Estimated Delivery Time Set", `Order ${orderId} estimated at ${minutes} minutes`)
        return { ...o, estimatedMinutes: minutes }
      }
      return o
    }))
  }

  // Wallet manual credit/debit
  const handleWalletTransaction = (customerId: string, amount: number, type: "CREDIT" | "DEBIT") => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const finalBal = type === "CREDIT" ? c.walletBalance + amount : c.walletBalance - amount
        addLog("Wallet Adjustments", `Manually ${type}ED ₹${amount} to/from ${c.name}'s wallet. New balance: ₹${finalBal}`)
        return { ...c, walletBalance: finalBal }
      }
      return c
    }))
  }

  // Global settings update
  const updateGlobalSettings = (field: keyof GlobalRules, value: any) => {
    setGlobalRules(prev => {
      addLog("Global Config Update", `Field [${field.toUpperCase()}] updated to ${value}`)
      return { ...prev, [field]: value }
    })
  }

  // Staff roles removal
  const handleDeleteStaffUser = (id: string) => {
    const userToDelete = adminUsers.find(u => u.id === id)
    if (userToDelete) {
      setAdminUsers(prev => prev.filter(u => u.id !== id))
      addLog("Staff Suspended/Removed", `Removed ${userToDelete.name} from staff list`)
    }
  }

  const handleUpdateStaffRole = (id: string, newRole: AdminUser["role"]) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === id) {
        addLog("Staff Role Updated", `Updated ${u.name}'s role to ${newRole}`)
        return { ...u, role: newRole }
      }
      return u
    }))
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <DashboardContext.Provider
      value={{
        outlets,
        setOutlets,
        menuItems,
        setMenuItems,
        categories,
        setCategories,
        orders,
        setOrders,
        customers,
        setCustomers,
        deliveryStaff,
        setDeliveryStaff,
        coupons,
        setCoupons,
        auditLogs,
        setAuditLogs,
        adminUsers,
        setAdminUsers,
        globalRules,
        setGlobalRules,
        notifications,
        setNotifications,
        addLog,
        handleAddOutlet,
        handleAddMenuItem,
        handleAddCoupon,
        handleAddAdminUser,
        toggleOutletStatus,
        toggleMenuItemStatus,
        toggleCouponStatus,
        toggleCustomerStatus,
        updateOrderStatus,
        assignStaffToOrder,
        setOrderEstTime,
        handleWalletTransaction,
        updateGlobalSettings,
        handleDeleteStaffUser,
        handleUpdateStaffRole,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
