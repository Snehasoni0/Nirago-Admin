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
import { Search, UserCheck, UserCheck2, UserX } from "lucide-react"

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

          <Card className="border border-[#d2d2c4] bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#e6e6d8]/20">
                    <TableRow className="border-b border-[#d2d2c4]">
                      <TableHead>Customer Details</TableHead>
                      <TableHead>Email & Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Orders Count</TableHead>
                      <TableHead className="text-right">Wallet Balance</TableHead>
                      <TableHead className="text-right">Lifetime Value (LTV)</TableHead>
                      <TableHead>Loyalty Level</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      paginatedCustomers.map((c) => (
                        <TableRow key={`cust-row-${c.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                          <TableCell>
                            <div className="font-bold text-neutral-800">{c.name}</div>
                            <span className="text-[10px] text-neutral-400 block font-semibold">Registered: {c.createdDate || "2026-01-01"}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-neutral-700">{c.email}</div>
                            <span className="text-[10px] text-neutral-400 block font-mono font-semibold">{c.phone}</span>
                          </TableCell>
                          <TableCell>{c.address || "N/A"}</TableCell>
                          <TableCell className="text-right font-semibold text-neutral-700">{c.orderVolume || 0} orders</TableCell>
                          <TableCell className="text-right font-bold text-[#556B2F]">₹{c.walletBalance}</TableCell>
                          <TableCell className="text-right font-bold text-neutral-700">₹{c.lifetimeValue || 0}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "font-semibold uppercase text-[10px]",
                              c.membership === "PREMIUM" && "bg-purple-100 text-purple-800 border-purple-200",
                              c.membership === "GOLD" && "bg-amber-100 text-amber-800 border-amber-200",
                              c.membership === "SILVER" && "bg-blue-100 text-blue-800 border-blue-200",
                              c.membership === "BRONZE" && "bg-amber-50 text-amber-900 border-amber-200",
                              c.membership === "NONE" && "bg-neutral-100 text-neutral-600"
                            )}>
                              {c.membership || "NONE"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="xs" className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => openManageModal(c)}>
                              Manage Awards
                            </Button>

                            <Button 
                              size="xs" 
                              variant="outline" 
                              className={c.status === "ACTIVE" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"} 
                              onClick={() => toggleCustomerStatus(c.id)}
                            >
                              {c.status === "ACTIVE" ? <UserX className="h-3.5 w-3.5 mr-1" /> : <UserCheck2 className="h-3.5 w-3.5 mr-1" />}
                              {c.status === "ACTIVE" ? "Block" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-neutral-400 italic">No customers matched this search query.</TableCell>
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


      {/* Wallet Deposit and Tier Override Dialog Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={closeManageModal}>
          <DialogContent className="bg-white max-h-[90vh] overflow-y-auto sm:max-w-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <DialogHeader>
              <DialogTitle>Manage Wallet & Loyalty: {selectedCustomer.name}</DialogTitle>
              <DialogDescription>
                Award discount coupons to customers.
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
                        <SelectContent>
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



              {/* Account Metrics Section */}
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-neutral-100 pt-4">
                <div>
                  <span className="font-semibold text-neutral-500 block">Registration Date:</span>
                  <span className="font-bold text-neutral-800">{selectedCustomer.createdDate || "2026-01-01"}</span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-500 block">Order Volume:</span>
                  <span className="font-bold text-neutral-800">{selectedCustomer.orderVolume || 0} orders</span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-500 block">Lifetime Value (LTV):</span>
                  <span className="font-bold text-[#556B2F]">₹{selectedCustomer.lifetimeValue || 0}</span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-500 block">Status:</span>
                  <span className="font-bold text-neutral-800">{selectedCustomer.status}</span>
                </div>
              </div>

              {/* Address Logs Section */}
              <div className="space-y-1 pt-3 border-t border-neutral-100">
                <span className="text-[11px] font-semibold text-neutral-500 block">Delivery Address Log</span>
                <p className="text-xs font-semibold text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                  📍 {selectedCustomer.address || "Self-Pickup / No Delivery Addresses Logged"}
                </p>
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
    </div>
  )
}
