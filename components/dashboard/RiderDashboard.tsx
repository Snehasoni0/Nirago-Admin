"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/pagination"
import { Bike, CheckCircle, Check, IndianRupee, Phone, Send, Map } from "lucide-react"
import Swal from "sweetalert2"
import { cn } from "@/lib/utils"
import type { Order } from "@/app/dashboard/DashboardContext"

interface RiderDashboardProps {
  orders: any[]
  userName: string
  updateOrderStatus: (orderId: string, status: Order["status"], cancellationReason?: string, prepMinutes?: number) => void
}

export function RiderDashboard({
  orders,
  userName,
  updateOrderStatus,
}: RiderDashboardProps) {
  const [riderPage, setRiderPage] = useState(1)

  const myOrders = orders.filter(o => o.deliveryStaff === userName)
  const completedDeliveries = myOrders.filter(o => o.status === "DELIVERED")
  const totalDeliveredCount = completedDeliveries.length

  const todayStr = new Date().toISOString().substring(0, 10)
  const todayDeliveredCount = completedDeliveries.filter(
    o => !o.deliveryDate || o.deliveryDate === todayStr
  ).length

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
      html: `<p className="text-xs text-neutral-500 mb-3">Connecting to GPS Navigation for:</p><b class="text-[#556B2F] text-xs font-sans block bg-[#f5f5e6] p-3 rounded-lg border border-[#d2d2c4]">${address}</b><br/><div className="animate-bounce font-bold text-xs text-[#556B2F]">Navigation Active (ETA: 12 Mins)</div>`,
      icon: "info",
      confirmButtonColor: "#556B2F",
      confirmButtonText: "Close Maps"
    })
  }

  const handleRiderAction = (orderId: string, actionType: "PICKUP" | "DELIVER") => {
    const nextStatus: Order["status"] = actionType === "PICKUP" ? "OUT_FOR_DELIVERY" : "DELIVERED"
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#2d3822]">Riders Dashboard</h2>
          <p className="text-xs text-neutral-500 font-semibold inline-flex items-center gap-1">Welcome back, {userName}. Drive safely today! <Bike className="h-3.5 w-3.5 text-[#556B2F]" /></p>
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
                        <span className="flex items-center gap-1.5 text-sm uppercase">
                          {isCod ? (
                            <>
                              <IndianRupee className="h-4 w-4 shrink-0" />
                              <span>Collect Cash: ₹{o.total}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 shrink-0" />
                              <span>Already Paid Online</span>
                            </>
                          )}
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
                            <Bike className="h-4 w-4" /> Start Delivery Shift / Picked Up
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRiderAction(o.id, "DELIVER")}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="h-4 w-4" /> Mark Delivered & Collected
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
