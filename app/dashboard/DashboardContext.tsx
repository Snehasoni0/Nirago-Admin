"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Types based on the API Contract
export interface ModifierGroup {
  id: string
  name: string
  selectionType: "SINGLE" | "MULTIPLE"
  options: { name: string; price: number }[]
}

export interface Outlet {
  id: string
  name: string
  address: string
  status: "ACTIVE" | "INACTIVE"
  contact: string
  image?: string
  deliveryEnabled?: boolean
  deliveryCharge?: number
  minFreeDelivery?: number
  estimatedDeliveryTime?: string
  paymentStatus?: "ACTIVE" | "INACTIVE" | "PENDING"
  merchantId?: string
  transactionId?: string
  allowedPaymentMethods?: string[]
  overrideGst?: number
  overridePackagingCharge?: number
  overrideDeliveryFee?: number
  overrideStoreTimings?: string
  overrideCod?: boolean
  overrideMaintenance?: boolean
  overrideVat?: number
  overrideLocalLevies?: number
  overrideDeliveryPerKm?: number
  overrideUseDistancePricing?: boolean
}

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  status: "ACTIVE" | "INACTIVE"
  description: string
  image?: string
  modifierGroups?: ModifierGroup[]
}

export interface Order {
  id: string
  customerName: string
  customerPhone?: string
  customerAddress?: string
  items: string
  structuredItems?: {
    name: string
    price: number
    quantity: number
    addOns?: string[]
  }[]
  subtotal?: number
  gst?: number
  packagingCharge?: number
  deliveryCharge?: number
  discount?: number
  total: number
  paymentMethod: "CASH" | "CARD" | "UPI"
  paymentStatus?: "PAID" | "PENDING" | "FAILED"
  fulfillmentType?: "DELIVERY" | "PICKUP"
  status: "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REJECTED"
  estimatedMinutes?: number
  deliveryStaff?: string
  outlet: string
  specialInstructions?: string
  deliveryDate?: string
  transactionId?: string
  cancellationReason?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  walletBalance: number
  membership: string
  status: "ACTIVE" | "BLOCKED"
  createdDate?: string
  orderVolume?: number
  lifetimeValue?: number
  address?: string
}

export interface LoyaltyTier {
  id: string
  name: string
  discountPercent: number
  minDeposit: number
  status: "ACTIVE" | "INACTIVE"
}

export interface DeliveryStaff {
  id: string
  name: string
  phone: string
  status: "ACTIVE" | "INACTIVE"
  assignedOutlet?: string
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
  role: "Owner" | "Admin" | "Manager" | "Outlet Manager" | "Kitchen Staff" | "Delivery Staff"
  status: "ACTIVE" | "INACTIVE"
  assignedOutlet?: string
}

