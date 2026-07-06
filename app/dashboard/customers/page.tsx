"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboard, Customer } from "../DashboardContext"

import Swal from "sweetalert2"
import { TablePagination } from "@/components/ui/pagination"
import { Search, UserCheck, UserCheck2, UserX, MapPin } from "lucide-react"

export default function CustomersPage() {
  const { 
    customers, 
    toggleCustomerStatus, 
    loyaltyTiers, 
    handleAddLoyaltyTier, 
    toggleLoyaltyTierStatus,
    handleCustomerDeposit,
    handleAssignCustomerTier 
  } = useDashboard()

  const [activeTab, setActiveTab] = useState<"directory" | "tiers">("directory")
  const [searchTerm, setSearchTerm] = useState("")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const customersPerPage = 10

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  
  // Wallet / Tier Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState<Customer | null>(null)

  const [couponCode, setCouponCode] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [minOrder, setMinOrder] = useState("")
  const [coupons, setCoupons] = useState<Array<{code:string;type:string;value:number;minOrder:number}>>([])
  // New Loyalty Tier Form State
const [depositAmount, setDepositAmount] = useState("");


  // Filter customers based on search term
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  const totalCustomersPages = Math.ceil(filteredCustomers.length / customersPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * customersPerPage,
    currentPage * customersPerPage
  )

  const openManageModal = (c: Customer) => {
    setSelectedCustomer(c)


  }

  const closeManageModal = () => {
    setSelectedCustomer(null)
  }




  const handleAddCoupon = () => {
    if (!couponCode) {
      Swal.fire({title: 'Error', text: 'Enter a coupon code.', icon: 'error', confirmButtonColor: '#556B2F'});
      return;
    }
    const valueNum = parseFloat(discountValue) || 0;
    const minOrderNum = parseFloat(minOrder) || 0;
    const newCoupon = {code: couponCode, type: discountType, value: valueNum, minOrder: minOrderNum};
    setCoupons([...coupons, newCoupon]);
    // Reset fields
    setCouponCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrder("");
    Swal.fire({title: 'Success', text: `Coupon added.`, icon: 'success', confirmButtonColor: '#556B2F'});
  };

  const handleDeleteCoupon = (idx: number) => {
    const updated = coupons.filter((_, i) => i !== idx);
    setCoupons(updated);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
  <h2 className="text-2xl font-bold text-[#2d3822]">Customers</h2>
  <p className="text-sm text-neutral-600">Track client directories and top up advance cash deposits.</p>
</div>
      </div>

    

      {/* Tab 1: Directory */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input 
              placeholder="Search customers by name, email, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#d2d2c4] bg-white w-full"
            />
          </div>

          <Card className="border border-[#d2d2c4] bg-white gap-0 py-0">
            <CardContent className="p-0 px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#e6e6d8]/20">
                    <TableRow className="border-b border-[#d2d2c4]">
                      <TableHead className="px-6">ID</TableHead>
                      <TableHead className="px-6">Name</TableHead>
                      <TableHead className="px-6">Phone Number</TableHead>
                      <TableHead className="px-6 w-[150px] min-w-[150px] max-w-[150px]">Block/Unblock</TableHead>
                      <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      paginatedCustomers.map((c) => (
                        <TableRow key={`cust-row-${c.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                          <TableCell className="px-6 font-mono text-xs font-bold text-[#556B2F]">
                            {c.id}
                          </TableCell>
                          <TableCell className="px-6 font-bold text-neutral-800">
                            {c.name}
                          </TableCell>
                          <TableCell className="px-6 font-mono text-xs text-neutral-600">
                            {c.phone}
                          </TableCell>
                          <TableCell className="px-6 w-[150px] min-w-[150px] max-w-[150px]">
                            {/* Block/Unblock toggle switch */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleCustomerStatus(c.id)}
                                className={cn(
                                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                  c.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-red-500"
                                )}
                                role="switch"
                                aria-checked={c.status === "ACTIVE"}
                                title={c.status === "ACTIVE" ? "Click to Block" : "Click to Activate"}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                                    c.status === "ACTIVE" ? "translate-x-4" : "translate-x-0"
                                  )}
                                />
                              </button>
                              <span className={cn(
                                "text-[10px] font-bold uppercase w-12 text-left",
                                c.status === "ACTIVE" ? "text-emerald-600" : "text-rose-600"
                              )}>
                                {c.status === "ACTIVE" ? "Active" : "Blocked"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-6 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* Details button */}
                              <Button 
                                size="xs" 
                                variant="outline" 
                                className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5"
                                onClick={() => setShowDetailsModal(c)}
                              >
                                Details
                              </Button>

                              {/* Manage Awards button */}
                              <Button 
                                size="xs" 
                                className="bg-[#556B2F] hover:bg-[#405223] text-white font-semibold" 
                                onClick={() => openManageModal(c)}
                              >
                                Manage Awards
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-neutral-400 italic">No customers matched this search query.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination 
                currentPage={currentPage}
                totalPages={totalCustomersPages || 1}
                onPageChange={setCurrentPage}
                totalEntries={filteredCustomers.length}
                startEntry={(currentPage - 1) * customersPerPage + 1}
                endEntry={currentPage * customersPerPage}
              />
            </CardContent>
          </Card>
        </div>
      )}


      {/* Manage Awards Dialog Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={closeManageModal}>
          <DialogContent className="bg-white max-h-[90vh] overflow-y-auto sm:max-w-xl no-scrollbar">
            <DialogHeader className="pr-8">
              <DialogTitle>Manage Awards: {selectedCustomer.name}</DialogTitle>
              <DialogDescription>
                Award discount coupons and manage loyalty tier benefits.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 my-2">
              {/* Wallet Summary */}
              <div className="bg-[#f5f5e6]/50 p-4 border border-[#d2d2c4]/40 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider block font-semibold">Wallet Balance</span>
                  <span className="text-2xl font-bold text-[#556B2F]">₹{selectedCustomer.walletBalance}</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider block font-semibold text-right">Current Badge</span>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold">{selectedCustomer.membership}</Badge>
                </div>
              </div>

              {/* Discount Coupon Section */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <h4 className="text-sm font-bold text-neutral-800">Add Discount Coupon</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-1 block">Coupon Code</label>
                    <Input
                      placeholder="e.g. SAVE20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="border-[#d2d2c4] bg-white h-9"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 mb-1 block">Discount Type</label>
                      <Select value={discountType} onValueChange={setDiscountType}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="percentage">% Off</SelectItem>
                          <SelectItem value="amount">₹ Amount Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 mb-1 block">Discount Value</label>
                      <Input
                        type="number"
                        placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 50"}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="border-[#d2d2c4] bg-white h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 mb-1 block">Minimum Order (₹)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 500"
                        value={minOrder}
                        onChange={(e) => setMinOrder(e.target.value)}
                        className="border-[#d2d2c4] bg-white h-9"
                      />
                    </div>
                  </div>
                  <Button className="bg-[#556B2F] hover:bg-[#405223] text-white w-full" onClick={handleAddCoupon}>Add Coupon</Button>
                </div>

                {/* List of awarded coupons */}
                {coupons.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Awarded Coupons</h4>
                    {coupons.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#f5f5e6]/50 border border-[#d2d2c4]/40 p-2.5 rounded-lg">
                        <div className="text-sm">
                          <span className="font-bold text-neutral-800">{c.code}</span>
                          <span className="text-neutral-500 ml-2">{c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}</span>
                          <span className="text-neutral-400 ml-2">· Min ₹{c.minOrder}</span>
                        </div>
                        <Button size="xs" variant="destructive" onClick={() => handleDeleteCoupon(idx)}>Delete</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" className="border border-neutral-300 text-neutral-500 hover:bg-neutral-100" onClick={closeManageModal}>
                Close Panel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Customer Details Dialog Modal */}
      {showDetailsModal && (
        <Dialog open={!!showDetailsModal} onOpenChange={(open) => !open && setShowDetailsModal(null)}>
          <DialogContent className="bg-[#FFFFF0] border border-[#d2d2c4] max-w-xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <DialogHeader className="pr-8 pb-3 border-b border-[#d2d2c4]/40">
              <DialogTitle className="text-xl font-bold text-[#2d3822]">
                Customer Details: {showDetailsModal.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                Full directory record, registration information, and account stats.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4 text-xs font-semibold text-neutral-600">
              {/* Core Fields */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-0.5">Customer ID</span>
                  <span className="text-sm font-black text-[#556B2F] font-mono">{showDetailsModal.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-0.5">Membership Badge</span>
                  <Badge className={cn(
                    "font-semibold uppercase text-[9px] py-0 px-1.5",
                    showDetailsModal.membership === "PREMIUM" && "bg-purple-100 text-purple-800 border-purple-200",
                    showDetailsModal.membership === "GOLD" && "bg-amber-100 text-amber-800 border-amber-200",
                    showDetailsModal.membership === "SILVER" && "bg-blue-100 text-blue-800 border-blue-200",
                    showDetailsModal.membership === "BRONZE" && "bg-amber-50 text-amber-900 border-amber-200",
                    showDetailsModal.membership === "NONE" && "bg-neutral-100 text-neutral-600"
                  )}>
                    {showDetailsModal.membership || "NONE"}
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-0.5">Email</span>
                  <span className="text-xs font-bold text-neutral-800">{showDetailsModal.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-0.5">Phone Number</span>
                  <span className="text-xs font-bold text-neutral-800 font-mono">{showDetailsModal.phone}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Registration Date:</span>
                  <span className="font-bold text-neutral-800">{showDetailsModal.createdDate || "2026-01-01"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Total Orders Placed:</span>
                  <span className="font-bold text-neutral-800">{showDetailsModal.orderVolume || 0} orders</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Wallet Balance:</span>
                  <span className="font-bold text-[#556B2F]">₹{showDetailsModal.walletBalance}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Lifetime Value (LTV):</span>
                  <span className="font-bold text-neutral-800">₹{showDetailsModal.lifetimeValue || 0}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between border-b border-neutral-100 pb-4 items-center">
                <span className="text-neutral-400">Account Status:</span>
                <span className={cn(
                  "font-bold uppercase text-xs",
                  showDetailsModal.status === "ACTIVE" ? "text-emerald-600" : "text-rose-600"
                )}>
                  {showDetailsModal.status === "ACTIVE" ? "Active" : "Blocked"}
                </span>
              </div>

              {/* Address log */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-neutral-500 block">Default Delivery Address</span>
                <p className="text-xs font-semibold text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
                  <span>{showDetailsModal.address || "Self-Pickup / No Delivery Addresses Logged"}</span>
                </p>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#d2d2c4]/40 mt-4 flex gap-2">
              <Button 
                variant="outline"
                className="border-neutral-300 text-neutral-600 font-bold text-xs"
                onClick={() => setShowDetailsModal(null)}
              >
                Close Details
              </Button>
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white font-bold text-xs"
                onClick={() => {
                  setSelectedCustomer(showDetailsModal)
                  setShowDetailsModal(null)
                }}
              >
                Manage Awards
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
