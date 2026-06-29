"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, Truck, CreditCard, Settings, MapPin, Phone, Trash2, ArrowLeft, Users, ShoppingBag, Landmark, ArrowRightLeft, ShieldAlert, BarChart3, TrendingUp, Calendar } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, Outlet } from "../DashboardContext"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts"

function OutletCard({ 
  o, 
  toggleOutletStatus, 
  handleDeleteOutlet,
  adminUsers,
  deliveryStaff,
  onConfigure,
  onViewSummary
}: { 
  o: Outlet
  toggleOutletStatus: (id: string) => void
  handleDeleteOutlet: (id: string) => void
  adminUsers: any[]
  deliveryStaff: any[]
  onConfigure: () => void
  onViewSummary: () => void
}) {
  const [cardTab, setCardTab] = useState<"general" | "delivery" | "payment">("general")
  
  const assignedManager = adminUsers.find(u => u.role === "Outlet Manager" && u.assignedOutlet === o.name)
  const assignedRiders = deliveryStaff.filter(s => s.assignedOutlet === o.name)

  return (
    <Card 
      className="border border-[#d2d2c4] bg-white shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer hover:border-[#556B2F]"
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest("button") || target.closest("input") || target.closest("select")) {
          return
        }
        onViewSummary()
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-[#f5f5e6]/25 border-b border-[#d2d2c4]/45">
        <CardTitle className="text-base font-bold text-[#556B2F] leading-tight" title={o.name}>{o.name}</CardTitle>
        <button 
          type="button"
          onClick={() => toggleOutletStatus(o.id)}
          className="cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Click to toggle status"
        >
          <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"}>
            {o.status}
          </Badge>
        </button>
      </CardHeader>

      {/* Card interactive tabs */}
      <div className="flex border-b border-[#d2d2c4]/30 bg-neutral-50/50 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setCardTab("general")}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            cardTab === "general"
              ? "border-[#556B2F] text-[#556B2F] bg-white font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50"
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setCardTab("delivery")}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            cardTab === "delivery"
              ? "border-[#556B2F] text-[#556B2F] bg-white font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50"
          }`}
        >
          Delivery
        </button>
        <button
          type="button"
          onClick={() => setCardTab("payment")}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            cardTab === "payment"
              ? "border-[#556B2F] text-[#556B2F] bg-white font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50"
          }`}
        >
          Payments & TXNs
        </button>
      </div>

      <CardContent className="pt-4 flex-1 min-h-[140px] space-y-3">
        {/* GENERAL TAB CONTENT */}
        {cardTab === "general" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <p className="text-xs text-neutral-600 flex items-start gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#556B2F] shrink-0 mt-0.5" />
              <span><strong>Address:</strong> {o.address}</span>
            </p>
            <p className="text-xs text-neutral-600 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-[#556B2F] shrink-0" />
              <span><strong>Contact:</strong> {o.contact}</span>
            </p>
            <div className="pt-2 border-t border-dashed border-[#d2d2c4]/25 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between items-center">
                <span><strong>Manager:</strong></span>
                <span className="font-bold text-[#2d3822]">{assignedManager ? assignedManager.name : <span className="text-neutral-400 italic font-normal">None Assigned</span>}</span>
              </div>
              <div className="flex justify-between items-center">
                <span><strong>Riders:</strong></span>
                <span className="font-bold text-[#556B2F]">{assignedRiders.length > 0 ? assignedRiders.map(r => r.name).join(", ") : <span className="text-neutral-400 italic font-normal">None Assigned</span>}</span>
              </div>
            </div>
            <div className="text-[10px] text-neutral-400 italic pt-2 border-t border-neutral-100">
              Click the status badge to toggle operations or click configure to modify settings.
            </div>
          </div>
        )}

        {/* DELIVERY TAB CONTENT */}
        {cardTab === "delivery" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#556B2F] flex items-center gap-1 uppercase tracking-wider">
                <Truck className="h-3.5 w-3.5" /> Service Status
              </span>
              <Badge className={o.deliveryEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 px-2" : "bg-red-50 text-red-700 border-red-200 text-[10px] py-0.5 px-2"}>
                {o.deliveryEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {o.deliveryEnabled ? (
              <div className="space-y-1 text-xs text-neutral-600 bg-[#f5f5e6]/20 p-2.5 rounded border border-[#d2d2c4]/20">
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-neutral-800">₹{o.deliveryCharge ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Time Window:</span>
                  <span className="font-semibold text-neutral-800">{o.estimatedDeliveryTime || "N/A"}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200/50">
                  <span>Minimum order for free delivery (₹):</span>
                  <span className="font-bold text-[#556B2F]">₹{o.minFreeDelivery ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">Delivery logistics are disabled for this location.</p>
            )}
          </div>
        )}

        {/* PAYMENT TAB CONTENT */}
        {cardTab === "payment" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#556B2F] flex items-center gap-1 uppercase tracking-wider">
                <CreditCard className="h-3.5 w-3.5" /> Gateway Status
              </span>
              <Badge className={
                o.paymentStatus === "ACTIVE" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 px-2"
                  : o.paymentStatus === "PENDING"
                    ? "bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0.5 px-2"
                    : "bg-red-50 text-red-700 border-red-200 text-[10px] py-0.5 px-2"
              }>
                {o.paymentStatus || "INACTIVE"}
              </Badge>
            </div>
            
            <div className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded border border-[#d2d2c4]/20">
              <div className="flex justify-between">
                <span>Razorpay ID:</span>
                <span className="font-mono text-[10px] text-neutral-800 font-semibold">{o.merchantId || "Not Set"}</span>
              </div>
              <div className="flex justify-between">
                <span>Test Transaction ID:</span>
                <span className="font-mono text-[10px] text-neutral-800 font-semibold">{o.transactionId || "Not Set"}</span>
              </div>
              {o.allowedPaymentMethods && o.allowedPaymentMethods.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-neutral-200/50">
                  {o.allowedPaymentMethods.map(method => (
                    <span key={method} className="bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide">{method}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-neutral-50/50 border-t border-[#d2d2c4]/40 flex justify-between items-center p-3">
        <Button 
          size="xs" 
          variant="outline" 
          className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 cursor-pointer font-bold"
          onClick={() => {
            const currentRole = localStorage.getItem("nirago_user_role") || "Owner"
            localStorage.setItem("nirago_original_role", currentRole)
            localStorage.setItem("nirago_user_role", "Outlet Manager")
            localStorage.setItem("nirago_user_outlet", o.name)
            Swal.fire({
              title: "Switching View",
              text: `Redirecting to ${o.name} dashboard view...`,
              icon: "success",
              timer: 1200,
              showConfirmButton: false
            }).then(() => {
              window.location.href = "/dashboard"
            })
          }}
        >
          Visit Dashboard
        </Button>
        <div className="flex gap-2">
          <Button 
            size="xs" 
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer p-1 h-7 w-7 flex items-center justify-center" 
            title="Delete Outlet"
            onClick={() => {
              Swal.fire({
                title: "Delete Outlet?",
                text: `Are you sure you want to permanently delete "${o.name}"? This action cannot be undone.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it"
              }).then((result) => {
                if (result.isConfirmed) {
                   handleDeleteOutlet(o.id)
                   Swal.fire({
                     title: "Deleted",
                     text: "Outlet listing removed successfully.",
                     icon: "success",
                     confirmButtonColor: "#556B2F"
                   })
                }
              })
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="xs" 
            className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" 
            onClick={onConfigure}
          >
            <Settings className="h-3 w-3 mr-1" /> Configure
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function OutletsPage() {
  const { 
    outlets, 
    toggleOutletStatus, 
    handleAddOutlet, 
    updateOutlet, 
    handleDeleteOutlet,
    adminUsers,
    setAdminUsers,
    deliveryStaff,
    setDeliveryStaff,
    orders
  } = useDashboard()
  
  // Register staffing states
  const [newOutletManagerId, setNewOutletManagerId] = useState<string>("none")
  const [newOutletRiderIds, setNewOutletRiderIds] = useState<string[]>([])
  
  // Register outlet states
  const [newOutlet, setNewOutlet] = useState({ 
    name: "", 
    address: "", 
    contact: "",
    deliveryEnabled: true,
    deliveryCharge: 40,
    minFreeDelivery: 500,
    estimatedDeliveryTime: "30-45 mins",
    paymentStatus: "ACTIVE" as "ACTIVE" | "INACTIVE" | "PENDING",
    merchantId: "",
    transactionId: "",
    allowedPaymentMethods: ["CASH", "UPI", "CARD"]
  })

  // Edit outlet states
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)
  const [activeTab, setActiveTab] = useState<"general" | "delivery" | "payment" | "staffing">("general")
  const [selectedOutletSummary, setSelectedOutletSummary] = useState<Outlet | null>(null)

  const handleRegister = () => {
    if (outlets.length >= 9) {
      Swal.fire({
        title: "Outlet License Limit",
        text: "WARNING: Maximum limit of 9 outlets reached. Please upgrade to the Premium Plan to configure additional outlet networks.",
        icon: "warning",
        confirmButtonColor: "#556B2F"
      })
      return
    }
    if (newOutlet.contact.length !== 10) {
      Swal.fire({
        title: "Invalid Contact",
        text: "Contact number must be exactly 10 digits.",
        icon: "warning",
        confirmButtonColor: "#556B2F"
      })
      return
    }
    if (newOutlet.name && newOutlet.address) {
      const success = handleAddOutlet(
        newOutlet.name, 
        newOutlet.address, 
        newOutlet.contact,
        newOutlet.deliveryEnabled,
        newOutlet.deliveryCharge,
        newOutlet.minFreeDelivery,
        newOutlet.estimatedDeliveryTime,
        newOutlet.paymentStatus,
        newOutlet.merchantId || undefined,
        newOutlet.transactionId || undefined,
        newOutlet.allowedPaymentMethods
      )
      if (success) {
        const newlyCreatedOutletName = newOutlet.name
        if (newOutletManagerId !== "none") {
          setAdminUsers(prev => prev.map(u => {
            if (u.id === newOutletManagerId) {
              return { ...u, assignedOutlet: newlyCreatedOutletName }
            }
            return u
          }))
        }
        if (newOutletRiderIds.length > 0) {
          setDeliveryStaff(prev => prev.map(s => {
            if (newOutletRiderIds.includes(s.id)) {
              return { ...s, assignedOutlet: newlyCreatedOutletName }
            }
            return s
          }))
        }

        setNewOutlet({ 
          name: "", 
          address: "", 
          contact: "",
          deliveryEnabled: true,
          deliveryCharge: 40,
          minFreeDelivery: 500,
          estimatedDeliveryTime: "30-45 mins",
          paymentStatus: "ACTIVE",
          merchantId: "",
          transactionId: "",
          allowedPaymentMethods: ["CASH", "UPI", "CARD"]
        })
        setNewOutletManagerId("none")
        setNewOutletRiderIds([])

        Swal.fire({
          title: "Outlet Registered",
          text: "Physical outlet successfully deployed in system records with assigned staff.",
          icon: "success",
          confirmButtonColor: "#556B2F"
        })
      }
    }
  }

  const handleSaveOutletSettings = () => {
    if (editingOutlet) {
      if (editingOutlet.contact.length !== 10) {
        Swal.fire({
          title: "Invalid Contact",
          text: "Contact number must be exactly 10 digits.",
          icon: "warning",
          confirmButtonColor: "#556B2F"
        })
        return
      }
      updateOutlet(editingOutlet.id, editingOutlet)
      setEditingOutlet(null)
      Swal.fire({
        title: "Store Configured",
        text: `Successfully updated settings for ${editingOutlet.name}.`,
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  const toggleEditPaymentMethod = (method: string) => {
    if (!editingOutlet) return
    const current = editingOutlet.allowedPaymentMethods || []
    const updated = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method]
    setEditingOutlet({ ...editingOutlet, allowedPaymentMethods: updated })
  }

  if (selectedOutletSummary) {
    const o = selectedOutletSummary
    const outletOrders = orders.filter((ord: any) => ord.outlet === o.name)
    const outletCompletedOrders = outletOrders.filter((ord: any) => ord.status !== "CANCELLED" && ord.status !== "REJECTED")
    const totalRevenue = outletCompletedOrders.reduce((sum: number, ord: any) => sum + (ord.total || 0), 0)
    const activeOrdersCount = outletOrders.filter((ord: any) => ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && ord.status !== "REJECTED").length
    const uniqueCustomers = Array.from(new Set(outletOrders.map((ord: any) => ord.customerName)))
    
    // Delivery vs Pickup
    const deliveryCount = outletOrders.filter((ord: any) => ord.fulfillmentType === "DELIVERY").length
    const pickupCount = outletOrders.filter((ord: any) => ord.fulfillmentType === "PICKUP").length

    // Assigned Manager
    const assignedManager = adminUsers.find(u => u.role === "Outlet Manager" && u.assignedOutlet === o.name)
    // Assigned Drivers
    const assignedRiders = deliveryStaff.filter(d => d.assignedOutlet === o.name)

    // Order status distribution
    const statusCounts = {
      PLACED: outletOrders.filter((ord: any) => ord.status === "PLACED").length,
      ACCEPTED: outletOrders.filter((ord: any) => ord.status === "ACCEPTED").length,
      PREPARING: outletOrders.filter((ord: any) => ord.status === "PREPARING").length,
      READY: outletOrders.filter((ord: any) => ord.status === "READY").length,
      OUT_FOR_DELIVERY: outletOrders.filter((ord: any) => ord.status === "OUT_FOR_DELIVERY").length,
      DELIVERED: outletOrders.filter((ord: any) => ord.status === "DELIVERED").length,
      CANCELLED: outletOrders.filter((ord: any) => ord.status === "CANCELLED" || ord.status === "REJECTED").length,
    }
    const statusChartData = [
      { name: "Placed", count: statusCounts.PLACED, color: "#3b82f6" },
      { name: "Accepted", count: statusCounts.ACCEPTED, color: "#06b6d4" },
      { name: "Preparing", count: statusCounts.PREPARING, color: "#f59e0b" },
      { name: "Ready", count: statusCounts.READY, color: "#8b5cf6" },
      { name: "Transit", count: statusCounts.OUT_FOR_DELIVERY, color: "#6366f1" },
      { name: "Delivered", count: statusCounts.DELIVERED, color: "#10b981" },
      { name: "Cancelled", count: statusCounts.CANCELLED, color: "#ef4444" },
    ]

    // 7-day sales trend data for this outlet
    const getOutletSalesTrend = () => {
      const days: { label: string; dateKey: string; sales: number }[] = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateKey = d.toISOString().substring(0, 10)
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        days.push({ label, dateKey, sales: 0 })
      }
      outletCompletedOrders.forEach((order: any) => {
        let oDate = order.deliveryDate
        if (!oDate) {
          const idNum = parseInt(order.id.replace("#", ""), 10)
          if (!isNaN(idNum)) {
            const diff = 1024 - idNum 
            const d = new Date()
            d.setDate(today.getDate() - Math.min(Math.max(diff, 0), 6))
            oDate = d.toISOString().substring(0, 10)
          } else {
            oDate = today.toISOString().substring(0, 10)
          }
        }
        const found = days.find(day => day.dateKey === oDate)
        if (found) {
          found.sales += order.total
        }
      })
      return days
    }
    const outletSalesTrendData = getOutletSalesTrend()

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-[#d2d2c4]/40 pb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-neutral-300 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              onClick={() => setSelectedOutletSummary(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#2d3822]">{o.name}</h2>
                <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
                  {o.status}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 font-semibold">{o.address} • {o.contact}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Total Revenue</span>
                <div className="text-2xl font-black text-[#2d3822]">₹{totalRevenue.toLocaleString()}</div>
                <span className="text-[9px] text-neutral-400 font-semibold block">From {outletCompletedOrders.length} completed orders</span>
              </div>
              <Landmark className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Active Orders</span>
                <div className="text-2xl font-black text-[#556B2F]">{activeOrdersCount}</div>
                <span className="text-[9px] text-neutral-400 font-semibold block">Currently in processing pipeline</span>
              </div>
              <ShoppingBag className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>

          {/* Customers */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Unique Customers</span>
                <div className="text-2xl font-black text-[#2d3822]">{uniqueCustomers.length}</div>
                <span className="text-[9px] text-neutral-400 font-semibold block">Served in outlet history</span>
              </div>
              <Users className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>

          {/* Logistics Mix */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Fulfillment Mix</span>
                <div className="text-sm font-bold text-neutral-800 mt-1.5">
                  Delivery: <span className="text-[#556B2F] font-black">{deliveryCount}</span> • Pickup: <span className="text-[#556B2F] font-black">{pickupCount}</span>
                </div>
                <span className="text-[9px] text-neutral-400 font-semibold block">Total tracked orders: {outletOrders.length}</span>
              </div>
              <ArrowRightLeft className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>
        </div>

        {/* Charts & Staff Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Revenue Line Chart */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-[#556B2F]" /> Sales Revenue Trend (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-1 min-h-[220px]">
              <div className="relative w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={outletSalesTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOutletSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#556B2F" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#556B2F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis 
                      dataKey="label" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #d2d2c4', borderRadius: '6px', fontSize: '11px' }}
                      formatter={(val: any) => [`₹${val}`, 'Sales']}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#556B2F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutletSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-[#556B2F]" /> Orders Pipeline Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-1 min-h-[220px]">
              <div className="relative w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusChartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 9, fontWeight: 600 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #d2d2c4', borderRadius: '6px', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff & Recent Orders */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Staffing Overview */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-[#556B2F]" /> Outlet Staffing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 flex-1">
              {/* Manager info */}
              <div className="bg-[#f5f5e6]/20 border border-[#d2d2c4]/45 p-3 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Assigned Manager</span>
                {assignedManager ? (
                  <div>
                    <div className="font-bold text-sm text-[#2d3822]">{assignedManager.name}</div>
                    <div className="text-xs text-neutral-500 font-semibold">{assignedManager.email}</div>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400 italic font-semibold">No Manager Assigned</span>
                )}
              </div>

              {/* Drivers list */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Assigned Delivery Team ({assignedRiders.length})</span>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {assignedRiders.map((rider: any) => (
                    <div key={rider.id} className="flex justify-between items-center text-xs p-2 bg-neutral-50 border rounded-md">
                      <span className="font-bold text-[#2d3822]">{rider.name}</span>
                      <span className="text-neutral-500 font-mono">{rider.phone}</span>
                    </div>
                  ))}
                  {assignedRiders.length === 0 && (
                    <p className="text-xs text-neutral-400 italic py-2">No delivery staff assigned.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders List */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#556B2F]" /> Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="p-3 font-bold text-neutral-600">ID</th>
                      <th className="p-3 font-bold text-neutral-600">Customer</th>
                      <th className="p-3 font-bold text-neutral-600">Method</th>
                      <th className="p-3 font-bold text-neutral-600">Status</th>
                      <th className="p-3 font-bold text-neutral-600 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outletOrders.slice(0, 5).map((ord: any) => (
                      <tr key={ord.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                        <td className="p-3 font-black text-[#556B2F]">{ord.id}</td>
                        <td className="p-3 font-semibold text-neutral-800">{ord.customerName}</td>
                        <td className="p-3 text-neutral-500">{ord.paymentMethod}</td>
                        <td className="p-3">
                          <Badge className="text-[9px] py-0.5 px-1.5 font-bold">
                            {ord.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-neutral-800 text-right">₹{ord.total}</td>
                      </tr>
                    ))}
                    {outletOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-400 italic font-semibold">
                          No order transactions recorded for this outlet yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Outlet Network Limits</h2>
          <p className="text-sm text-neutral-600">Manage physical cafe outlets. The framework natively supports up to 9 active outlets.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Register Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl sm:max-w-3xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-[#2d3822] font-bold text-lg">Register Outlet Location</DialogTitle>
              <DialogDescription>Input new store location specs. Maximum limit: 9 outlets.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-600">Outlet Name</label>
                <Input placeholder="e.g. Nirago Select (Vasant Kunj)" value={newOutlet.name} onChange={(e) => setNewOutlet(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-600">Physical Address</label>
                <Input placeholder="e.g. Ground Floor, DLF Promenade" value={newOutlet.address} onChange={(e) => setNewOutlet(prev => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-600">Contact Number</label>
                <Input placeholder="e.g. 9876543210" value={newOutlet.contact} onChange={(e) => setNewOutlet(prev => ({ ...prev, contact: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
              </div>
              
              <div className="border-t border-[#d2d2c4]/45 pt-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#556B2F] flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Initial Delivery Config 
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Enable Delivery</label>
                    <Select 
                      value={newOutlet.deliveryEnabled ? "yes" : "no"} 
                      onValueChange={(val) => setNewOutlet(prev => ({ ...prev, deliveryEnabled: val === "yes" }))}
                    >
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="yes">Enabled</SelectItem>
                        <SelectItem value="no">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Delivery Charge (₹)</label>
                    <Input type="number" className="h-9" value={newOutlet.deliveryCharge} onChange={(e) => setNewOutlet(prev => ({ ...prev, deliveryCharge: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Minimum order for free delivery (₹)</label>
                    <Input type="number" className="h-9" value={newOutlet.minFreeDelivery} onChange={(e) => setNewOutlet(prev => ({ ...prev, minFreeDelivery: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Est. Time (e.g. 20-30m)</label>
                    <Input className="h-9" value={newOutlet.estimatedDeliveryTime} onChange={(e) => setNewOutlet(prev => ({ ...prev, estimatedDeliveryTime: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="border-t border-[#d2d2c4]/45 pt-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">
                  Initial Staffing
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Assign Manager</label>
                    <Select value={newOutletManagerId} onValueChange={setNewOutletManagerId}>
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue placeholder="Select Manager" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="none">No Manager (Unassigned)</SelectItem>
                        {adminUsers.filter(u => u.role === "Outlet Manager").map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} {u.assignedOutlet ? `(Currently: ${u.assignedOutlet})` : "(Unassigned)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500 block">Assign Delivery Partners</label>
                    <div className="max-h-28 overflow-y-auto border border-[#d2d2c4] rounded-md p-2 bg-white space-y-1.5">
                      {deliveryStaff.map(staff => (
                        <label key={staff.id} className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={newOutletRiderIds.includes(staff.id)}
                            onChange={(e) => {
                              const checked = e.target.checked
                              if (checked) {
                                setNewOutletRiderIds(prev => [...prev, staff.id])
                              } else {
                                setNewOutletRiderIds(prev => prev.filter(id => id !== staff.id))
                              }
                            }}
                            className="rounded border-[#d2d2c4] text-[#556B2F] focus:ring-[#556B2F]"
                          />
                          <span>{staff.name} {staff.assignedOutlet ? `(Currently: ${staff.assignedOutlet})` : ""}</span>
                        </label>
                      ))}
                      {deliveryStaff.length === 0 && (
                        <span className="text-[10px] text-neutral-400 italic">No delivery staff registered.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-3">
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" onClick={handleRegister}>
                Register Store
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {outlets.length >= 9 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-800 text-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Outlet License Alert:</span> You have reached the maximum allowed limit of 9 outlets under the standard license. To configure additional physical outlets, please contact ADVLST support at MSME licensing slots to upgrade your plan.
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {outlets.map(o => (
          <OutletCard 
            key={`outlet-card-${o.id}`} 
            o={o} 
            toggleOutletStatus={toggleOutletStatus} 
            handleDeleteOutlet={handleDeleteOutlet}
            adminUsers={adminUsers}
            deliveryStaff={deliveryStaff}
            onConfigure={() => {
              setEditingOutlet({ ...o })
              setActiveTab("general")
            }}
            onViewSummary={() => setSelectedOutletSummary(o)}
          />
        ))}
      </div>

      {/* Detailed Configure Dialog Modal with Tabs */}
      {editingOutlet && (
        <Dialog open={!!editingOutlet} onOpenChange={(open) => !open && setEditingOutlet(null)}>
          <DialogContent className="bg-white sm:max-w-md w-full overflow-y-auto max-h-[90vh]">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold text-[#2d3822]">Configure {editingOutlet.name}</DialogTitle>
              <DialogDescription>Modify status, delivery logistics, and payment gateway rules.</DialogDescription>
            </DialogHeader>

            {/* Custom Premium Tabs Bar */}
            <div className="flex border-b border-[#d2d2c4] my-2">
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "delivery"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("delivery")}
              >
                Delivery
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "payment"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("payment")}
              >
                Payments
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "staffing"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("staffing")}
              >
                Staffing
              </button>
            </div>

            {/* Tab Contents */}
            <div className="py-2 space-y-4">
              {/* TAB: GENERAL */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Store Outlet Name</label>
                    <Input 
                      value={editingOutlet.name} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, name: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Physical Address</label>
                    <Input 
                      value={editingOutlet.address} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, address: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Contact Telephone</label>
                    <Input 
                      placeholder="e.g. 9876543210"
                      value={editingOutlet.contact} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, contact: e.target.value.replace(/\D/g, "").slice(0, 10) } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Operational Status</label>
                    <Select 
                      value={editingOutlet.status} 
                      onValueChange={(val: "ACTIVE" | "INACTIVE") => setEditingOutlet(prev => prev ? { ...prev, status: val } : null)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="ACTIVE">ACTIVE (Store Open)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Store Closed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* TAB: DELIVERY */}
              {activeTab === "delivery" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Fulfillment Delivery Service</label>
                    <Select 
                      value={editingOutlet.deliveryEnabled ? "yes" : "no"} 
                      onValueChange={(val) => setEditingOutlet(prev => prev ? { ...prev, deliveryEnabled: val === "yes" } : null)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="yes">Enable Deliveries</SelectItem>
                        <SelectItem value="no">Disable Deliveries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editingOutlet.deliveryEnabled && (
                    <div className="space-y-4 border border-[#d2d2c4] rounded-lg p-3 bg-neutral-50/50 animate-in slide-in-from-top-2 duration-150">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600">Delivery Fee (₹)</label>
                        <Input 
                          type="number" 
                          value={editingOutlet.deliveryCharge ?? 0} 
                          onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, deliveryCharge: parseFloat(e.target.value) || 0 } : null)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600">Free Delivery Minimum (₹)</label>
                        <Input 
                          type="number" 
                          value={editingOutlet.minFreeDelivery ?? 0} 
                          onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, minFreeDelivery: parseFloat(e.target.value) || 0 } : null)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600">Estimated Delivery Time Window</label>
                        <Input 
                          placeholder="e.g. 30-45 mins" 
                          value={editingOutlet.estimatedDeliveryTime ?? ""} 
                          onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, estimatedDeliveryTime: e.target.value } : null)} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PAYMENT */}
              {activeTab === "payment" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Gateway Razorpay Status</label>
                    <Select 
                      value={editingOutlet.paymentStatus || "ACTIVE"} 
                      onValueChange={(val: "ACTIVE" | "PENDING" | "INACTIVE") => setEditingOutlet(prev => prev ? { ...prev, paymentStatus: val } : null)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="ACTIVE">ACTIVE (Accepting Online Payments)</SelectItem>
                        <SelectItem value="PENDING">PENDING (Razorpay Setup In Progress)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Gateways Disabled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Gateway Razorpay ID</label>
                    <Input 
                      placeholder="e.g. rzp_live_xxxxxxxxxxxxxx" 
                      value={editingOutlet.merchantId ?? ""} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, merchantId: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Test / Initial Transaction ID</label>
                    <Input 
                      placeholder="e.g. TXN_VASANT_INIT_01" 
                      value={editingOutlet.transactionId ?? ""} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, transactionId: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-neutral-600 block">Allowed Payment Channels</label>
                    <div className="flex gap-2">
                      {["CASH", "UPI", "CARD"].map(method => {
                        const isActive = (editingOutlet.allowedPaymentMethods || []).includes(method)
                        return (
                          <Button
                            key={method}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            className={isActive ? "bg-[#556B2F] hover:bg-[#405223] text-white flex-1 font-bold cursor-pointer" : "border-neutral-300 text-neutral-600 flex-1 cursor-pointer"}
                            onClick={() => toggleEditPaymentMethod(method)}
                          >
                            {method}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* TAB: STAFFING */}
              {activeTab === "staffing" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Assign Outlet Manager</label>
                    <Select 
                      value={adminUsers.find(u => u.role === "Outlet Manager" && u.assignedOutlet === editingOutlet.name)?.id || "none"}
                      onValueChange={(userId) => {
                        setAdminUsers(prev => prev.map(u => {
                          if (u.id === userId) {
                            return { ...u, assignedOutlet: editingOutlet.name }
                          }
                          if (u.assignedOutlet === editingOutlet.name && u.role === "Outlet Manager") {
                            return { ...u, assignedOutlet: "" }
                          }
                          return u
                        }))
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select Manager" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="none">No Manager (Unassigned)</SelectItem>
                        {adminUsers.filter(u => u.role === "Outlet Manager").map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} {u.assignedOutlet ? `(Currently: ${u.assignedOutlet})` : "(Unassigned)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-600 block">Assign Delivery Partners</label>
                    <div className="max-h-40 overflow-y-auto border border-[#d2d2c4] rounded-lg p-2.5 space-y-2 bg-white">
                      {deliveryStaff.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic">No delivery staff registered.</p>
                      ) : (
                        deliveryStaff.map(staff => {
                          const isAssigned = staff.assignedOutlet === editingOutlet.name
                          return (
                            <label key={staff.id} className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={isAssigned}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  setDeliveryStaff(prev => prev.map(s => {
                                    if (s.id === staff.id) {
                                      return { ...s, assignedOutlet: checked ? editingOutlet.name : "" }
                                    }
                                    return s
                                  }))
                                }}
                                className="rounded border-[#d2d2c4] text-[#556B2F] focus:ring-[#556B2F]"
                              />
                              <span>{staff.name} {staff.assignedOutlet && !isAssigned ? `(Currently: ${staff.assignedOutlet})` : ""}</span>
                            </label>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-3 gap-2">
              <Button 
                variant="outline" 
                className="border-neutral-300 text-neutral-600 cursor-pointer" 
                onClick={() => setEditingOutlet(null)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" 
                onClick={handleSaveOutletSettings}
              >
                Save Configurations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
