"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useDashboard, Order, Outlet } from "../DashboardContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, Download, TrendingUp, Calendar, AlertCircle, FileSpreadsheet } from "lucide-react"
import Swal from "sweetalert2"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

// Custom chart tooltip styling
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#2d3822] text-[#FFFFF0] border border-[#d2d2c4] p-3 rounded-lg shadow-lg text-xs space-y-1 text-left">
        <p className="font-bold">{data.label}</p>
        <p className="text-[#cce8b5] font-semibold">Revenue: ₹{data.sales.toLocaleString()}</p>
        <p className="text-neutral-300">Orders: {data.orders}</p>
      </div>
    );
  }
  return null;
};

// Custom pie chart tooltip styling
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Handle fallback 1-pad when count is 0
    const displayValue = data.value === 1 && data.count === 0 ? 0 : data.value;
    return (
      <div className="bg-[#2d3822] text-[#FFFFF0] border border-[#d2d2c4] p-2.5 rounded-lg shadow-lg text-xs space-y-1 text-left z-[1000]">
        <p className="font-bold flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: data.color || '#556B2F' }} />
          {data.name}
        </p>
        <p className="text-[#cce8b5] font-semibold">Sales: ₹{displayValue.toLocaleString()}</p>
        <p className="text-neutral-300">Items Sold: {data.count}</p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { orders, outlets, menuItems } = useDashboard()

  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")
  const [userOutlet, setUserOutlet] = useState("")
  const [selectedOutlet, setSelectedOutlet] = useState("all")
  const [dateRange, setDateRange] = useState<"7days" | "today" | "30days" | "custom">("7days")
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })
  const [isMounted, setIsMounted] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedOutlet, dateRange, startDate, endDate])

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("nirago_user_role") || "Owner"
      const name = localStorage.getItem("nirago_user_name") || "Master Admin"
      const outlet = localStorage.getItem("nirago_user_outlet") || ""
      setUserRole(role)
      setUserName(name)
      setUserOutlet(outlet)
      if (role === "Outlet Manager" && outlet) {
        setSelectedOutlet(outlet)
      }
    }
  }, [])

  // Date falling mapping helper
  const getOrderDateString = (order: Order) => {
    if (order.deliveryDate) return order.deliveryDate
    const idNum = parseInt(order.id.replace("#", ""), 10)
    if (isNaN(idNum)) return "2026-06-18"
    if (idNum >= 1023) return "2026-06-18"
    if (idNum >= 1021) return "2026-06-17"
    if (idNum >= 1019) return "2026-06-16"
    if (idNum >= 1017) return "2026-06-15"
    if (idNum >= 1015) return "2026-06-14"
    return "2026-06-13"
  }

  // Filter orders by outlet and date range
  const filteredOrders = orders.filter(order => {
    // Role & Dropdown Filter
    if (userRole === "Outlet Manager" && userOutlet) {
      if (order.outlet !== userOutlet) return false
    } else if (selectedOutlet !== "all") {
      if (order.outlet !== selectedOutlet) return false
    }

    // Date Range Filter
    const orderDate = getOrderDateString(order)
    
    if (dateRange === "today") {
      return orderDate === "2026-06-18"
    } else if (dateRange === "7days") {
      return orderDate >= "2026-06-12" && orderDate <= "2026-06-18"
    } else if (dateRange === "30days") {
      return orderDate >= "2026-05-20" && orderDate <= "2026-06-18"
    } else if (dateRange === "custom") {
      return orderDate >= startDate && orderDate <= endDate
    }

    return true
  })

  // State variables for dynamic API metrics
  const [loading, setLoading] = useState(true)
  const [totalSales, setTotalSales] = useState(0)
  const [totalOrdersCount, setTotalOrdersCount] = useState(0)
  const [avgOrderValue, setAvgOrderValue] = useState(0)
  const [successRate, setSuccessRate] = useState(0)
  const [trendDays, setTrendDays] = useState<{ label: string; dateKey: string; sales: number; orders: number }[]>([])
  const [categoryChartData, setCategoryChartData] = useState<{ name: string; value: number; count: number; color: string }[]>([])
  const [bestSellers, setBestSellers] = useState<{ name: string; sales: number; count: number; category: string }[]>([])
  const [outletComparison, setOutletComparison] = useState<{ name: string; ordersCount: number; sales: number; successRate: number; status: string }[]>([])

  const getDates = () => {
    const today = new Date()
    const formatDate = (d: Date) => d.toISOString().split("T")[0]
    
    if (dateRange === "today") {
      return { start: formatDate(today), end: formatDate(today) }
    }
    if (dateRange === "7days") {
      const past = new Date()
      past.setDate(today.getDate() - 7)
      return { start: formatDate(past), end: formatDate(today) }
    }
    if (dateRange === "30days") {
      const past = new Date()
      past.setDate(today.getDate() - 30)
      return { start: formatDate(past), end: formatDate(today) }
    }
    // custom
    return { start: startDate, end: endDate }
  }

  const getOutletId = () => {
    if (userRole === "Outlet Manager" && userOutlet) {
      const outletObj = outlets.find(o => o.name === userOutlet)
      if (outletObj) return outletObj.id;
      if (typeof window !== "undefined") {
        return localStorage.getItem("nirago_user_outlet_id") || undefined;
      }
    }
    if (selectedOutlet !== "all") {
      const outletObj = outlets.find(o => o.name === selectedOutlet)
      return outletObj ? outletObj.id : undefined
    }
    return undefined
  }

  const loadReportData = async () => {
    setLoading(true)
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return;

      const dates = getDates()
      const outletId = getOutletId()

      let queryParams = `startDate=${dates.start}&endDate=${dates.end}`
      if (outletId) {
        queryParams += `&outletId=${outletId}`
      }

      // Fetch Reports Analysis
      const analysisRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports/analysis?${queryParams}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const analysisJson = await analysisRes.json();
      console.log("API CALL SUCCESS: GET /admin/reports/analysis =>", analysisJson);

      // Fetch Top Items
      const topItemsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports/top-items?${queryParams}&limit=5`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const topItemsJson = await topItemsRes.json();
      console.log("API CALL SUCCESS: GET /admin/reports/top-items =>", topItemsJson);

      if (analysisJson.success && analysisJson.data) {
        const analysisData = analysisJson.data;
        const kpis = analysisData.kpis || {};
        
        const totalSalesVal = kpis.grossSales || 0;
        const totalOrdersVal = kpis.totalOrders || 0;
        
        setTotalSales(totalSalesVal);
        setTotalOrdersCount(totalOrdersVal);
        setAvgOrderValue(kpis.avgOrderValue || (totalOrdersVal > 0 ? Math.round(totalSalesVal / totalOrdersVal) : 0));
        setSuccessRate(kpis.orderSuccessRate ?? (totalOrdersVal > 0 ? 100 : 0));

        const trendDataMapped = (analysisData.salesTrends || []).map((t: any) => {
          const dateObj = new Date(t._id);
          const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return {
            label,
            dateKey: t._id,
            sales: t.revenue || 0,
            orders: t.orders || 0
          };
        });
        setTrendDays(trendDataMapped);

        const COLORS = ["#556B2F", "#8FBC8F", "#2d3822", "#CD853F"];
        const categoryChart = (analysisData.categoryInsights || []).map((item: any, idx: number) => ({
          name: item._id || "Uncategorized",
          value: item.totalSales || 0,
          count: 0,
          color: COLORS[idx % COLORS.length]
        }));
        setCategoryChartData(categoryChart);
      }

      if (topItemsJson.success && topItemsJson.data) {
        const topItemsData = topItemsJson.data;
        const bestSellersData = (topItemsData || []).map((item: any) => {
          const matchedItem = menuItems.find(m => m.name === item.name);
          return {
            name: item.name,
            sales: item.totalRevenue,
            count: item.totalQuantity,
            category: matchedItem?.category || "Main Course"
          };
        });
        setBestSellers(bestSellersData);
      }

      // Fetch Outlet Comparisons if Owner/Admin (sequential to avoid connection pool exhaustion)
      if (userRole !== "Outlet Manager" && outlets.length > 0) {
        const comparisons: { name: string; ordersCount: number; sales: number; successRate: number; status: string }[] = [];
        for (const outlet of outlets) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports/analysis?startDate=${dates.start}&endDate=${dates.end}&outletId=${outlet.id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const json = await res.json();
            console.log(`API CALL SUCCESS: GET /admin/reports/analysis for outlet ${outlet.name} =>`, json);
            if (json.success && json.data) {
              const analysisData = json.data;
              const kpis = analysisData.kpis || {};
              const totalSalesVal = kpis.grossSales || 0;
              const totalOrdersVal = kpis.totalOrders || 0;

              comparisons.push({
                name: outlet.name,
                ordersCount: totalOrdersVal,
                sales: totalSalesVal,
                successRate: kpis.orderSuccessRate ?? 0,
                status: outlet.status
              });
            } else {
              comparisons.push({
                name: outlet.name,
                ordersCount: 0,
                sales: 0,
                successRate: 0,
                status: outlet.status
              });
            }
          } catch (err) {
            comparisons.push({
              name: outlet.name,
              ordersCount: 0,
              sales: 0,
              successRate: 0,
              status: outlet.status
            });
          }
        }
        setOutletComparison(comparisons);
      }

    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReportData();
  }, [selectedOutlet, dateRange, startDate, endDate, userRole, userOutlet, outlets.length]);

  // Client side CSV Generator & Downloader
  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportSalesReport = () => {
    let csvContent = "Order ID,Customer,Outlet,Items,Subtotal,Tax,Discount,Total,Payment Method,Status,Date\n"
    filteredOrders.forEach(o => {
      const itemsEscaped = `"${o.items.replace(/"/g, '""')}"`
      const date = getOrderDateString(o)
      csvContent += `${o.id},${o.customerName},${o.outlet},${itemsEscaped},${o.subtotal || 0},${o.gst || 0},${o.discount || 0},${o.total},${o.paymentMethod},${o.status},${date}\n`
    })
    const reportName = `sales_report_${selectedOutlet === "all" ? "all_outlets" : selectedOutlet.replace(/\s+/g, "_")}_${dateRange}.csv`
    downloadCSV(reportName, csvContent)
  }

  const handleExportOutletPerformance = () => {
    let csvContent = "Outlet Name,Total Orders,Total Sales (INR),Order Success Rate (%),Status\n"
    outletComparison.forEach(o => {
      csvContent += `"${o.name}",${o.ordersCount},${o.sales},${o.successRate}%,${o.status}\n`
    })
    downloadCSV("outlet_performance_report.csv", csvContent)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Reports & Analysis</h2>
          <p className="text-sm text-neutral-600">
            {userRole === "Outlet Manager" 
              ? `Sales and orders report for ${userOutlet}`
              : "Compare outlet sales and top dishes."
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {userRole !== "Outlet Manager" && (
            <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
              <SelectTrigger className="w-[200px] border-[#d2d2c4] bg-white">
                <SelectValue placeholder="All Outlets" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Outlets</SelectItem>
                {outlets.map(o => (
                  <SelectItem key={`filter-outlet-${o.id}`} value={o.name}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={dateRange} onValueChange={(val: any) => setDateRange(val)}>
            <SelectTrigger className="w-[160px] border-[#d2d2c4] bg-white font-semibold text-neutral-800">
              <SelectValue placeholder="Past 7 Days" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Past 7 Days</SelectItem>
              <SelectItem value="30days">All-Time</SelectItem>
              <SelectItem value="custom">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#556B2F] shrink-0" />
                  <span>Custom Range</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <div className="flex items-center gap-2 bg-[#f5f5e6]/30 border border-[#d2d2c4] p-1.5 rounded-lg text-xs animate-in slide-in-from-right duration-250">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="bg-white border border-[#d2d2c4] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
              />
              <span className="text-neutral-500 font-bold">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="bg-white border border-[#d2d2c4] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
              />
            </div>
          )}

          <Button 
            onClick={handleExportSalesReport}
            className="bg-[#556B2F] hover:bg-[#405223] text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border border-[#d2d2c4] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Gross Sales</span>
              <Badge className="bg-emerald-100 text-emerald-800">INR</Badge>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#2d3822]">₹{totalSales.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Based on completed and delivered orders</p>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Orders</span>
              <BarChart3 className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#2d3822]">{totalOrdersCount}</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Including pending and cancelled orders</p>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Avg Order Value</span>
              <TrendingUp className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#2d3822]">₹{avgOrderValue}</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Average cart ticket size of sales</p>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order Success Rate</span>
              <Badge className={cn("font-semibold", successRate >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
                {successRate}%
              </Badge>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#2d3822]">{successRate}%</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Ratio of delivered vs cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Graph & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Sales Trend Chart */}
        <Card className="lg:col-span-2 border border-[#d2d2c4] bg-white flex flex-col justify-between">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#2d3822] text-lg">Daily Sales Revenue</h3>
                <p className="text-xs text-neutral-500">Sales volume (INR) tracked over the past 7 days</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  Swal.fire({
                    title: "Select Custom Date Range",
                    html: `
                      <div style="display: flex; flex-direction: column; gap: 16px; text-align: left; padding: 10px 0;">
                        <div>
                          <label style="font-size: 12px; font-weight: 600; color: #4b5563; display: block; margin-bottom: 6px;">Start Date</label>
                          <input type="date" id="swal-start-date" value="${startDate}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s;" />
                        </div>
                        <div>
                          <label style="font-size: 12px; font-weight: 600; color: #4b5563; display: block; margin-bottom: 6px;">End Date</label>
                          <input type="date" id="swal-end-date" value="${endDate}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s;" />
                        </div>
                      </div>
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonColor: "#556B2F",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Apply Range",
                    cancelButtonText: "Cancel",
                    didOpen: () => {
                      const startInput = document.getElementById('swal-start-date') as HTMLInputElement;
                      const endInput = document.getElementById('swal-end-date') as HTMLInputElement;
                      if (startInput) {
                        startInput.addEventListener('click', () => {
                          try { startInput.showPicker(); } catch (e) { console.warn(e); }
                        });
                      }
                      if (endInput) {
                        endInput.addEventListener('click', () => {
                          try { endInput.showPicker(); } catch (e) { console.warn(e); }
                        });
                      }
                    },
                    preConfirm: () => {
                      const startVal = (document.getElementById('swal-start-date') as HTMLInputElement).value
                      const endVal = (document.getElementById('swal-end-date') as HTMLInputElement).value
                      if (!startVal || !endVal) {
                        Swal.showValidationMessage('Please select both start and end dates')
                        return false
                      }
                      if (new Date(startVal) > new Date(endVal)) {
                        Swal.showValidationMessage('Start date cannot be after end date')
                        return false
                      }
                      return { start: startVal, end: endVal }
                    }
                  }).then((result) => {
                    if (result.isConfirmed && result.value) {
                      setStartDate(result.value.start)
                      setEndDate(result.value.end)
                      setDateRange("custom")
                      
                      Swal.fire({
                        title: "Filter Applied",
                        text: `Date range set to ${result.value.start} to ${result.value.end}`,
                        icon: "success",
                        confirmButtonColor: "#556B2F",
                        timer: 1500
                      })
                    }
                  })
                }} 
                className="p-1 rounded-md hover:bg-neutral-100 transition-all cursor-pointer flex items-center justify-center border-0 bg-transparent"
                title="Select custom date range"
              >
                <Calendar className="h-4 w-4 text-[#556B2F]" />
              </button>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="relative w-full h-64 mt-4 bg-neutral-50/50 border border-neutral-100 rounded-lg p-2 flex flex-col justify-center items-center">
              {!isMounted ? (
                <div className="text-neutral-400 text-xs animate-pulse">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={trendDays}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
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
                    <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: '#f5f5e6', opacity: 0.4 }} />
                    <Bar 
                      dataKey="sales" 
                      fill="#556B2F" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown summary */}
        <Card className="border border-[#d2d2c4] bg-white flex flex-col justify-between">
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div>
              <h3 className="font-bold text-[#2d3822] text-lg mb-1">Category Insights</h3>
              <p className="text-xs text-neutral-500 mb-4">Volume distributions by menu categories</p>
            </div>

            {/* Donut Chart representation */}
            <div className="h-40 w-full flex items-center justify-center relative my-2">
              {!isMounted ? (
                <div className="text-neutral-400 text-xs animate-pulse">Loading breakdown...</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData.filter(d => d.value > 0).length > 0 
                          ? categoryChartData.filter(d => d.value > 0)
                          : categoryChartData.map(d => ({ ...d, value: 1 }))
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(categoryChartData.filter(d => d.value > 0).length > 0 
                          ? categoryChartData.filter(d => d.value > 0)
                          : categoryChartData.map(d => ({ ...d, value: 1 }))
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        content={<CustomPieTooltip />}
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[9px] uppercase font-bold text-neutral-400">Total Sales</span>
                    <span className="text-sm font-extrabold text-[#2d3822]">₹{totalSales.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            {/* Progress Bars / Legend */}
            <div className="space-y-3 mt-4">
              {categoryChartData.map(item => {
                const sharePercent = totalSales > 0 ? Math.round((item.value / totalSales) * 100) : 0
                return (
                  <div key={`cat-progress-${item.name}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-700 flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-[#556B2F]">{sharePercent}% (₹{item.value.toLocaleString()})</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${sharePercent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables - Outlets & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userRole !== "Outlet Manager" && (
          <Card className="border border-[#d2d2c4] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#2d3822] text-lg">Outlet Comparisons</h3>
                  <p className="text-xs text-neutral-500">Live operational comparisons of physical locations</p>
                </div>
                <Button 
                  size="xs" 
                  variant="outline" 
                  onClick={handleExportOutletPerformance}
                  className="border-neutral-300 text-neutral-600 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="h-3 w-3" /> Compare CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#d2d2c4]">
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Success</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outletComparison.map((comp, idx) => (
                      <TableRow key={`outlet-comp-${idx}`} className="border-b border-neutral-100 hover:bg-[#f5f5e6]/20">
                        <TableCell className="font-semibold text-neutral-800">{comp.name.split("(")[0]}</TableCell>
                        <TableCell className="text-right">{comp.ordersCount}</TableCell>
                        <TableCell className="text-right font-semibold">₹{comp.sales.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn(
                            "text-[10px] font-semibold",
                            comp.successRate >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          )}>
                            {comp.successRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className={cn("border border-[#d2d2c4] bg-white", userRole === "Outlet Manager" && "lg:col-span-2")}>
          <CardContent className="p-6">
            <h3 className="font-bold text-[#2d3822] text-lg mb-1">Top Performing Dishes</h3>
            <p className="text-xs text-neutral-500 mb-4">Dish listings ranked by gross sales volumes</p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#d2d2c4]">
                    <TableHead>Menu Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Gross Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestSellers.length > 0 ? (
                    bestSellers.map((item, idx) => (
                      <TableRow key={`best-seller-${idx}`} className="border-b border-neutral-100 hover:bg-[#f5f5e6]/20">
                        <TableCell className="font-semibold text-neutral-800">{item.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.count}</TableCell>
                        <TableCell className="text-right font-bold text-[#556B2F]">₹{item.sales.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-neutral-400 italic">
                        No transactions registered in this period.
                      </TableCell>
                    </TableRow>
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
