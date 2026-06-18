"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IndianRupee, Utensils, Flame, CheckCircle, Clock, Truck, MapPin, Users, Receipt, Percent } from "lucide-react"
import { useDashboard } from "./DashboardContext"
import { cn } from "@/lib/utils"

export default function OverviewPage() {
  const { orders, customers, outlets } = useDashboard()

  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")
  const [userOutlet, setUserOutlet] = useState("")

  useEffect(() => {
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
  const myActiveCount = myOrders.filter(o => o.status === "OUT_FOR_DELIVERY").length
  const myPendingCount = myOrders.filter(o => o.status === "READY").length
  
  // Today's Delivered & Earnings
  const todayDeliveredOrders = myOrders.filter(o => o.status === "DELIVERED" && o.deliveryDate === todayStr)
  const todayDeliveredCount = todayDeliveredOrders.length
  const todayEarnings = todayDeliveredOrders.reduce((acc, curr) => acc + (curr.deliveryCharge ?? 40), 0)

  // Lifetime/Total Delivered & Earnings
  const totalDeliveredOrders = myOrders.filter(o => o.status === "DELIVERED")
  const totalDeliveredCount = totalDeliveredOrders.length
  const totalEarnings = totalDeliveredOrders.reduce((acc, curr) => acc + (curr.deliveryCharge ?? 40), 0)

  // RIDER VIEW
  if (userRole === "Delivery Staff") {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#2d3822]">Rider Dashboard</h2>
            <p className="text-sm text-neutral-600">Welcome back, {userName}. Track your performance and active route details.</p>
          </div>
        </div>

        {/* Rider Analytics Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-[#d2d2c4] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Earnings</CardTitle>
              <IndianRupee className="h-4 w-4 text-[#556B2F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#556B2F]">₹{totalEarnings}</div>
              <p className="text-[10px] text-neutral-500 mt-1">All-time payout earned</p>
            </CardContent>
          </Card>
          <Card className="border border-[#d2d2c4] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Deliveries</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{totalDeliveredCount}</div>
              <p className="text-[10px] text-neutral-500 mt-1">All-time completed orders</p>
            </CardContent>
          </Card>
          <Card className="border border-[#d2d2c4] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Today's Earnings</CardTitle>
              <IndianRupee className="h-4 w-4 text-[#556B2F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#556B2F]">₹{todayEarnings}</div>
              <p className="text-[10px] text-neutral-500 mt-1">Payout earned today</p>
            </CardContent>
          </Card>
          <Card className="border border-[#d2d2c4] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Today's Deliveries</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{todayDeliveredCount}</div>
              <p className="text-[10px] text-neutral-500 mt-1">Orders delivered today</p>
            </CardContent>
          </Card>
        </div>

        {/* Lower section for Rider */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Active Deliveries Route */}
          <Card className="border border-[#d2d2c4] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#556B2F]">My Active Route Map</CardTitle>
              <CardDescription>Deliveries in transit or ready for pickup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myOrders.filter(o => o.status === "OUT_FOR_DELIVERY" || o.status === "READY").length === 0 ? (
                  <p className="text-sm text-neutral-400 italic py-4 text-center">No active deliveries. Good job!</p>
                ) : (
                  myOrders.filter(o => o.status === "OUT_FOR_DELIVERY" || o.status === "READY").map(o => (
                    <div key={`rider-active-${o.id}`} className="p-4 bg-[#f5f5e6]/30 border border-[#d2d2c4] rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#556B2F]">{o.id}</span>
                        <Badge className={o.status === "READY" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"}>
                          {o.status === "READY" ? "Ready to Pick" : "Out for Delivery"}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-xs text-neutral-600 font-sans">
                        <div className="flex items-start gap-1"><span className="w-16 font-semibold text-neutral-500 shrink-0">Address:</span> <span className="font-bold text-neutral-800 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-[#556B2F] shrink-0 mt-0.5" />{o.customerAddress}</span></div>
                        <div className="flex gap-1"><span className="w-16 font-semibold text-neutral-500">Customer:</span> <span className="font-bold text-neutral-800">{o.customerName} ({o.customerPhone})</span></div>
                        <div className="flex gap-1"><span className="w-16 font-semibold text-neutral-500">Method:</span> <span className="font-bold text-neutral-800">{o.paymentMethod} (₹{o.total})</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery History */}
          <Card className="border border-[#d2d2c4] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#2d3822]">Recent Completed Deliveries</CardTitle>
              <CardDescription>Records of your successfully delivered orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#d2d2c4]">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total Pay</TableHead>
                      <TableHead>Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOrders.filter(o => o.status === "DELIVERED").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-neutral-400 italic py-6">No completed deliveries today yet.</TableCell>
                      </TableRow>
                    ) : (
                      myOrders.filter(o => o.status === "DELIVERED").map(o => (
                        <TableRow key={`rider-history-${o.id}`} className="border-b border-[#d2d2c4]/40 hover:bg-[#f5f5e6]/10">
                          <TableCell className="font-bold text-[#556B2F]">{o.id}</TableCell>
                          <TableCell className="font-medium">{o.customerName}</TableCell>
                          <TableCell className="font-semibold">₹{o.total}</TableCell>
                          <TableCell className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> ₹{o.deliveryCharge ?? 40}
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
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#2d3822]">Dashboard Overview</h2>
          <p className="text-sm text-neutral-600">Live analytics metrics, sales figures and operational health.</p>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Sales */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Gross Sales Volume</CardTitle>
            <IndianRupee className="h-4 w-4 text-[#556B2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#556B2F]">₹{stats.grossSales.toLocaleString()}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Sum of all completed/delivered orders</p>
          </CardContent>
        </Card>

        {/* Net Profit Margin */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-500">Net Profit Margins</CardTitle>
            <Percent className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">₹{stats.netMargin.toLocaleString()}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Estimated 65% net margin of food value</p>
          </CardContent>
        </Card>

        {/* Tax Collection */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500">Tax Collection</CardTitle>
            <Receipt className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₹{stats.taxCollected.toLocaleString()}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Total GST collected for government levies</p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Average Order Value</CardTitle>
            <Utensils className="h-4 w-4 text-[#556B2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#556B2F]">₹{stats.averageOrderValue}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Average spent per basket transaction</p>
          </CardContent>
        </Card>

        {/* Live Orders Queue */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-500">Live Orders Queue</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.placedOrdersCount + stats.preparingOrdersCount + stats.readyOrdersCount + stats.assignedOrdersCount}</div>
            <p className="text-[10px] text-neutral-500 mt-1">{stats.placedOrdersCount} Placed / {stats.preparingOrdersCount} Preparing / {stats.readyOrdersCount} Ready</p>
          </CardContent>
        </Card>

        {/* Fulfilled Orders */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500">Fulfilled Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.deliveredOrdersCount}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Orders successfully delivered</p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-[#556B2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#556B2F]">{stats.totalCustomersCount}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Registered clients in database directory</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border border-[#d2d2c4] bg-white shadow-sm min-h-[145px] flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500">Active User Volume</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.activeCustomersCount}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Non-suspended client accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Details Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Order Funnel Pipeline */}
        <Card className="border border-[#d2d2c4] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#556B2F]">Order Funnel Pipeline</CardTitle>
            <CardDescription>Live distribution of all orders across states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Pending (Placed)", count: stats.placedOrdersCount, color: "bg-blue-500", text: "text-blue-700" },
                { label: "Preparing", count: stats.preparingOrdersCount, color: "bg-amber-500", text: "text-amber-700" },
                { label: "Ready / Packed", count: stats.readyOrdersCount, color: "bg-purple-500", text: "text-purple-700" },
                { label: "Assigned (Transit)", count: stats.assignedOrdersCount, color: "bg-indigo-500", text: "text-indigo-700" },
                { label: "Delivered", count: stats.deliveredOrdersCount, color: "bg-emerald-500", text: "text-emerald-700" },
                { label: "Cancelled / Rejected", count: stats.cancelledOrdersCount, color: "bg-rose-500", text: "text-rose-700" },
              ].map((stage, idx) => (
                <div key={idx} className="p-3 bg-[#f5f5e6]/25 border border-[#d2d2c4]/40 rounded-xl flex flex-col justify-between h-[90px]">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider leading-tight">{stage.label}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={cn("text-2xl font-black", stage.text)}>{stage.count}</span>
                    <span className="text-neutral-400 text-xs font-semibold">orders</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className={cn("h-full rounded-full", stage.color)} style={{ width: `${(stage.count / (filteredOrders.length || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Channel Splits */}
        <Card className="border border-[#d2d2c4] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#556B2F]">Payment Channel Distributions</CardTitle>
            <CardDescription>Breakdown of billing payment modes (Cash vs Card vs UPI)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col justify-center h-[calc(100%-80px)]">
            {[
              { mode: "UPI Payments", value: upiSales, percentage: upiPercent, color: "bg-indigo-600" },
              { mode: "Card Swipes", value: cardSales, percentage: cardPercent, color: "bg-blue-600" },
              { mode: "Cash Collection", value: cashSales, percentage: cashPercent, color: "bg-emerald-600" },
            ].map((channel, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span className="flex items-center gap-1.5">
                    <span className={cn("h-3 w-3 rounded-full", channel.color)} />
                    {channel.mode}
                  </span>
                  <span className="text-[#556B2F]">
                    {channel.percentage}% (₹{channel.value.toLocaleString()})
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", channel.color)} 
                    style={{ width: `${channel.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lower Section (Outlet Summary) */}
      {userRole !== "Outlet Manager" && (
        <div className="grid gap-6 grid-cols-1">
          <Card className="border border-[#d2d2c4] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#556B2F]">Active Outlet Summary</CardTitle>
              <CardDescription>Network distribution & live operational performance metrics</CardDescription>
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
                    <div key={`outlet-summary-${o.id}`} className="flex flex-col justify-between overflow-hidden bg-[#f5f5e6]/20 border border-[#d2d2c4] rounded-xl hover:bg-[#f5f5e6]/40 transition-all shadow-xs min-h-[260px]">
                      {/* Image Banner */}
                      <div className="h-28 w-full relative bg-neutral-100 shrink-0">
                        <img 
                          src={o.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop"} 
                          alt={o.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold" : "bg-neutral-100 text-neutral-800"}>
                            {o.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-bold text-[#2d3822]">{o.name}</p>
                          <span className="text-xs text-neutral-500 block truncate max-w-[220px]">{o.address}</span>
                        </div>

                        {/* Operational Metrics */}
                        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#d2d2c4]/45 text-center">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Total Orders</span>
                            <span className="text-sm font-extrabold text-neutral-700">{totalOrders}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Revenue</span>
                            <span className="text-sm font-extrabold text-[#556B2F]">₹{completedSales}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Queue</span>
                            <span className={`text-sm font-extrabold block ${queueCount > 0 ? "text-amber-600 animate-pulse" : "text-neutral-500"}`}>
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
