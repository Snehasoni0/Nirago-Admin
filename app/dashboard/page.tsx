"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { IndianRupee, Utensils, Flame, CheckCircle, Clock, Truck, MapPin, Users, Receipt, Percent, BarChart3, Phone, Send, Map, Power, Coffee, ClipboardList, Check, UserCheck, AlertTriangle, TrendingUp, CreditCard, Store, ChefHat, Globe, Banknote, Bike, Bell, Sparkles } from "lucide-react"
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
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard"
import { RiderDashboard } from "@/components/dashboard/RiderDashboard"
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard"

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
  const [salesTimeframe, setSalesTimeframe] = useState<"today" | "week" | "month" | "year" | "custom">("week")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [customerTimeframe, setCustomerTimeframe] = useState<"monthly" | "weekly" | "today">("monthly")
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all")
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly")
  const [slaTimeframe, setSlaTimeframe] = useState<"today" | "week" | "month">("week")
  const [slaDrillDown, setSlaDrillDown] = useState<"outlet" | "reason" | "rider" | "breach">("outlet")
  const [selectedChannelDetail, setSelectedChannelDetail] = useState<"Dine In" | "Pick Up" | "Delivery" | null>(null)
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any | null>(null)
  const [selectedFailedPayment, setSelectedFailedPayment] = useState<any | null>(null)

  const [apiDashboardStats, setApiDashboardStats] = useState<any>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(false)

  const fetchDashboardStats = async () => {
    let startDateStr = ""
    let endDateStr = ""

    const today = new Date()
    if (salesTimeframe === "today") {
      const start = new Date(today)
      start.setHours(0, 0, 0, 0)
      startDateStr = start.toISOString()
      const end = new Date(today)
      end.setHours(23, 59, 59, 999)
      endDateStr = end.toISOString()
    } else if (salesTimeframe === "week") {
      const start = new Date(today)
      start.setDate(today.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      startDateStr = start.toISOString()
      endDateStr = today.toISOString()
    } else if (salesTimeframe === "month") {
      const start = new Date(today)
      start.setDate(today.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      startDateStr = start.toISOString()
      endDateStr = today.toISOString()
    } else if (salesTimeframe === "year") {
      const start = new Date(today)
      start.setDate(today.getDate() - 365)
      start.setHours(0, 0, 0, 0)
      startDateStr = start.toISOString()
      endDateStr = today.toISOString()
    } else if (salesTimeframe === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate)
      start.setHours(0, 0, 0, 0)
      startDateStr = start.toISOString()
      const end = new Date(customEndDate)
      end.setHours(23, 59, 59, 999)
      endDateStr = end.toISOString()
    }

    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null
      const token = tokenMatch ? tokenMatch[2] : null
      if (!token) return

      let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/dashboard`
      const params = new URLSearchParams()
      if (startDateStr) params.append("startDate", startDateStr)
      if (endDateStr) params.append("endDate", endDateStr)

      const targetOutlet = userRole === "Outlet Manager" ? userOutlet : selectedOutlet
      if (targetOutlet && targetOutlet !== "all") {
        const outObj = outlets.find(o => o.name === targetOutlet)
        const outId = outObj ? outObj.id : null
        if (outId) params.append("outletId", outId)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      setIsStatsLoading(true)
      console.log("API CALL REQUEST: fetchDashboardStats via GET", url)
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      console.log("API CALL RESPONSE SUCCESS: fetchDashboardStats =>", data)
      if (res.ok && data.success && data.data) {
        setApiDashboardStats(data.data)
      } else {
        console.error("Failed to fetch dashboard stats:", data.message)
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
    } finally {
      setIsStatsLoading(false)
    }
  }

  const [reviewsStats, setReviewsStats] = useState<any>({
    averageRating: 4.4,
    totalReviews: 300,
    positiveFeedbackPercentage: 95,
    breakdown: [
      { star: 5, count: 180, percentage: 60, color: "bg-emerald-500" },
      { star: 4, count: 75, percentage: 25, color: "bg-[#80965e]" },
      { star: 3, count: 30, percentage: 10, color: "bg-[#a3b881]" },
      { star: 2, count: 10, percentage: 3, color: "bg-[#c9dbb1]" },
      { star: 1, count: 5, percentage: 2, color: "bg-rose-500" }
    ]
  })

  const fetchReviewsStats = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null
      const token = tokenMatch ? tokenMatch[2] : null
      if (!token) return

      console.log("API CALL REQUEST: fetchReviewsStats via GET /admin/reviews")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews?page=1&limit=100`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success && data.data) {
        const docs = Array.isArray(data.data) ? data.data : (data.data.reviews || data.data.docs || [])
        
        const targetOutlet = userRole === "Outlet Manager" ? userOutlet : selectedOutlet
        const filteredDocs = docs.filter((r: any) => {
          if (targetOutlet && targetOutlet !== "all") {
            const oName = typeof r.outletId === "object" ? r.outletId?.name : (r.outletName || "")
            return oName === targetOutlet || r.outletId === targetOutlet
          }
          return true
        })

        console.log("API CALL RESPONSE SUCCESS: fetchReviewsStats => total raw reviews:", docs.length, "| filtered for outlet:", filteredDocs.length, "| reviews details:", filteredDocs)

        const totalReviews = filteredDocs.length
        if (totalReviews > 0) {
          const sumRatings = filteredDocs.reduce((sum: number, r: any) => sum + (r.rating || 5), 0)
          const averageRating = parseFloat((sumRatings / totalReviews).toFixed(1))
          
          const positiveCount = filteredDocs.filter((r: any) => (r.rating || 5) >= 4).length
          const positiveFeedbackPercentage = Math.round((positiveCount / totalReviews) * 100)

          const counts = [0, 0, 0, 0, 0]
          filteredDocs.forEach((r: any) => {
            const rating = Math.min(5, Math.max(1, r.rating || 5))
            counts[rating - 1]++
          })

          const breakdown = [5, 4, 3, 2, 1].map(star => {
            const count = counts[star - 1]
            const percentage = Math.round((count / totalReviews) * 100)
            const colors = ["bg-rose-500", "bg-[#c9dbb1]", "bg-[#a3b881]", "bg-[#80965e]", "bg-emerald-500"]
            return { star, count, percentage, color: colors[star - 1] }
          })

          setReviewsStats({
            averageRating,
            totalReviews,
            positiveFeedbackPercentage,
            breakdown
          })
        } else {
          setReviewsStats({
            averageRating: 0.0,
            totalReviews: 0,
            positiveFeedbackPercentage: 0,
            breakdown: [
              { star: 5, count: 0, percentage: 0, color: "bg-emerald-500" },
              { star: 4, count: 0, percentage: 0, color: "bg-[#80965e]" },
              { star: 3, count: 0, percentage: 0, color: "bg-[#a3b881]" },
              { star: 2, count: 0, percentage: 0, color: "bg-[#c9dbb1]" },
              { star: 1, count: 0, percentage: 0, color: "bg-rose-500" }
            ]
          })
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews stats:", err)
    }
  }

  useEffect(() => {
    if (isMounted) {
      fetchDashboardStats()
      fetchReviewsStats()
    }
  }, [salesTimeframe, customStartDate, customEndDate, selectedOutlet, outlets, isMounted, userRole, userOutlet])

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
    console.log("MAIN DASHBOARD -> RAW ORDERS FROM CONTEXT:", orders);
    console.log("MAIN DASHBOARD -> CURRENT USER ROLE:", userRole, "| OUTLET:", userOutlet);
    if (userRole === "Outlet Manager" && userOutlet) {
      baseOrders = baseOrders.filter(o => o.outlet === userOutlet)
    } else if (selectedOutlet && selectedOutlet !== "all") {
      baseOrders = baseOrders.filter(o => o.outlet === selectedOutlet)
    }
    console.log("MAIN DASHBOARD -> FILTERED ORDERS:", baseOrders);
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
    if (apiDashboardStats) {
      const rev = apiDashboardStats.revenueMetrics || {}
      const summary = apiDashboardStats.salesSummary || {}
      const orderTypes = apiDashboardStats.orderTypes || []
      const pipe = apiDashboardStats.pipeline || []

      const grossSales = summary.totalSales || rev.totalRevenue || 0
      const discountAmount = apiDashboardStats.taxesAndDiscounts?.reduce((sum: number, o: any) => sum + (o.discount || 0), 0) || 0
      const taxCollected = apiDashboardStats.taxesAndDiscounts?.reduce((sum: number, o: any) => sum + (o.tax || 0), 0) || 0
      const totalTaxable = (summary.netSales || grossSales) || 1
      const taxPercent = parseFloat(((taxCollected / totalTaxable) * 100).toFixed(2)) || 0
      const discountPercent = parseFloat(((discountAmount / (grossSales || 1)) * 100).toFixed(2)) || 0

      const onlineSales = summary.onlineSales || 0
      const onlinePercent = grossSales > 0 ? Math.round((onlineSales / grossSales) * 100) : 0
      const cashSales = summary.cashCollection || 0
      const cashPercent = grossSales > 0 ? Math.round((cashSales / grossSales) * 100) : 0

      const getStatusCount = (status: string) => {
        const found = pipe.find((p: any) => p._id?.toLowerCase() === status.toLowerCase())
        return found ? found.count : 0
      }

      const dineInChannel = orderTypes.find((o: any) => o._id === "dine_in") || {}
      const pickupChannel = orderTypes.find((o: any) => o._id === "pickup") || {}
      const deliveryChannel = orderTypes.find((o: any) => o._id === "delivery") || {}

      return {
        grossSales,
        netSales: summary.netSales || 0,
        onlineSales,
        onlinePercent,
        cashSales,
        cashPercent,
        taxCollected,
        taxPercent,
        discountAmount,
        discountPercent,
        placedOrdersCount: getStatusCount("placed"),
        preparingOrdersCount: getStatusCount("preparing"),
        readyOrdersCount: getStatusCount("ready"),
        assignedOrdersCount: getStatusCount("out_for_delivery") || getStatusCount("assigned"),
        deliveredOrdersCount: getStatusCount("completed") || getStatusCount("delivered"),
        cancelledOrdersCount: getStatusCount("cancelled"),
        totalCustomersCount: rev.totalCustomers || customers.length,
        activeCustomersCount: rev.totalCustomers || customers.length,
        averageOrderValue: Math.round(rev.avgOrderValue || (grossSales / (rev.totalOrders || 1))),

        dineInCount: dineInChannel.count || 0,
        dineInSales: dineInChannel.revenue || 0,
        dineInAOV: Math.round(dineInChannel.avgTurnAroundTime || 0),
        pickUpCount: pickupChannel.count || 0,
        pickUpSales: pickupChannel.revenue || 0,
        pickUpAOV: Math.round(pickupChannel.revenue / (pickupChannel.count || 1)) || 0,
        deliveryCount: deliveryChannel.count || 0,
        deliverySales: deliveryChannel.revenue || 0,
        deliveryAOV: Math.round(deliveryChannel.revenue / (deliveryChannel.count || 1)) || 0,
        reviewsStats
      }
    }

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
      deliveryAOV,
      reviewsStats
    }
  }, [apiDashboardStats, completedOrders, filteredOrders, customers, activeCustomers])

  // Delivery SLA Calculations
  const slaData = React.useMemo(() => {
    if (apiDashboardStats && apiDashboardStats.slaMetrics) {
      const outletSla: { [key: string]: { total: number; onTime: number } } = {}
      apiDashboardStats.slaMetrics.forEach((m: any) => {
        outletSla[m.outletName] = {
          total: m.totalDelivered || 0,
          onTime: m.onTimeDelivered || 0
        }
      })

      const totalDelivered = apiDashboardStats.slaMetrics.reduce((sum: number, m: any) => sum + (m.totalDelivered || 0), 0)
      const totalOnTime = apiDashboardStats.slaMetrics.reduce((sum: number, m: any) => sum + (m.onTimeDelivered || 0), 0)
      const slaCompliance = totalDelivered > 0 ? Math.round((totalOnTime / totalDelivered) * 100) : 92

      const riderSla: { [key: string]: { total: number; onTime: number } } = {}
      deliveryStaff.forEach(st => {
        riderSla[st.name] = { total: 10, onTime: Math.round(10 * 0.92) }
      })

      return {
        totalDeliveries: totalDelivered || 45,
        onTimeCount: totalOnTime || 41,
        delayedCount: (totalDelivered - totalOnTime) || 4,
        slightlyDelayedCount: Math.round((totalDelivered - totalOnTime) * 0.75) || 3,
        severelyDelayedCount: Math.round((totalDelivered - totalOnTime) * 0.25) || 1,
        delayReasons: { kitchen: 2, transit: 1, customer: 1, other: 0 },
        outletSla,
        riderSla,
        breachedOrdersList: [
          { id: "#1008", customer: "Aarav Mehta", rider: "Ramesh Kumar", delayMinutes: 12, reason: "Kitchen Prep Backlog", outlet: "Nirago Connaught Place" },
          { id: "#1014", customer: "Priya Sharma", rider: "Amit Sharma", delayMinutes: 8, reason: "Rider Transit Traffic", outlet: "Nirago Dwarka Sector 12" },
          { id: "#1022", customer: "Kabir Singh", rider: "Ramesh Kumar", delayMinutes: 18, reason: "Customer Unreachable", outlet: "Nirago Connaught Place" }
        ],
        slaCompliance
      }
    }

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
  }, [apiDashboardStats, filteredOrders, outlets, deliveryStaff])

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

    if (salesTimeframe === "today") {
      const hours = ["08 AM", "10 AM", "12 PM", "02 PM", "04 PM", "06 PM", "08 PM", "10 PM"]
      const data = hours.map(h => ({ label: h, sales: 0, orders: 0 }))
      const todayDateKey = today.toISOString().substring(0, 10)
      completedOrders.forEach(order => {
        let oDate = order.deliveryDate || todayDateKey
        if (oDate === todayDateKey) {
          const charSum = order.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
          const hourIndex = charSum % hours.length
          data[hourIndex].sales += order.total
          data[hourIndex].orders += 1
        }
      })
      return data
    } else if (salesTimeframe === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate)
      const end = new Date(customEndDate)
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
      const data: { label: string; dateKey: string; sales: number; orders: number }[] = []
      
      const limit = Math.min(daysDiff, 60)
      for (let i = 0; i <= limit; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        const dateKey = d.toISOString().substring(0, 10)
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        data.push({ label, dateKey, sales: 0, orders: 0 })
      }
      
      completedOrders.forEach(order => {
        let oDate = order.deliveryDate
        if (!oDate) {
          oDate = today.toISOString().substring(0, 10)
        }
        const found = data.find(day => day.dateKey === oDate)
        if (found) {
          found.sales += order.total
          found.orders += 1
        }
      })
      return data
    } else if (salesTimeframe === "week") {
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

  const salesTrendData = React.useMemo(() => {
    if (apiDashboardStats && apiDashboardStats.salesTrends) {
      return apiDashboardStats.salesTrends.map((t: any) => {
        const d = new Date(t._id);
        const label = salesTimeframe === "today" 
          ? t._id.split(" ")[1] || t._id 
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return {
          label,
          sales: t.revenue || 0,
          orders: t.orders || 0
        };
      });
    }
    return getSalesTrendData();
  }, [apiDashboardStats, salesTimeframe, customStartDate, customEndDate, completedOrders])

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
  const paymentChartData = React.useMemo(() => {
    if (apiDashboardStats && apiDashboardStats.paymentMix) {
      const upi = apiDashboardStats.paymentMix.find((p: any) => p._id?.toLowerCase() === "upi" || p._id?.toLowerCase() === "online") || {};
      const card = apiDashboardStats.paymentMix.find((p: any) => p._id?.toLowerCase() === "card") || {};
      const cash = apiDashboardStats.paymentMix.find((p: any) => p._id?.toLowerCase() === "cash") || {};
      
      const upiAmt = upi.amount || 0;
      const cardAmt = card.amount || 0;
      const cashAmt = cash.amount || 0;
      const total = upiAmt + cardAmt + cashAmt || 1;

      return [
        { name: "UPI", value: upiAmt, percentage: Math.round((upiAmt / total) * 100), color: "#6366f1" },
        { name: "Card", value: cardAmt, percentage: Math.round((cardAmt / total) * 100), color: "#3b82f6" },
        { name: "Cash", value: cashAmt, percentage: Math.round((cashAmt / total) * 100), color: "#10b981" },
      ];
    }

    const upiSales = completedOrders.filter(o => o.paymentMethod === "UPI").reduce((sum, o) => sum + o.total, 0)
    const cardSales = completedOrders.filter(o => o.paymentMethod === "CARD").reduce((sum, o) => sum + o.total, 0)
    const cashSales = completedOrders.filter(o => o.paymentMethod === "CASH").reduce((sum, o) => sum + o.total, 0)
    const totalPaymentSales = upiSales + cardSales + cashSales || 1
    const upiPercent = Math.round((upiSales / totalPaymentSales) * 100)
    const cardPercent = Math.round((cardSales / totalPaymentSales) * 100)
    const cashPercent = Math.round((cashSales / totalPaymentSales) * 100)

    return [
      { name: "UPI", value: upiSales, percentage: upiPercent, color: "#6366f1" },
      { name: "Card", value: cardSales, percentage: cardPercent, color: "#3b82f6" },
      { name: "Cash", value: cashSales, percentage: cashPercent, color: "#10b981" },
    ]
  }, [apiDashboardStats, completedOrders])

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
    return (
      <ManagerDashboard
        orders={orders}
        outlets={outlets}
        deliveryStaff={deliveryStaff}
        userOutlet={userOutlet}
        userName={userName}
        updateOrderStatus={updateOrderStatus}
        assignStaffToOrder={assignStaffToOrder}
        setOrderEstTime={setOrderEstTime}
        updateOutlet={updateOutlet}
      />
    )
  }

  // RIDER VIEW
  if (["Delivery Staff", "Delivery Rider", "Delivery Riders", "Rider", "Riders"].includes(userRole)) {
    return (
      <RiderDashboard
        orders={orders}
        userName={userName}
        updateOrderStatus={updateOrderStatus}
      />
    )
  }

  // STANDARD ADMIN VIEW
  return (
    <OwnerDashboard
      userRole={userRole}
      selectedOutlet={selectedOutlet}
      setSelectedOutlet={setSelectedOutlet}
      outlets={outlets}
      filteredOrders={filteredOrders}
      filteredOutlets={filteredOutlets}
      stats={stats}
      isMounted={isMounted}
      salesTimeframe={salesTimeframe}
      setSalesTimeframe={setSalesTimeframe}
      salesTrendData={salesTrendData}
      customStartDate={customStartDate}
      setCustomStartDate={setCustomStartDate}
      customEndDate={customEndDate}
      setCustomEndDate={setCustomEndDate}
      paymentChartData={paymentChartData}
      selectedChannelDetail={selectedChannelDetail}
      setSelectedChannelDetail={setSelectedChannelDetail}
      completedOrders={completedOrders}
      selectedReceiptOrder={selectedReceiptOrder}
      setSelectedReceiptOrder={setSelectedReceiptOrder}
      deliveryTimeframe={deliveryTimeframe}
      setDeliveryTimeframe={setDeliveryTimeframe}
      totalDeliveredToday={totalDeliveredToday}
      dailyDeliveryData={dailyDeliveryData}
      slaData={slaData}
      slaDrillDown={slaDrillDown}
      setSlaDrillDown={setSlaDrillDown}
      customerTimeframe={customerTimeframe}
      setCustomerTimeframe={setCustomerTimeframe}
      customerMapData={customerMapData}
      failedPayments={failedPayments}
      paginatedFailed={paginatedFailed}
      failedPage={failedPage}
      setFailedPage={setFailedPage}
      totalFailedPages={totalFailedPages}
      failedPerPage={failedPerPage}
      selectedFailedPayment={selectedFailedPayment}
      setSelectedFailedPayment={setSelectedFailedPayment}
    />
  )
}
