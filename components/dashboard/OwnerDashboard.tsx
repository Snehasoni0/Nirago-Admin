"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TablePagination } from "@/components/ui/pagination"
import {
  IndianRupee, Utensils, Flame, CheckCircle, Truck, Users, Receipt,
  BarChart3, AlertTriangle, UserCheck, ClipboardList, Store, ChefHat,
  Globe, Banknote, Bike
} from "lucide-react"
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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

interface OwnerDashboardProps {
  userRole: string
  selectedOutlet: string
  setSelectedOutlet: (v: string) => void
  outlets: any[]
  filteredOrders: any[]
  filteredOutlets: any[]
  stats: any
  isMounted: boolean
  salesTimeframe: string
  setSalesTimeframe: (v: any) => void
  salesTrendData: any[]
  customStartDate: string
  setCustomStartDate: (v: string) => void
  customEndDate: string
  setCustomEndDate: (v: string) => void
  paymentChartData: any[]
  selectedChannelDetail: string | null
  setSelectedChannelDetail: (v: any) => void
  completedOrders: any[]
  selectedReceiptOrder: any
  setSelectedReceiptOrder: (v: any) => void
  deliveryTimeframe: string
  setDeliveryTimeframe: (v: any) => void
  totalDeliveredToday: number
  dailyDeliveryData: any[]
  slaData: any
  slaDrillDown: string
  setSlaDrillDown: (v: any) => void
  customerTimeframe: string
  setCustomerTimeframe: (v: any) => void
  customerMapData: any[]
  failedPayments: any[]
  paginatedFailed: any[]
  failedPage: number
  setFailedPage: (v: number) => void
  totalFailedPages: number
  failedPerPage: number
  selectedFailedPayment: any
  setSelectedFailedPayment: (v: any) => void
}

