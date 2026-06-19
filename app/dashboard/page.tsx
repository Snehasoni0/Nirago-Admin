"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IndianRupee, Utensils, Flame, CheckCircle, Clock, Truck, MapPin, Users, Receipt, Percent, BarChart3, Phone, Send, Map, Power, Coffee, ClipboardList, Check, UserCheck, AlertTriangle } from "lucide-react"
import { useDashboard } from "./DashboardContext"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

// Custom tooltip for Sales trend chart
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#2d3822] text-[#FFFFF0] border border-[#d2d2c4] p-3 rounded-lg shadow-lg text-xs space-y-1 text-left">
        <p className="font-bold">{data.label}</p>
        <p className="text-[#cce8b5] font-semibold">Sales: ₹{data.sales.toLocaleString()}</p>
        <p className="text-neutral-300">Orders: {data.orders}</p>
      </div>
    )
  }
  return null
}

// Custom tooltip for Payment mix chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#2d3822] text-[#FFFFF0] border border-[#d2d2c4] p-2.5 rounded-lg shadow-lg text-xs space-y-1 text-left">
        <p className="font-bold flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-[#cce8b5] font-semibold">Total: ₹{data.value.toLocaleString()}</p>
        <p className="text-neutral-300">Share: {data.percentage}%</p>
      </div>
    )
  }
  return null
}

