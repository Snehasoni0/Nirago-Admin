"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Clock, ClipboardList, User, MapPin, CreditCard, DollarSign, Eye } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, Order } from "../DashboardContext"

export default function OrdersPage() {
  const { 
    orders, 
    deliveryStaff, 
    updateOrderStatus, 
    assignStaffToOrder, 
    setOrderEstTime 
  } = useDashboard()

  const [assignedRider, setAssignedRider] = useState<{ [orderId: string]: string }>({})
  const [estMinutes, setEstMinutes] = useState<{ [orderId: string]: string }>({})
  const [showRiderDialog, setShowRiderDialog] = useState(false)
  const [selectedOrderForStaff, setSelectedOrderForStaff] = useState<Order | null>(null)
  const [showKotDialog, setShowKotDialog] = useState(false)
  const [selectedOrderForKot, setSelectedOrderForKot] = useState<Order | null>(null)
  
  const [showOrderDrawer, setShowOrderDrawer] = useState(false)
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<Order | null>(null)

  const [showManageModal, setShowManageModal] = useState(false)
  const [selectedOrderForManage, setSelectedOrderForManage] = useState<Order | null>(null)

  const [modalEstMinutes, setModalEstMinutes] = useState("")
  const [modalAssignedRider, setModalAssignedRider] = useState("")
  const [showDetailsInModal, setShowDetailsInModal] = useState(false)

  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")

  React.useEffect(() => {
    if (selectedOrderForManage) {
      setModalEstMinutes(selectedOrderForManage.estimatedMinutes?.toString() || "")
      setModalAssignedRider(selectedOrderForManage.deliveryStaff || "")
      setShowDetailsInModal(userRole === "Delivery Staff")
    }
  }, [selectedOrderForManage, userRole])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserName(localStorage.getItem("nirago_user_name") || "Master Admin")
    }
  }, [])

  const visibleOrders = orders.filter(o => {
    if (userRole === "Delivery Staff") {
      return o.deliveryStaff === userName
    }
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">
            {userRole === "Delivery Staff" ? "My Assigned Deliveries" : "Orders Processing Engine"}
          </h2>
          <p className="text-sm text-neutral-600">
            {userRole === "Delivery Staff" ? "Track and complete your assigned orders." : "Accept, track and dispatch orders manually to rider staff."}
          </p>
        </div>
      </div>

      <Card className="border border-[#d2d2c4] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items & Details</TableHead>
                  <TableHead>Total Amt</TableHead>
                  <TableHead>Status Flow</TableHead>
                  <TableHead>Delivery Staff</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleOrders.map((o) => (
                  <TableRow key={`order-row-${o.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell 
                      className="font-bold text-[#556B2F] hover:underline cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedOrderForDrawer(o)
                        setShowOrderDrawer(true)
                      }}
                    >
                      {o.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{o.customerName}</div>
                      <span className="text-[10px] text-neutral-400 block truncate max-w-[150px]">{o.outlet}</span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{o.items}</TableCell>
                    <TableCell className="font-semibold">₹{o.total}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-semibold",
                        o.status === "PLACED" && "bg-blue-100 text-blue-800 border-blue-200",
                        o.status === "ACCEPTED" && "bg-sky-100 text-sky-800 border-sky-200",
                        o.status === "PREPARING" && "bg-amber-100 text-amber-800 border-amber-200",
                        o.status === "READY" && "bg-purple-100 text-purple-800 border-purple-200",
                        o.status === "OUT_FOR_DELIVERY" && "bg-indigo-100 text-indigo-800 border-indigo-200",
                        o.status === "DELIVERED" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                        o.status === "CANCELLED" && "bg-red-100 text-red-800 border-red-200"
                      )}>
                        {o.status}
                      </Badge>
                      {o.estimatedMinutes && (
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1 font-semibold">
                          <Clock className="h-3 w-3" /> {o.estimatedMinutes} mins
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {o.deliveryStaff ? (
                        <span className="text-xs font-semibold text-neutral-700">{o.deliveryStaff}</span>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1.5 space-y-1">
                      {userRole === "Delivery Staff" ? (
                        <Button 
                          size="xs" 
                          className="bg-[#556B2F] hover:bg-[#405223] text-white"
                          disabled={o.status === "DELIVERED"}
                          onClick={() => {
                            setSelectedOrderForManage(o)
                            setShowDetailsInModal(true)
                            setShowManageModal(true)
                          }}
                        >
                          {o.status === "DELIVERED" ? "Delivered" : "View & Update Status"}
                        </Button>
                      ) : (
                        <>
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/10"
                            onClick={() => {
                              setSelectedOrderForDrawer(o)
                              setShowOrderDrawer(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" /> Check
                          </Button>
                          <Button 
                            size="xs" 
                            className="bg-[#556B2F] hover:bg-[#405223] text-white"
                            disabled={o.status === "DELIVERED" || o.status === "CANCELLED" || o.status === "REJECTED"}
                            onClick={() => {
                              setSelectedOrderForManage(o)
                              setShowManageModal(true)
                            }}
                          >
                            Manage
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for manual rider selection */}
      {showRiderDialog && selectedOrderForStaff && (
        <Dialog open={showRiderDialog} onOpenChange={setShowRiderDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Assign Delivery Rider</DialogTitle>
              <DialogDescription>Manually assign active rider to dispatch order {selectedOrderForStaff.id}</DialogDescription>
            </DialogHeader>
            <Select 
              onValueChange={(val) => setAssignedRider(prev => ({ ...prev, [selectedOrderForStaff.id]: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select active rider staff" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {deliveryStaff.filter(s => s.status === "ACTIVE").map(s => (
                  <SelectItem key={`staff-opt-${s.id}`} value={s.name}>{s.name} ({s.phone})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => {
                const rider = assignedRider[selectedOrderForStaff.id]
                if (rider) {
                  assignStaffToOrder(selectedOrderForStaff.id, rider)
                  updateOrderStatus(selectedOrderForStaff.id, "OUT_FOR_DELIVERY")
                  setShowRiderDialog(false)
                } else {
                  Swal.fire({
                    title: "Rider Required",
                    text: "Please choose a delivery rider.",
                    icon: "warning",
                    confirmButtonColor: "#556B2F"
                  })
                }
              }}>
                Confirm & Dispatch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Unified Status Flow Dialog Modal */}
      {showManageModal && selectedOrderForManage && (
        <Sheet open={showManageModal} onOpenChange={setShowManageModal}>
          <SheetContent side="right" className="bg-[#FFFFF0] border-l border-[#d2d2c4] sm:max-w-xl w-full p-6 overflow-y-auto">
            <SheetHeader className="p-0 border-b border-[#d2d2c4] pb-4">
              <SheetTitle className="text-xl font-bold text-[#2d3822] flex items-center gap-2">
                Order Status Manager — {selectedOrderForManage.id}
              </SheetTitle>
              <SheetDescription className="text-neutral-500">
                Track status progression or perform state updates for {selectedOrderForManage.customerName}'s order.
              </SheetDescription>
            </SheetHeader>

            {/* Visual Status Progress Bar (Desktop / Tablet) */}
            <div className="hidden sm:block relative py-6 my-2">
              {/* Connector line background */}
              <div className="absolute top-1/2 left-6 right-6 h-1 bg-neutral-200 -translate-y-1/2 rounded-full" />
              
              {/* Filled connector line */}
              {(() => {
                const steps = ["PLACED", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]
                const currentIdx = steps.indexOf(selectedOrderForManage.status)
                if (currentIdx < 0) return null
                return (
                  <div 
                    className="absolute top-1/2 left-6 h-1 bg-[#556B2F] -translate-y-1/2 transition-all duration-300 rounded-full" 
                    style={{ width: `calc(${(currentIdx / 5) * 100}% - 12px)` }}
                  />
                )
              })()}

              {/* Step Circles */}
              <div className="relative flex justify-between">
                {(() => {
                  const steps = [
                    { key: "PLACED", label: "Placed" },
                    { key: "ACCEPTED", label: "Accepted" },
                    { key: "PREPARING", label: "Preparing" },
                    { key: "READY", label: "Ready" },
                    { key: "OUT_FOR_DELIVERY", label: "Dispatched" },
                    { key: "DELIVERED", label: "Delivered" }
                  ]
                  const currentIdx = steps.findIndex(s => s.key === selectedOrderForManage.status)
                  const isTerminated = selectedOrderForManage.status === "CANCELLED" || selectedOrderForManage.status === "REJECTED"

                  return steps.map((step, idx) => {
                    const isCompleted = !isTerminated && currentIdx >= idx
                    const isActive = !isTerminated && currentIdx === idx

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm z-10 border-2",
                          isCompleted 
                            ? "bg-[#556B2F] border-[#556B2F] text-[#FFFFF0]" 
                            : "bg-white border-neutral-300 text-neutral-400",
                          isActive && "ring-4 ring-[#556B2F]/20 scale-110"
                        )}>
                          {isCompleted && !isActive ? "✓" : idx + 1}
                        </div>
                        <span className={cn(
                          "text-[10px] mt-2 font-semibold tracking-tight whitespace-nowrap",
                          isActive ? "text-[#556B2F] font-bold" : "text-neutral-500"
                        )}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Visual Status Progress Bar (Mobile Stack) */}
            <div className="block sm:hidden relative pl-8 py-4 space-y-5 my-2 border-b border-[#d2d2c4]/20 pb-4">
              {/* Vertical connector line */}
              <div className="absolute top-4 bottom-4 left-3 w-1 bg-neutral-200 rounded-full" />
              
              {/* Filled vertical connector line */}
              {(() => {
                const steps = ["PLACED", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]
                const currentIdx = steps.indexOf(selectedOrderForManage.status)
                if (currentIdx < 0) return null
                return (
                  <div 
                    className="absolute top-4 left-3 w-1 bg-[#556B2F] transition-all duration-300 rounded-full" 
                    style={{ height: `calc(${(currentIdx / 5) * 100}% - 4px)` }}
                  />
                )
              })()}

              {/* Steps */}
              {(() => {
                const steps = [
                  { key: "PLACED", label: "Placed" },
                  { key: "ACCEPTED", label: "Accepted" },
                  { key: "PREPARING", label: "Preparing" },
                  { key: "READY", label: "Ready" },
                  { key: "OUT_FOR_DELIVERY", label: "Dispatched" },
                  { key: "DELIVERED", label: "Delivered" }
                ]
                const currentIdx = steps.findIndex(s => s.key === selectedOrderForManage.status)
                const isTerminated = selectedOrderForManage.status === "CANCELLED" || selectedOrderForManage.status === "REJECTED"

                return steps.map((step, idx) => {
                  const isCompleted = !isTerminated && currentIdx >= idx
                  const isActive = !isTerminated && currentIdx === idx

                  return (
                    <div key={idx} className="flex items-center gap-3 relative min-h-6">
                      {/* Step Circle */}
                      <div className={cn(
                        "absolute -left-8 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm z-10 border-2",
                        isCompleted 
                          ? "bg-[#556B2F] border-[#556B2F] text-[#FFFFF0]" 
                          : "bg-white border-neutral-300 text-neutral-400",
                        isActive && "ring-4 ring-[#556B2F]/20 scale-110"
                      )}>
                        {isCompleted && !isActive ? "✓" : idx + 1}
                      </div>
                      <span className={cn(
                        "text-xs font-semibold tracking-tight",
                        isActive ? "text-[#556B2F] font-bold" : "text-neutral-500"
                      )}>
                        {step.label} {isActive && <span className="text-[10px] bg-[#556B2F]/10 text-[#556B2F] px-1.5 py-0.5 rounded-full ml-1 font-bold">Active</span>}
                      </span>
                    </div>
                  )
                })
              })()}
            </div>

            {/* Order Details Card (Static & High Premium Style) */}
            <div className="space-y-4 my-4">
              {/* Delivery Rider Assignment (Admin only) */}
              {userRole !== "Delivery Staff" && (
                <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <User className="h-4 w-4" /> Delivery Partner Assignment
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Assign Delivery Rider</label>
                      <Select 
                        value={modalAssignedRider}
                        onValueChange={(val) => {
                          setModalAssignedRider(val)
                          assignStaffToOrder(selectedOrderForManage.id, val)
                          Swal.fire({
                            title: "Rider Assigned",
                            text: `Successfully assigned ${val} to order ${selectedOrderForManage.id}.`,
                            icon: "success",
                            confirmButtonColor: "#556B2F",
                            timer: 1500
                          })
                        }}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder={selectedOrderForManage.deliveryStaff || "Select active rider staff"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {deliveryStaff.filter(s => s.status === "ACTIVE").map(s => (
                            <SelectItem key={`assign-rider-opt-${s.id}`} value={s.name}>{s.name} ({s.phone})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer details card */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <User className="h-4 w-4" /> Customer Details
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Name:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForManage.customerName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Phone:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForManage.customerPhone ?? "Not Provided"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 shrink-0 font-medium mt-0.5">Address:</span>
                    <span className="font-semibold text-neutral-800 flex items-start gap-1">
                      <MapPin className="h-4 w-4 shrink-0 text-[#556B2F] mt-0.5" />
                      {selectedOrderForManage.customerAddress ?? "Self-Pickup (No delivery address)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Summary card */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <ClipboardList className="h-4 w-4" /> Ordered Items
                </h3>
                <div className="divide-y divide-neutral-100">
                  {selectedOrderForManage.structuredItems && selectedOrderForManage.structuredItems.length > 0 ? (
                    selectedOrderForManage.structuredItems.map((item, idx) => (
                      <div key={idx} className="py-2.5 space-y-1 first:pt-0 last:pb-0 text-sm">
                        <div className="flex justify-between font-medium">
                          <span className="text-neutral-800">{item.name}</span>
                          <span className="text-[#556B2F] font-semibold">₹{item.price} x {item.quantity}</span>
                        </div>
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="pl-3 text-xs text-neutral-500 space-y-0.5">
                            <span className="font-semibold block text-[#556B2F]/70">Add-ons:</span>
                            {item.addOns.map((add, aIdx) => (
                              <span key={aIdx} className="block">• {add}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    selectedOrderForManage.items.split(", ").map((item, idx) => {
                      const match = item.match(/^(\d+)x\s+(.+)$/)
                      const qty = match ? match[1] : "1"
                      const itemName = match ? match[2] : item
                      return (
                        <div key={idx} className="flex justify-between py-2 text-sm first:pt-0 last:pb-0">
                          <span className="text-neutral-800">{itemName}</span>
                          <span className="font-semibold text-[#556B2F]">Qty: {qty}</span>
                        </div>
                      )
                    })
                  )}
                </div>

                {selectedOrderForManage.specialInstructions && (
                  <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg mt-3 text-xs space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1">
                      💡 Customer Instructions:
                    </span>
                    <p className="text-neutral-700 italic font-medium">"{selectedOrderForManage.specialInstructions}"</p>
                  </div>
                )}

                <div className="border-t border-dashed border-[#d2d2c4] pt-3 mt-3 flex justify-between items-center text-sm font-bold text-[#2d3822]">
                  <span>Total (to pay via {selectedOrderForManage.paymentMethod}):</span>
                  <span className="text-[#556B2F] text-base font-extrabold">₹{selectedOrderForManage.total}</span>
                </div>
              </div>
            </div>

            {/* Cancelled/Rejected Banner */}
            {(selectedOrderForManage.status === "CANCELLED" || selectedOrderForManage.status === "REJECTED") && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 my-2">
                <span className="text-base">⚠️ Order Terminated</span>
                <p className="text-xs text-neutral-500 font-normal">This order has been marked as {selectedOrderForManage.status.toLowerCase()}. No further actions can be performed.</p>
              </div>
            )}

            {/* Actions Form Section */}
            {selectedOrderForManage.status !== "CANCELLED" && selectedOrderForManage.status !== "REJECTED" && (
              <div className="bg-[#f5f5e6]/30 border border-[#d2d2c4] p-4 rounded-xl space-y-4 my-2">
                <div className="flex justify-between items-center border-b border-[#d2d2c4]/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Current Action Required</span>
                  <Badge className="bg-[#e6e6d8] text-[#2d3822] border-[#d2d2c4]">{selectedOrderForManage.status}</Badge>
                </div>

                {/* State: PLACED */}
                {selectedOrderForManage.status === "PLACED" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Review this order and click "Accept Order" to start preparation, or "Reject Order" if it cannot be fulfilled.</p>
                    {userRole !== "Delivery Staff" ? (
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-[#556B2F] hover:bg-[#405223] text-white"
                          onClick={() => {
                            updateOrderStatus(selectedOrderForManage.id, "ACCEPTED")
                            setSelectedOrderForManage(prev => prev ? { ...prev, status: "ACCEPTED" } : null)
                          }}
                        >
                          Accept Order
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            updateOrderStatus(selectedOrderForManage.id, "CANCELLED")
                            setSelectedOrderForManage(prev => prev ? { ...prev, status: "CANCELLED" } : null)
                          }}
                        >
                          Reject Order
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold">Waiting for store manager acceptance.</p>
                    )}
                  </div>
                )}

                {/* State: ACCEPTED */}
                {selectedOrderForManage.status === "ACCEPTED" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Enter the estimated food preparation time (in minutes) to progress this order to the preparing kitchen stage.</p>
                    {userRole !== "Delivery Staff" ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-600">Prep Time (Minutes)</label>
                          <Input 
                            type="number" 
                            placeholder="e.g. 25" 
                            value={modalEstMinutes}
                            onChange={(e) => setModalEstMinutes(e.target.value)}
                          />
                        </div>
                        <Button 
                          className="w-full bg-[#556B2F] hover:bg-[#405223] text-white"
                          onClick={() => {
                            const mins = parseInt(modalEstMinutes) || 20
                            setOrderEstTime(selectedOrderForManage.id, mins)
                            updateOrderStatus(selectedOrderForManage.id, "PREPARING")
                            setSelectedOrderForManage(prev => prev ? { ...prev, status: "PREPARING", estimatedMinutes: mins } : null)
                          }}
                        >
                          Start Preparing
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold">Waiting for store manager to configure preparation time.</p>
                    )}
                  </div>
                )}

                {/* State: PREPARING */}
                {selectedOrderForManage.status === "PREPARING" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Kitchen is preparing. Mark as ready once the items are prepared and packed for pickup/delivery.</p>
                    {userRole !== "Delivery Staff" ? (
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => {
                          updateOrderStatus(selectedOrderForManage.id, "READY")
                          setSelectedOrderForManage(prev => prev ? { ...prev, status: "READY" } : null)
                        }}
                      >
                        Mark Ready for Dispatch
                      </Button>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold">Kitchen is currently preparing food items.</p>
                    )}
                  </div>
                )}

                {/* State: READY */}
                {selectedOrderForManage.status === "READY" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">
                      {userRole === "Delivery Staff" 
                        ? "The order is ready for pickup in the kitchen. Mark as picked up and leave for delivery."
                        : "Select an active delivery agent to manually assign and dispatch this order."
                      }
                    </p>
                    {userRole !== "Delivery Staff" ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-600">Select Delivery Rider</label>
                          <Select 
                            value={modalAssignedRider}
                            onValueChange={setModalAssignedRider}
                          >
                            <SelectTrigger className="w-full bg-white">
                              <SelectValue placeholder="Select active rider staff" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {deliveryStaff.filter(s => s.status === "ACTIVE").map(s => (
                                <SelectItem key={`modal-staff-opt-${s.id}`} value={s.name}>{s.name} ({s.phone})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => {
                            if (modalAssignedRider) {
                              assignStaffToOrder(selectedOrderForManage.id, modalAssignedRider)
                              updateOrderStatus(selectedOrderForManage.id, "OUT_FOR_DELIVERY")
                              setSelectedOrderForManage(prev => prev ? { ...prev, status: "OUT_FOR_DELIVERY", deliveryStaff: modalAssignedRider } : null)
                            } else {
                              Swal.fire("Rider Required", "Please choose a rider to dispatch.", "warning")
                            }
                          }}
                        >
                          Confirm Rider & Dispatch
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => {
                          updateOrderStatus(selectedOrderForManage.id, "OUT_FOR_DELIVERY")
                          setSelectedOrderForManage(prev => prev ? { ...prev, status: "OUT_FOR_DELIVERY" } : null)
                          Swal.fire({
                            title: "Picked Up!",
                            text: "Order status marked as Left for Delivery.",
                            icon: "success",
                            confirmButtonColor: "#556B2F"
                          })
                        }}
                      >
                        Pick Up & Left for Delivery
                      </Button>
                    )}
                  </div>
                )}

                {/* State: OUT_FOR_DELIVERY */}
                {selectedOrderForManage.status === "OUT_FOR_DELIVERY" && (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-600">Rider {selectedOrderForManage.deliveryStaff} is currently delivering. Click complete once items reach the destination.</p>
                    
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        updateOrderStatus(selectedOrderForManage.id, "DELIVERED")
                        setSelectedOrderForManage(prev => prev ? { ...prev, status: "DELIVERED" } : null)
                        Swal.fire({
                          title: "Delivered!",
                          text: `Order ${selectedOrderForManage.id} marked as delivered successfully.`,
                          icon: "success",
                          confirmButtonColor: "#556B2F"
                        })
                      }}
                    >
                      Mark Delivered Successfully
                    </Button>
                  </div>
                )}

                {/* State: DELIVERED */}
                {selectedOrderForManage.status === "DELIVERED" && (
                  <div className="space-y-1 text-center py-2">
                    <p className="text-sm font-semibold text-emerald-700">🎉 Order Delivered successfully!</p>
                    <p className="text-xs text-neutral-500">All stages of fulfillment have been verified and processed.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex sm:justify-between items-center mt-6 pt-4 border-t border-[#d2d2c4] gap-2">
              {userRole !== "Delivery Staff" && (
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-neutral-300 text-neutral-600"
                  onClick={() => {
                    setSelectedOrderForKot(selectedOrderForManage)
                    setShowKotDialog(true)
                  }}
                >
                  Print Kitchen Slip (KOT)
                </Button>
              )}
              <Button type="button" className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => setShowManageModal(false)}>
                Close
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Dialog for KOT Preview */}
      {showKotDialog && selectedOrderForKot && (
        <Dialog open={showKotDialog} onOpenChange={setShowKotDialog}>
          <DialogContent className="bg-[#FFFFF0] border-2 border-dashed border-[#556B2F] text-neutral-900 max-w-sm">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-bold tracking-tight text-[#556B2F]">KITCHEN ORDER TICKET (KOT)</DialogTitle>
              <DialogDescription className="text-neutral-500">Nirago Kitchen Staff Routing Slip</DialogDescription>
            </DialogHeader>
            <div className="border-t border-b border-[#556B2F]/30 py-4 my-2 text-sm space-y-1 font-mono">
              <p><strong>Order ID:</strong> {selectedOrderForKot.id}</p>
              <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>Fulfillment:</strong> Delivery (Manual assignment)</p>
              <p><strong>Outlet:</strong> {selectedOrderForKot.outlet}</p>
              <div className="border-t border-dashed border-[#556B2F]/30 my-3 pt-3">
                <p className="font-bold text-[#556B2F] mb-1">ITEMS:</p>
                <p className="text-sm whitespace-pre-line">{selectedOrderForKot.items.replaceAll(", ", "\n")}</p>
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white w-full" onClick={() => {
                Swal.fire({
                  title: "Slip Printed",
                  text: "KOT printed successfully to kitchen thermal slot!",
                  icon: "success",
                  confirmButtonColor: "#556B2F"
                })
                setShowKotDialog(false)
              }}>
                Print Slip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Side Drawer for Order Details */}
      <Sheet open={showOrderDrawer} onOpenChange={setShowOrderDrawer}>
        <SheetContent side="right" className="bg-[#FFFFF0] border-l border-[#d2d2c4] sm:max-w-xl w-full p-6 overflow-y-auto">
          {selectedOrderForDrawer && (
            <div className="space-y-6">
              <SheetHeader className="p-0 border-b border-[#d2d2c4] pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">Order Verification</span>
                  <Badge className={cn(
                    "font-semibold",
                    selectedOrderForDrawer.status === "PLACED" && "bg-blue-100 text-blue-800 border-blue-200",
                    selectedOrderForDrawer.status === "ACCEPTED" && "bg-sky-100 text-sky-800 border-sky-200",
                    selectedOrderForDrawer.status === "PREPARING" && "bg-amber-100 text-amber-800 border-amber-200",
                    selectedOrderForDrawer.status === "READY" && "bg-purple-100 text-purple-800 border-purple-200",
                    selectedOrderForDrawer.status === "OUT_FOR_DELIVERY" && "bg-indigo-100 text-indigo-800 border-indigo-200",
                    selectedOrderForDrawer.status === "DELIVERED" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                    selectedOrderForDrawer.status === "CANCELLED" && "bg-red-100 text-red-800 border-red-200"
                  )}>
                    {selectedOrderForDrawer.status}
                  </Badge>
                </div>
                <SheetTitle className="text-2xl font-bold text-[#2d3822] mt-2 flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-[#556B2F]" />
                  Order {selectedOrderForDrawer.id}
                </SheetTitle>
                <SheetDescription className="text-neutral-600 mt-1">
                  Placed at {selectedOrderForDrawer.outlet}
                </SheetDescription>
              </SheetHeader>

              {/* Customer Info Section */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <User className="h-4 w-4" /> Customer Details
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Name:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForDrawer.customerName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Phone:</span>
                    <span className="font-semibold text-neutral-800">{selectedOrderForDrawer.customerPhone ?? "Not Provided"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 shrink-0 font-medium mt-0.5">Address:</span>
                    <span className="font-semibold text-neutral-800 flex items-start gap-1">
                      <MapPin className="h-4 w-4 shrink-0 text-[#556B2F] mt-0.5" />
                      {selectedOrderForDrawer.customerAddress ?? "Self-Pickup (No delivery address)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <ClipboardList className="h-4 w-4" /> Ordered Items
                </h3>
                <div className="divide-y divide-neutral-100">
                  {selectedOrderForDrawer.structuredItems && selectedOrderForDrawer.structuredItems.length > 0 ? (
                    selectedOrderForDrawer.structuredItems.map((item, idx) => (
                      <div key={idx} className="py-2.5 space-y-1 first:pt-0 last:pb-0 text-sm">
                        <div className="flex justify-between font-medium">
                          <span className="text-neutral-800">{item.name}</span>
                          <span className="text-[#556B2F] font-semibold">₹{item.price} x {item.quantity}</span>
                        </div>
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="pl-3 text-xs text-neutral-500 space-y-0.5">
                            <span className="font-semibold block text-[#556B2F]/70">Add-ons:</span>
                            {item.addOns.map((add, aIdx) => (
                              <span key={aIdx} className="block">• {add}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    selectedOrderForDrawer.items.split(", ").map((item, idx) => {
                      const match = item.match(/^(\d+)x\s+(.+)$/)
                      const qty = match ? match[1] : "1"
                      const itemName = match ? match[2] : item
                      return (
                        <div key={idx} className="flex justify-between py-2 text-sm first:pt-0 last:pb-0">
                          <span className="text-neutral-800">{itemName}</span>
                          <span className="font-semibold text-[#556B2F]">Qty: {qty}</span>
                        </div>
                      )
                    })
                  )}
                </div>

                {selectedOrderForDrawer.specialInstructions && (
                  <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg mt-3 text-xs space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1">
                      💡 Customer Instructions:
                    </span>
                    <p className="text-neutral-700 italic font-medium">"{selectedOrderForDrawer.specialInstructions}"</p>
                  </div>
                )}
              </div>

              {/* Payment & Charges Section */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <CreditCard className="h-4 w-4" /> Billing Summary
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-neutral-800">₹{selectedOrderForDrawer.subtotal ?? (selectedOrderForDrawer.total - (selectedOrderForDrawer.gst ?? 0) - (selectedOrderForDrawer.packagingCharge ?? 0) - (selectedOrderForDrawer.deliveryCharge ?? 0))}</span>
                  </div>
                  {selectedOrderForDrawer.gst !== undefined && (
                    <div className="flex justify-between">
                      <span>GST (Tax):</span>
                      <span className="font-medium text-neutral-800">₹{selectedOrderForDrawer.gst}</span>
                    </div>
                  )}
                  {selectedOrderForDrawer.packagingCharge !== undefined && (
                    <div className="flex justify-between">
                      <span>Packaging Charges:</span>
                      <span className="font-medium text-neutral-800">₹{selectedOrderForDrawer.packagingCharge}</span>
                    </div>
                  )}
                  {selectedOrderForDrawer.deliveryCharge !== undefined && (
                    <div className="flex justify-between">
                      <span>Delivery Charges:</span>
                      <span className="font-medium text-neutral-800 font-mono">
                        {selectedOrderForDrawer.deliveryCharge === 0 ? "FREE" : `₹${selectedOrderForDrawer.deliveryCharge}`}
                      </span>
                    </div>
                  )}
                  {selectedOrderForDrawer.discount !== undefined && selectedOrderForDrawer.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount:</span>
                      <span>-₹{selectedOrderForDrawer.discount}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-dashed border-[#d2d2c4] pt-2 mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <Badge className={cn(
                        "font-semibold text-[10px] py-0 px-2",
                        selectedOrderForDrawer.paymentStatus === "PAID" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                        selectedOrderForDrawer.paymentStatus === "PENDING" && "bg-amber-100 text-amber-800 border-amber-200",
                        selectedOrderForDrawer.paymentStatus === "FAILED" && "bg-red-100 text-red-800 border-red-200"
                      )}>
                        {selectedOrderForDrawer.paymentStatus ?? "PAID"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-bold text-neutral-800 uppercase">{selectedOrderForDrawer.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fulfillment:</span>
                      <span className="font-bold text-neutral-800 uppercase">{selectedOrderForDrawer.fulfillmentType ?? "DELIVERY"}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-neutral-100">
                      <span className="font-bold text-[#2d3822]">Grand Total:</span>
                      <span className="font-extrabold text-[#556B2F] text-lg">₹{selectedOrderForDrawer.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery / Status Details */}
              <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-3 shadow-sm">
                <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <Clock className="h-4 w-4" /> Dispatch Logistics
                </h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Prep Time:</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedOrderForDrawer.estimatedMinutes ? `${selectedOrderForDrawer.estimatedMinutes} mins` : "Not set"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 shrink-0 font-medium">Assigned Rider:</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedOrderForDrawer.deliveryStaff || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