export function OwnerDashboard({
  userRole,
  selectedOutlet,
  setSelectedOutlet,
  outlets,
  filteredOrders,
  filteredOutlets,
  stats,
  isMounted,
  salesTimeframe,
  setSalesTimeframe,
  salesTrendData,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  paymentChartData,
  selectedChannelDetail,
  setSelectedChannelDetail,
  completedOrders,
  selectedReceiptOrder,
  setSelectedReceiptOrder,
  deliveryTimeframe,
  setDeliveryTimeframe,
  totalDeliveredToday,
  dailyDeliveryData,
  slaData,
  slaDrillDown,
  setSlaDrillDown,
  customerTimeframe,
  setCustomerTimeframe,
  customerMapData,
  failedPayments,
  paginatedFailed,
  failedPage,
  setFailedPage,
  totalFailedPages,
  failedPerPage,
  selectedFailedPayment,
  setSelectedFailedPayment,
}: OwnerDashboardProps) {
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
                  <SelectItem key={o.id} value={o.name || ""}>
                    {(o.name || "").split("(")[0].trim()}
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
            {selectedOutlet === "all" ? "All Outlets Sales Summary" : `${(selectedOutlet || "").split("(")[0].trim()} Sales Summary`}
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Sales", value: `₹${stats.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subText: `of ${filteredOrders.length} orders`, icon: IndianRupee },
              { title: "Net sales", value: `₹${stats.netSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subText: `Of ${filteredOutlets.length} outlets`, icon: Receipt },
              { title: "Other sales", value: `₹${stats.onlineSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subText: `${stats.onlinePercent}% of sales`, icon: Globe },
              { title: "Cash sales", value: `₹${stats.cashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subText: `${stats.cashPercent}% of cash sales`, icon: Banknote },
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
            <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-[#556B2F]" /> Sales Revenue Trends
                </CardTitle>
                <CardDescription className="text-xs">
                  {salesTimeframe === "today" 
                    ? "Hourly sales totals tracked for today" 
                    : salesTimeframe === "week" 
                      ? "Sales totals tracked over the last 7 days" 
                      : salesTimeframe === "month" 
                        ? "Sales totals tracked over the last 30 days" 
                        : salesTimeframe === "custom" 
                          ? `Sales totals tracked from ${customStartDate || "Start Date"} to ${customEndDate || "End Date"}` 
                          : "Sales totals tracked monthly over the last year"}
                </CardDescription>
              </div>
              <div className="flex items-center justify-start gap-2 w-full md:w-auto mr-auto md:ml-auto md:mr-0">
                <Button
                  size="xs"
                  variant={salesTimeframe === "today" ? "default" : "outline"}
                  className={cn(
                    "h-8 w-20 text-xs font-bold transition-all shadow-xs shrink-0",
                    salesTimeframe === "today" 
                      ? "bg-[#556B2F] hover:bg-[#405223] text-white" 
                      : "border-[#d2d2c4] text-[#2d3822] hover:bg-[#f5f5e6]/25 bg-white"
                  )}
                  onClick={() => setSalesTimeframe("today")}
                >
                  Today
                </Button>
                {salesTimeframe === "custom" ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in duration-200 shrink-0">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-[11px] sm:text-xs font-semibold border border-[#d2d2c4] rounded-md px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-white text-neutral-700 h-8 w-24 sm:w-28"
                    />
                    <span className="text-[10px] font-bold text-neutral-400">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-[11px] sm:text-xs font-semibold border border-[#d2d2c4] rounded-md px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-white text-neutral-700 h-8 w-24 sm:w-28"
                    />
                  </div>
                ) : (
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-8 w-28 text-xs font-bold transition-all shadow-xs shrink-0 border-[#d2d2c4] text-[#2d3822] hover:bg-[#f5f5e6]/25 bg-white"
                    onClick={() => {
                      setSalesTimeframe("custom")
                      if (!customStartDate || !customEndDate) {
                        const todayDate = new Date()
                        const pastDate = new Date()
                        pastDate.setDate(todayDate.getDate() - 14)
                        setCustomStartDate(pastDate.toISOString().substring(0, 10))
                        setCustomEndDate(todayDate.toISOString().substring(0, 10))
                      }
                    }}
                  >
                    Custom Date
                  </Button>
                )}
              </div>
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
                          <stop offset="5%" stopColor="#556B2F" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#556B2F" stopOpacity={0} />
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
                  <div className="text-2xl font-black text-[#2d3822]">₹{channel.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                  ₹{stats.taxCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Taxes
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
                      <span className="text-neutral-600 truncate max-w-[120px]">{(out.name || "").split("(")[0].trim()}</span>
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
                  ₹{stats.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Discounts
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
                      <span className="text-neutral-600 truncate max-w-[120px]">{(out.name || "").split("(")[0].trim()}</span>
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
                        {row.cells.map((cell: any, idx: number) => {
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
        <h3 className="text-sm font-extrabold text-[#556B2F] uppercase tracking-wider">III. Delivery Speed & On-Time Performance</h3>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Card 1: SLA Compliance Score (SVG Radial Progress) */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 flex flex-col justify-between h-[360px]">
            <div>
              <CardTitle className="text-sm font-bold text-[#2d3822]">On-Time Delivery Score (SLA)</CardTitle>
              <CardDescription className="text-xs">Percentage of orders prepared & delivered within the promised time limit.</CardDescription>
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
                <span className="text-neutral-400 block text-[9px] uppercase font-bold">Late / Delayed (Breached SLA)</span>
                <span className="text-lg font-black text-rose-600">{slaData.delayedCount}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Interactive Drill-Down panel */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 lg:col-span-2 flex flex-col justify-between h-[360px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#d2d2c4]/30 gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-[#2d3822]">On-Time Delivery Analytics</CardTitle>
                <CardDescription className="text-xs">See delays by outlet, reasons for delay, rider speed, or view late orders</CardDescription>
              </div>

              {/* Drill-down selector buttons */}
              <div className="flex bg-neutral-100 border border-neutral-200 rounded-full p-1 text-[10px] font-bold gap-1 self-start sm:self-auto shrink-0">
                {[
                  { id: "outlet", label: "By Outlet" },
                  { id: "reason", label: "Delay Reasons" },
                  { id: "rider", label: "By Rider" },
                  { id: "breach", label: "Late Orders" }
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
                  {Object.entries(slaData.outletSla).map(([name, data]: [string, any]) => {
                    const cleanName = (name || "").split("(")[0].trim()
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
                    const totalDelays = Object.values(slaData.delayReasons).reduce((a: number, b: any) => a + b, 0) || 1
                    const percentage = Math.round((reason.value / (totalDelays as number)) * 100)
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
                  {Object.entries(slaData.riderSla).slice(0, 5).map(([name, data]: [string, any]) => {
                    const compliance = data.total > 0 ? Math.round((data.onTime / data.total) * 100) : 100
                    return (
                      <div key={name} className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-700 font-bold inline-flex items-center gap-1"><Bike className="h-3.5 w-3.5" /> {name}</span>
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
                        <TableHead className="font-bold text-[10px] text-neutral-600">Order ID</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600">Customer</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600">Rider</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600 text-right">Delay</TableHead>
                        <TableHead className="font-bold text-[10px] text-neutral-600">Primary Cause</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slaData.breachedOrdersList.map((item: any) => (
                        <TableRow key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 text-[11px] font-semibold">
                          <TableCell className="font-extrabold text-[#556B2F]">{item.id}</TableCell>
                          <TableCell className="text-neutral-800">{item.customer}</TableCell>
                          <TableCell className="text-neutral-600">{item.rider}</TableCell>
                          <TableCell className="text-right text-rose-600 font-extrabold">+{item.delayMinutes} mins</TableCell>
                          <TableCell className="text-neutral-500 font-medium">{item.reason}</TableCell>
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
        <h3 className="text-sm font-extrabold text-[#556B2F] uppercase tracking-wider">IV. Customer Metrics</h3>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 animate-in fade-in duration-300">
          {/* Customer Map Card */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md lg:col-span-2 flex flex-col justify-between">
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
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="positive" fill="#556B2F" radius={[10, 10, 10, 10]} />
                    <Bar dataKey="negative" fill="#2d3822" radius={[10, 10, 10, 10]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Customer Reviews Rating Distribution Card */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md p-6 flex flex-col justify-between">
            <div className="pb-3 border-b border-[#d2d2c4]/30 shrink-0">
              <CardTitle className="text-sm font-bold text-[#2d3822]">Reviews & Ratings</CardTitle>
              <CardDescription className="text-xs">Distribution of 1 to 5 star ratings submitted by customers</CardDescription>
            </div>
            <div className="flex-1 pt-4 flex flex-col justify-start space-y-4">
              {/* Rating metrics summary */}
              <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <div className="text-center shrink-0">
                  <div className="text-3xl font-black text-[#2d3822]">4.4</div>
                  <div className="text-amber-500 text-xs mt-0.5">★★★★★</div>
                  <div className="text-[9px] text-neutral-400 font-bold uppercase mt-1">300 Reviews</div>
                </div>
                <div className="flex-grow space-y-1 text-xs">
                  <div className="text-neutral-500 font-semibold text-[10px] leading-relaxed">
                    95% Positive Feedback
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>
              </div>

              {/* Progress bars split */}
              <div className="space-y-2 pt-1">
                {[
                  { star: 5, count: 180, percentage: 60, color: "bg-emerald-500" },
                  { star: 4, count: 75, percentage: 25, color: "bg-[#80965e]" },
                  { star: 3, count: 30, percentage: 10, color: "bg-[#a3b881]" },
                  { star: 2, count: 10, percentage: 3, color: "bg-[#c9dbb1]" },
                  { star: 1, count: 5, percentage: 2, color: "bg-rose-500" },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-3 text-xs font-semibold text-neutral-600">
                    <span className="w-12 text-right shrink-0">{item.star} Stars</span>
                    <div className="flex-grow bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", item.color)}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-neutral-800 font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-rose-600 uppercase tracking-wider">V. Failed / Flagged Payments</h3>
        <Card className="border border-rose-200 bg-white shadow-sm rounded-md overflow-hidden gap-0 py-0">
          <CardHeader className="bg-rose-50/50 border-b border-rose-100 px-6 py-3">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-4.5 w-4.5" />
              <span className="font-extrabold text-sm">Gateway Incomplete Ledger</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow className="border-b border-neutral-200">
                    <TableHead className="font-bold text-xs text-neutral-600 px-6">Order ID</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600 hidden md:table-cell px-6">Customer</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600 hidden md:table-cell px-6">Contact</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600 px-6">Amount</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600 font-mono hidden md:table-cell px-6">Gateway Reference</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600 px-6">Failure Status</TableHead>
                    <TableHead className="font-bold text-xs text-neutral-600 text-right md:hidden px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    if (paginatedFailed.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-neutral-400 italic py-8 text-xs font-semibold px-6">
                            No failed or flagged payment transactions found in system records.
                          </TableCell>
                        </TableRow>
                      )
                    }
                    return paginatedFailed.map((o) => (
                      <TableRow key={`flagged-${o.id}`} className="border-b border-neutral-100 hover:bg-neutral-50/50 text-xs">
                        <TableCell className="font-extrabold text-rose-700 px-6">{o.id}</TableCell>
                        <TableCell className="font-bold text-neutral-800 hidden md:table-cell px-6">{o.customerName}</TableCell>
                        <TableCell className="text-neutral-500 font-mono hidden md:table-cell px-6">{o.customerPhone || "N/A"}</TableCell>
                        <TableCell className="font-bold text-neutral-800 px-6">₹{o.total}</TableCell>
                        <TableCell className="font-mono text-neutral-400 hidden md:table-cell px-6">{o.transactionId || "No gateway callback"}</TableCell>
                        <TableCell className="px-6">
                          <Badge className={cn("font-semibold text-[10px] py-0.5 px-2 rounded-sm", o.paymentStatus === "FAILED" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200")}>
                            {o.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right md:hidden px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 px-2.5 font-bold border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 cursor-pointer"
                            onClick={() => setSelectedFailedPayment(o)}
                          >
                            Details
                          </Button>
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
                            <span className="text-neutral-800 font-extrabold">₹{cSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-rose-600">
                            <span>Discount:</span>
                            <span className="font-extrabold">-₹{cDiscounts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes:</span>
                            <span className="text-neutral-800 font-extrabold">₹{cTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Container / Packing:</span>
                            <span className="text-neutral-800 font-extrabold">₹{cPackaging.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery charges:</span>
                            <span className="text-neutral-800 font-extrabold">₹{cDelivery.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="border-t border-neutral-200 pt-2.5 flex justify-between text-sm font-black text-[#2d3822]">
                            <span>Total Sales:</span>
                            <span>₹{cTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                              <TableHead className="font-extrabold text-[10px]">Order ID</TableHead>
                              <TableHead className="font-extrabold text-[10px]">Customer</TableHead>
                              <TableHead className="font-extrabold text-[10px]">Items</TableHead>
                              <TableHead className="font-extrabold text-[10px]">Payment</TableHead>
                              <TableHead className="font-extrabold text-[10px] text-right">Amount</TableHead>
                              <TableHead className="font-extrabold text-[10px] text-center">Status</TableHead>
                              <TableHead className="font-extrabold text-[10px] text-right">Action</TableHead>
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
                <img src="/Cafe-logo.png" alt="Cafe De Nira Logo" className="h-12 w-12 object-contain mb-1" />
                <h4 className="font-playfair italic font-bold text-[#556B2F] tracking-wide text-2xl">Cafe De Nira®</h4>
                <p className="text-xs text-neutral-500 font-medium font-mono text-center mt-1">
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
                      (selectedReceiptOrder.items || "").split(", ").map((item: string, idx: number) => {
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
      {/* Failed/Flagged Payment Details Modal */}
      {selectedFailedPayment && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="border border-rose-200 bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-rose-100 bg-rose-50/50">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider">
                  Payment Details
                </CardTitle>
              </div>
              <button
                onClick={() => setSelectedFailedPayment(null)}
                className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer border border-neutral-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-semibold text-neutral-600">
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-0.5">Order ID</span>
                  <span className="text-sm font-black text-rose-700">{selectedFailedPayment.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-0.5">Amount</span>
                  <span className="text-sm font-black text-neutral-800">₹{selectedFailedPayment.total}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400">Customer Name:</span>
                  <span className="text-neutral-800 font-extrabold">{selectedFailedPayment.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400">Contact Number:</span>
                  <span className="text-neutral-800 font-mono font-bold">{selectedFailedPayment.customerPhone || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400">Failure Status:</span>
                  <Badge className={cn("font-semibold text-[10px] py-0.5 px-2 rounded-sm", selectedFailedPayment.paymentStatus === "FAILED" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200")}>
                    {selectedFailedPayment.paymentStatus}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-neutral-400">Gateway Reference:</span>
                  <span className="font-mono text-neutral-800 bg-neutral-50 p-2.5 rounded border border-neutral-100 text-[11px] select-all break-all">
                    {selectedFailedPayment.transactionId || "No gateway callback received (Ledger Incomplete)"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
