"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, IndianRupee, Utensils, Flame, CheckCircle } from "lucide-react"
import { useDashboard } from "./DashboardContext"

export default function OverviewPage() {
  const { orders, customers, outlets } = useDashboard()

  const stats = {
    grossSales: orders.filter(o => o.status === "DELIVERED" || o.status === "OUT_FOR_DELIVERY" || o.status === "PREPARING").reduce((acc, curr) => acc + curr.total, 0),
    placedOrdersCount: orders.filter(o => o.status === "PLACED").length,
    preparingOrdersCount: orders.filter(o => o.status === "PREPARING").length,
    deliveredOrdersCount: orders.filter(o => o.status === "DELIVERED").length,
    cancelledOrdersCount: orders.filter(o => o.status === "CANCELLED" || o.status === "REJECTED").length,
    activeCustomersCount: customers.filter(c => c.status === "ACTIVE").length,
    averageOrderValue: Math.round(orders.reduce((acc, curr) => acc + curr.total, 0) / (orders.length || 1)),
  }

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
