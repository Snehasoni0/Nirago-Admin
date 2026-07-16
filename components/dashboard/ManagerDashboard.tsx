"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  ChefHat,
  ClipboardList,
  Flame,
  CheckCircle,
  Clock,
  Utensils,
  Truck,
  MapPin,
  Bike,
  AlertTriangle,
  Bell,
  Sparkles,
  IndianRupee,
  Coffee,
  Pizza,
  Trophy
} from "lucide-react"
import Swal from "sweetalert2"
import { cn } from "@/lib/utils"
import type { Order } from "@/app/dashboard/DashboardContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/pagination"

interface ManagerDashboardProps {
  orders: any[]
  outlets: any[]
  deliveryStaff: any[]
  userOutlet: string
  userName: string
  updateOrderStatus: (orderId: string, status: Order["status"], cancellationReason?: string, prepMinutes?: number) => void
  assignStaffToOrder: (orderId: string, staffName: string) => void
  setOrderEstTime: (orderId: string, mins: number) => void
  updateOutlet: (outletId: string, data: any) => void
}

export function ManagerDashboard({
  orders,
  outlets,
  deliveryStaff,
  userOutlet,
  userName,
  updateOrderStatus,
  assignStaffToOrder,
  setOrderEstTime,
  updateOutlet,
}: ManagerDashboardProps) {
  const [managerTab, setManagerTab] = useState<"new" | "kitchen" | "dispatch" | "delivered">("new")
  const [outletRiderSelect, setOutletRiderSelect] = useState<{ [orderId: string]: string }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  React.useEffect(() => {
    setCurrentPage(1)
  }, [managerTab])

  const myOutletObj = outlets.find(o => o.name === userOutlet)
  const isOnline = myOutletObj?.status === "ACTIVE"
  const outletNameClean = userOutlet ? userOutlet.split("(")[0].trim() : "Kitchen"

  // Filters
  const outletOrders = orders.filter(o => o.outlet === userOutlet)
  const newOrders = outletOrders.filter(o => o.status === "PLACED")
  const kitchenOrders = outletOrders.filter(o => o.status === "ACCEPTED" || o.status === "PREPARING")
  const dispatchOrders = outletOrders.filter(o => o.status === "READY" || o.status === "OUT_FOR_DELIVERY")
  const deliveredOrders = outletOrders.filter(o => o.status === "DELIVERED")

  const tabOrders = managerTab === "new" ? newOrders
    : managerTab === "kitchen" ? kitchenOrders
    : managerTab === "dispatch" ? dispatchOrders
    : deliveredOrders

  const totalPages = Math.ceil(tabOrders.length / itemsPerPage)
  const paginatedOrders = tabOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
            <Bell className="h-4 w-4 text-rose-600 animate-bounce" />
            <span>Incoming orders waiting! Please click "Accept & Cook" below.</span>
          </span>
        </div>
      )}

      {/* Tab Selection Row */}
      <div className="flex border-b border-[#d2d2c4] gap-2 pb-px pt-2">
        {(["new", "kitchen", "dispatch", "delivered"] as const).map(t => {
          const label = t === "new" ? "1. New Orders" 
            : t === "kitchen" ? "2. Active Cooking" 
            : t === "dispatch" ? "3. Dispatch / Transit" 
            : "4. Delivered"
          const count = t === "new" ? newOrders.length 
            : t === "kitchen" ? kitchenOrders.length 
            : t === "dispatch" ? dispatchOrders.length 
            : deliveredOrders.length
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
        {paginatedOrders.length === 0 ? (
          <div className="py-12 text-center bg-white border border-[#d2d2c4] rounded-2xl space-y-2">
            <Coffee className="h-10 w-10 text-[#556B2F]/20 mx-auto" />
            <div className="text-xs text-neutral-400 italic font-bold flex items-center justify-center gap-1.5">
              {managerTab === "new" && (
                <>
                  <span>No new orders right now. Kitchen is up to date!</span>
                  <Pizza className="h-3.5 w-3.5 text-[#556B2F]" />
                </>
              )}
              {managerTab === "kitchen" && (
                <>
                  <span>No active orders cooking right now.</span>
                  <ChefHat className="h-3.5 w-3.5 text-[#556B2F]" />
                </>
              )}
              {managerTab === "dispatch" && (
                <>
                  <span>No orders waiting for dispatch.</span>
                  <Truck className="h-3.5 w-3.5 text-[#556B2F]" />
                </>
              )}
              {managerTab === "delivered" && (
                <>
                  <span>No completed orders today.</span>
                  <Trophy className="h-3.5 w-3.5 text-[#556B2F]" />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#d2d2c4] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#e6e6d8]/20">
                  <TableRow className="border-b border-[#d2d2c4]">
                    <TableHead className="px-6 font-bold text-[#556B2F]">Order ID</TableHead>
                    <TableHead className="px-6">Customer & Address</TableHead>
                    <TableHead className="px-6">Items</TableHead>
                    <TableHead className="px-6">Fulfillment & Payment</TableHead>
                    <TableHead className="px-6">Total Amt</TableHead>
                    <TableHead className="px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((o) => {
                    const isReady = o.status === "READY"
                    const isDelivery = o.fulfillmentType === "DELIVERY"
                    return (
                      <TableRow key={o.id} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                        <TableCell className="px-6 font-extrabold text-[#556B2F]">
                          {o.id}
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="font-bold text-neutral-800">{o.customerName}</div>
                          {o.customerPhone && <div className="text-[10px] text-neutral-400">{o.customerPhone}</div>}
                          {isDelivery && o.customerAddress && (
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1 max-w-[200px] truncate">
                              <MapPin className="h-3 w-3 shrink-0 text-[#556B2F]" />
                              <span>{o.customerAddress}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-6 text-xs max-w-[250px]">
                          <div className="font-semibold text-neutral-700 space-y-1">
                            {o.structuredItems ? o.structuredItems.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-neutral-50 p-1 rounded border border-neutral-100/60">
                                <span>{item.quantity}x {item.name}</span>
                              </div>
                            )) : o.items.split(", ").map((item: string, idx: number) => (
                              <div key={idx} className="bg-neutral-50 p-1 rounded border border-neutral-100/60">{item}</div>
                            ))}
                          </div>
                          {o.specialInstructions && (
                            <div className="text-[9px] text-amber-700 italic mt-1 bg-amber-50/50 p-1 rounded border border-amber-100/40">
                              * {o.specialInstructions}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="text-xs font-bold text-neutral-800">
                            {o.fulfillmentType || "DELIVERY"}
                          </div>
                          <div className={cn(
                            "text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded inline-block",
                            o.paymentMethod === "CASH" ? "bg-rose-50 text-rose-800 border border-rose-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                          )}>
                            {o.paymentMethod === "CASH" ? `Collect Cash: ₹${o.total}` : "Paid Online"}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 font-extrabold text-neutral-800 font-mono">
                          ₹{o.total}
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          {/* Render actions based on tab */}
                          {managerTab === "new" && (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleAcceptOrder(o.id)}
                                className="bg-[#556B2F] hover:bg-[#405223] text-white py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm shrink-0"
                              >
                                <Utensils className="h-3 w-3" /> Accept & Cook
                              </button>
                              <button
                                onClick={() => handleRejectOrder(o.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {managerTab === "kitchen" && (
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                onClick={() => handleMarkReady(o.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm shrink-0"
                              >
                                <CheckCircle className="h-3 w-3" /> Food is Ready
                              </button>
                              <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1">
                                <Clock className="h-3 w-3 animate-spin" /> Cooking ({o.estimatedMinutes || 20}m)
                              </span>
                            </div>
                          )}
                          {managerTab === "dispatch" && (
                            <div className="flex flex-col items-end gap-2">
                              {isDelivery ? (
                                o.deliveryStaff ? (
                                  <div className="flex flex-col gap-1.5 items-end">
                                    <div className="text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-100 rounded px-1.5 py-0.5 font-bold flex items-center gap-1">
                                      <Bike className="h-3 w-3" /> {o.deliveryStaff}
                                    </div>
                                    {isReady ? (
                                      <button
                                        onClick={() => handleDispatchOrDeliver(o.id, "OUT_FOR_DELIVERY")}
                                        className="bg-[#556B2F] hover:bg-[#405223] text-white py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        <Truck className="h-3.5 w-3.5" /> Dispatch
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleDispatchOrDeliver(o.id, "DELIVERED")}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        <CheckCircle className="h-3.5 w-3.5" /> Hand Over
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <select
                                      value={outletRiderSelect[o.id] || ""}
                                      onChange={(e) => setOutletRiderSelect(prev => ({ ...prev, [o.id]: e.target.value }))}
                                      className="text-[10px] border border-neutral-300 rounded bg-white p-1 font-bold outline-none"
                                    >
                                      <option value="">Rider...</option>
                                      {activeRiders.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleAssignRiderToOrder(o.id, outletRiderSelect[o.id])}
                                      className="bg-[#556B2F] text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-[#405223] transition-colors cursor-pointer"
                                    >
                                      Assign
                                    </button>
                                  </div>
                                )
                              ) : (
                                <button
                                  onClick={() => handleDispatchOrDeliver(o.id, "DELIVERED")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" /> Hand Over
                                </button>
                              )}
                            </div>
                          )}
                          {managerTab === "delivered" && (
                            <div className="flex flex-col items-end gap-1">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold uppercase text-[9px]">
                                Completed
                              </Badge>
                              {o.deliveryStaff && (
                                <span className="text-[9px] text-neutral-400 font-medium">By {o.deliveryStaff}</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="border-t border-[#d2d2c4] p-4 flex justify-center bg-neutral-50/50">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalEntries={tabOrders.length}
                  startEntry={(currentPage - 1) * itemsPerPage + 1}
                  endEntry={currentPage * itemsPerPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
