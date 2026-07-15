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
  Coffee
} from "lucide-react"
import Swal from "sweetalert2"
import { cn } from "@/lib/utils"
import type { Order } from "@/app/dashboard/DashboardContext"

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
  const [managerTab, setManagerTab] = useState<"new" | "kitchen" | "dispatch">("new")
  const [outletRiderSelect, setOutletRiderSelect] = useState<{ [orderId: string]: string }>({})

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
            <Bell className="h-4 w-4 text-rose-600 animate-bounce" />
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
                        {o.structuredItems ? o.structuredItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5">
                              <ChefHat className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                              <span>{item.quantity}x {item.name}</span>
                            </span>
                          </div>
                        )) : o.items.split(", ").map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <ChefHat className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special instructions */}
                    {o.specialInstructions && (
                      <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-[10px] text-amber-800 italic flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <strong>Instruction:</strong> "{o.specialInstructions}"
                        </div>
                      </div>
                    )}

                    {/* Cash collection warning / paid status */}
                    <div className={cn(
                      "p-2.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5",
                      o.paymentMethod === "CASH"
                        ? "bg-rose-50 border-rose-100 text-rose-800 animate-pulse"
                        : "bg-emerald-50 border-emerald-100 text-emerald-800"
                    )}>
                      {o.paymentMethod === "CASH" ? (
                        <>
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span>Collect Cash: ₹{o.total} on delivery</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Already Paid Online: ₹{o.total}</span>
                        </>
                      )}
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
                        {o.structuredItems ? o.structuredItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-neutral-50 p-1.5 rounded border border-neutral-100">
                            <span className="inline-flex items-center gap-1"><ChefHat className="h-3.5 w-3.5 text-neutral-500" /> {item.quantity}x {item.name}</span>
                            {item.addOns && item.addOns.length > 0 && (
                              <span className="text-[8px] bg-neutral-200 text-neutral-600 px-1 rounded font-bold">With Add-ons</span>
                            )}
                          </div>
                        )) : o.items.split(", ").map((item: string, idx: number) => (
                          <div key={idx} className="bg-neutral-50 p-1.5 rounded border border-neutral-100 inline-flex items-center gap-1"><ChefHat className="h-3.5 w-3.5 text-neutral-500" /> {item}</div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    {o.specialInstructions && (
                      <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-[10px] text-amber-800 italic flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <strong>Instruction:</strong> "{o.specialInstructions}"
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="p-3 border-t border-[#d2d2c4]/40 bg-neutral-50">
                    <button
                      onClick={() => handleMarkReady(o.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4" /> <Bell className="h-4 w-4" /> Food is Ready / Packed
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
                              <span className="inline-flex items-center gap-1"><Bike className="h-3.5 w-3.5" /> Assigned Rider:</span>
                              <span>{o.deliveryStaff}</span>
                            </div>
                          ) : (
                            <div className="space-y-2 bg-rose-50 border border-rose-100 rounded-lg p-2.5">
                              <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> No Rider Assigned yet</span>
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
                            <span className="inline-flex items-center justify-center gap-1.5"><CheckCircle className="h-4 w-4" /> Hand Over to Customer (Complete)</span>
                          </button>
                        ) : o.deliveryStaff ? (
                          <button
                            onClick={() => handleDispatchOrDeliver(o.id, "OUT_FOR_DELIVERY")}
                            className="w-full bg-[#556B2F] hover:bg-[#405223] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Truck className="h-4 w-4" /> Hand Over & Dispatch
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
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark Delivered (Manual Backup Override)</span>
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