export default function OverviewPage() {
  const { 
    orders, 
    customers, 
    outlets, 
    deliveryStaff, 
    updateOrderStatus, 
    assignStaffToOrder, 
    setOrderEstTime, 
    updateOutlet 
  } = useDashboard()

  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")
  const [userOutlet, setUserOutlet] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [managerTab, setManagerTab] = useState<"new" | "kitchen" | "dispatch">("new")
  const [outletRiderSelect, setOutletRiderSelect] = useState<{ [orderId: string]: string }>({})

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserName(localStorage.getItem("nirago_user_name") || "Master Admin")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  // Filter orders & outlets based on role
  const filteredOrders = userRole === "Outlet Manager" && userOutlet
    ? orders.filter(o => o.outlet === userOutlet)
    : orders

  const filteredOutlets = userRole === "Outlet Manager" && userOutlet
    ? outlets.filter(o => o.name === userOutlet)
    : outlets

  // Admin stats
  const completedOrders = filteredOrders.filter(o => o.status !== "CANCELLED" && o.status !== "REJECTED")
  const activeCustomers = customers.filter(c => c.status === "ACTIVE")
  
  const stats = {
    grossSales: completedOrders.reduce((acc, curr) => acc + curr.total, 0),
    netMargin: Math.round(completedOrders.reduce((acc, curr) => acc + ((curr.subtotal || curr.total) - (curr.discount || 0)), 0) * 0.65),
    taxCollected: completedOrders.reduce((acc, curr) => acc + (curr.gst || 0), 0),
    placedOrdersCount: filteredOrders.filter(o => o.status === "PLACED").length,
    preparingOrdersCount: filteredOrders.filter(o => o.status === "PREPARING").length,
    readyOrdersCount: filteredOrders.filter(o => o.status === "READY").length,
    assignedOrdersCount: filteredOrders.filter(o => o.status === "OUT_FOR_DELIVERY").length,
    deliveredOrdersCount: filteredOrders.filter(o => o.status === "DELIVERED").length,
    cancelledOrdersCount: filteredOrders.filter(o => o.status === "CANCELLED" || o.status === "REJECTED").length,
    totalCustomersCount: customers.length,
    activeCustomersCount: activeCustomers.length,
    averageOrderValue: Math.round(filteredOrders.reduce((acc, curr) => acc + curr.total, 0) / (filteredOrders.length || 1)),
  }

  const upiSales = completedOrders.filter(o => o.paymentMethod === "UPI").reduce((sum, o) => sum + o.total, 0)
  const cardSales = completedOrders.filter(o => o.paymentMethod === "CARD").reduce((sum, o) => sum + o.total, 0)
  const cashSales = completedOrders.filter(o => o.paymentMethod === "CASH").reduce((sum, o) => sum + o.total, 0)
  const totalPaymentSales = upiSales + cardSales + cashSales || 1
  const upiPercent = Math.round((upiSales / totalPaymentSales) * 100)
  const cardPercent = Math.round((cardSales / totalPaymentSales) * 100)
  const cashPercent = Math.round((cashSales / totalPaymentSales) * 100)

  // Rider stats (filter by userName)
  const todayStr = new Date().toISOString().substring(0, 10)
  const myOrders = orders.filter(o => o.deliveryStaff === userName)
  const myActiveCount = myOrders.filter(o => o.status === "OUT_FOR_DELIVERY" || o.status === "READY").length
  const totalDeliveredCount = myOrders.filter(o => o.status === "DELIVERED").length
  const todayDeliveredCount = myOrders.filter(o => o.status === "DELIVERED" && o.deliveryDate === todayStr).length

  // Generate dynamic 7-day sales trend data
  const getSalesTrendData = () => {
    const days: { label: string; dateKey: string; sales: number; orders: number }[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateKey = d.toISOString().substring(0, 10)
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      days.push({ label, dateKey, sales: 0, orders: 0 })
    }

    completedOrders.forEach(order => {
      let oDate = order.deliveryDate
      if (!oDate) {
        const idNum = parseInt(order.id.replace("#", ""), 10)
        const today = new Date()
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
        found.orders += 1
      }
    })
    return days
  }

  const salesTrendData = getSalesTrendData()

  // Order status distribution
  const orderStatusData = [
    { name: "Placed", count: stats.placedOrdersCount, color: "#3b82f6" },
    { name: "Preparing", count: stats.preparingOrdersCount, color: "#f59e0b" },
    { name: "Ready", count: stats.readyOrdersCount, color: "#8b5cf6" },
    { name: "Transit", count: stats.assignedOrdersCount, color: "#6366f1" },
    { name: "Delivered", count: stats.deliveredOrdersCount, color: "#10b981" },
    { name: "Cancelled", count: stats.cancelledOrdersCount, color: "#ef4444" },
  ]

  // Payments mix
  const paymentChartData = [
    { name: "UPI", value: upiSales, percentage: upiPercent, color: "#6366f1" },
    { name: "Card", value: cardSales, percentage: cardPercent, color: "#3b82f6" },
    { name: "Cash", value: cashSales, percentage: cashPercent, color: "#10b981" },
  ]

  // Outlet contribution
  const outletChartData = filteredOutlets.map(o => {
    const outletOrders = filteredOrders.filter(order => order.outlet === o.name)
    const revenue = outletOrders
      .filter(order => order.status !== "CANCELLED" && order.status !== "REJECTED")
      .reduce((sum, order) => sum + (order.total || 0), 0)
    return {
      name: o.name.split("(")[0].trim(),
      sales: revenue,
      orders: outletOrders.length
    }
  })

  // Rider Action Triggers
  const handleRiderAction = (orderId: string, actionType: "PICKUP" | "DELIVER") => {
    const nextStatus = actionType === "PICKUP" ? "OUT_FOR_DELIVERY" : "DELIVERED"
    const actionText = actionType === "PICKUP" ? "start delivery for" : "mark as delivered"

    Swal.fire({
      title: "Confirm Status Update",
      text: `Are you sure you want to ${actionText} Order ${orderId}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#556B2F",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Confirm",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatus(orderId, nextStatus)
        Swal.fire({
          title: "Status Updated!",
          text: `Order ${orderId} has been successfully updated.`,
          icon: "success",
          confirmButtonColor: "#556B2F",
          timer: 1500
        })
      }
    })
  }

  // KITCHEN / OUTLET MANAGER VIEW
  if (userRole === "Outlet Manager") {
    const myOutletObj = outlets.find(o => o.name === userOutlet)
    const isOnline = myOutletObj?.status === "ACTIVE"
    const outletNameClean = userOutlet ? userOutlet.split("(")[0].trim() : "Kitchen"

    const handleToggleOutletStatus = () => {
      if (!myOutletObj) return
      const nextStatus = isOnline ? "INACTIVE" : "ACTIVE"
      updateOutlet(myOutletObj.id, { status: nextStatus })
      Swal.fire({
        title: `Kitchen is ${nextStatus === "ACTIVE" ? "ONLINE 🟢" : "OFFLINE 🔴"}`,
        text: `${outletNameClean} is now ${nextStatus === "ACTIVE" ? "accepting orders" : "offline"}`,
        icon: "success",
        confirmButtonColor: "#556B2F",
        timer: 1500
      })
    }

    // Filters
    const outletOrders = orders.filter(o => o.outlet === userOutlet)
    const newOrders = outletOrders.filter(o => o.status === "PLACED")
    const kitchenOrders = outletOrders.filter(o => o.status === "ACCEPTED" || o.status === "PREPARING")
    const dispatchOrders = outletOrders.filter(o => o.status === "READY" || o.status === "OUT_FOR_DELIVERY")
    
    // Today stats
    const todayStr = new Date().toISOString().substring(0, 10)
    const completedTodayOrders = outletOrders.filter(o => o.status === "DELIVERED" && (!o.deliveryDate || o.deliveryDate === todayStr))
    const completedSalesToday = completedTodayOrders.reduce((sum, o) => sum + o.total, 0)

    const handleAcceptOrder = (orderId: string) => {
      Swal.fire({
        title: "Prep Time",
        text: "Select cooking time for this order (minutes):",
        input: "select",
        inputOptions: {
          "15": "15 Minutes (Fast Cook)",
          "20": "20 Minutes (Standard)",
          "30": "30 Minutes (Busy)",
          "45": "45 Minutes (Peak Load)",
          "60": "60 Minutes (Bulk Order)"
        },
        inputValue: "20",
        showCancelButton: true,
        confirmButtonColor: "#556B2F",
        cancelButtonColor: "#d33",
        confirmButtonText: "Start Cooking",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          const mins = parseInt(result.value, 10) || 20
          setOrderEstTime(orderId, mins)
          updateOrderStatus(orderId, "PREPARING")
          Swal.fire({
            title: "Cooking Started",
            text: `Order ${orderId} has been sent to the kitchen. Timer: ${mins} mins.`,
            icon: "success",
            confirmButtonColor: "#556B2F",
            timer: 1500
          })
        }
      })
    }

    const handleRejectOrder = (orderId: string) => {
      Swal.fire({
        title: "Reject Order",
        text: "Why is this order being rejected?",
        input: "select",
        inputOptions: {
          "Kitchen too busy / Backlog": "Kitchen too busy / Backlog",
          "Ingredients out of stock": "Ingredients out of stock",
          "Rider staff unavailable": "Rider staff unavailable",
          "Location unserviceable": "Location unserviceable",
          "Customer request": "Customer request"
        },
        inputPlaceholder: "Select a reason...",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#556B2F",
        confirmButtonText: "Confirm Reject",
        cancelButtonText: "Keep Active",
        inputValidator: (value) => {
          if (!value) {
            return "Rejection reason is required!"
          }
          return null
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          updateOrderStatus(orderId, "CANCELLED", result.value)
          Swal.fire({
            title: "Order Cancelled",
            text: `Order ${orderId} has been rejected. Reason: ${result.value}`,
            icon: "warning",
            confirmButtonColor: "#d33",
            timer: 1500
          })
        }
      })
    }

    const handleMarkReady = (orderId: string) => {
      updateOrderStatus(orderId, "READY")
      Swal.fire({
        title: "Food is Ready",
        text: `Order ${orderId} is packed and ready for dispatch.`,
        icon: "success",
        confirmButtonColor: "#556B2F",
        timer: 1500
      })
    }

    const handleAssignRiderToOrder = (orderId: string, riderName: string) => {
      if (!riderName) return
      assignStaffToOrder(orderId, riderName)
      Swal.fire({
        title: "Rider Assigned",
        text: `${riderName} is assigned to Order ${orderId}.`,
        icon: "success",
        confirmButtonColor: "#556B2F",
        timer: 1200
      })
    }

    const handleDispatchOrDeliver = (orderId: string, targetStatus: "OUT_FOR_DELIVERY" | "DELIVERED") => {
      updateOrderStatus(orderId, targetStatus)
      Swal.fire({
        title: targetStatus === "OUT_FOR_DELIVERY" ? "Order Sent!" : "Order Completed!",
        text: `Order ${orderId} status updated to ${targetStatus === "OUT_FOR_DELIVERY" ? "Out for Delivery" : "Delivered"}.`,
        icon: "success",
        confirmButtonColor: "#556B2F",
        timer: 1500
      })
    }

    const activeRiders = deliveryStaff.filter(r => r.status === "ACTIVE" && (!r.assignedOutlet || r.assignedOutlet === userOutlet))

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        
        {/* Top Header Panel: Status and Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-white border border-[#d2d2c4] rounded-2xl gap-4 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-[#2d3822]">{outletNameClean} Kitchen</h2>
            <p className="text-xs text-neutral-500 font-medium font-sans">
              Live orders management, kitchen status control, and rider dispatches.
            </p>
          </div>
          
          <button
            onClick={handleToggleOutletStatus}
            className={cn(
              "px-5 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2.5 shadow-sm transition-all duration-300 cursor-pointer border",
              isOnline 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" 
                : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 animate-pulse"
            )}
          >
            <Power className="h-4.5 w-4.5 shrink-0" />
            <span>{isOnline ? "🟢 Kitchen: ONLINE & OPEN" : "🔴 Kitchen: CLOSED / OFFLINE"}</span>
          </button>
        </div>

        {/* Operational Counters Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* New Orders Card */}
          <Card className="relative overflow-hidden border border-blue-100/80 bg-gradient-to-br from-white to-[#fafdff] shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 rounded-xl">
            <div className="absolute -right-3 -bottom-3 h-16 w-16 bg-gradient-to-tr from-blue-400 to-blue-200 rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
            <CardContent className="p-4 flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">New Orders</span>
                <div className="text-xl font-extrabold text-blue-600 tracking-tight">{newOrders.length}</div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0">
                <ClipboardList className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>

          {/* In Kitchen Card */}
          <Card className="relative overflow-hidden border border-amber-100/80 bg-gradient-to-br from-white to-[#fffdf7] shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 rounded-xl">
            <div className="absolute -right-3 -bottom-3 h-16 w-16 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
            <CardContent className="p-4 flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">In Kitchen</span>
                <div className="text-xl font-extrabold text-amber-600 tracking-tight">{kitchenOrders.length}</div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0">
                <Flame className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>

          {/* Completed Today Card */}
          <Card className="relative overflow-hidden border border-emerald-100/80 bg-gradient-to-br from-white to-[#f7fdf9] shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 rounded-xl">
            <div className="absolute -right-3 -bottom-3 h-16 w-16 bg-gradient-to-tr from-emerald-400 to-emerald-200 rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
            <CardContent className="p-4 flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Completed Today</span>
                <div className="text-xl font-extrabold text-emerald-600 tracking-tight">{completedTodayOrders.length}</div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform shrink-0">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>

          {/* Sales Today Card */}
          <Card className="relative overflow-hidden border border-[#d2d2c4]/40 bg-gradient-to-br from-white to-[#fcfcf9] shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 rounded-xl">
            <div className="absolute -right-3 -bottom-3 h-16 w-16 bg-gradient-to-tr from-[#556B2F] to-[#8FBC8F] rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
            <CardContent className="p-4 flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">Sales Today</span>
                <div className="text-xl font-extrabold text-[#556B2F] tracking-tight">₹{completedSalesToday.toLocaleString()}</div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-[#556B2F]/10 border border-[#556B2F]/20 flex items-center justify-center text-[#556B2F] group-hover:scale-105 transition-transform shrink-0">
                <IndianRupee className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High-Visibility Kitchen Sound Alert Banner */}
        {newOrders.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold animate-pulse shadow-sm">
            <span className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <span>Incoming orders waiting! Please click "Accept & Cook" below.</span>
            </span>
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-[#d2d2c4] gap-2 pb-px pt-2">
          {(["new", "kitchen", "dispatch"] as const).map(t => {
            const label = t === "new" ? "1. New Orders" : t === "kitchen" ? "2. Active Cooking" : "3. Ready / Dispatched"
            const count = t === "new" ? newOrders.length : t === "kitchen" ? kitchenOrders.length : dispatchOrders.length
            const isActive = managerTab === t
            return (
              <button
                key={t}
                onClick={() => setManagerTab(t)}
                className={cn(
                  "px-4 py-2.5 font-bold text-xs border-b-2 -mb-px transition-all cursor-pointer flex items-center gap-1.5",
                  isActive 
                    ? "border-[#556B2F] text-[#556B2F] bg-white rounded-t-lg" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[9px] font-extrabold",
                    isActive ? "bg-[#556B2F] text-white" : "bg-neutral-200 text-neutral-600"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-4">
          
          {/* TAB 1: NEW ORDERS */}
          {managerTab === "new" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newOrders.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white border border-[#d2d2c4] rounded-2xl space-y-2">
                  <Coffee className="h-10 w-10 text-[#556B2F]/20 mx-auto" />
                  <p className="text-xs text-neutral-400 italic font-bold">No new orders right now. Kitchen is up to date! 🍕</p>
                </div>
              ) : (
                newOrders.map(o => (
                  <div key={o.id} className="bg-white border border-[#d2d2c4] rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                    <div className="p-4 border-b border-[#d2d2c4]/40 flex justify-between items-center bg-[#f5f5e6]/20">
                      <div>
                        <span className="font-extrabold text-[#556B2F] block">{o.id}</span>
                        <span className="text-[10px] text-neutral-400 font-bold font-sans">Placed just now</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold uppercase tracking-wider text-[9px]">
                        {o.fulfillmentType || "DELIVERY"}
                      </Badge>
                    </div>

                    <div className="p-4 flex-grow space-y-4">
                      {/* Customer Info */}
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">Customer</span>
                        <span className="text-xs font-black text-neutral-700">{o.customerName}</span>
                      </div>

                      {/* Items Details */}
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase border-b border-neutral-100 pb-1 mb-1">Items to prepare</span>
                        <div className="text-xs font-bold text-neutral-700 font-sans space-y-1">
                          {o.structuredItems ? o.structuredItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>🍔 {item.quantity}x {item.name}</span>
                            </div>
                          )) : o.items.split(", ").map((item, idx) => (
                            <div key={idx}>🍔 {item}</div>
                          ))}
                        </div>
                      </div>

                      {/* Special instructions */}
                      {o.specialInstructions && (
                        <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-[10px] text-amber-800 italic">
                          <strong>💡 Instruction:</strong> "{o.specialInstructions}"
                        </div>
                      )}

                      {/* Cash collection warning / paid status */}
                      <div className={cn(
                        "p-2.5 rounded-xl border text-[10px] font-bold",
                        o.paymentMethod === "CASH" 
                          ? "bg-amber-50 text-amber-800 border-amber-200" 
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      )}>
                        {o.paymentMethod === "CASH" ? "💵 Collect Cash: ₹" + o.total + " on delivery" : "✅ Already Paid Online: ₹" + o.total}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-3 border-t border-[#d2d2c4]/40 bg-neutral-50 flex gap-2">
                      <button
                        onClick={() => handleAcceptOrder(o.id)}
                        className="flex-1 bg-[#556B2F] hover:bg-[#405223] text-white py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Utensils className="h-3.5 w-3.5" /> Accept & Cook
                      </button>
                      <button
                        onClick={() => handleRejectOrder(o.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE COOKING */}
          {managerTab === "kitchen" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kitchenOrders.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white border border-[#d2d2c4] rounded-2xl space-y-2">
                  <Utensils className="h-10 w-10 text-[#556B2F]/20 mx-auto" />
                  <p className="text-xs text-neutral-400 italic font-bold">No active orders cooking right now.</p>
                </div>
              ) : (
                kitchenOrders.map(o => (
                  <div key={o.id} className="bg-white border border-[#d2d2c4] rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-[#d2d2c4]/40 flex justify-between items-center bg-[#f5f5e6]/20">
                      <div>
                        <span className="font-extrabold text-[#556B2F] block">{o.id}</span>
                        <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 animate-spin" /> Cooking (Est: {o.estimatedMinutes || 20}m)
                        </span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold uppercase text-[9px]">
                        In Kitchen
                      </Badge>
                    </div>

                    <div className="p-4 flex-grow space-y-4">
                      {/* Items Details */}
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase border-b border-neutral-100 pb-1 mb-1">Dish Checklist</span>
                        <div className="text-xs font-black text-neutral-800 font-sans space-y-1.5">
                          {o.structuredItems ? o.structuredItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-neutral-50 p-1.5 rounded border border-neutral-100">
                              <span>👨‍🍳 {item.quantity}x {item.name}</span>
                              {item.addOns && item.addOns.length > 0 && (
                                <span className="text-[8px] bg-neutral-200 text-neutral-600 px-1 rounded font-bold">With Add-ons</span>
                              )}
                            </div>
                          )) : o.items.split(", ").map((item, idx) => (
                            <div key={idx} className="bg-neutral-50 p-1.5 rounded border border-neutral-100">👨‍🍳 {item}</div>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      {o.specialInstructions && (
                        <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-[10px] text-amber-800 italic">
                          <strong>💡 Instruction:</strong> "{o.specialInstructions}"
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="p-3 border-t border-[#d2d2c4]/40 bg-neutral-50">
                      <button
                        onClick={() => handleMarkReady(o.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle className="h-4 w-4" /> 🔔 Food is Ready / Packed
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: READY / DISPATCH */}
          {managerTab === "dispatch" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dispatchOrders.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white border border-[#d2d2c4] rounded-2xl space-y-2">
                  <Truck className="h-10 w-10 text-[#556B2F]/20 mx-auto" />
                  <p className="text-xs text-neutral-400 italic font-bold">No orders waiting for dispatch.</p>
                </div>
              ) : (
                dispatchOrders.map(o => {
                  const isReady = o.status === "READY"
                  const isDelivery = o.fulfillmentType === "DELIVERY"
                  
                  return (
                    <div key={o.id} className="bg-white border border-[#d2d2c4] rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-[#d2d2c4]/40 flex justify-between items-center bg-[#f5f5e6]/20">
                        <div>
                          <span className="font-extrabold text-[#556B2F] block">{o.id}</span>
                          <span className="text-[10px] text-neutral-400 font-bold block">{o.customerName}</span>
                        </div>
                        <Badge className={cn(
                          "font-bold uppercase text-[9px] tracking-wider",
                          isReady ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-indigo-100 text-indigo-800 border-indigo-200"
                        )}>
                          {isReady ? "Ready to Pick" : "In Transit"}
                        </Badge>
                      </div>

                      <div className="p-4 flex-grow space-y-4 text-xs font-medium text-neutral-600 font-sans">
                        <div className="space-y-1">
                          <div className="flex gap-1.5"><span className="w-16 font-semibold text-neutral-400">Type:</span> <span className="font-bold text-neutral-800">{o.fulfillmentType || "DELIVERY"} ({o.paymentMethod})</span></div>
                          {isDelivery && (
                            <div className="flex items-start gap-1.5"><span className="w-16 font-semibold text-neutral-400 shrink-0">Address:</span> <span className="font-bold text-neutral-800 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-[#556B2F] shrink-0 mt-0.5" />{o.customerAddress}</span></div>
                          )}
                          <div className="flex gap-1.5"><span className="w-16 font-semibold text-neutral-400">Amount:</span> <span className="font-bold text-neutral-800">₹{o.total}</span></div>
                        </div>

                        {/* Rider Status Indicator */}
                        {isDelivery && (
                          <div className="pt-2 border-t border-neutral-100">
                            {o.deliveryStaff ? (
                              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-indigo-900 font-bold">
                                <span>🏍️ Assigned Rider:</span>
                                <span>{o.deliveryStaff}</span>
                              </div>
                            ) : (
                              <div className="space-y-2 bg-rose-50 border border-rose-100 rounded-lg p-2.5">
                                <span className="text-[10px] font-bold text-rose-800 block">⚠️ No Rider Assigned yet</span>
                                <div className="flex gap-2">
                                  <select
                                    value={outletRiderSelect[o.id] || ""}
                                    onChange={(e) => setOutletRiderSelect(prev => ({ ...prev, [o.id]: e.target.value }))}
                                    className="flex-1 text-[11px] border border-neutral-300 rounded bg-white p-1 font-bold outline-none"
                                  >
                                    <option value="">Choose active rider...</option>
                                    {activeRiders.map(r => (
                                      <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAssignRiderToOrder(o.id, outletRiderSelect[o.id])}
                                    className="bg-[#556B2F] text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-[#405223] transition-colors cursor-pointer"
                                  >
                                    Assign
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Dispatch Trigger Actions */}
                      <div className="p-3 border-t border-[#d2d2c4]/40 bg-neutral-50">
                        {isReady ? (
                          !isDelivery ? (
                            <button
                              onClick={() => handleDispatchOrDeliver(o.id, "DELIVERED")}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              ✅ Hand Over to Customer (Complete)
                            </button>
                          ) : o.deliveryStaff ? (
                            <button
                              onClick={() => handleDispatchOrDeliver(o.id, "OUT_FOR_DELIVERY")}
                              className="w-full bg-[#556B2F] hover:bg-[#405223] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Truck className="h-4 w-4" /> 🏍️ Hand Over & Dispatch
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-neutral-200 text-neutral-400 py-2 rounded-lg text-xs font-bold cursor-not-allowed"
                            >
                              Assign Rider above to Dispatch
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleDispatchOrDeliver(o.id, "DELIVERED")}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            ✅ Mark Delivered (Manual Backup Override)
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
          
        </div>
      </div>
    )
  }

  // RIDER VIEW
  if (userRole === "Delivery Staff") {
    // Communication Mock Actions
    const triggerPhoneCall = (customerName: string, phoneNumber: string) => {
      Swal.fire({
        title: "Calling Customer",
        html: `Dialing <b class="text-[#556B2F]">${customerName}</b> at <br/><span class="text-lg font-bold">${phoneNumber}</span><br/><br/><div className="animate-pulse text-neutral-400 text-xs">Simulating phone application connection...</div>`,
        icon: "info",
        showConfirmButton: true,
        confirmButtonColor: "#556B2F",
        confirmButtonText: "End Call"
      })
    }

    const triggerWhatsAppMessage = (customerName: string, phoneNumber: string, orderId: string) => {
      const text = `Hi ${customerName}, I am Amit/Ramesh from Nirago. I am out for delivery with your order ${orderId} and will reach you shortly.`
      Swal.fire({
        title: "WhatsApp Dispatch",
        html: `<p className="text-xs text-neutral-500 mb-2">Simulating WhatsApp message launch:</p><div className="bg-neutral-100 p-3 rounded-lg border text-left text-xs italic font-sans mb-3">"${text}"</div><p className="text-[10px] text-neutral-400">Target Phone: ${phoneNumber}</p>`,
        icon: "success",
        confirmButtonColor: "#556B2F",
        confirmButtonText: "Message Sent"
      })
    }

    const triggerNavigation = (address: string) => {
      Swal.fire({
        title: "Map Navigation",
        html: `<p className="text-xs text-neutral-500 mb-3">Connecting to GPS Navigation for:</p><b class="text-[#556B2F] text-xs font-sans block bg-[#f5f5e6] p-3 rounded-lg border border-[#d2d2c4]">${address}</b><br/><div className="animate-bounce font-bold text-xs text-[#556B2F]">🏍️ Navigation Active (ETA: 12 Mins)</div>`,
        icon: "info",
        confirmButtonColor: "#556B2F",
        confirmButtonText: "Close Maps"
      })
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#2d3822]">Riders Dashboard</h2>
            <p className="text-xs text-neutral-500 font-semibold">Welcome back, {userName}. Drive safely today! 🏍️</p>
          </div>
        </div>

        {/* Rider Deliveries Cards (Simple, No Payouts/Earnings) */}
        <div className="grid gap-4 grid-cols-2">
          <Card className="border border-[#d2d2c4] bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-3.5 px-4">
              <CardTitle className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Completed Today</CardTitle>
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-emerald-600">{todayDeliveredCount}</div>
            </CardContent>
          </Card>
          <Card className="border border-[#d2d2c4] bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-3.5 px-4">
              <CardTitle className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">All-Time Total</CardTitle>
              <CheckCircle className="h-4.5 w-4.5 text-[#556B2F]" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-[#556B2F]">{totalDeliveredCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lower section for Rider */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Active Deliveries Route */}
          <Card className="border border-[#d2d2c4] bg-white">
            <CardHeader>
              <CardTitle className="text-base font-black text-[#556B2F]">My Active Deliveries</CardTitle>
              <CardDescription className="text-xs font-semibold text-neutral-400">Deliveries assigned to you that are ready or in transit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myOrders.filter(o => o.status === "OUT_FOR_DELIVERY" || o.status === "READY").length === 0 ? (
                  <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                    <Check className="h-8 w-8 text-[#556B2F]/20 mx-auto" />
                    <p className="text-xs text-neutral-400 italic font-bold mt-2">No active deliveries assigned. Good job! 🎉</p>
                  </div>
                ) : (
                  myOrders.filter(o => o.status === "OUT_FOR_DELIVERY" || o.status === "READY").map(o => {
                    const isReady = o.status === "READY"
                    const isCod = o.paymentMethod === "CASH"

                    return (
                      <div 
                        key={`rider-active-${o.id}`} 
                        className={cn(
                          "p-4 border rounded-xl space-y-4 shadow-sm relative overflow-hidden transition-all duration-300 border-l-4",
                          isReady 
                            ? "bg-purple-50/30 border-[#d2d2c4] border-l-purple-500" 
                            : "bg-indigo-50/30 border-[#d2d2c4] border-l-indigo-500"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[#556B2F] text-sm">{o.id}</span>
                          <Badge className={cn(
                            "font-bold uppercase text-[9px]",
                            isReady ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"
                          )}>
                            {isReady ? "Ready to Pick" : "Out for Delivery (Transit)"}
                          </Badge>
                        </div>

                        {/* HIGH VISIBILITY PAYMENT COLLECT WARNING */}
                        <div className={cn(
                          "p-3 rounded-xl border flex items-center justify-between text-xs font-black",
                          isCod 
                            ? "bg-amber-100 text-amber-900 border-amber-200 animate-pulse" 
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        )}>
                          <span>Payment Method:</span>
                          <span className="flex items-center gap-1 text-sm uppercase">
                            {isCod ? `💵 Collect Cash: ₹${o.total}` : `✅ Already Paid Online`}
                          </span>
                        </div>

                        {/* Customer details in larger text */}
                        <div className="space-y-3.5 text-xs text-neutral-600 font-sans">
                          {/* Deliver Location */}
                          <div className="space-y-1 bg-white p-3 rounded-lg border border-neutral-100">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Deliver to Address</span>
                            <span className="font-black text-neutral-800 leading-tight block">{o.customerAddress}</span>
                          </div>

                          {/* Customer name & phone */}
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Recipient</span>
                              <span className="font-extrabold text-neutral-800">{o.customerName}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Phone</span>
                              <span className="font-bold text-neutral-800">{o.customerPhone || "Not provided"}</span>
                            </div>
                          </div>

                          {/* Action Mock Buttons */}
                          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-neutral-100">
                            <button
                              onClick={() => triggerPhoneCall(o.customerName, o.customerPhone || "+91 99887 76655")}
                              className="py-2 border border-[#d2d2c4] rounded-lg bg-white hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center text-[10px] font-bold text-neutral-600 gap-1 cursor-pointer"
                            >
                              <Phone className="h-4 w-4 text-[#556B2F]" />
                              <span>Call Customer</span>
                            </button>
                            <button
                              onClick={() => triggerWhatsAppMessage(o.customerName, o.customerPhone || "+91 99887 76655", o.id)}
                              className="py-2 border border-[#d2d2c4] rounded-lg bg-white hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center text-[10px] font-bold text-neutral-600 gap-1 cursor-pointer"
                            >
                              <Send className="h-4 w-4 text-[#556B2F]" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => triggerNavigation(o.customerAddress || "Connaught Place Block A, New Delhi")}
                              className="py-2 border border-[#d2d2c4] rounded-lg bg-white hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center text-[10px] font-bold text-neutral-600 gap-1 cursor-pointer"
                            >
                              <Map className="h-4 w-4 text-[#556B2F]" />
                              <span>Directions</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* One-Click Direct Actions */}
                        <div className="pt-2 border-t border-dashed border-[#d2d2c4]/50">
                          {isReady ? (
                            <button
                              onClick={() => handleRiderAction(o.id, "PICKUP")}
                              className="w-full bg-[#556B2F] hover:bg-[#405223] text-white py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              🏍️ Start Delivery Shift / Picked Up
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRiderAction(o.id, "DELIVER")}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              ✅ Mark Delivered & Collected
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery History */}
          <Card className="border border-[#d2d2c4] bg-white">
            <CardHeader>
              <CardTitle className="text-base font-black text-[#2d3822]">Recent Deliveries</CardTitle>
              <CardDescription className="text-xs font-semibold text-neutral-400">Records of your successfully delivered orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#d2d2c4]">
                      <TableHead className="font-bold">Order ID</TableHead>
                      <TableHead className="font-bold">Recipient</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOrders.filter(o => o.status === "DELIVERED").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-neutral-400 italic py-6 font-bold text-xs">No completed deliveries yet.</TableCell>
                      </TableRow>
                    ) : (
                      myOrders.filter(o => o.status === "DELIVERED").map(o => (
                        <TableRow key={`rider-history-${o.id}`} className="border-b border-[#d2d2c4]/40 hover:bg-[#f5f5e6]/10">
                          <TableCell className="font-extrabold text-[#556B2F]">{o.id}</TableCell>
                          <TableCell className="font-bold text-xs">{o.customerName}</TableCell>
                          <TableCell className="font-black text-xs">₹{o.total}</TableCell>
                          <TableCell className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Delivered
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // STANDARD ADMIN VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2d3822]">Overview</h2>
          <p className="text-xs text-neutral-500">Live sales summary, orders queue, and outlets performance.</p>
        </div>
      </div>

      {/* Analytics Summary Cards (SaaS-Style Creative & Premium) */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Sales Card */}
        <Card className="relative overflow-hidden border border-[#d2d2c4]/60 bg-gradient-to-br from-white to-[#fcfcf9] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          {/* Decorative Glow Blob */}
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-gradient-to-tr from-[#556B2F] to-[#8FBC8F] rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity duration-300" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Total Sales</span>
                <div className="text-3xl font-black text-[#556B2F] tracking-tight mt-1">₹{stats.grossSales.toLocaleString()}</div>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-[#556B2F]/10 flex items-center justify-center text-[#556B2F] border border-[#556B2F]/20 group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            
            {/* Visual Indicator: Progress towards a weekly goal */}
            <div className="space-y-1.5 relative z-10 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
                <span>Goal Progress</span>
                <span className="text-[#556B2F]">+12.5% vs last week</span>
              </div>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8FBC8F] to-[#556B2F] rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Earnings Card */}
        <Card className="relative overflow-hidden border border-rose-100 bg-gradient-to-br from-white to-[#fffafb] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          {/* Decorative Glow Blob */}
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-gradient-to-tr from-rose-400 to-rose-200 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity duration-300" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block">Your Earnings</span>
                <div className="text-3xl font-black text-rose-600 tracking-tight mt-1">₹{stats.netMargin.toLocaleString()}</div>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0">
                <Percent className="h-5 w-5" />
              </div>
            </div>

            {/* Visual Indicator: Fixed margin bar */}
            <div className="space-y-1.5 relative z-10 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
                <span>Profit Margin</span>
                <span className="text-rose-600 font-bold">65% Food Margin</span>
              </div>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders Card */}
        <Card className="relative overflow-hidden border border-amber-100 bg-gradient-to-br from-white to-[#fffdf7] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          {/* Decorative Glow Blob */}
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block">Active Orders</span>
                <div className="text-3xl font-black text-amber-600 tracking-tight mt-1">
                  {stats.placedOrdersCount + stats.preparingOrdersCount + stats.readyOrdersCount + stats.assignedOrdersCount}
                </div>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0">
                <Flame className="h-5 w-5" />
              </div>
            </div>

            {/* Visual Indicator: Pulsing status bar */}
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 pt-1 relative z-10">
              <span className="flex items-center">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Live Processing
              </span>
              <span>{stats.placedOrdersCount} new / {stats.preparingOrdersCount} cooking</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers Card */}
        <Card className="relative overflow-hidden border border-indigo-100 bg-gradient-to-br from-white to-[#fafaff] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          {/* Decorative Glow Blob */}
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-gradient-to-tr from-indigo-400 to-indigo-200 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity duration-300" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">Active Customers</span>
                <div className="text-3xl font-black text-indigo-600 tracking-tight mt-1">{stats.activeCustomersCount}</div>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </div>

            {/* Visual Indicator: Simulated user avatars stack */}
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 pt-1 relative z-10">
              <span>Customer Base</span>
              <div className="flex -space-x-1.5">
                <div className="h-4.5 w-4.5 rounded-full border border-white bg-slate-200 text-[8px] flex items-center justify-center font-bold text-slate-600">A</div>
                <div className="h-4.5 w-4.5 rounded-full border border-white bg-amber-200 text-[8px] flex items-center justify-center font-bold text-amber-700">R</div>
                <div className="h-4.5 w-4.5 rounded-full border border-white bg-emerald-200 text-[8px] flex items-center justify-center font-bold text-emerald-700">S</div>
                <div className="h-4.5 w-4.5 rounded-full border border-white bg-[#556B2F] text-[7px] text-white flex items-center justify-center font-bold">+</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Hub with Recharts (Beautiful and space saving) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Sales Trend Chart */}
        <Card className="border border-[#d2d2c4] bg-white lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#2d3822] flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-[#556B2F]" /> Recent Sales Trends
            </CardTitle>
            <CardDescription className="text-xs">Sales totals tracked over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-1 min-h-[250px] flex flex-col justify-center">
            {!isMounted ? (
              <div className="text-center text-neutral-400 text-xs py-10 animate-pulse">Loading charts...</div>
            ) : (
              <div className="relative w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: '#556B2F', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#556B2F" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments Mix Pie Chart */}
        <Card className="border border-[#d2d2c4] bg-white flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#2d3822]">Payment Methods</CardTitle>
            <CardDescription className="text-xs">Distribution of payment channels (Cash vs Card vs UPI)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col justify-between">
            {!isMounted ? (
              <div className="text-center text-neutral-400 text-xs py-10 animate-pulse">Loading charts...</div>
            ) : (
              <>
                <div className="h-40 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 leading-none">Total</span>
                    <span className="text-sm font-extrabold text-[#2d3822]">₹{stats.grossSales.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  {paymentChartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-neutral-600">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-[#556B2F]">{item.percentage}% (₹{item.value.toLocaleString()})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Order Status Distribution (Bar Chart) */}
        <Card className="border border-[#d2d2c4] bg-white flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#2d3822]">Orders Status</CardTitle>
            <CardDescription className="text-xs">Active state distribution of orders</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-grow">
            {!isMounted ? (
              <div className="text-center text-neutral-400 text-xs py-10 animate-pulse">Loading charts...</div>
            ) : (
              <div className="relative w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={orderStatusData}
                    margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 9 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      allowDecimals={false}
                      tick={{ fill: '#888888', fontSize: 9 }}
                    />
                    <Tooltip cursor={{ fill: '#f5f5e6', opacity: 0.3 }} />
                    <Bar 
                      dataKey="count" 
                      radius={[3, 3, 0, 0]}
                      maxBarSize={25}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outlet comparison bar chart */}
        <Card className="border border-[#d2d2c4] bg-white lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#2d3822]">Branch Performance</CardTitle>
            <CardDescription className="text-xs">Compare revenues across different outlets</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-grow">
            {!isMounted ? (
              <div className="text-center text-neutral-400 text-xs py-10 animate-pulse">Loading charts...</div>
            ) : (
              <div className="relative w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={outletChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis 
                      type="number"
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `₹${val}`}
                      tick={{ fill: '#888888', fontSize: 9 }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 9 }}
                      width={100}
                    />
                    <Tooltip formatter={(val) => [`₹${val}`, 'Sales']} cursor={{ fill: '#f5f5e6', opacity: 0.3 }} />
                    <Bar 
                      dataKey="sales" 
                      fill="#8FBC8F" 
                      radius={[0, 3, 3, 0]}
                      maxBarSize={15}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lower Section (Outlet Summary) */}
      {userRole !== "Outlet Manager" && (
        <div className="grid gap-6 grid-cols-1">
          <Card className="border border-[#d2d2c4] bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#556B2F]">Outlets Status</CardTitle>
              <CardDescription>List of all active outlets and their revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOutlets.map(o => {
                  const outletOrders = filteredOrders.filter(order => order.outlet === o.name)
                  const totalOrders = outletOrders.length
                  const completedSales = outletOrders
                    .filter(order => order.status !== "CANCELLED" && order.status !== "REJECTED")
                    .reduce((sum, order) => sum + (order.total || 0), 0)
                  const queueCount = outletOrders.filter(order => order.status === "PLACED" || order.status === "PREPARING").length

                  return (
                    <div key={`outlet-summary-${o.id}`} className="flex flex-col justify-between overflow-hidden bg-[#f5f5e6]/20 border border-[#d2d2c4] rounded-xl hover:bg-[#f5f5e6]/40 transition-all shadow-xs h-full min-h-[260px]">
                      {/* Image Banner (Equal Heights) */}
                      <div className="h-32 w-full relative bg-neutral-100 shrink-0">
                        <img 
                          src={o.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop"} 
                          alt={o.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold" : "bg-neutral-100 text-neutral-800"}>
                            {o.status === "ACTIVE" ? "Active" : "Closed"}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                        <div>
                          <p className="text-xs font-bold text-[#2d3822]">{o.name.split("(")[0].trim()}</p>
                          <span className="text-[10px] text-neutral-500 block truncate max-w-[200px]">{o.address}</span>
                        </div>

                        {/* Operational Metrics */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#d2d2c4]/45 text-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Orders</span>
                            <span className="text-xs font-extrabold text-neutral-700">{totalOrders}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Revenue</span>
                            <span className="text-xs font-extrabold text-[#556B2F]">₹{completedSales}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Queue</span>
                            <span className={`text-[10px] font-extrabold block ${queueCount > 0 ? "text-amber-600 animate-pulse" : "text-neutral-500"}`}>
                              {queueCount} active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
