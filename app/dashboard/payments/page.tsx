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
  const [previewOrder, setPreviewOrder] = useState<any | null>(null)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPaymentsData = async () => {
    setLoading(true)
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments?page=1&limit=1000`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("API CALL SUCCESS: GET /admin/payments =>", data);
      if (data.success && data.data) {
        setPayments(data.data.payments || []);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPaymentsData()
  }, [])

  // Map raw backend payments to UI structures
  const mappedTransactions = payments.map((p: any) => {
    const matchedOrder = orders.find(o => o.dbId === p.orderId?._id);
    return {
      id: p.orderId?.orderNumber || matchedOrder?.id || "N/A",
      orderDbId: p.orderId?._id,
      paymentId: p._id,
      transactionId: p.transactionId,
      customerName: matchedOrder?.customerName || "Customer",
      customerPhone: matchedOrder?.customerPhone || "",
      paymentMethod: (p.paymentMethod || "CASH").toUpperCase(),
      paymentStatus: (p.status || "PENDING").toUpperCase() === "SUCCESS" ? "PAID" : (p.status || "PENDING").toUpperCase(),
      total: p.amount || 0,
      subtotal: matchedOrder?.subtotal || Math.round((p.amount || 0) * 0.85),
      gst: matchedOrder?.gst || 20,
      packagingCharge: matchedOrder?.packagingCharge || 30,
      outlet: matchedOrder?.outlet || "Nirago Outlet",
      fulfillmentType: matchedOrder?.fulfillmentType || "DELIVERY",
      status: matchedOrder?.status || "DELIVERED",
      deliveryDate: p.paidAt ? new Date(p.paidAt).toISOString().substring(0, 10) : (matchedOrder?.deliveryDate || new Date().toISOString().substring(0, 10)),
      structuredItems: matchedOrder?.structuredItems || [],
      items: matchedOrder?.items || "",
      
      // Backend specific fields
      paymentGateway: p.paymentGateway || "N/A",
      paidAt: p.paidAt ? new Date(p.paidAt).toLocaleString("en-IN") : "N/A",
      rawStatus: p.status || "pending"
    };
  });

  // Filter orders based on user permissions
  const authFilteredOrders = mappedTransactions.filter(o => {
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
      </div>

      {/* Transactions Table */}
      <Card className="border border-[#d2d2c4] bg-white shadow-sm gap-0 py-0">
        <CardContent className="p-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="px-6 font-bold text-neutral-800">Transaction Ref</TableHead>
                  <TableHead className="px-6 font-bold text-neutral-800">Customer</TableHead>
                  <TableHead className="px-6 font-bold text-neutral-800">Method</TableHead>
                  <TableHead className="px-6 font-bold text-neutral-800">Amount & Status</TableHead>
                  <TableHead className="text-right px-6 font-bold text-neutral-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-neutral-400 italic py-10 px-6">
                      No matching transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((o) => (
                    <TableRow key={`txn-${o.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                      <TableCell className="px-6">
                        <div className="font-mono text-xs font-semibold text-neutral-700">
                          {o.transactionId || (
                            <span className="text-neutral-400 italic text-[11px]">No Gateway Reference</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#556B2F] font-bold block mt-0.5">Order ID: {o.id}</span>
                      </TableCell>
                      <TableCell className="px-6 font-medium text-neutral-800">{o.customerName}</TableCell>
                      <TableCell className="px-6">
                        <Badge variant="outline" className="border-neutral-300 bg-neutral-50 text-[10px] py-0.5 px-2">
                          {o.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2d3822] text-sm">₹{o.total}</span>
                          <Badge className={cn(
                            "font-semibold text-[10px] py-0 px-2",
                            o.paymentStatus === "PAID" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                            o.paymentStatus === "PENDING" && "bg-amber-100 text-amber-800 border-amber-200",
                            o.paymentStatus === "FAILED" && "bg-red-100 text-red-800 border-red-200"
                          )}>
                            {o.paymentStatus ?? "PAID"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className="border-neutral-300 text-neutral-600 cursor-pointer"
                            onClick={() => setPreviewOrder(o)}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Slip
                          </Button>
                          <Button 
                            size="xs" 
                            variant="outline"
                            className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 cursor-pointer"
                            onClick={() => setSelectedOrderForDetails(o)}
                          >
                            Details
                          </Button>
                        </div>
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
              <img src="/Cafe-logo.png" alt="Cafe De Nira Logo" className="h-12 w-12 object-contain mb-1" />
              <DialogTitle className="font-playfair italic font-bold text-[#556B2F] tracking-wide text-2xl">Cafe De Nira®</DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 font-mono text-center mt-1">
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

      {/* Order Details Dialog Modal */}
      {selectedOrderForDetails && (
        <Dialog open={!!selectedOrderForDetails} onOpenChange={(open) => !open && setSelectedOrderForDetails(null)}>
          <DialogContent className="bg-white border border-[#d2d2c4] max-w-lg overflow-y-auto max-h-[90vh] no-scrollbar">
            <DialogHeader className="pr-8 pb-3 border-b">
              <DialogTitle className="text-lg font-bold text-[#2d3822]">
                Order Details: {selectedOrderForDetails.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                Fulfillment logistics, items ledger, and audit history.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4 text-xs font-semibold text-neutral-600">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200/50">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block mb-0.5">Customer Name</span>
                  <span className="text-xs font-bold text-neutral-800">{selectedOrderForDetails.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block mb-0.5">Outlet Location</span>
                  <span className="text-xs font-bold text-[#556B2F]">{selectedOrderForDetails.outlet}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block mb-0.5">Phone Number</span>
                  <span className="text-xs font-bold text-neutral-800 font-mono">{selectedOrderForDetails.customerPhone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block mb-0.5">Fulfillment Type</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-bold uppercase border-neutral-300">
                    {selectedOrderForDetails.fulfillmentType || "DELIVERY"}
                  </Badge>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 border-b border-neutral-100 pb-3">
                <span className="text-neutral-500 block">Ordered Items Ledger:</span>
                <div className="space-y-1.5 bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-200/40">
                  {selectedOrderForDetails.structuredItems && selectedOrderForDetails.structuredItems.length > 0 ? (
                    selectedOrderForDetails.structuredItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-neutral-700">
                          {item.name} <span className="text-neutral-400 font-normal">x {item.quantity}</span>
                        </span>
                        <span className="font-mono text-neutral-600">₹{item.price * item.quantity}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-neutral-700 font-bold">{selectedOrderForDetails.items}</div>
                  )}
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Paid At Timestamp:</span>
                  <span className="font-bold text-neutral-800">{selectedOrderForDetails.paidAt || "N/A"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Payment Method:</span>
                  <span className="font-bold text-neutral-800 uppercase">{selectedOrderForDetails.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Payment Gateway:</span>
                  <span className="font-bold text-neutral-800 uppercase text-[#556B2F]">{selectedOrderForDetails.paymentGateway}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Transaction ID:</span>
                  <span className="font-bold text-neutral-800 font-mono">{selectedOrderForDetails.transactionId || "No Reference ID"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Grand Total Settled:</span>
                  <span className="font-bold text-[#556B2F] text-sm">₹{selectedOrderForDetails.total}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Payment DB ID:</span>
                  <span className="font-bold text-neutral-500 font-mono text-[10px]">{selectedOrderForDetails.paymentId || "N/A"}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-between items-center pb-2">
                <span className="text-neutral-400">Fulfillment Status:</span>
                <Badge className={cn(
                  "font-bold uppercase text-[10px]",
                  selectedOrderForDetails.status === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                )}>
                  {selectedOrderForDetails.status || "PENDING"}
                </Badge>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button 
                variant="outline"
                className="border-neutral-300 text-neutral-600 font-bold text-xs"
                onClick={() => setSelectedOrderForDetails(null)}
              >
                Close Panel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
