"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, IndianRupee, AlertTriangle, CheckCircle, Clock, Search, Filter, Settings, FileText } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, Order } from "../DashboardContext"
import { TablePagination } from "@/components/ui/pagination"

export default function PaymentsPage() {
  const { orders, updateOrderPayment } = useDashboard()

  const [userRole, setUserRole] = useState("Owner")
  const [userOutlet, setUserOutlet] = useState("")

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [methodFilter, setMethodFilter] = useState("ALL")
  const [selectedOutletFilter, setSelectedOutletFilter] = useState("ALL")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const txnsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, methodFilter, selectedOutletFilter])

  // Receipt Preview State
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  // Filter orders based on user permissions
  const authFilteredOrders = orders.filter(o => {
    if (userRole === "Outlet Manager" && userOutlet) {
      return o.outlet === userOutlet
    }
    return true
  })

  // Apply visual search and attributes filters
  const filteredTransactions = authFilteredOrders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.transactionId && o.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "ALL" || o.paymentStatus === statusFilter
    const matchesMethod = methodFilter === "ALL" || o.paymentMethod === methodFilter
    const matchesOutlet = selectedOutletFilter === "ALL" || o.outlet === selectedOutletFilter

    return matchesSearch && matchesStatus && matchesMethod && matchesOutlet
  })

  const totalTxnsPages = Math.ceil(filteredTransactions.length / txnsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * txnsPerPage,
    currentPage * txnsPerPage
  )

  // Calculate Metrics
  const metrics = {
    grossVolume: filteredTransactions.filter(o => o.paymentStatus === "PAID").reduce((acc, curr) => acc + curr.total, 0),
    pendingVolume: filteredTransactions.filter(o => o.paymentStatus === "PENDING").reduce((acc, curr) => acc + curr.total, 0),
    failedCount: filteredTransactions.filter(o => o.paymentStatus === "FAILED").length,
    successRate: Math.round(
      (filteredTransactions.filter(o => o.paymentStatus === "PAID").length / (filteredTransactions.length || 1)) * 100
    )
  }

  // Get Unique Outlets for Filters
  const uniqueOutlets = Array.from(new Set(authFilteredOrders.map(o => o.outlet)))



  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">
            {userRole === "Outlet Manager" ? `Payments — ${userOutlet}` : "Payments & Bills"}
          </h2>
          <p className="text-sm text-neutral-600">Track customer payments, billing methods, and transaction status.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Gross Processed Volume</CardTitle>
            <IndianRupee className="h-4 w-4 text-[#556B2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#556B2F]">₹{metrics.grossVolume}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Total volume from settled PAID transactions</p>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Pending Settlements</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₹{metrics.pendingVolume}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Volume from PENDING orders awaiting check</p>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Failed Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedCount}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Failed gateway authorizations</p>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">Settlement Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{metrics.successRate}%</div>
            <p className="text-[10px] text-neutral-500 mt-1">Ratio of successful payments to total attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Control bar */}
      <Card className="border border-[#d2d2c4] bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search Order, Customer, Txn ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            {/* Outlet Filter (Global view only) */}
            {userRole !== "Outlet Manager" && (
              <Select value={selectedOutletFilter} onValueChange={setSelectedOutletFilter}>
                <SelectTrigger className="w-44 bg-white h-10">
                  <SelectValue placeholder="All Outlets" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ALL">All Outlets</SelectItem>
                  {uniqueOutlets.map(out => (
                    <SelectItem key={`filter-outlet-${out}`} value={out}>{out}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-white h-10">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PAID">PAID</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
              </SelectContent>
            </Select>

            {/* Method Filter */}
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-32 bg-white h-10">
                <SelectValue placeholder="Channel Method" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CARD">CARD</SelectItem>
                <SelectItem value="CASH">CASH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border border-[#d2d2c4] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="font-bold text-neutral-800">Order ID</TableHead>
                  <TableHead className="font-bold text-neutral-800">Transaction ID</TableHead>
                  <TableHead className="font-bold text-neutral-800">Customer</TableHead>
                  {userRole !== "Outlet Manager" && <TableHead className="font-bold text-neutral-800">Outlet</TableHead>}
                  <TableHead className="font-bold text-neutral-800">Method</TableHead>
                  <TableHead className="font-bold text-neutral-800">Settled Amount</TableHead>
                  <TableHead className="font-bold text-neutral-800">Payment Status</TableHead>
                  <TableHead className="text-right font-bold text-neutral-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={userRole === "Outlet Manager" ? 7 : 8} className="text-center text-neutral-400 italic py-10">
                      No matching transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((o) => (
                    <TableRow key={`txn-${o.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                      <TableCell className="font-bold text-[#556B2F]">{o.id}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-neutral-700">
                        {o.transactionId || (
                          <span className="text-neutral-400 italic text-[11px]">No Gateway Reference</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">{o.customerName}</TableCell>
                      {userRole !== "Outlet Manager" && (
                        <TableCell className="text-xs text-neutral-500 truncate max-w-[150px]">{o.outlet}</TableCell>
                      )}
                      <TableCell>
                        <Badge variant="outline" className="border-neutral-300 bg-neutral-50 text-[10px] py-0.5 px-2">
                          {o.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-[#2d3822]">₹{o.total}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "font-semibold text-xs py-0.5 px-2.5",
                          o.paymentStatus === "PAID" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                          o.paymentStatus === "PENDING" && "bg-amber-100 text-amber-800 border-amber-200",
                          o.paymentStatus === "FAILED" && "bg-red-100 text-red-800 border-red-200"
                        )}>
                          {o.paymentStatus ?? "PAID"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button 
                          size="xs" 
                          variant="outline" 
                          className="border-neutral-300 text-neutral-600 cursor-pointer"
                          onClick={() => setPreviewOrder(o)}
                        >
                          <FileText className="h-3 w-3 mr-1" /> Slip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalTxnsPages || 1}
            onPageChange={setCurrentPage}
            totalEntries={filteredTransactions.length}
            startEntry={(currentPage - 1) * txnsPerPage + 1}
            endEntry={currentPage * txnsPerPage}
          />
        </CardContent>
      </Card>



      {/* Slip Preview Modal */}
      {previewOrder && (
        <Dialog open={!!previewOrder} onOpenChange={(open) => !open && setPreviewOrder(null)}>
          <DialogContent className="bg-[#FFFFF0] border-2 border-dashed border-[#556B2F] text-neutral-900 max-w-sm font-sans p-6">
            <DialogHeader className="flex flex-col items-center pb-2 border-b border-dashed border-[#556B2F]/30">
              <img src="/brand-logo.png" alt="Nirago Logo" className="h-10 w-10 object-contain mb-1" />
              <DialogTitle className="text-xl font-bold tracking-tight text-[#556B2F]">Nirago Bill Receipt</DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 font-mono">
                {previewOrder.outlet}<br />
                Ph: {previewOrder.customerPhone || "+91 98765 43210"}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 my-1 text-xs space-y-1.5 font-mono border-b border-dashed border-[#556B2F]/30 text-left">
              <div className="flex justify-between"><strong>ORDER NO:</strong> <span>{previewOrder.id}</span></div>
              <div className="flex justify-between"><strong>TRANSACTION ID:</strong> <span className="font-bold">{previewOrder.transactionId || "N/A"}</span></div>
              <div className="flex justify-between"><strong>SETTLEMENT:</strong> <span>{previewOrder.paymentMethod}</span></div>
              <div className="flex justify-between"><strong>STATUS:</strong> <span className="font-bold uppercase text-[#556B2F]">{previewOrder.paymentStatus || "PAID"}</span></div>
              <div className="flex justify-between"><strong>DATE/TIME:</strong> <span>{previewOrder.deliveryDate || new Date().toISOString().substring(0, 10)}</span></div>
            </div>

            <div className="py-2.5 text-xs text-left">
              <span className="font-bold text-[#2d3822] block mb-1">Billing Summary:</span>
              <div className="space-y-1 text-neutral-600 font-mono">
                <div className="flex justify-between"><span>Subtotal:</span> <span>₹{previewOrder.subtotal ?? Math.round(previewOrder.total * 0.85)}</span></div>
                <div className="flex justify-between"><span>GST & Packaging:</span> <span>₹{(previewOrder.gst ?? 20) + (previewOrder.packagingCharge ?? 30)}</span></div>
                <div className="flex justify-between font-bold text-[#2d3822] pt-1.5 border-t border-dashed border-neutral-200">
                  <span>Grand Total:</span>
                  <span className="text-[#556B2F] text-sm font-extrabold">₹{previewOrder.total}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-dashed border-[#556B2F]/30">
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white w-full" onClick={() => {
                Swal.fire({
                  title: "Ledger Printed",
                  text: "Receipt slip exported successfully to auditing records.",
                  icon: "success",
                  confirmButtonColor: "#556B2F"
                })
                setPreviewOrder(null)
              }}>
                Confirm & Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
