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
import { useDashboard, Customer, LoyaltyTier } from "../DashboardContext"
import { Award, Coins, Search, Plus, UserX, UserCheck, ShieldAlert, Settings, Sparkles } from "lucide-react"
import Swal from "sweetalert2"

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
  
  // Wallet / Tier Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [selectedTier, setSelectedTier] = useState("")

  // New Loyalty Tier Form State
  const [newTierName, setNewTierName] = useState("")
  const [newTierDiscount, setNewTierDiscount] = useState("")
  const [newTierMinDeposit, setNewTierMinDeposit] = useState("")

  // Filter customers based on search term
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  const openManageModal = (c: Customer) => {
    setSelectedCustomer(c)
    setSelectedTier(c.membership)
    setDepositAmount("")
  }

  const closeManageModal = () => {
    setSelectedCustomer(null)
  }

  const handleDepositSubmit = () => {
    if (!selectedCustomer) return
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      Swal.fire("Error", "Please enter a valid deposit amount.", "error")
      return
    }

    handleCustomerDeposit(selectedCustomer.id, amount)
    
    // Find updated customer info
    const updated = customers.find(c => c.id === selectedCustomer.id)
    if (updated) {
      // Re-fetch customer data for updated balance representation
      setSelectedCustomer({
        ...selectedCustomer,
        walletBalance: selectedCustomer.walletBalance + amount
      })
    }

    setDepositAmount("")
    Swal.fire({
      title: "Deposit Success",
      text: `₹${amount} credited successfully! If this triggers tier promotion, it has been updated.`,
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
  }

  const handleTierOverrideSubmit = () => {
    if (!selectedCustomer) return
    handleAssignCustomerTier(selectedCustomer.id, selectedTier)
    setSelectedCustomer({
      ...selectedCustomer,
      membership: selectedTier
    })
    Swal.fire({
      title: "Tier Override",
      text: `Customer tier updated to ${selectedTier}`,
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
  }

  const handleCreateTier = (e: React.FormEvent) => {
    e.preventDefault()
    const discount = parseFloat(newTierDiscount)
    const minDep = parseFloat(newTierMinDeposit)

    if (!newTierName || isNaN(discount) || isNaN(minDep) || discount < 0 || discount > 100 || minDep < 0) {
      Swal.fire("Error", "Please enter valid configuration details.", "error")
      return
    }

    handleAddLoyaltyTier(newTierName, discount, minDep)
    setNewTierName("")
    setNewTierDiscount("")
    setNewTierMinDeposit("")

    Swal.fire({
      title: "Tier Created",
      text: "New customer loyalty tier active in the catalog.",
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Customers & Loyalty Program</h2>
          <p className="text-sm text-neutral-600">Track client directories, top up advance cash deposits, and customize reward tiers.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#d2d2c4] gap-2">
        <button 
          onClick={() => setActiveTab("directory")}
          className={cn(
            "px-4 py-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "directory" ? "border-[#556B2F] text-[#556B2F]" : "border-transparent text-neutral-500 hover:text-[#2d3822]"
          )}
        >
          <Search className="h-4 w-4" /> Customer Directory
        </button>
        <button 
          onClick={() => setActiveTab("tiers")}
          className={cn(
            "px-4 py-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "tiers" ? "border-[#556B2F] text-[#556B2F]" : "border-transparent text-neutral-500 hover:text-[#2d3822]"
          )}
        >
          <Award className="h-4 w-4" /> Loyalty Program Settings
        </button>
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
                      filteredCustomers.map((c) => (
                        <TableRow key={`cust-row-${c.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                          <TableCell>
                            <div className="font-bold text-neutral-800">{c.name}</div>
                            <span className="text-[10px] text-neutral-400 block font-semibold">Registered: {c.createdDate || "2026-01-01"}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-neutral-700">{c.email}</div>
                            <span className="text-[10px] text-neutral-400 block font-mono font-semibold">{c.phone}</span>
                          </TableCell>
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
                              Manage Wallet & Tier
                            </Button>

                            <Button 
                              size="xs" 
                              variant="outline" 
                              className={c.status === "ACTIVE" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"} 
                              onClick={() => toggleCustomerStatus(c.id)}
                            >
                              {c.status === "ACTIVE" ? <UserX className="h-3.5 w-3.5 mr-1" /> : <UserCheck className="h-3.5 w-3.5 mr-1" />}
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Loyalty Settings */}
      {activeTab === "tiers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Creator panel */}
          <Card className="border border-[#d2d2c4] bg-white h-fit">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-[#556B2F] mb-4">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold text-neutral-800 text-lg">Define Loyalty Level</h3>
              </div>

              <form onSubmit={handleCreateTier} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Tier Designation Name</label>
                  <Input 
                    placeholder="e.g. DIAMOND, VIP" 
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    className="border-[#d2d2c4] bg-white uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Discount Percent (%)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 15" 
                    value={newTierDiscount}
                    onChange={(e) => setNewTierDiscount(e.target.value)}
                    className="border-[#d2d2c4] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Min. Wallet Deposit Threshold (INR)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={newTierMinDeposit}
                    onChange={(e) => setNewTierMinDeposit(e.target.value)}
                    className="border-[#d2d2c4] bg-white"
                  />
                  <p className="text-[10px] text-neutral-400">Auto-assigned when customer tops up this aggregate amount.</p>
                </div>

                <Button type="submit" className="w-full bg-[#556B2F] hover:bg-[#405223] text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Loyalty Rule
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List panel */}
          <Card className="lg:col-span-2 border border-[#d2d2c4] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-neutral-500" />
                <h3 className="font-bold text-[#2d3822] text-lg">Active Loyalty Catalog Matrix</h3>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#d2d2c4]">
                      <TableHead>Level Badge</TableHead>
                      <TableHead className="text-right">Auto Threshold</TableHead>
                      <TableHead className="text-right">Discount Rate</TableHead>
                      <TableHead>Rule Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loyaltyTiers.map((tier) => (
                      <TableRow key={`tier-row-${tier.id}`} className="border-b border-neutral-100 hover:bg-[#f5f5e6]/20">
                        <TableCell className="font-bold text-[#556B2F]">
                          <Badge className="bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 font-bold uppercase">{tier.name}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{tier.minDeposit}</TableCell>
                        <TableCell className="text-right font-bold text-[#556B2F]">{tier.discountPercent}% OFF</TableCell>
                        <TableCell>
                          <Badge className={tier.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-500"}>
                            {tier.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className={tier.status === "ACTIVE" ? "border-neutral-300 text-neutral-600" : "border-emerald-300 text-emerald-600"}
                            onClick={() => toggleLoyaltyTierStatus(tier.id)}
                          >
                            {tier.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wallet Deposit and Tier Override Dialog Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={closeManageModal}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Manage Wallet & Loyalty: {selectedCustomer.name}</DialogTitle>
              <DialogDescription>
                Credit advance cash deposits and configure manual loyalty overrides.
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

              {/* Deposit Section */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h4 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" /> Advance Cash Deposit
                </h4>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Enter deposit amount (INR)" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="border-[#d2d2c4] bg-white flex-1"
                  />
                  <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={handleDepositSubmit}>
                    Credit Wallet
                  </Button>
                </div>
                <p className="text-[10px] text-neutral-400">Topping up will automatically audit rules and promote their tier if eligible.</p>
              </div>

              {/* Tier Override Section */}
              <div className="space-y-2 pt-4 border-t border-neutral-100">
                <h4 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#556B2F]" /> Manual Loyalty Override
                </h4>
                <div className="flex gap-2">
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger className="flex-1 border-[#d2d2c4] bg-white">
                      <SelectValue placeholder="Select Override Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="NONE">NONE</SelectItem>
                      {loyaltyTiers.map(t => (
                        <SelectItem key={`dialog-override-tier-${t.id}`} value={t.name}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="border-[#d2d2c4] text-[#2d3822]" onClick={handleTierOverrideSubmit}>
                    Apply Override
                  </Button>
                </div>
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