export interface GlobalRules {
  gst: number
  vat: number
  localLevies: number
  packagingCharge: number
  deliveryChargeBase: number
  deliveryPerKm: number
  useDistancePricing: boolean
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
  loyaltyTiers: LoyaltyTier[]
  setLoyaltyTiers: React.Dispatch<React.SetStateAction<LoyaltyTier[]>>
  addLog: (action: string, details: string) => void
  handleAddOutlet: (
    name: string,
    address: string,
    contact?: string,
    deliveryEnabled?: boolean,
    deliveryCharge?: number,
    minFreeDelivery?: number,
    estimatedDeliveryTime?: string,
    paymentStatus?: "ACTIVE" | "INACTIVE" | "PENDING",
    merchantId?: string,
    transactionId?: string,
    allowedPaymentMethods?: string[]
  ) => boolean
  updateOutlet: (id: string, updated: Partial<Outlet>) => void
  handleAddMenuItem: (name: string, category: string, price: number, description?: string, image?: string) => void
  handleAddCoupon: (code: string, discount: string, minOrder: number) => void
  handleAddAdminUser: (name: string, email: string, password?: string, role?: AdminUser["role"], assignedOutlet?: string) => void
  handleAddDeliveryStaff: (name: string, phone: string, email: string, password?: string, assignedOutlet?: string) => void
  toggleOutletStatus: (id: string) => void
  toggleMenuItemStatus: (id: string) => void
  toggleCouponStatus: (id: string) => void
  toggleCustomerStatus: (id: string) => void
  updateOrderStatus: (orderId: string, nextStatus: Order["status"], cancellationReason?: string) => void
  updateOrderPayment: (orderId: string, status: "PAID" | "PENDING" | "FAILED", transactionId?: string) => void
  assignStaffToOrder: (orderId: string, staffName: string) => void
  setOrderEstTime: (orderId: string, minutes: number) => void
  handleWalletTransaction: (customerId: string, amount: number, type: "CREDIT" | "DEBIT") => void
  updateGlobalSettings: (field: keyof GlobalRules, value: any) => void
  handleDeleteStaffUser: (id: string) => void
  handleUpdateStaffRole: (id: string, newRole: AdminUser["role"], assignedOutlet?: string) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  deleteNotification: (id: string) => void
  handleAddLoyaltyTier: (name: string, discountPercent: number, minDeposit: number) => void
  toggleLoyaltyTierStatus: (id: string) => void
  handleCustomerDeposit: (customerId: string, amount: number) => void
  handleAssignCustomerTier: (customerId: string, tierName: string) => void
  handleAddCategory: (name: string, icon: string) => void
  handleDeleteCategory: (id: string) => void
  handleToggleCategoryStatus: (id: string) => void
  handleUpdateItemModifiers: (itemId: string, groups: ModifierGroup[]) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [outlets, setOutlets] = useState<Outlet[]>([
    { 
      id: "1", 
      name: "Nirago Elite (Connaught Place)", 
      address: "Block A, CP, New Delhi", 
      status: "ACTIVE", 
      contact: "+91 98765 43210",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop",
      deliveryEnabled: true,
      deliveryCharge: 40,
      minFreeDelivery: 500,
      estimatedDeliveryTime: "30-45 mins",
      paymentStatus: "ACTIVE",
      merchantId: "MERCH_CP_101",
      transactionId: "TXN_CP_INIT_99",
      allowedPaymentMethods: ["CASH", "CARD", "UPI"]
    },
    { 
      id: "2", 
      name: "Nirago Express (GK-2)", 
      address: "M-Block Market, Greater Kailash 2, New Delhi", 
      status: "ACTIVE", 
      contact: "+91 98765 43211",
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop",
      deliveryEnabled: true,
      deliveryCharge: 50,
      minFreeDelivery: 600,
      estimatedDeliveryTime: "25-35 mins",
      paymentStatus: "ACTIVE",
      merchantId: "MERCH_GK_202",
      transactionId: "TXN_GK_INIT_88",
      allowedPaymentMethods: ["CARD", "UPI"]
    },
    { 
      id: "3", 
      name: "Nirago Bistro (DLF Phase 3)", 
      address: "Cyber Hub, Sector 24, Gurugram", 
      status: "ACTIVE", 
      contact: "+91 98765 43212",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop",
      deliveryEnabled: false,
      deliveryCharge: 30,
      minFreeDelivery: 400,
      estimatedDeliveryTime: "20-30 mins",
      paymentStatus: "PENDING",
      merchantId: "MERCH_DLF_303",
      transactionId: "TXN_DLF_INIT_77",
      allowedPaymentMethods: ["CASH", "UPI"]
    },
  ])

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: "1", name: "Truffle Mushroom Risotto", category: "Main Course", price: 549, status: "ACTIVE", description: "Creamy arborio rice with rich black truffle paste and wild forest mushrooms.", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&auto=format&fit=crop" },
    { id: "2", name: "Avocado Sourdough Toast", category: "Appetizers", price: 349, status: "ACTIVE", description: "Freshly smashed Hass avocados on wood-fired sourdough with cherry tomatoes.", image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop" },
    { id: "3", name: "Pistachio Rose Latte", category: "Drinks", price: 249, status: "ACTIVE", description: "Double espresso with textured milk, floral rose extract, and ground pistachios.", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop" },
    { id: "4", name: "Saffron Tres Leches", category: "Desserts", price: 399, status: "ACTIVE", description: "Soft sponge cake soaked in saffron-infused triple milk blend.", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop" },
  ])

  const [categories, setCategories] = useState([
    { id: "1", name: "Appetizers", status: "ACTIVE", icon: "🌮" },
    { id: "2", name: "Main Course", status: "ACTIVE", icon: "🍝" },
    { id: "3", name: "Drinks", status: "ACTIVE", icon: "☕" },
    { id: "4", name: "Desserts", status: "ACTIVE", icon: "🍰" },
  ])

  const [orders, setOrders] = useState<Order[]>([
    { 
      id: "#1024", 
      customerName: "Rahul Sharma", 
      customerPhone: "+91 98765 43210",
      customerAddress: "Flat 402, Block B, CP Heights, Connaught Place, New Delhi - 110001",
      items: "1x Truffle Mushroom Risotto, 1x Pistachio Latte", 
      structuredItems: [
        { name: "Truffle Mushroom Risotto", price: 549, quantity: 1, addOns: ["Extra Truffle Paste (+₹50)", "Shaved Parmesan (+₹30)"] },
        { name: "Pistachio Rose Latte", price: 249, quantity: 1, addOns: ["Almond Milk (+₹30)"] }
      ],
      subtotal: 798,
      gst: 40,
      packagingCharge: 30,
      deliveryCharge: 40,
      discount: 110,
      total: 798, 
      paymentMethod: "UPI", 
      paymentStatus: "PAID",
      fulfillmentType: "DELIVERY",
      status: "PLACED", 
      outlet: "Nirago Elite (Connaught Place)",
      specialInstructions: "Please make the risotto extra hot and deliver contactlessly at the front door.",
      transactionId: "TXN_UPI_987654"
    },
    { 
      id: "#1023", 
      customerName: "Priya Patel", 
      customerPhone: "+91 98989 89898",
      customerAddress: "M-12, Ground Floor, Greater Kailash 2, New Delhi - 11048",
      items: "2x Avocado Sourdough Toast", 
      structuredItems: [
        { name: "Avocado Sourdough Toast", price: 349, quantity: 2, addOns: ["Feta Cheese Crumbles (+₹40)", "Poached Egg (+₹50)"] }
      ],
      subtotal: 698,
      gst: 35,
      packagingCharge: 30,
      deliveryCharge: 0,
      discount: 65,
      total: 698, 
      paymentMethod: "CARD", 
      paymentStatus: "PAID",
      fulfillmentType: "PICKUP",
      status: "PREPARING", 
      estimatedMinutes: 20, 
      outlet: "Nirago Express (GK-2)",
      specialInstructions: "Wrap separately in eco-friendly boxes please.",
      transactionId: "TXN_CARD_543210"
    },
    { 
      id: "#1022", 
      customerName: "Vikram Singh", 
      customerPhone: "+91 95555 66666",
      customerAddress: "Office 104, Tower A, Cyber Hub, Sector 24, Gurugram - 122002",
      items: "1x Saffron Tres Leches", 
      structuredItems: [
        { name: "Saffron Tres Leches", price: 399, quantity: 1 }
      ],
      subtotal: 399,
      gst: 20,
      packagingCharge: 30,
      deliveryCharge: 40,
      discount: 90,
      total: 399, 
      paymentMethod: "CASH", 
      paymentStatus: "PENDING",
      fulfillmentType: "DELIVERY",
      status: "DELIVERED", 
      outlet: "Nirago Bistro (DLF Phase 3)",
      specialInstructions: "Call when you reach the gate.",
      transactionId: "TXN_CASH_908123"
    },
    { 
      id: "#1021", 
      customerName: "Sneha Reddy", 
      customerPhone: "+91 97777 88888",
      customerAddress: "C-45, First Floor, Connaught Place, New Delhi - 110001",
      items: "1x Truffle Mushroom Risotto", 
      structuredItems: [
        { name: "Truffle Mushroom Risotto", price: 549, quantity: 1 }
      ],
      subtotal: 549,
      gst: 27,
      packagingCharge: 30,
      deliveryCharge: 40,
      discount: 97,
      total: 549, 
      paymentMethod: "UPI", 
      paymentStatus: "PAID",
      fulfillmentType: "DELIVERY",
      status: "OUT_FOR_DELIVERY", 
      deliveryStaff: "Amit Kumar", 
      outlet: "Nirago Elite (Connaught Place)",
      transactionId: "TXN_UPI_123456"
    },
    { 
      id: "#1020", 
      customerName: "Vikram Singh", 
      customerPhone: "+91 95555 66666",
      customerAddress: "Office 104, Tower A, Cyber Hub, Sector 24, Gurugram - 122002",
      items: "1x Truffle Mushroom Risotto", 
      structuredItems: [
        { name: "Truffle Mushroom Risotto", price: 549, quantity: 1 }
      ],
      subtotal: 549,
      gst: 27,
      packagingCharge: 30,
      deliveryCharge: 40,
      discount: 0,
      total: 646, 
      paymentMethod: "UPI", 
      paymentStatus: "PAID",
      fulfillmentType: "DELIVERY",
      status: "READY", 
      deliveryStaff: "Ramesh Kumar", 
      outlet: "Nirago Bistro (DLF Phase 3)",
      specialInstructions: "Hurry up, I'm very hungry!",
      transactionId: "TXN_UPI_654321"
    },
    { 
      id: "#1019", 
      customerName: "Ananya Sen", 
      customerPhone: "+91 98989 89898",
      customerAddress: "M-12, Ground Floor, Greater Kailash 2, New Delhi - 110048",
      items: "1x Avocado Sourdough Toast", 
      structuredItems: [
        { name: "Avocado Sourdough Toast", price: 349, quantity: 1 }
      ],
      subtotal: 349,
      gst: 18,
      packagingCharge: 30,
      deliveryCharge: 0,
      discount: 0,
      total: 397, 
      paymentMethod: "CARD", 
      paymentStatus: "PAID",
      fulfillmentType: "DELIVERY",
      status: "OUT_FOR_DELIVERY", 
      deliveryStaff: "Ramesh Kumar", 
      outlet: "Nirago Express (GK-2)",
      transactionId: "TXN_CARD_789012"
    },
    { 
      id: "#1018", 
      customerName: "Aditya Roy", 
      customerPhone: "+91 96666 77777",
      customerAddress: "Flat 704, Royal Apartments, Connaught Place, New Delhi - 110001",
      items: "1x Truffle Mushroom Risotto, 1x Saffron Tres Leches", 
      structuredItems: [
        { name: "Truffle Mushroom Risotto", price: 549, quantity: 1 },
        { name: "Saffron Tres Leches", price: 399, quantity: 1 }
      ],
      subtotal: 948,
      gst: 47,
      packagingCharge: 30,
      deliveryCharge: 40,
      discount: 0,
      total: 1065, 
      paymentMethod: "UPI", 
      paymentStatus: "PAID",
      fulfillmentType: "DELIVERY",
      status: "READY", 
      deliveryStaff: "Ramesh Kumar", 
      outlet: "Nirago Elite (Connaught Place)",
      specialInstructions: "Leave with security if not answering.",
      transactionId: "TXN_UPI_210987"
    },
    {
      id: "#1017",
      customerName: "Sneha Reddy",
      customerPhone: "+91 97777 88888",
      customerAddress: "C-45, First Floor, Connaught Place, New Delhi - 110001",
      items: "1x Truffle Mushroom Risotto",
      structuredItems: [
        { name: "Truffle Mushroom Risotto", price: 549, quantity: 1 }
      ],
      subtotal: 549,
      gst: 27,
      packagingCharge: 30,
      deliveryCharge: 40,
      discount: 97,
      total: 549,
      paymentMethod: "UPI",
      paymentStatus: "PAID",
      fulfillmentType: "DELIVERY",
      status: "DELIVERED",
      deliveryStaff: "Ramesh Kumar",
      outlet: "Nirago Elite (Connaught Place)",
      deliveryDate: "2026-06-17",
      transactionId: "TXN_UPI_009188"
    },
    {
      id: "#1016",
      customerName: "Karan Malhotra",
      customerPhone: "+91 91111 22222",
      customerAddress: "Flat 202, Block G, GK-2, New Delhi - 110048",
      items: "2x Avocado Sourdough Toast",
      structuredItems: [
        { name: "Avocado Sourdough Toast", price: 349, quantity: 2 }
      ],
      subtotal: 698,
      gst: 35,
      packagingCharge: 30,
      deliveryCharge: 40,
      discount: 0,
      total: 803,
      paymentMethod: "CARD",
      paymentStatus: "PAID",
      fulfillmentType: "DELIVERY",
      status: "DELIVERED",
      deliveryStaff: "Ramesh Kumar",
      outlet: "Nirago Express (GK-2)",
      deliveryDate: "2026-06-17",
      transactionId: "TXN_CARD_334120"
    },
  ])

  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Aarav Mehta", email: "aarav@gmail.com", phone: "+91 99887 76655", walletBalance: 1250, membership: "PREMIUM", status: "ACTIVE", createdDate: "2026-01-10", orderVolume: 8, lifetimeValue: 4590, address: "Flat 402, Block B, CP Heights, Connaught Place, New Delhi - 110001" },
    { id: "2", name: "Ananya Sen", email: "ananya.sen@outlook.com", phone: "+91 98989 89898", walletBalance: 450, membership: "GOLD", status: "ACTIVE", createdDate: "2026-02-14", orderVolume: 4, lifetimeValue: 2450, address: "M-12, Ground Floor, Greater Kailash 2, New Delhi - 110048" },
    { id: "3", name: "Karan Johar", email: "karan@dharmaprod.com", phone: "+91 90000 11111", walletBalance: 0, membership: "NONE", status: "BLOCKED", createdDate: "2026-03-01", orderVolume: 0, lifetimeValue: 0, address: "Flat 202, Block G, GK-2, New Delhi - 110048" },
    { id: "4", name: "Diya Malik", email: "diya@yahoo.com", phone: "+91 97777 88888", walletBalance: 3200, membership: "SILVER", status: "ACTIVE", createdDate: "2026-04-18", orderVolume: 12, lifetimeValue: 6800, address: "C-45, First Floor, Connaught Place, New Delhi - 110001" },
  ])

  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>([
    { id: "1", name: "Amit Kumar", phone: "+91 91111 22222", status: "ACTIVE", assignedOutlet: "Nirago Elite (Connaught Place)" },
    { id: "2", name: "Rajesh Yadav", phone: "+91 93333 44444", status: "ACTIVE", assignedOutlet: "Nirago Express (GK-2)" },
    { id: "3", name: "Suresh Pal", phone: "+91 95555 66666", status: "INACTIVE", assignedOutlet: "Nirago Elite (Connaught Place)" },
    { id: "4", name: "Ramesh Kumar", phone: "+91 99887 76655", status: "ACTIVE", assignedOutlet: "Nirago Bistro (DLF Phase 3)" },
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
    { id: "5", name: "Ramesh Kumar", email: "ramesh@nirago.com", password: "Ramesh123", role: "Delivery Staff", status: "ACTIVE" },
    { id: "6", name: "Priya Mehra", email: "priya@nirago.com", password: "Priya123", role: "Outlet Manager", status: "ACTIVE", assignedOutlet: "Nirago Elite (Connaught Place)" },
    { id: "7", name: "Neha Verma", email: "neha@nirago.com", password: "Neha123", role: "Outlet Manager", status: "ACTIVE", assignedOutlet: "Nirago Express (GK-2)" },
    { id: "8", name: "Arjun Kapoor", email: "arjun@nirago.com", password: "Arjun123", role: "Outlet Manager", status: "ACTIVE", assignedOutlet: "Nirago Bistro (DLF Phase 3)" },
  ])

  const [globalRules, setGlobalRules] = useState<GlobalRules>({
    gst: 5,
    vat: 12,
    localLevies: 2,
    packagingCharge: 30,
    deliveryChargeBase: 40,
    deliveryPerKm: 10,
    useDistancePricing: false,
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

  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([
    { id: "1", name: "BRONZE", discountPercent: 5, minDeposit: 500, status: "ACTIVE" },
    { id: "2", name: "SILVER", discountPercent: 10, minDeposit: 1500, status: "ACTIVE" },
    { id: "3", name: "GOLD", discountPercent: 15, minDeposit: 3000, status: "ACTIVE" },
    { id: "4", name: "PREMIUM", discountPercent: 20, minDeposit: 5000, status: "ACTIVE" },
  ])

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStaff = localStorage.getItem("nirago_delivery_staff")
      if (savedStaff) {
        const parsedStaff: DeliveryStaff[] = JSON.parse(savedStaff)
        const hasRamesh = parsedStaff.some(s => s.name === "Ramesh Kumar")
        if (!hasRamesh) {
          const rameshStaff = deliveryStaff.find(s => s.name === "Ramesh Kumar")
          if (rameshStaff) {
            const updated = [...parsedStaff, rameshStaff]
            setDeliveryStaff(updated)
            localStorage.setItem("nirago_delivery_staff", JSON.stringify(updated))
          } else {
            setDeliveryStaff(parsedStaff)
          }
        } else {
          setDeliveryStaff(parsedStaff)
        }
      } else {
        localStorage.setItem("nirago_delivery_staff", JSON.stringify(deliveryStaff))
      }

      const savedUsers = localStorage.getItem("nirago_admin_users")
      if (savedUsers) {
        const parsedUsers: AdminUser[] = JSON.parse(savedUsers)
        let updatedUsers = [...parsedUsers]
        let needsUpdate = false
        adminUsers.forEach(du => {
          const idx = updatedUsers.findIndex(u => u.email.toLowerCase() === du.email.toLowerCase())
          if (idx > -1) {
            const existing = updatedUsers[idx]
            if (existing.password !== du.password || existing.role !== du.role || existing.assignedOutlet !== du.assignedOutlet) {
              updatedUsers[idx] = { ...existing, password: du.password, role: du.role, assignedOutlet: du.assignedOutlet }
              needsUpdate = true
            }
          } else {
            updatedUsers.push(du)
            needsUpdate = true
          }
        })

        if (needsUpdate) {
          setAdminUsers(updatedUsers)
          localStorage.setItem("nirago_admin_users", JSON.stringify(updatedUsers))
        } else {
          setAdminUsers(parsedUsers)
        }
      } else {
        localStorage.setItem("nirago_admin_users", JSON.stringify(adminUsers))
      }

      const savedOrders = localStorage.getItem("nirago_orders")
      if (savedOrders) {
        const parsedOrders: Order[] = JSON.parse(savedOrders)
        const hasRameshOrders = parsedOrders.some(o => o.deliveryStaff === "Ramesh Kumar")
        if (!hasRameshOrders) {
          const rameshDemoOrders = orders.filter(o => o.deliveryStaff === "Ramesh Kumar")
          const updated = [...parsedOrders, ...rameshDemoOrders]
          setOrders(updated)
          localStorage.setItem("nirago_orders", JSON.stringify(updated))
        } else {
          setOrders(parsedOrders)
        }
      } else {
        localStorage.setItem("nirago_orders", JSON.stringify(orders))
      }

      const savedMenuItems = localStorage.getItem("nirago_menu_items")
      if (savedMenuItems) {
        setMenuItems(JSON.parse(savedMenuItems))
      } else {
        localStorage.setItem("nirago_menu_items", JSON.stringify(menuItems))
      }

      const savedOutlets = localStorage.getItem("nirago_outlets")
      if (savedOutlets) {
        setOutlets(JSON.parse(savedOutlets))
      } else {
        localStorage.setItem("nirago_outlets", JSON.stringify(outlets))
      }

      const savedLoyaltyTiers = localStorage.getItem("nirago_loyalty_tiers")
      if (savedLoyaltyTiers) {
        setLoyaltyTiers(JSON.parse(savedLoyaltyTiers))
      } else {
        localStorage.setItem("nirago_loyalty_tiers", JSON.stringify(loyaltyTiers))
      }

      const savedCustomers = localStorage.getItem("nirago_customers")
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers))
      } else {
        localStorage.setItem("nirago_customers", JSON.stringify(customers))
      }

      const savedCategories = localStorage.getItem("nirago_categories")
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      } else {
        localStorage.setItem("nirago_categories", JSON.stringify(categories))
      }

      const savedRules = localStorage.getItem("nirago_global_rules")
      if (savedRules) {
        setGlobalRules(JSON.parse(savedRules))
      } else {
        localStorage.setItem("nirago_global_rules", JSON.stringify(globalRules))
      }
    }
  }, [])

  // Sync to localStorage on changes
  useEffect(() => {
    if (typeof window !== "undefined" && outlets.length > 0) {
      localStorage.setItem("nirago_outlets", JSON.stringify(outlets))
    }
  }, [outlets])

  useEffect(() => {
    if (typeof window !== "undefined" && adminUsers.length > 0) {
      localStorage.setItem("nirago_admin_users", JSON.stringify(adminUsers))
    }
  }, [adminUsers])

  useEffect(() => {
    if (typeof window !== "undefined" && loyaltyTiers.length > 0) {
      localStorage.setItem("nirago_loyalty_tiers", JSON.stringify(loyaltyTiers))
    }
  }, [loyaltyTiers])

  useEffect(() => {
    if (typeof window !== "undefined" && customers.length > 0) {
      localStorage.setItem("nirago_customers", JSON.stringify(customers))
    }
  }, [customers])

  useEffect(() => {
    if (typeof window !== "undefined" && deliveryStaff.length > 0) {
      localStorage.setItem("nirago_delivery_staff", JSON.stringify(deliveryStaff))
    }
  }, [deliveryStaff])

  useEffect(() => {
    if (typeof window !== "undefined" && orders.length > 0) {
      localStorage.setItem("nirago_orders", JSON.stringify(orders))
    }
  }, [orders])

  useEffect(() => {
    if (typeof window !== "undefined" && menuItems.length > 0) {
      localStorage.setItem("nirago_menu_items", JSON.stringify(menuItems))
    }
  }, [menuItems])

  useEffect(() => {
    if (typeof window !== "undefined" && categories.length > 0) {
      localStorage.setItem("nirago_categories", JSON.stringify(categories))
    }
  }, [categories])

  useEffect(() => {
    if (typeof window !== "undefined" && globalRules) {
      localStorage.setItem("nirago_global_rules", JSON.stringify(globalRules))
    }
  }, [globalRules])

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
  const handleAddOutlet = (
    name: string,
    address: string,
    contact?: string,
    deliveryEnabled: boolean = true,
    deliveryCharge: number = 40,
    minFreeDelivery: number = 500,
    estimatedDeliveryTime: string = "30-45 mins",
    paymentStatus: "ACTIVE" | "INACTIVE" | "PENDING" = "ACTIVE",
    merchantId: string = "MERCH_" + name.replace(/[^A-Z0-9]/ig, "_").toUpperCase(),
    transactionId: string = "TXN_INIT_" + Math.floor(Math.random() * 100),
    allowedPaymentMethods: string[] = ["CASH", "UPI", "CARD"]
  ): boolean => {
    if (outlets.length >= 9) {
      return false
    }
    const added: Outlet = {
      id: (outlets.length + 1).toString(),
      name,
      address,
      contact: contact || "+91 99999 99999",
      status: "ACTIVE",
      deliveryEnabled,
      deliveryCharge,
      minFreeDelivery,
      estimatedDeliveryTime,
      paymentStatus,
      merchantId,
      transactionId,
      allowedPaymentMethods
    }
    setOutlets(prev => [...prev, added])
    addLog("Outlet Added", `Created new outlet: ${name}`)
    return true
  }

  // Handle Outlet Update
  const updateOutlet = (id: string, updated: Partial<Outlet>) => {
    setOutlets(prev => prev.map(o => {
      if (o.id === id) {
        addLog("Outlet Configured", `Updated configuration for outlet: ${o.name}`)
        return { ...o, ...updated }
      }
      return o
    }))
  }

  // Handle Menu Item Add
  const handleAddMenuItem = (name: string, category: string, price: number, description?: string, image?: string) => {
    const added: MenuItem = {
      id: (menuItems.length + 1).toString(),
      name,
      category,
      price,
      status: "ACTIVE",
      description: description || "Freshly cooked gourmet specialty.",
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop"
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
  const handleAddAdminUser = (name: string, email: string, password?: string, role?: AdminUser["role"], assignedOutlet?: string) => {
    const added: AdminUser = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      password: password || "Password123",
      role: role || "Manager",
      status: "ACTIVE",
      ...(assignedOutlet ? { assignedOutlet } : {})
    }
    setAdminUsers(prev => [...prev, added])
    addLog("Staff Registered", `Registered new staff member: ${name} as ${role || "Manager"} with custom credentials.`)
  }

  // Handle Add Delivery Staff
  const handleAddDeliveryStaff = (name: string, phone: string, email: string, password?: string, assignedOutlet?: string) => {
    const newStaff: DeliveryStaff = {
      id: `${Date.now()}-staff`,
      name,
      phone,
      status: "ACTIVE",
      ...(assignedOutlet ? { assignedOutlet } : {})
    }
    setDeliveryStaff(prev => [...prev, newStaff])

    const newAdminUser: AdminUser = {
      id: `${Date.now()}-user`,
      name,
      email,
      password: password || "Password123",
      role: "Delivery Staff",
      status: "ACTIVE",
      ...(assignedOutlet ? { assignedOutlet } : {})
    }
    setAdminUsers(prev => [...prev, newAdminUser])

    addLog("Staff Registered", `Registered new delivery rider: ${name} with email ${email}`)
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
  const updateOrderStatus = (orderId: string, nextStatus: Order["status"], cancellationReason?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const details = cancellationReason 
          ? `Order ${orderId} marked as ${nextStatus}. Reason: ${cancellationReason}`
          : `Order ${orderId} progressed to ${nextStatus}`
        addLog("Order Status Updated", details)
        if (nextStatus === "DELIVERED") {
          const todayStr = new Date().toISOString().substring(0, 10)
          return { ...o, status: nextStatus, deliveryDate: todayStr }
        }
        return { ...o, status: nextStatus, ...(cancellationReason ? { cancellationReason } : {}) }
      }
      return o
    }))
  }

  // Update order payment status and transaction ID
  const updateOrderPayment = (orderId: string, status: "PAID" | "PENDING" | "FAILED", transactionId?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        addLog("Payment Updated", `Updated payment status for Order ${orderId} to ${status}`)
        return { 
          ...o, 
          paymentStatus: status, 
          ...(transactionId ? { transactionId } : o.transactionId ? { transactionId: o.transactionId } : {})
        }
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

  // Add new Loyalty Tier
  const handleAddLoyaltyTier = (name: string, discountPercent: number, minDeposit: number) => {
    const newTier: LoyaltyTier = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: name.toUpperCase(),
      discountPercent,
      minDeposit,
      status: "ACTIVE"
    }
    setLoyaltyTiers(prev => [...prev, newTier])
    addLog("Loyalty Tier Added", `Created new tier: ${newTier.name} (Discount: ${discountPercent}%, Min Deposit: ₹${minDeposit})`)
  }

  // Toggle Loyalty Tier status
  const toggleLoyaltyTierStatus = (id: string) => {
    setLoyaltyTiers(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        addLog("Loyalty Tier Status Toggled", `Loyalty tier ${t.name} set to ${nextStatus}`)
        return { ...t, status: nextStatus }
      }
      return t
    }))
  }

  // Customer wallet deposit with auto-promotion
  const handleCustomerDeposit = (customerId: string, amount: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const nextBalance = c.walletBalance + amount
        let matchedTier = c.membership

        // Filter active tiers, sort by minDeposit descending
        const activeTiers = loyaltyTiers
          .filter(t => t.status === "ACTIVE")
          .sort((a, b) => b.minDeposit - a.minDeposit)

        const eligibleTier = activeTiers.find(t => nextBalance >= t.minDeposit)
        if (eligibleTier) {
          matchedTier = eligibleTier.name
        }

        addLog("Wallet Deposit", `Deposited ₹${amount} into ${c.name}'s wallet. New Balance: ₹${nextBalance}. Tier: ${matchedTier}`)

        return {
          ...c,
          walletBalance: nextBalance,
          membership: matchedTier
        }
      }
      return c
    }))
  }

  // Assign Customer Tier manually
  const handleAssignCustomerTier = (customerId: string, tierName: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        addLog("Loyalty Tier Override", `Manually assigned ${c.name} to tier ${tierName}`)
        return {
          ...c,
          membership: tierName
        }
      }
      return c
    }))
  }

  const handleAddCategory = (name: string, icon: string) => {
    const newCat = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      status: "ACTIVE",
      icon: icon || "🍽️"
    }
    setCategories(prev => [...prev, newCat])
    addLog("Category Added", `Created new category: ${name}`)
  }

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find(c => c.id === id)
    if (cat) {
      setCategories(prev => prev.filter(c => c.id !== id))
      addLog("Category Deleted", `Removed category: ${cat.name}`)
    }
  }

  const handleToggleCategoryStatus = (id: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        addLog("Category Status Toggled", `Category ${c.name} set to ${nextStatus}`)
        return { ...c, status: nextStatus }
      }
      return c
    }))
  }

  const handleUpdateItemModifiers = (itemId: string, groups: ModifierGroup[]) => {
    setMenuItems(prev => prev.map(m => {
      if (m.id === itemId) {
        addLog("Modifiers Updated", `Updated customizer groups for menu item: ${m.name}`)
        return { ...m, modifierGroups: groups }
      }
      return m
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

  const handleUpdateStaffRole = (id: string, newRole: AdminUser["role"], assignedOutlet?: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === id) {
        addLog("Staff Role Updated", `Updated ${u.name}'s role to ${newRole}${assignedOutlet ? ` (Outlet: ${assignedOutlet})` : ''}`)
        return { 
          ...u, 
          role: newRole, 
          assignedOutlet: newRole === "Outlet Manager" ? (assignedOutlet || u.assignedOutlet) : undefined 
        }
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
        loyaltyTiers,
        setLoyaltyTiers,
        addLog,
        handleAddOutlet,
        updateOutlet,
        handleAddMenuItem,
        handleAddCoupon,
        handleAddAdminUser,
        handleAddDeliveryStaff,
        toggleOutletStatus,
        toggleMenuItemStatus,
        toggleCouponStatus,
        toggleCustomerStatus,
        updateOrderStatus,
        updateOrderPayment,
        assignStaffToOrder,
        setOrderEstTime,
        handleWalletTransaction,
        updateGlobalSettings,
        handleDeleteStaffUser,
        handleUpdateStaffRole,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        handleAddLoyaltyTier,
        toggleLoyaltyTierStatus,
        handleCustomerDeposit,
        handleAssignCustomerTier,
        handleAddCategory,
        handleDeleteCategory,
        handleToggleCategoryStatus,
        handleUpdateItemModifiers
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
