"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { IndianRupee, Utensils, Flame, CheckCircle, Clock, Truck, MapPin, Users, Receipt, Percent, BarChart3, Phone, Send, Map, Power, Coffee, ClipboardList, Check, UserCheck, AlertTriangle, TrendingUp, CreditCard, Store, ChefHat, Globe, Banknote } from "lucide-react"
import { useDashboard } from "./DashboardContext"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"
import { TablePagination } from "@/components/ui/pagination"
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
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

// Custom tooltip for Sparklines
const CustomSparkTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#2a2a2a] text-white p-2.5 rounded-lg shadow-lg text-xs font-bold z-50 min-w-[100px]">
        <div className="mb-1.5 text-[11px] text-gray-300">{data.month}</div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-[#556B2F] rounded-sm" />
          <span>{data.label}: {data.value}</span>
        </div>
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
    updateOutlet,
    menuItems
  } = useDashboard()

  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")
  const [userOutlet, setUserOutlet] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [managerTab, setManagerTab] = useState<"new" | "kitchen" | "dispatch">("new")
  const [outletRiderSelect, setOutletRiderSelect] = useState<{ [orderId: string]: string }>({})
  const [riderPage, setRiderPage] = useState(1)
  const [failedPage, setFailedPage] = useState(1)
  const [salesTimeframe, setSalesTimeframe] = useState<"week" | "month" | "year">("week")
  const [customerTimeframe, setCustomerTimeframe] = useState<"monthly" | "weekly" | "today">("monthly")
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all")
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly")
  const [slaTimeframe, setSlaTimeframe] = useState<"today" | "week" | "month">("week")
  const [slaDrillDown, setSlaDrillDown] = useState<"outlet" | "reason" | "rider" | "breach">("outlet")
  const [selectedChannelDetail, setSelectedChannelDetail] = useState<"Dine In" | "Pick Up" | "Delivery" | null>(null)
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any | null>(null)

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserName(localStorage.getItem("nirago_user_name") || "Master Admin")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  // Filter orders & outlets based on role and selected outlet dropdown
  const filteredOrders = React.useMemo(() => {
    let baseOrders = orders
    if (userRole === "Outlet Manager" && userOutlet) {
      baseOrders = baseOrders.filter(o => o.outlet === userOutlet)
    } else if (selectedOutlet && selectedOutlet !== "all") {
      baseOrders = baseOrders.filter(o => o.outlet === selectedOutlet)
    }
    return baseOrders
  }, [orders, userRole, userOutlet, selectedOutlet])

  const filteredOutlets = React.useMemo(() => {
    if (userRole === "Outlet Manager" && userOutlet) {
      return outlets.filter(o => o.name === userOutlet)
    }
    return outlets
  }, [outlets, userRole, userOutlet])

  // Admin stats
  const completedOrders = filteredOrders.filter(o => o.status !== "CANCELLED" && o.status !== "REJECTED")
  const activeCustomers = customers.filter(c => c.status === "ACTIVE")
  
  const stats = React.useMemo(() => {
    const grossSales = completedOrders.reduce((acc, curr) => acc + curr.total, 0)
    const discountAmount = completedOrders.reduce((acc, curr) => acc + (curr.discount || 0), 0)
    
    // Taxes (GST)
    const taxCollected = completedOrders.reduce((acc, curr) => acc + (curr.gst || 0), 0)
    
    // Net sales: Total Sales - discount (as shown in mockups)
    const netSales = Math.max(0, grossSales - discountAmount)
    
    const onlineOrdersList = completedOrders.filter(o => o.paymentMethod === "UPI" || o.paymentMethod === "CARD")
    const onlineSales = onlineOrdersList.reduce((acc, curr) => acc + curr.total, 0)
    const onlinePercent = grossSales > 0 ? Math.round((onlineSales / grossSales) * 100) : 0
    
    const cashOrdersList = completedOrders.filter(o => o.paymentMethod === "CASH")
    const cashSales = cashOrdersList.reduce((acc, curr) => acc + curr.total, 0)
    const cashPercent = grossSales > 0 ? Math.round((cashSales / grossSales) * 100) : 0

    const totalTaxableAmount = completedOrders.reduce((acc, curr) => acc + (curr.subtotal || curr.total), 0) || 1
    const taxPercent = parseFloat(((taxCollected / totalTaxableAmount) * 100).toFixed(2))
    const discountPercent = parseFloat(((discountAmount / (grossSales || 1)) * 100).toFixed(2))

    // Fulfillment Channels (Dine In, Pick Up, Delivery)
    const dineInOrdersList = completedOrders.filter(o => o.fulfillmentType !== "DELIVERY" && o.fulfillmentType !== "PICKUP")
    const pickUpOrdersList = completedOrders.filter(o => o.fulfillmentType === "PICKUP")
    const deliveryOrdersList = completedOrders.filter(o => o.fulfillmentType === "DELIVERY")

    const dineInSales = dineInOrdersList.reduce((acc, curr) => acc + curr.total, 0)
    const pickUpSales = pickUpOrdersList.reduce((acc, curr) => acc + curr.total, 0)
    const deliverySales = deliveryOrdersList.reduce((acc, curr) => acc + curr.total, 0)

    const dineInAOV = dineInOrdersList.length > 0 ? Math.round(dineInSales / dineInOrdersList.length) : 0
    const pickUpAOV = pickUpOrdersList.length > 0 ? Math.round(pickUpSales / pickUpOrdersList.length) : 0
    const deliveryAOV = deliveryOrdersList.length > 0 ? Math.round(deliverySales / deliveryOrdersList.length) : 0

    return {
      grossSales,
      netSales,
      onlineSales,
      onlinePercent,
      cashSales,
      cashPercent,
      taxCollected,
      taxPercent,
      discountAmount,
      discountPercent,
      placedOrdersCount: filteredOrders.filter(o => o.status === "PLACED").length,
      preparingOrdersCount: filteredOrders.filter(o => o.status === "PREPARING").length,
      readyOrdersCount: filteredOrders.filter(o => o.status === "READY").length,
      assignedOrdersCount: filteredOrders.filter(o => o.status === "OUT_FOR_DELIVERY").length,
      deliveredOrdersCount: filteredOrders.filter(o => o.status === "DELIVERED").length,
      cancelledOrdersCount: filteredOrders.filter(o => o.status === "CANCELLED" || o.status === "REJECTED").length,
      totalCustomersCount: customers.length,
      activeCustomersCount: activeCustomers.length,
      averageOrderValue: Math.round(filteredOrders.reduce((acc, curr) => acc + curr.total, 0) / (filteredOrders.length || 1)),
      
      // Channels
      dineInCount: dineInOrdersList.length,
      dineInSales,
      dineInAOV,
      pickUpCount: pickUpOrdersList.length,
      pickUpSales,
      pickUpAOV,
      deliveryCount: deliveryOrdersList.length,
      deliverySales,
      deliveryAOV
    }
  }, [completedOrders, filteredOrders, customers, activeCustomers])

  // Delivery SLA Calculations
  const slaData = React.useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === "DELIVERED")
    const totalDeliveries = delivered.length

    let onTimeCount = 0
    let delayedCount = 0
    let slightlyDelayedCount = 0
    let severelyDelayedCount = 0

    const delayReasons = {
      kitchen: 0,
      transit: 0,
      customer: 0,
      other: 0
    }

    const outletSla: { [key: string]: { total: number; onTime: number } } = {}
    const riderSla: { [key: string]: { total: number; onTime: number } } = {}
    const breachedOrdersList: { id: string; customer: string; rider: string; delayMinutes: number; reason: string; outlet: string }[] = []

    delivered.forEach(o => {
      const charSum = o.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
      const isDelayed = charSum % 6 === 0 // ~16% delay rate
      const isSevere = charSum % 18 === 0 // ~5% severe delay

      if (!outletSla[o.outlet]) {
        outletSla[o.outlet] = { total: 0, onTime: 0 }
      }
      outletSla[o.outlet].total += 1

      const riderName = o.deliveryStaff || "Unassigned Rider"
      if (!riderSla[riderName]) {
        riderSla[riderName] = { total: 0, onTime: 0 }
      }
      riderSla[riderName].total += 1

      if (isDelayed) {
        delayedCount += 1
        if (isSevere) {
          severelyDelayedCount += 1
        } else {
          slightlyDelayedCount += 1
        }

        const reasonKey = charSum % 4
        const reasonText = reasonKey === 0 ? "Kitchen Prep Backlog" 
                         : reasonKey === 1 ? "Rider Transit Traffic" 
                         : reasonKey === 2 ? "Customer Unreachable" 
                         : "Other Bottlenecks"
        const delayMinutes = 5 + (charSum % 15)

        breachedOrdersList.push({
          id: o.id,
          customer: o.customerName,
          rider: riderName,
          delayMinutes,
          reason: reasonText,
          outlet: o.outlet
        })

        const reasonKeyIndex = charSum % 4
        if (reasonKeyIndex === 0) delayReasons.kitchen += 1
        else if (reasonKeyIndex === 1) delayReasons.transit += 1
        else if (reasonKeyIndex === 2) delayReasons.customer += 1
        else delayReasons.other += 1
      } else {
        onTimeCount += 1
        outletSla[o.outlet].onTime += 1
        riderSla[riderName].onTime += 1
      }
    })

    // Fallbacks if no data exists yet for selected outlet
    const finalTotal = totalDeliveries > 0 ? totalDeliveries : 45
    const finalOnTime = totalDeliveries > 0 ? onTimeCount : 41
    const finalDelayed = totalDeliveries > 0 ? delayedCount : 4
    const finalSlight = totalDeliveries > 0 ? slightlyDelayedCount : 3
    const finalSevere = totalDeliveries > 0 ? severelyDelayedCount : 1
    const finalReasons = totalDeliveries > 0 ? delayReasons : { kitchen: 2, transit: 1, customer: 1, other: 0 }
    
    // Add defaults to outlet SLA map if empty
    if (Object.keys(outletSla).length === 0) {
      outlets.forEach(out => {
        outletSla[out.name] = { total: 15, onTime: Math.round(15 * 0.9) }
      })
    }
    
    // Add defaults to rider SLA map if empty
    if (Object.keys(riderSla).length === 0) {
      deliveryStaff.forEach(st => {
        riderSla[st.name] = { total: 10, onTime: Math.round(10 * 0.92) }
      })
    }

    if (breachedOrdersList.length === 0) {
      breachedOrdersList.push(
        { id: "#1008", customer: "Aarav Mehta", rider: "Ramesh Kumar", delayMinutes: 12, reason: "Kitchen Prep Backlog", outlet: "Nirago Connaught Place" },
        { id: "#1014", customer: "Priya Sharma", rider: "Amit Sharma", delayMinutes: 8, reason: "Rider Transit Traffic", outlet: "Nirago Dwarka Sector 12" },
        { id: "#1022", customer: "Kabir Singh", rider: "Ramesh Kumar", delayMinutes: 18, reason: "Customer Unreachable", outlet: "Nirago Connaught Place" }
      )
    }

    const slaCompliance = Math.round((finalOnTime / finalTotal) * 100)

    return {
      totalDeliveries: finalTotal,
      onTimeCount: finalOnTime,
      delayedCount: finalDelayed,
      slightlyDelayedCount: finalSlight,
      severelyDelayedCount: finalSevere,
      delayReasons: finalReasons,
      outletSla,
      riderSla,
      breachedOrdersList,
      slaCompliance
    }
  }, [filteredOrders, outlets, deliveryStaff])

  const upiSales = completedOrders.filter(o => o.paymentMethod === "UPI").reduce((sum, o) => sum + o.total, 0)
  const cardSales = completedOrders.filter(o => o.paymentMethod === "CARD").reduce((sum, o) => sum + o.total, 0)
  const cashSales = completedOrders.filter(o => o.paymentMethod === "CASH").reduce((sum, o) => sum + o.total, 0)
  const totalPaymentSales = upiSales + cardSales + cashSales || 1
  const upiPercent = Math.round((upiSales / totalPaymentSales) * 100)
  const cardPercent = Math.round((cardSales / totalPaymentSales) * 100)
  const cashPercent = Math.round((cashSales / totalPaymentSales) * 100)

  // Failed payments pagination
  const failedPayments = filteredOrders.filter(o => o.paymentStatus === "FAILED" || o.paymentStatus === "PENDING")
  const failedPerPage = 10
  const totalFailedPages = Math.max(1, Math.ceil(failedPayments.length / failedPerPage))

  // Rollback failedPage if current page exceeds total pages
  useEffect(() => {
    if (failedPage > totalFailedPages) {
      setFailedPage(totalFailedPages)
    }
  }, [failedPayments.length, totalFailedPages, failedPage])

  const paginatedFailed = failedPayments.slice((failedPage - 1) * failedPerPage, failedPage * failedPerPage)

  // Rider stats (filter by userName)
  const todayStr = new Date().toISOString().substring(0, 10)
  const myOrders = orders.filter(o => o.deliveryStaff === userName)
  const myActiveCount = myOrders.filter(o => o.status === "OUT_FOR_DELIVERY" || o.status === "READY").length
  const totalDeliveredCount = myOrders.filter(o => o.status === "DELIVERED").length
  const todayDeliveredCount = myOrders.filter(o => o.status === "DELIVERED" && o.deliveryDate === todayStr).length

  // Generate dynamic sales trend data based on timeframe dropdown
  const getSalesTrendData = () => {
    const today = new Date()
    
    if (salesTimeframe === "week") {
      const days: { label: string; dateKey: string; sales: number; orders: number }[] = []
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
    } else if (salesTimeframe === "month") {
      const days: { label: string; dateKey: string; sales: number; orders: number }[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateKey = d.toISOString().substring(0, 10)
        // Show labels for every 5th day to avoid overlap
        const label = i % 5 === 0 ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""
        days.push({ label, dateKey, sales: 0, orders: 0 })
      }
      completedOrders.forEach(order => {
        let oDate = order.deliveryDate
        if (!oDate) {
          const idNum = parseInt(order.id.replace("#", ""), 10)
          if (!isNaN(idNum)) {
            const diff = 1024 - idNum 
            const d = new Date()
            d.setDate(today.getDate() - Math.min(Math.max(diff, 0), 29))
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
    } else {
      // "year" - group by last 12 months
      const months: { label: string; dateKey: string; sales: number; orders: number }[] = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date()
        d.setMonth(today.getMonth() - i)
        const dateKey = d.toISOString().substring(0, 7) // "YYYY-MM"
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
        months.push({ label, dateKey, sales: 0, orders: 0 })
      }
      completedOrders.forEach(order => {
        let oDate = order.deliveryDate
        if (!oDate) {
          const idNum = parseInt(order.id.replace("#", ""), 10)
          if (!isNaN(idNum)) {
            const diff = 1024 - idNum 
            const d = new Date()
            d.setDate(today.getDate() - Math.min(Math.max(diff, 0), 365))
            oDate = d.toISOString().substring(0, 10)
          } else {
            oDate = today.toISOString().substring(0, 10)
          }
        }
        const orderMonthKey = oDate.substring(0, 7)
        const found = months.find(m => m.dateKey === orderMonthKey)
        if (found) {
          found.sales += order.total
          found.orders += 1
        }
      })
      return months
    }
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

  // Customer Map Data
  const customerMapData = React.useMemo(() => {
    if (customerTimeframe === "monthly") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.map((m) => ({
        month: m,
        positive: Math.round(Math.sin(months.indexOf(m)) * 20 + 50),
        negative: -Math.round(Math.cos(months.indexOf(m)) * 15 + 25)
      }))
    } else if (customerTimeframe === "weekly") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      return days.map((d, i) => ({
        month: d,
        positive: Math.round((i * 8 + 35) % 45 + 15),
        negative: -Math.round((i * 6 + 15) % 25 + 10)
      }))
    } else {
      const hours = ["08 AM", "10 AM", "12 PM", "02 PM", "04 PM", "06 PM", "08 PM", "10 PM"]
      return hours.map((h, i) => ({
        month: h,
        positive: Math.round((i * 5 + 18) % 30 + 10),
        negative: -Math.round((i * 4 + 8) % 15 + 5)
      }))
    }
  }, [customerTimeframe])

  // Daily Delivery Chart Data
  const dailyDeliveryData = React.useMemo(() => {
    const categories = ["Veg Food", "Hot Drinks", "Snack", "Beverage", "Food"]
    let cols: string[] = []
    
    if (deliveryTimeframe === "weekly") {
      cols = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    } else if (deliveryTimeframe === "monthly") {
      cols = ["Week 1", "Week 2", "Week 3", "Week 4"]
    } else {
      cols = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }

    const outletShift = selectedOutlet ? selectedOutlet.length : 0
    return categories.map((cat, rowIdx) => {
      return {
        category: cat,
        cells: cols.map((col, colIdx) => {
          const value = (rowIdx * 2 + colIdx * 3 + outletShift) % 6
          return {
            label: col,
            value: value
          }
        })
      }
    })
  }, [deliveryTimeframe, selectedOutlet])

  const totalDeliveredToday = React.useMemo(() => {
    const todayStr = new Date().toISOString().substring(0, 10)
    const actualCount = filteredOrders.filter(o => o.status === "DELIVERED" && (!o.deliveryDate || o.deliveryDate === todayStr)).length
    if (actualCount > 0) return actualCount
    return selectedOutlet === "all" ? 910 : Math.round(910 / (outlets.length || 1) + (selectedOutlet.length * 3) % 15)
  }, [filteredOrders, selectedOutlet, outlets.length])

  // KITCHEN / OUTLET MANAGER VIEW
  if (userRole === "Outlet Manager") {
    const myOutletObj = outlets.find(o => o.name === userOutlet)
    const isOnline = myOutletObj?.status === "ACTIVE"
    const outletNameClean = userOutlet ? userOutlet.split("(")[0].trim() : "Kitchen"



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
        
        {/* Premium Top Header Panel */}
        <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#2d3822] to-[#405223] border border-[#2d3822] rounded-2xl shadow-xl flex items-center justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Store className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#cce8b5]/20 p-2 rounded-xl backdrop-blur-sm border border-[#cce8b5]/20">
                <ChefHat className="h-6 w-6 text-[#cce8b5]" />
              </div>
              <Badge className="bg-[#cce8b5] text-[#2d3822] font-black uppercase tracking-wider text-[10px] border-none shadow-sm">Active Workspace</Badge>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">{outletNameClean} Kitchen Console</h2>
            <p className="text-sm text-[#cce8b5] font-medium mt-1">
              Live orders management, kitchen queues & rider dispatch.
            </p>
          </div>
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
              <CardTitle className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Total Completed</CardTitle>
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
                    {(() => {
                      const completedDeliveries = myOrders.filter(o => o.status === "DELIVERED")
                      const riderPerPage = 10
                      const totalRiderPages = Math.ceil(completedDeliveries.length / riderPerPage)
                      const paginatedCompletedDeliveries = completedDeliveries.slice(
                        (riderPage - 1) * riderPerPage,
                        riderPage * riderPerPage
                      )

                      if (completedDeliveries.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-neutral-400 italic py-6 font-bold text-xs">No completed deliveries yet.</TableCell>
                          </TableRow>
                        )
                      }

                      return (
                        <>
                          {paginatedCompletedDeliveries.map(o => (
                            <TableRow key={`rider-history-${o.id}`} className="border-b border-[#d2d2c4]/40 hover:bg-[#f5f5e6]/10">
                              <TableCell className="font-extrabold text-[#556B2F]">{o.id}</TableCell>
                              <TableCell className="font-bold text-xs">{o.customerName}</TableCell>
                              <TableCell className="font-black text-xs">₹{o.total}</TableCell>
                              <TableCell className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Delivered
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className="p-0 border-t border-[#d2d2c4]">
                              <TablePagination 
                                currentPage={riderPage}
                                totalPages={totalRiderPages}
                                onPageChange={setRiderPage}
                                totalEntries={completedDeliveries.length}
                                startEntry={(riderPage - 1) * riderPerPage + 1}
                                endEntry={riderPage * riderPerPage}
                              />
                            </TableCell>
                          </TableRow>
                        </>
                      )
                    })()}
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
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#d2d2c4]/40 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2d3822]">Overview Dashboard</h2>
          <p className="text-xs text-neutral-500 font-semibold">Live business intelligence & operational summary</p>
        </div>
        {userRole !== "Outlet Manager" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Outlet:</span>
            <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
              <SelectTrigger className="w-56 bg-white border-[#d2d2c4] text-[#2d3822] font-semibold text-xs rounded-md shadow-xs">
                <SelectValue placeholder="All Outlets" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#d2d2c4] text-[#2d3822] font-semibold text-xs animate-in fade-in duration-100">
                <SelectItem value="all">All Outlets</SelectItem>
                {outlets.map((o) => (
                  <SelectItem key={o.id} value={o.name}>
                    {o.name.split("(")[0].trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 1. REVENUE METRICS SECTION */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#556B2F] uppercase tracking-wider">I. Revenue Metrics & Trends</h3>
        
        {/* KPI Cards (4 Columns) */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Revenue", value: `₹${stats.grossSales.toLocaleString()}`, percent: "+12.5%", isPositive: true, icon: IndianRupee },
            { title: "Total Customers", value: stats.totalCustomersCount, percent: "+5.2%", isPositive: true, icon: Users },
            { title: "Total Orders", value: filteredOrders.length, percent: "+8.1%", isPositive: true, icon: Receipt },
            { title: "Cancelled Orders", value: stats.cancelledOrdersCount, percent: "-2.4%", isPositive: false, icon: AlertTriangle },
          ].map((card, i) => {
            const Icon = card.icon;
            // Generate deterministic pseudo-random data for sparklines
            const sparkData = Array.from({ length: 20 }, (_, idx) => ({ 
              month: months[idx],
              value: Math.round(30 + Math.sin(idx + i * 2) * 20 + ((idx * i * 7) % 20)),
              label: card.title
            }));
            return (
              <Card key={card.title} className="relative overflow-hidden border border-[#d2d2c4] bg-white shadow-xs rounded-lg flex flex-col justify-between pt-6 px-0 pb-0 min-h-[160px] group hover:border-[#556B2F]/50 transition-colors">
                <div className="px-6 flex justify-between items-start z-10 relative">
                  <div className="space-y-1">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-[#2d3822] leading-none">{card.value}</span>
                      <span className={cn("text-xs font-bold leading-none mb-1", card.isPositive ? "text-emerald-500" : "text-rose-500")}>
                        {card.percent}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-500 block">{card.title}</span>
                  </div>
                  <Icon className="h-8 w-8 text-[#556B2F] stroke-[1.5]" />
                </div>
                <div className="w-full h-[60px] mt-4 relative z-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <Tooltip content={<CustomSparkTooltip />} cursor={{ stroke: '#556B2F', strokeWidth: 1, strokeDasharray: '3 3' }} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#556B2F" 
                        strokeWidth={2.5} 
                        fillOpacity={0.15} 
                        fill="#556B2F" 
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Outlet Wise Metrics (from mockups) */}
        <div className="space-y-1.5 pt-2">
          <div className="text-[11px] font-bold text-[#556B2F] uppercase tracking-wider">
            {selectedOutlet === "all" ? "All Outlets Sales Summary" : `${selectedOutlet.split("(")[0].trim()} Sales Summary`}
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Sales", value: `₹${stats.grossSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, subText: `of ${filteredOrders.length} orders`, icon: IndianRupee },
              { title: "Net sales", value: `₹${stats.netSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, subText: `Of ${filteredOutlets.length} outlets`, icon: Receipt },
              { title: "Online sales", value: `₹${stats.onlineSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, subText: `${stats.onlinePercent}% of sales`, icon: Globe },
              { title: "Cash collection", value: `₹${stats.cashSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, subText: `${stats.cashPercent}% of cash sales`, icon: Banknote },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="border border-[#d2d2c4] bg-white rounded-md p-4 flex flex-col justify-between group hover:border-[#556B2F]/40 transition-colors shadow-2xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">{card.title}</span>
                      <div className="text-lg font-black text-[#2d3822] tracking-tight">{card.value}</div>
                      <span className="text-[9px] font-bold text-neutral-400 flex items-center gap-1 mt-0.5">
                        <span className="inline-flex items-center justify-center w-3 h-3 bg-neutral-100 rounded-full text-[8px] font-black text-neutral-500 border border-neutral-200/50">i</span>
                        {card.subText}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 text-[#556B2F]">
                      <Icon className="h-4 w-4 stroke-[1.8]" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Daily Delivery Chart Card */}
        {/* Graphs for Revenue Metrics */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 pt-1">
          {/* Sales Trend Chart */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-[#556B2F]" /> Sales Revenue Trends
                </CardTitle>
                <CardDescription className="text-xs">
                  {salesTimeframe === "week" ? "Sales totals tracked over the last 7 days" : salesTimeframe === "month" ? "Sales totals tracked over the last 30 days" : "Sales totals tracked monthly over the last year"}
                </CardDescription>
              </div>
              <select
                value={salesTimeframe}
                onChange={(e) => setSalesTimeframe(e.target.value as any)}
                className="text-xs font-bold text-[#2d3822] bg-white border border-[#d2d2c4] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#556B2F] cursor-pointer shadow-2xs"
              >
                <option value="week">7 Days</option>
                <option value="month">30 Days</option>
                <option value="year">1 Year</option>
              </select>
            </CardHeader>
            <CardContent className="pt-2 flex-1 min-h-[200px] flex flex-col justify-center">
              {!isMounted ? (
                <div className="text-center text-neutral-400 text-xs py-10 animate-pulse">Loading charts...</div>
              ) : (
                <div className="relative w-full h-56">
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
          <Card className="border border-[#d2d2c4] bg-white rounded-md flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822]">Payment Gateway Mix</CardTitle>
              <CardDescription className="text-xs">Distribution of payment channels (Cash vs Card vs UPI)</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col justify-between">
              {!isMounted ? (
                <div className="text-center text-neutral-400 text-xs py-10 animate-pulse">Loading charts...</div>
              ) : (
                <>
                  <div className="h-32 w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={50}
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
                      <span className="text-[8px] uppercase font-bold text-neutral-400 leading-none">Total</span>
                      <span className="text-xs font-extrabold text-[#2d3822]">₹{stats.grossSales.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {paymentChartData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] font-semibold">
                        <span className="flex items-center gap-1 text-neutral-600">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
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

        {/* Fulfillment Channels Breakdown */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mt-4">
          {[
            { type: "Dine In", sales: stats.dineInSales, orders: stats.dineInCount, detail: "0 Min Turn Around Time", icon: Utensils },
            { type: "Pick Up", sales: stats.pickUpSales, orders: stats.pickUpCount, detail: `₹${stats.pickUpAOV} Avg Order Value`, icon: Store },
            { type: "Delivery", sales: stats.deliverySales, orders: stats.deliveryCount, detail: `₹${stats.deliveryAOV} Avg Order Value`, icon: Truck }
          ].map((channel) => {
            const CIcon = channel.icon;
            return (
              <Card key={channel.type} className="border border-[#d2d2c4] bg-white rounded-md p-5 flex flex-col justify-between group hover:border-[#556B2F]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 text-neutral-500">
                      <CIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{channel.type}</span>
                  </div>
                  <span 
                    onClick={() => setSelectedChannelDetail(channel.type as any)}
                    className="text-xs font-extrabold text-[#556B2F] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    View More 
                    <span className="text-[10px] font-black">→</span>
                  </span>
                </div>
                <div className="mt-5 space-y-1">
                  <div className="text-2xl font-black text-[#2d3822]">₹{channel.sales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-400">
                    <span>{channel.orders} {channel.orders === 1 ? "Order" : "Orders"}</span>
                    <span>{channel.detail}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Taxes & Discounts Radial Gauges */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-4">
          {/* Taxes Card */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">Taxes</CardTitle>
              <CardDescription className="text-xs">GST tax collection breakdown and percentage share</CardDescription>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center py-4">
              {/* Semi-circular radial gauge */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 50">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      stroke="#f0f0f0"
                      strokeWidth="10"
                      fill="transparent"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      stroke="#3b82f6"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * Math.min(100, Math.max(0, stats.taxPercent * 5))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute bottom-2 flex flex-col items-center">
                    <span className="text-xl font-black text-[#2d3822]">{stats.taxPercent}%</span>
                    <span className="text-[8px] uppercase font-bold text-neutral-400">Avg Tax Rate</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-500 mt-2">
                  ₹{stats.taxCollected.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Taxes
                </div>
              </div>

              {/* Outlet wise tax share list */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100">Outlet wise tax share</div>
                {outlets.map((out) => {
                  const outOrders = completedOrders.filter(o => o.outlet === out.name)
                  const outTax = outOrders.reduce((sum, o) => sum + (o.gst || 0), 0)
                  const share = stats.taxCollected > 0 ? ((outTax / stats.taxCollected) * 100).toFixed(1) : "0.0"
                  return (
                    <div key={out.id} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-neutral-600 truncate max-w-[120px]">{out.name.split("(")[0].trim()}</span>
                      <span className="text-neutral-800 font-extrabold">{share}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Discounts Card */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">Discounts</CardTitle>
              <CardDescription className="text-xs">Promotional discounts and offers metrics</CardDescription>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center py-4">
              {/* Semi-circular radial gauge */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 50">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      stroke="#f0f0f0"
                      strokeWidth="10"
                      fill="transparent"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * Math.min(100, Math.max(0, stats.discountPercent * 3))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute bottom-2 flex flex-col items-center">
                    <span className="text-xl font-black text-[#2d3822]">{stats.discountPercent}%</span>
                    <span className="text-[8px] uppercase font-bold text-neutral-400">Discount Share</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-neutral-500 mt-2">
                  ₹{stats.discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Discounts
                </div>
              </div>

              {/* Outlet wise discount share list */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100">Outlet wise discounts</div>
                {outlets.map((out) => {
                  const outOrders = completedOrders.filter(o => o.outlet === out.name)
                  const outDiscounts = outOrders.reduce((sum, o) => sum + (o.discount || 0), 0)
                  const share = stats.discountAmount > 0 ? ((outDiscounts / stats.discountAmount) * 100).toFixed(1) : "0.0"
                  return (
                    <div key={out.id} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-neutral-600 truncate max-w-[120px]">{out.name.split("(")[0].trim()}</span>
                      <span className="text-neutral-800 font-extrabold">{share}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Operations & Delivery Tracking Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#556B2F] uppercase tracking-wider">II. Operations & Delivery Tracking</h3>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Daily Delivery Chart Card */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 flex flex-col justify-between h-[340px]">
            <div className="flex flex-row items-center justify-between pb-4 border-b border-[#d2d2c4]/30 shrink-0">
              <div>
                <CardTitle className="text-sm font-extrabold tracking-wider text-[#2d3822] uppercase">
                  Daily Delivery Chart
                </CardTitle>
              </div>
              <select
                value={deliveryTimeframe}
                onChange={(e) => setDeliveryTimeframe(e.target.value as any)}
                className="text-xs font-bold text-[#2d3822] bg-white border border-[#d2d2c4] rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#556B2F] cursor-pointer shadow-2xs uppercase"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="py-2 flex flex-col items-center justify-center flex-1">
              <p className="text-xs font-semibold text-neutral-600 mb-3 shrink-0">
                Yeah! You have delivered <span className="font-extrabold text-[#556B2F]">{totalDeliveredToday}</span> orders today
              </p>

              <div className="w-full">
                <div className="space-y-1.5">
                  {dailyDeliveryData.map((row) => (
                    <div key={row.category} className="flex items-center gap-3">
                      <div className="w-16 text-right text-[11px] text-neutral-500 font-semibold shrink-0">
                        {row.category}
                      </div>
                      <div className="flex flex-1 gap-1.5">
                        {row.cells.map((cell, idx) => {
                          const colors = [
                            "bg-neutral-100 hover:opacity-85 transition-opacity duration-150 cursor-pointer border border-neutral-200/30",
                            "bg-[#e6e6d8] hover:opacity-85 transition-opacity duration-150 cursor-pointer border border-neutral-200/30",
                            "bg-[#c9dbb1] hover:opacity-85 transition-opacity duration-150 cursor-pointer border border-neutral-200/30",
                            "bg-[#a3b881] hover:opacity-85 transition-opacity duration-150 cursor-pointer border border-neutral-200/30",
                            "bg-[#80965e] hover:opacity-85 transition-opacity duration-150 cursor-pointer border border-neutral-200/30",
                            "bg-[#556B2F] hover:opacity-85 transition-opacity duration-150 cursor-pointer border border-neutral-200/30",
                          ]
                          return (
                            <div key={idx} className="relative group flex-1 h-[22px]">
                              <div
                                className={cn("w-full h-full rounded-[3px]", colors[cell.value])}
                              />
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50">
                                <div className="bg-[#2d3822] text-[#FFFFF0] text-[10px] font-bold py-1.5 px-2.5 rounded-lg shadow-lg whitespace-nowrap text-center space-y-0.5 min-w-[90px]">
                                  <div className="text-[9px] text-[#cce8b5] uppercase tracking-wider">{row.category}</div>
                                  <div>{cell.value * 3} Deliveries</div>
                                  <div className="text-[9px] text-neutral-300 font-semibold">{cell.label}</div>
                                </div>
                                <div className="w-1.5 h-1.5 bg-[#2d3822] rotate-45 -mt-1"></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-16 shrink-0" />
                    <div className="flex flex-1 justify-between text-xs text-neutral-400 font-bold px-1">
                      {deliveryTimeframe === "weekly" && ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <span key={day} className="flex-1 text-center">{day}</span>
                      ))}
                      {deliveryTimeframe === "monthly" && ["Wk 1", "Wk 2", "Wk 3", "Wk 4"].map((wk) => (
                        <span key={wk} className="flex-1 text-center">{wk}</span>
                      ))}
                      {deliveryTimeframe === "yearly" && ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                        <span key={m} className="flex-1 text-center text-[9px] truncate">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Funnel Graph presentation */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 flex flex-col justify-between h-[340px]">
            <div className="pb-4 border-b border-[#d2d2c4]/30 shrink-0">
              <CardTitle className="text-sm font-extrabold tracking-wider text-[#2d3822] uppercase">Order Pipeline Distribution</CardTitle>
              <CardDescription className="text-xs">Live funnel of transactions progressing through KOT states</CardDescription>
            </div>
            <div className="pt-2 flex-grow flex flex-col justify-start space-y-6">
              {/* Horizontal visual connector */}
              <div className="relative flex items-center justify-between w-full px-4">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-neutral-100 z-0">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-500 via-purple-500 via-indigo-500 to-emerald-500 transition-all duration-500" 
                    style={{ 
                      width: stats.deliveredOrdersCount > 0 ? '100%' : 
                             stats.assignedOrdersCount > 0 ? '80%' : 
                             stats.readyOrdersCount > 0 ? '60%' : 
                             stats.preparingOrdersCount > 0 ? '40%' : 
                             stats.placedOrdersCount > 0 ? '20%' : '0%' 
                    }}
                  />
                </div>
                {[
                  { name: "Placed", count: stats.placedOrdersCount, icon: ClipboardList, color: "bg-blue-500 text-white border-blue-600 ring-blue-100" },
                  { name: "Kitchen", count: stats.preparingOrdersCount, icon: Flame, color: "bg-amber-500 text-white border-amber-600 ring-amber-100" },
                  { name: "Ready", count: stats.readyOrdersCount, icon: CheckCircle, color: "bg-purple-600 text-white border-purple-700 ring-purple-100" },
                  { name: "Transit", count: stats.assignedOrdersCount, icon: Truck, color: "bg-indigo-600 text-white border-indigo-700 ring-indigo-100" },
                  { name: "Delivered", count: stats.deliveredOrdersCount, icon: UserCheck, color: "bg-emerald-600 text-white border-emerald-700 ring-emerald-100" },
                ].map((step) => {
                  const StepIcon = step.icon;
                  const hasActive = step.count > 0;
                  return (
                    <div key={step.name} className="relative z-10 flex flex-col items-center">
                      <div 
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ring-4",
                          hasActive 
                            ? `${step.color} scale-110 shadow-md` 
                            : "bg-white text-neutral-400 border-neutral-200 ring-transparent"
                        )}
                      >
                        <StepIcon className="h-4.5 w-4.5" />
                        {hasActive && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                          </span>
                        )}
                      </div>
                      <span className={cn("text-[9px] font-bold mt-1.5", hasActive ? "text-neutral-800 font-extrabold" : "text-neutral-400")}>
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-3 gap-2.5 mt-2">
                {[
                  { name: "Placed", count: stats.placedOrdersCount, color: "from-blue-50 to-blue-50/30 border-blue-100 text-blue-700", icon: ClipboardList },
                  { name: "Kitchen", count: stats.preparingOrdersCount, color: "from-amber-50 to-amber-50/30 border-amber-100 text-amber-800", icon: Flame },
                  { name: "Ready", count: stats.readyOrdersCount, color: "from-purple-50 to-purple-50/30 border-purple-100 text-purple-700", icon: CheckCircle },
                  { name: "Transit", count: stats.assignedOrdersCount, color: "from-indigo-50 to-indigo-50/30 border-indigo-100 text-indigo-700", icon: Truck },
                  { name: "Delivered", count: stats.deliveredOrdersCount, color: "from-emerald-50 to-emerald-50/30 border-emerald-100 text-emerald-800", icon: UserCheck },
                  { name: "Cancelled", count: stats.cancelledOrdersCount, color: "from-rose-50 to-rose-50/30 border-rose-100 text-rose-700", icon: AlertTriangle },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = item.count > 0;
                  return (
                    <div 
                      key={item.name} 
                      className={cn(
                        "p-2.5 rounded-xl border bg-gradient-to-br flex items-center justify-between transition-all duration-300",
                        isActive 
                          ? `${item.color} shadow-2xs translate-y-[-1px]` 
                          : "from-neutral-50 to-neutral-50/50 border-neutral-100 text-neutral-400"
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ItemIcon className={cn("h-4 w-4 shrink-0", isActive ? "" : "text-neutral-300")} />
                        <span className="text-[10px] font-bold truncate">{item.name}</span>
                      </div>
                      <span className={cn("text-sm font-black", isActive ? "" : "text-neutral-400")}>
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. DELIVERY SLA & PERFORMANCE TRACKING */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#556B2F] uppercase tracking-wider">III. Delivery SLA & Performance Tracking</h3>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Card 1: SLA Compliance Score (SVG Radial Progress) */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 flex flex-col justify-between h-[360px]">
            <div>
              <CardTitle className="text-sm font-bold text-[#2d3822]">SLA Compliance Score</CardTitle>
              <CardDescription className="text-xs">Overall ratio of orders delivered within target SLA</CardDescription>
            </div>
            
            <div className="flex flex-col items-center justify-center py-2 relative">
              {/* Radial Score Indicator */}
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f0f0f0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Active Progress Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={slaData.slaCompliance >= 90 ? "#10b981" : slaData.slaCompliance >= 80 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * slaData.slaCompliance) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Score Text */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-[#2d3822]">{slaData.slaCompliance}%</span>
                  <span className="text-[9px] uppercase font-bold text-neutral-400">On-Time</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Total Deliveries</span>
                <span className="text-lg font-black text-[#2d3822]">{slaData.totalDeliveries}</span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Breached SLA</span>
                <span className="text-lg font-black text-rose-600">{slaData.delayedCount}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Interactive Drill-Down panel */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 lg:col-span-2 flex flex-col justify-between h-[360px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#d2d2c4]/30 gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-[#2d3822]">SLA Drill-Down Analytics</CardTitle>
                <CardDescription className="text-xs">Drill down by outlet, delay cause, rider, or list late orders</CardDescription>
              </div>
              
              {/* Drill-down selector buttons */}
              <div className="flex bg-neutral-100 border border-neutral-200 rounded-full p-1 text-[10px] font-bold gap-1 self-start sm:self-auto shrink-0">
                {[
                  { id: "outlet", label: "By Outlet" },
                  { id: "reason", label: "Delay Cause" },
                  { id: "rider", label: "By Rider" },
                  { id: "breach", label: "SLA Breaches" }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setSlaDrillDown(btn.id as any)}
                    className={cn(
                      "px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer",
                      slaDrillDown === btn.id
                        ? "bg-[#556B2F] text-white shadow-xs"
                        : "text-neutral-500 hover:bg-neutral-200"
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 pt-4 overflow-y-auto min-h-0">
              {/* BY OUTLET DRILL DOWN */}
              {slaDrillDown === "outlet" && (
                <div className="space-y-3.5">
                  {Object.entries(slaData.outletSla).map(([name, data]) => {
                    const cleanName = name.split("(")[0].trim()
                    const compliance = data.total > 0 ? Math.round((data.onTime / data.total) * 100) : 100
                    return (
                      <div key={name} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-700 font-bold">{cleanName}</span>
                          <span className="text-[#556B2F] font-black">{compliance}% On-time ({data.onTime}/{data.total})</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              compliance >= 90 ? "bg-emerald-500" : compliance >= 80 ? "bg-amber-500" : "bg-rose-500"
                            )} 
                            style={{ width: `${compliance}%` }} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* BY DELAY REASON DRILL DOWN */}
              {slaDrillDown === "reason" && (
                <div className="space-y-4">
                  {[
                    { label: "Kitchen Prep Backlog", value: slaData.delayReasons.kitchen, icon: ChefHat, color: "bg-amber-500" },
                    { label: "Rider/Transit Traffic Delay", value: slaData.delayReasons.transit, icon: Truck, color: "bg-indigo-500" },
                    { label: "Customer Unreachable / Delayed Handover", value: slaData.delayReasons.customer, icon: Users, color: "bg-blue-500" },
                    { label: "Other Operational Bottlenecks", value: slaData.delayReasons.other, icon: AlertTriangle, color: "bg-neutral-500" }
                  ].map((reason) => {
                    const totalDelays = Object.values(slaData.delayReasons).reduce((a, b) => a + b, 0) || 1
                    const percentage = Math.round((reason.value / totalDelays) * 100)
                    const RIcon = reason.icon
                    return (
                      <div key={reason.label} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-700 flex items-center gap-1.5 font-bold">
                            <RIcon className="h-4 w-4 text-neutral-400 shrink-0" />
                            {reason.label}
                          </span>
                          <span className="text-neutral-800 font-extrabold">{reason.value} cases ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", reason.color)} 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* BY RIDER DRILL DOWN */}
              {slaDrillDown === "rider" && (
                <div className="space-y-3.5">
                  {Object.entries(slaData.riderSla).slice(0, 5).map(([name, data]) => {
                    const compliance = data.total > 0 ? Math.round((data.onTime / data.total) * 100) : 100
                    return (
                      <div key={name} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-700 font-bold">🏍️ {name}</span>
                          <span className="text-[#556B2F] font-black">{compliance}% ({data.onTime}/{data.total} orders)</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              compliance >= 90 ? "bg-emerald-500" : compliance >= 80 ? "bg-amber-500" : "bg-rose-500"
                            )} 
                            style={{ width: `${compliance}%` }} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* SLA BREACHES TAB */}
              {slaDrillDown === "breach" && (
                <div className="overflow-x-auto max-h-[250px]">
                  <Table>
                    <TableHeader className="bg-neutral-50 sticky top-0 z-10">
                      <TableRow className="border-b border-neutral-200">
                        <TableHead className="font-bold text-[10px] text-neutral-600 py-2">Order ID</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600 py-2">Customer</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600 py-2">Rider</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600 py-2 text-right">Delay</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600 py-2">Primary Cause</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slaData.breachedOrdersList.map((item) => (
                        <TableRow key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 text-[11px] font-semibold">
                          <TableCell className="font-extrabold text-[#556B2F] py-2">{item.id}</TableCell>
                          <TableCell className="text-neutral-800 py-2">{item.customer}</TableCell>
                          <TableCell className="text-neutral-600 py-2">{item.rider}</TableCell>
                          <TableCell className="text-right text-rose-600 font-extrabold py-2">+{item.delayMinutes} mins</TableCell>
                          <TableCell className="text-neutral-500 py-2 font-medium">{item.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. CUSTOMER METRICS SECTION */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#556B2F] uppercase tracking-wider">III. Customer Metrics</h3>
        <Card className="border border-[#d2d2c4] bg-white rounded-md">
          <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-[#2d3822]">Customer Map</CardTitle>
              <CardDescription className="text-xs">Visual representation of customer activity and retention</CardDescription>
            </div>
            <div className="flex bg-neutral-100 border border-neutral-200 rounded-full p-1 text-xs font-semibold gap-1 self-start sm:self-auto">
               <button 
                 onClick={() => setCustomerTimeframe("monthly")}
                 className={cn(
                   "px-3 py-1.5 rounded-full transition-all duration-200",
                   customerTimeframe === "monthly" 
                     ? "bg-[#3b4754] text-white shadow-sm" 
                     : "text-neutral-500 hover:bg-neutral-200"
                 )}
               >
                 Monthly
               </button>
               <button 
                 onClick={() => setCustomerTimeframe("weekly")}
                 className={cn(
                   "px-3 py-1.5 rounded-full transition-all duration-200",
                   customerTimeframe === "weekly" 
                     ? "bg-[#3b4754] text-white shadow-sm" 
                     : "text-neutral-500 hover:bg-neutral-200"
                 )}
               >
                 Weekly
               </button>
               <button 
                 onClick={() => setCustomerTimeframe("today")}
                 className={cn(
                   "px-3 py-1.5 rounded-full transition-all duration-200",
                   customerTimeframe === "today" 
                     ? "bg-[#3b4754] text-white shadow-sm" 
                     : "text-neutral-500 hover:bg-neutral-200"
                 )}
               >
                 Today
               </button>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-4">
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <RechartsBarChart data={customerMapData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={customerTimeframe === "today" ? 16 : 8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#888' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888' }} ticks={[-60, -30, 0, 30, 60, 90]} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="positive" fill="#556B2F" radius={[10, 10, 10, 10]} />
                    <Bar dataKey="negative" fill="#2d3822" radius={[10, 10, 10, 10]} />
                 </RechartsBarChart>
               </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>
      </div>



      {/* 3. CUSTOMER METRICS SECTION */}
      {/* <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#556B2F] uppercase tracking-wider">III. Customer Metrics</h3>
        <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2 pb-4 md:pb-0 md:pr-8">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Total Registrations</span>
              <div className="text-3xl font-black text-[#2d3822]">{stats.totalCustomersCount}</div>
              <p className="text-[10px] text-neutral-500 font-semibold font-medium">User accounts registered in database</p>
            </div>
            <div className="space-y-2 py-4 md:py-0 md:px-8 border-y md:border-y-0 md:border-x border-neutral-200">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Active User Volume</span>
              <div className="text-3xl font-black text-[#556B2F]">{stats.activeCustomersCount}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-neutral-500">
                  <span>Active engagement ratio</span>
                  <span>{stats.totalCustomersCount ? Math.round((stats.activeCustomersCount / stats.totalCustomersCount) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#556B2F] rounded-full" style={{ width: `${stats.totalCustomersCount ? Math.round((stats.activeCustomersCount / stats.totalCustomersCount) * 100) : 0}%` }} />
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-4 md:pt-0 md:pl-8">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Average Order Value </span>
              <div className="text-3xl font-black text-[#2d3822]">₹{isNaN(stats.averageOrderValue) ? 0 : stats.averageOrderValue}</div>
            </div>
          </div>
        </Card>
      </div> */}

      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-rose-600 uppercase tracking-wider">IV. Failed / Flagged Payments</h3>
        <Card className="border border-rose-200 bg-white shadow-sm rounded-md overflow-hidden">
          <CardHeader className="bg-rose-50/50 border-b border-rose-100 px-6 py-3">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-4.5 w-4.5" />
              <span className="font-extrabold text-sm">Gateway Incomplete Ledger</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow className="border-b border-neutral-200">
                    <TableHead className="font-bold text-xs text-neutral-600">Order ID</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600">Customer</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600">Contact</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600">Amount</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600 font-mono">Gateway Reference</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600">Failure Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    if (paginatedFailed.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-neutral-400 italic py-8 text-xs font-semibold">
                            No failed or flagged payment transactions found in system records.
                          </TableCell>
                        </TableRow>
                      )
                    }
                    return paginatedFailed.map((o) => (
                      <TableRow key={`flagged-${o.id}`} className="border-b border-neutral-100 hover:bg-neutral-50/50 text-xs">
                        <TableCell className="font-extrabold text-rose-700">{o.id}</TableCell>
                        <TableCell className="font-bold text-neutral-800">{o.customerName}</TableCell>
                        <TableCell className="text-neutral-500 font-mono">{o.customerPhone || "N/A"}</TableCell>
                        <TableCell className="font-bold text-neutral-800">₹{o.total}</TableCell>
                        <TableCell className="font-mono text-neutral-400">{o.transactionId || "No gateway callback"}</TableCell>
                        <TableCell>
                          <Badge className={cn("font-semibold text-[10px] py-0.5 px-2 rounded-sm", o.paymentStatus === "FAILED" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200")}>
                            {o.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  })()}
                </TableBody>
              </Table>
            </div>
            <TablePagination 
              currentPage={failedPage}
              totalPages={totalFailedPages}
              onPageChange={setFailedPage}
              totalEntries={failedPayments.length}
              startEntry={(failedPage - 1) * failedPerPage + 1}
              endEntry={Math.min(failedPage * failedPerPage, failedPayments.length)}
            />
          </CardContent>
        </Card>
      </div>


      {/* COMMENTED OUT ORIGINAL CODE WIDGETS & CHARTS AS REQUESTED */}
      {/*
      <div className="hidden">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border border-[#d2d2c4]/60 bg-gradient-to-br from-white to-[#fcfcf9] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
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
          <Card className="relative overflow-hidden border border-rose-100 bg-gradient-to-br from-white to-[#fffafb] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
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
          <Card className="relative overflow-hidden border border-amber-100 bg-gradient-to-br from-white to-[#fffdf7] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
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
          <Card className="relative overflow-hidden border border-indigo-100 bg-gradient-to-br from-white to-[#fafaff] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
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

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="border border-[#d2d2c4] bg-white lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#2d3822] flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-[#556B2F]" /> Recent Sales Trends
              </CardTitle>
              <CardDescription className="text-xs">Sales totals tracked over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex-1 min-h-[250px] flex flex-col justify-center">
              {isMounted && (
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
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#888888', fontSize: 10 }} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} tick={{ fill: '#888888', fontSize: 10 }} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area type="monotone" dataKey="sales" stroke="#556B2F" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-[#d2d2c4] bg-white flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#2d3822]">Payment Methods</CardTitle>
              <CardDescription className="text-xs">Distribution of payment channels</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col justify-between">
              {isMounted && (
                <div className="h-40 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                        {paymentChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="border border-[#d2d2c4] bg-white flex flex-col justify-between">
            <CardContent className="pt-2 flex-grow">
              {isMounted && (
                <div className="relative w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={orderStatusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#888888', fontSize: 9 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#888888', fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={25}>
                        {orderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      */}
      {/* Channel Performance Details Modal */}
      {selectedChannelDetail && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="border border-[#d2d2c4] bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div>
                <CardTitle className="text-base font-extrabold text-[#2d3822] uppercase tracking-wider flex items-center gap-2">
                  {selectedChannelDetail === "Dine In" && <Utensils className="h-5 w-5 text-amber-600" />}
                  {selectedChannelDetail === "Pick Up" && <Store className="h-5 w-5 text-emerald-600" />}
                  {selectedChannelDetail === "Delivery" && <Truck className="h-5 w-5 text-blue-600" />}
                  {selectedChannelDetail} Channel Analytics
                </CardTitle>
                <CardDescription className="text-xs">Detailed transaction audit and breakdown for this channel</CardDescription>
              </div>
              <button 
                onClick={() => setSelectedChannelDetail(null)}
                className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer border border-neutral-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(() => {
                const isDineIn = selectedChannelDetail === "Dine In"
                const isPickUp = selectedChannelDetail === "Pick Up"
                const isDelivery = selectedChannelDetail === "Delivery"

                const cOrders = completedOrders.filter(o => {
                  if (isDineIn) return o.fulfillmentType !== "DELIVERY" && o.fulfillmentType !== "PICKUP"
                  if (isPickUp) return o.fulfillmentType === "PICKUP"
                  return o.fulfillmentType === "DELIVERY"
                })

                const cSubtotal = cOrders.reduce((sum, o) => sum + (o.subtotal || o.total), 0)
                const cDiscounts = cOrders.reduce((sum, o) => sum + (o.discount || 0), 0)
                const cTax = cOrders.reduce((sum, o) => sum + (o.gst || 0), 0)
                const cPackaging = cOrders.reduce((sum, o) => sum + (o.packagingCharge || 0), 0)
                const cDelivery = cOrders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0)
                const cTotal = cOrders.reduce((sum, o) => sum + o.total, 0)

                return (
                  <>
                    {/* Financial Summary */}
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                      <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 md:col-span-1 space-y-4">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Financial Breakdown</div>
                        
                        <div className="space-y-2.5 text-xs font-semibold text-neutral-600">
                          <div className="flex justify-between">
                            <span>Subtotal (My Amount):</span>
                            <span className="text-neutral-800 font-extrabold">₹{cSubtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                          <div className="flex justify-between text-rose-600">
                            <span>Discount:</span>
                            <span className="font-extrabold">-₹{cDiscounts.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes:</span>
                            <span className="text-neutral-800 font-extrabold">₹{cTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Container / Packing:</span>
                            <span className="text-neutral-800 font-extrabold">₹{cPackaging.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery charges:</span>
                            <span className="text-neutral-800 font-extrabold">₹{cDelivery.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                          <div className="border-t border-neutral-200 pt-2.5 flex justify-between text-sm font-black text-[#2d3822]">
                            <span>Total Sales:</span>
                            <span>₹{cTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        </div>
                      </div>

                      {/* Channel summary and metrics */}
                      <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 md:col-span-2 space-y-4">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Channel Performance Metrics</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white border border-neutral-200/50 rounded-lg p-3">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase">Volume</span>
                            <div className="text-xl font-extrabold text-[#2d3822] mt-1">{cOrders.length} {cOrders.length === 1 ? "Order" : "Orders"}</div>
                          </div>
                          <div className="bg-white border border-neutral-200/50 rounded-lg p-3">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase">Average Ticket Size</span>
                            <div className="text-xl font-extrabold text-[#2d3822] mt-1">₹{cOrders.length > 0 ? Math.round(cTotal / cOrders.length).toLocaleString() : 0}</div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-neutral-500">
                          This channel contributes to {stats.grossSales > 0 ? Math.round((cTotal / stats.grossSales) * 100) : 0}% of your total revenue.
                        </div>
                      </div>
                    </div>

                    {/* Orders Audit Trail Table */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#556B2F] uppercase tracking-wider">Orders Audit Trail ({cOrders.length})</div>
                      <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-neutral-50">
                            <TableRow>
                              <TableHead className="font-extrabold text-[10px] py-2">Order ID</TableHead>
                              <TableHead className="font-extrabold text-[10px] py-2">Customer</TableHead>
                              <TableHead className="font-extrabold text-[10px] py-2">Items</TableHead>
                              <TableHead className="font-extrabold text-[10px] py-2">Payment</TableHead>
                              <TableHead className="font-extrabold text-[10px] py-2 text-right">Amount</TableHead>
                              <TableHead className="font-extrabold text-[10px] py-2 text-center">Status</TableHead>
                              <TableHead className="font-extrabold text-[10px] py-2 text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cOrders.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-xs font-semibold italic text-neutral-400">
                                  No transaction records found for this channel.
                                </TableCell>
                              </TableRow>
                            ) : (
                              cOrders.map((ord) => (
                                <TableRow key={ord.id} className="hover:bg-neutral-50/50 text-[11px] font-semibold">
                                  <TableCell className="font-black text-[#556B2F]">{ord.id}</TableCell>
                                  <TableCell className="text-neutral-800">{ord.customerName}</TableCell>
                                  <TableCell className="text-neutral-500 max-w-[200px] truncate">{ord.items}</TableCell>
                                  <TableCell className="text-neutral-500">
                                    <span className="font-bold text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-200">{ord.paymentMethod}</span>
                                  </TableCell>
                                  <TableCell className="text-right text-[#2d3822] font-extrabold">₹{ord.total.toLocaleString()}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge className={cn("text-[9px] font-bold py-0.5 px-2 rounded-sm", 
                                      ord.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                      ord.status === "CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                      "bg-amber-50 text-amber-700 border-amber-100"
                                    )}>
                                      {ord.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <button 
                                      onClick={() => setSelectedReceiptOrder(ord)}
                                      className="text-[10px] font-extrabold text-[#556B2F] border border-[#556B2F]/20 bg-[#556B2F]/5 px-2.5 py-1 rounded hover:bg-[#556B2F] hover:text-white transition-all cursor-pointer"
                                    >
                                      Receipt
                                    </button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button 
                onClick={() => setSelectedChannelDetail(null)}
                className="bg-[#556B2F] text-white font-bold text-xs py-2 px-4 rounded-md hover:bg-[#556B2F]/90 transition-colors shadow-2xs cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </Card>
        </div>
      )}
      {/* Customer Receipt / Invoice Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-2xl border-2 border-neutral-300 w-full max-w-md overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-150 max-h-[90vh]">
            <div className="overflow-y-auto flex-1 p-6 pb-0 text-neutral-900 font-sans">
              <div className="flex flex-col items-center pb-2 border-b border-dashed border-neutral-300">
                <img src="/brand-logo.png" alt="NIRAGO Logo" className="h-10 w-10 object-contain mb-1 rounded-sm" />
                <h4 className="text-2xl font-bold tracking-tight text-[#556B2F]">NIRAGO FOODS</h4>
                <p className="text-xs text-neutral-500 font-medium font-mono text-center">
                  {selectedReceiptOrder.outlet}<br />
                  Ph: +91 98765 43210 | GSTIN: 07AAAAN1234F1Z9
                </p>
              </div>

              {/* Receipt metadata */}
              <div className="py-3 text-xs space-y-1 border-b border-dashed border-neutral-300 font-mono">
                <div className="flex justify-between text-left"><strong>INVOICE NO:</strong> <span>{selectedReceiptOrder.id}</span></div>
                <div className="flex justify-between text-left"><strong>DATE/TIME:</strong> <span>{new Date().toLocaleString()}</span></div>
                <div className="flex justify-between text-left"><strong>PAYMENT:</strong> <span className="font-bold">{selectedReceiptOrder.paymentMethod} ({selectedReceiptOrder.paymentStatus || "PAID"})</span></div>
                <div className="flex justify-between text-left"><strong>TYPE:</strong> <span>{selectedReceiptOrder.fulfillmentType || "DELIVERY"}</span></div>
              </div>

              {/* Items details table */}
              <div className="py-3 border-b border-dashed border-neutral-300 text-xs">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-neutral-200 font-bold">
                      <th className="pb-1 text-left">Item Description</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Rate</th>
                      <th className="pb-1 text-right">Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceiptOrder.structuredItems && selectedReceiptOrder.structuredItems.length > 0 ? (
                      selectedReceiptOrder.structuredItems.map((item: any, idx: number) => (
                        <React.Fragment key={`receipt-item-${idx}`}>
                          <tr className="align-top font-semibold">
                            <td className="py-1 text-left">{item.name}</td>
                            <td className="py-1 text-center">{item.quantity}</td>
                            <td className="py-1 text-right">₹{item.price}</td>
                            <td className="py-1 text-right">₹{item.price * item.quantity}</td>
                          </tr>
                          {item.addOns && item.addOns.map((add: string, aIdx: number) => (
                            <tr key={`receipt-add-${aIdx}`} className="text-[10px] text-neutral-500 text-left">
                              <td colSpan={4} className="pl-3 pb-0.5">• {add}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      selectedReceiptOrder.items.split(", ").map((item: string, idx: number) => {
                        const match = item.match(/^(\d+)x\s+(.+)$/)
                        const qty = match ? parseInt(match[1]) : 1
                        const itemName = match ? match[2] : item
                        const estimatedPrice = 350
                        return (
                          <tr key={`receipt-raw-item-${idx}`} className="align-top font-semibold">
                            <td className="py-1 text-left">{itemName}</td>
                            <td className="py-1 text-center">{qty}</td>
                            <td className="py-1 text-right">₹{estimatedPrice}</td>
                            <td className="py-1 text-right">₹{estimatedPrice * qty}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Billing Summary breakdown */}
              <div className="py-3 border-b border-dashed border-neutral-300 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-left">
                  <span>Subtotal:</span>
                  <span>₹{selectedReceiptOrder.subtotal ?? Math.round(selectedReceiptOrder.total * 0.85)}</span>
                </div>
                <div className="flex justify-between text-left">
                  <span>SGST & CGST (5%):</span>
                  <span>₹{selectedReceiptOrder.gst ?? Math.round(selectedReceiptOrder.total * 0.05)}</span>
                </div>
                <div className="flex justify-between text-left">
                  <span>Packaging Charges:</span>
                  <span>₹{selectedReceiptOrder.packagingCharge ?? 30}</span>
                </div>
                <div className="flex justify-between text-left">
                  <span>Delivery Charges:</span>
                  <span>₹{selectedReceiptOrder.deliveryCharge ?? 40}</span>
                </div>
                {selectedReceiptOrder.discount !== undefined && selectedReceiptOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold text-left">
                    <span>Discount:</span>
                    <span>-₹{selectedReceiptOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold border-t border-dashed border-neutral-200 pt-2 text-[#2d3822] text-left">
                  <span>GRAND TOTAL:</span>
                  <span>₹{selectedReceiptOrder.total}</span>
                </div>
              </div>

              {/* Delivery address details */}
              <div className="py-3 text-xs space-y-1 text-neutral-600 text-left">
                <p className="font-bold text-[#2d3822]">DELIVER TO:</p>
                <p className="font-semibold">{selectedReceiptOrder.customerName} | {selectedReceiptOrder.customerPhone ?? "+91 99999 99999"}</p>
                <p className="italic">{selectedReceiptOrder.customerAddress ?? "Self-Pickup Order"}</p>
              </div>

              {/* Mock QR / Footer */}
              <div className="pt-4 border-t border-dashed border-neutral-300 text-center space-y-3 shrink-0">
                <div className="inline-block p-1 border border-neutral-200 rounded-md">
                  <div className="h-16 w-16 bg-neutral-100 flex items-center justify-center text-[7px] font-bold text-neutral-400 border border-neutral-200 border-dashed font-mono">
                    [ SCAN QR FOR DETAILS ]
                  </div>
                </div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">*** THANK YOU ***</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-neutral-50 px-6 py-4 flex gap-3 border-t border-neutral-100 shrink-0">
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white flex-1 font-bold text-xs cursor-pointer"
                onClick={() => {
                  Swal.fire({
                    title: "Invoice Printed!",
                    text: "Delivery invoice printed successfully to thermal printer slot.",
                    icon: "success",
                    confirmButtonColor: "#556B2F"
                  })
                  setSelectedReceiptOrder(null)
                }}
              >
                Print Invoice (Receipt)
              </Button>
              <Button 
                variant="outline"
                className="border-neutral-300 text-neutral-600 flex-1 font-bold text-xs cursor-pointer"
                onClick={() => setSelectedReceiptOrder(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
