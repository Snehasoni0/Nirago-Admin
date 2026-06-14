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
import { Clock } from "lucide-react"
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Orders Processing Engine</h2>
          <p className="text-sm text-neutral-600">Accept, track and dispatch orders manually to rider staff.</p>
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
                {orders.map((o) => (
                  <TableRow key={`order-row-${o.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold text-neutral-800">{o.id}</TableCell>
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
                      {o.status === "PLACED" && (
                        <>
                          <Button 
                            size="xs" 
                            className="bg-[#556B2F] hover:bg-[#405223] text-white"
                            onClick={() => updateOrderStatus(o.id, "ACCEPTED")}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="xs" 
                            variant="destructive"
                            onClick={() => updateOrderStatus(o.id, "CANCELLED")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {o.status === "ACCEPTED" && (
                        <div className="flex gap-2 justify-end items-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="xs" variant="outline" className="border-[#556B2F] text-[#556B2F]">
                                Set Prep Time
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                              <DialogHeader>
                                <DialogTitle>Set Preparation Time</DialogTitle>
                                <DialogDescription>Enter preparation time (in minutes) for Order {o.id}</DialogDescription>
                              </DialogHeader>
                              <Input 
                                type="number" 
                                placeholder="e.g. 30" 
                                value={estMinutes[o.id] || ""}
                                onChange={(e) => setEstMinutes(prev => ({ ...prev, [o.id]: e.target.value }))}
                              />
                              <DialogFooter>
                                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => {
                                  setOrderEstTime(o.id, parseInt(estMinutes[o.id]) || 20)
                                  updateOrderStatus(o.id, "PREPARING")
                                }}>
                                  Save & Start Preparing
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      {o.status === "PREPARING" && (
                        <Button 
                          size="xs" 
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => updateOrderStatus(o.id, "READY")}
                        >
                          Mark Ready
                        </Button>
                      )}
                      {o.status === "READY" && (
                        <Button 
                          size="xs" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => {
                            setSelectedOrderForStaff(o)
                            setShowRiderDialog(true)
                          }}
                        >
                          Assign Rider & Dispatch
                        </Button>
                      )}
                      {o.status === "OUT_FOR_DELIVERY" && (
                        <Button 
                          size="xs" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => updateOrderStatus(o.id, "DELIVERED")}
                        >
                          Complete Order
                        </Button>
                      )}
                      
                      <Button 
                        size="xs" 
                        variant="outline" 
                        className="border-neutral-300 text-neutral-600"
                        onClick={() => {
                          setSelectedOrderForKot(o)
                          setShowKotDialog(true)
                        }}
                      >
                        Print KOT
                      </Button>
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
    </div>
  )
}
