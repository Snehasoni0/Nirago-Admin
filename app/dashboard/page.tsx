"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, IndianRupee, Utensils, Flame, CheckCircle, Clock, Truck, MapPin } from "lucide-react"
import { useDashboard } from "./DashboardContext"

export default function OverviewPage() {
  const { orders, customers, outlets } = useDashboard()

  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserName(localStorage.getItem("nirago_user_name") || "Master Admin")
    }
  }, [])

  // Admin stats
  const stats = {
    grossSales: orders.filter(o => o.status === "DELIVERED" || o.status === "OUT_FOR_DELIVERY" || o.status === "PREPARING").reduce((acc, curr) => acc + curr.total, 0),
    placedOrdersCount: orders.filter(o => o.status === "PLACED").length,
    preparingOrdersCount: orders.filter(o => o.status === "PREPARING").length,
    deliveredOrdersCount: orders.filter(o => o.status === "DELIVERED").length,
    cancelledOrdersCount: orders.filter(o => o.status === "CANCELLED" || o.status === "REJECTED").length,
    activeCustomersCount: customers.filter(c => c.status === "ACTIVE").length,
    averageOrderValue: Math.round(orders.reduce((acc, curr) => acc + curr.total, 0) / (orders.length || 1)),
  }

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
        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Gross Sales Volume</CardTitle>
            <IndianRupee className="h-4 w-4 text-[#556B2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#556B2F]">₹{stats.grossSales}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Sum of Accepted, Preparing & Delivered orders</p>
          </CardContent>
        </Card>
        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Average Order Value</CardTitle>
            <Utensils className="h-4 w-4 text-[#556B2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#556B2F]">₹{stats.averageOrderValue}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Average spent per food basket transaction</p>
          </CardContent>
        </Card>
        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Live Orders Queue</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.placedOrdersCount + stats.preparingOrdersCount}</div>
            <p className="text-[10px] text-neutral-500 mt-1">{stats.placedOrdersCount} Placed / {stats.preparingOrdersCount} Preparing right now</p>
          </CardContent>
        </Card>
        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Fulfilled Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.deliveredOrdersCount}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Orders successfully delivered to customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section (Failed Payments and Outlet Summary) */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="border border-[#d2d2c4] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#556B2F]">Active Outlet Summary</CardTitle>
            <CardDescription>Network distribution (Max 9 outlets allowed)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outlets.map(o => (
                <div key={`outlet-summary-${o.id}`} className="flex items-center justify-between p-3 bg-[#f5f5e6]/30 border border-[#d2d2c4] rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-[#2d3822]">{o.name}</p>
                    <span className="text-xs text-neutral-500">{o.address}</span>
                  </div>
                  <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-neutral-100 text-neutral-800"}>
                    {o.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-red-600">Failed / Flagged Payments</CardTitle>
            <CardDescription>Overview of digital transaction failures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#d2d2c4]">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amt</TableHead>
                    <TableHead>Issue Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-[#d2d2c4]">
                    <TableCell className="font-bold">#1019</TableCell>
                    <TableCell>Karan Johar</TableCell>
                    <TableCell className="font-semibold">₹1,249</TableCell>
                    <TableCell className="text-xs text-red-600 flex items-center gap-1 font-medium font-mono">
                      <AlertTriangle className="h-3 w-3" /> UPI Gateway Timeout
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">#1014</TableCell>
                    <TableCell>Ananya Sen</TableCell>
                    <TableCell className="font-semibold">₹449</TableCell>
                    <TableCell className="text-xs text-red-600 flex items-center gap-1 font-medium font-mono">
                      <AlertTriangle className="h-3 w-3" /> Card Verification Failed
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
