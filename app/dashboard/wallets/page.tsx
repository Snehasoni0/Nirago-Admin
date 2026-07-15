"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Award, Crown, Medal, Sparkles, Settings, Plus, Users, Pencil } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard } from "../DashboardContext"
import { cn } from "@/lib/utils"

export default function WalletsPage() {
  const router = useRouter()
  const { customers, handleWalletTransaction, loyaltyTiers, handleAddLoyaltyTier, toggleLoyaltyTierStatus, handleUpdateLoyaltyTier } = useDashboard()

  console.log("=== LOYALTY TIERS STATE DATA ===", loyaltyTiers);

  const [walletAmount, setWalletAmount] = useState({ customerId: "", amount: "", type: "CREDIT" as "CREDIT" | "DEBIT" })
  const [newTierName, setNewTierName] = useState("")
  const [newTierDiscount, setNewTierDiscount] = useState("")
  const [newTierMinDeposit, setNewTierMinDeposit] = useState("")
  const [newTierDescription, setNewTierDescription] = useState("")

  // Edit Tier State
  const [editingTier, setEditingTier] = useState<any | null>(null)
  const [editName, setEditName] = useState("")
  const [editDiscount, setEditDiscount] = useState("")
  const [editMinDeposit, setEditMinDeposit] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const openEditModal = (tier: any) => {
    setEditingTier(tier)
    setEditName(tier.name)
    setEditDiscount(String(tier.discountPercent))
    setEditMinDeposit(String(tier.minDeposit))
    setEditDescription(tier.description || "")
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTier && editName && editDiscount && editMinDeposit) {
      handleUpdateLoyaltyTier(editingTier.id, editName, Number(editDiscount), Number(editMinDeposit), editDescription)
      setEditingTier(null)
      Swal.fire({
        title: "Updated!",
        text: "Loyalty tier updated successfully!",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }



  const handleSubmit = () => {
    const amt = parseFloat(walletAmount.amount)
    if (walletAmount.customerId && !isNaN(amt) && amt > 0) {
      handleWalletTransaction(walletAmount.customerId, amt, walletAmount.type)
      setWalletAmount({ customerId: "", amount: "", type: "CREDIT" })
      Swal.fire({
        title: "Success!",
        text: "Wallet updated successfully!",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please enter a valid amount and select a customer.",
        icon: "error",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  const handleCreateTier = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTierName && newTierDiscount && newTierMinDeposit) {
      handleAddLoyaltyTier(newTierName, Number(newTierDiscount), Number(newTierMinDeposit), newTierDescription)
      setNewTierName("")
      setNewTierDiscount("")
      setNewTierMinDeposit("")
      setNewTierDescription("")
      Swal.fire({
        title: "Success!",
        text: "Loyalty tier added successfully!",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please fill all tier fields.",
        icon: "error",
        confirmButtonColor: "#556B2F"
      })
    }
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Wallets & Membership Plans</h2>
          <p className="text-sm text-neutral-600">Manage customer wallets and view membership plans.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Loyalty Program Settings */}
        <Card className="border border-[#d2d2c4] bg-white md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#556B2F] flex items-center gap-2">
              <Award className="h-5 w-5" /> Loyalty Program Settings
            </CardTitle>
            <CardDescription>Configure tiers and rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Creator panel */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-bold text-neutral-800 text-lg">Add Loyalty Tier</h3>
            </div>
            <form onSubmit={handleCreateTier} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Tier Name</label>
                <Input
                  placeholder="e.g. Gold, Silver"
                  value={newTierName}
                  onChange={e => setNewTierName(e.target.value)}
                  className="border-[#d2d2c4] bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Discount %</label>
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={newTierDiscount}
                  onChange={e => setNewTierDiscount(e.target.value)}
                  className="border-[#d2d2c4] bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Minimum Deposit (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newTierMinDeposit}
                  onChange={e => setNewTierMinDeposit(e.target.value)}
                  className="border-[#d2d2c4] bg-white"
                />
                <p className="text-[10px] text-neutral-400">Customer gets this tier automatically after reaching the deposit.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Description / Benefits</label>
                <Input
                  placeholder="e.g. Free packaging + Express dispatch"
                  value={newTierDescription}
                  onChange={e => setNewTierDescription(e.target.value)}
                  className="border-[#d2d2c4] bg-white"
                />
              </div>
              <Button type="submit" className="w-full bg-[#556B2F] hover:bg-[#405223] text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Tier
              </Button>
            </form>
            {/* List panel */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-neutral-500" />
                <h3 className="font-bold text-[#2d3822] text-lg">Loyalty Tiers</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#e6e6d8]/20">
                    <TableRow className="border-b border-[#d2d2c4]">
                      <TableHead className="px-6">Tier</TableHead>
                      <TableHead className="px-6">Description / Benefits</TableHead>
                      <TableHead className="text-center px-6">Min Deposit (₹)</TableHead>
                      <TableHead className="text-center px-6">Discount %</TableHead>
                      <TableHead className="px-6 text-center w-[150px] min-w-[150px] max-w-[150px]">Status</TableHead>
                      <TableHead className="text-right px-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loyaltyTiers.map(tier => (
                      <TableRow key={`tier-row-${tier.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                        <TableCell className="font-bold text-[#556B2F] px-6 py-3">
                          <Badge className="bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 font-bold uppercase">{tier.name}</Badge>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-xs text-neutral-600 max-w-[220px] truncate" title={tier.description || ""}>
                          {tier.description || <span className="text-neutral-400 italic">No description</span>}
                        </TableCell>
                        <TableCell className="text-center font-medium px-6 py-3 font-mono">₹{tier.minDeposit}</TableCell>
                        <TableCell className="text-center font-bold text-[#556B2F] px-6 py-3">{tier.discountPercent}% OFF</TableCell>
                        <TableCell className="px-6 py-3 w-[150px] min-w-[150px] max-w-[150px]">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleLoyaltyTierStatus(tier.id)}
                              className={cn(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                tier.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
                              )}
                              role="switch"
                              aria-checked={tier.status === "ACTIVE"}
                              title={tier.status === "ACTIVE" ? "Click to Deactivate" : "Click to Activate"}
                            >
                              <span
                                className={cn(
                                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                                  tier.status === "ACTIVE" ? "translate-x-4" : "translate-x-0"
                                )}
                              />
                            </button>
                            <span className={cn(
                              "text-[10px] font-bold uppercase w-12 text-left",
                              tier.status === "ACTIVE" ? "text-emerald-600" : "text-neutral-500"
                            )}>
                              {tier.status === "ACTIVE" ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6 py-3">
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 cursor-pointer h-7 px-2 font-bold text-[10px]"
                            onClick={() => openEditModal(tier)}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Plans - full width */}
        <Card className="border border-[#d2d2c4] bg-white md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#556B2F] flex items-center gap-2">
              <Users className="h-5 w-5" /> Membership Plans
            </CardTitle>
            <CardDescription>Overview of membership tiers and enrolled customers</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#e6e6d8]/20">
                  <TableRow className="border-b border-[#d2d2c4]">
                    <TableHead className="px-6">Tier</TableHead>
                    <TableHead className="px-6">Required Spend</TableHead>
                    <TableHead className="px-6">Benefits</TableHead>
                    <TableHead className="px-6">Members</TableHead>
                    <TableHead className="text-right px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loyaltyTiers.map((tier) => {
                    const count = customers.filter(c => c.membership === tier.name).length;
                    const iconColor = 
                      tier.name === "PREMIUM" ? "text-purple-500" :
                      tier.name === "GOLD" ? "text-amber-500" :
                      tier.name === "SILVER" ? "text-slate-400" : "text-emerald-500";
                    const labelColor = 
                      tier.name === "PREMIUM" ? "text-purple-600" :
                      tier.name === "GOLD" ? "text-amber-600" :
                      tier.name === "SILVER" ? "text-slate-600" : "text-emerald-600";
                    const Icon = 
                      tier.name === "PREMIUM" ? <Crown className="h-4 w-4 text-purple-500" /> :
                      tier.name === "GOLD" ? <Medal className="h-4 w-4 text-amber-500" /> :
                      <Award className={`h-4 w-4 ${iconColor}`} />;

                    return (
                      <TableRow key={tier.id} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                        <TableCell className="px-6 py-3">
                          <div className={`font-bold ${labelColor} flex items-center gap-1.5`}>
                            {Icon} {tier.name.charAt(0) + tier.name.slice(1).toLowerCase()} Member
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3">₹{tier.minDeposit}+ Lifetime</TableCell>
                        <TableCell className="px-6 py-3">{tier.description || `${tier.discountPercent}% wallet cashback`}</TableCell>
                        <TableCell className="px-6 py-3 font-semibold">{count} Active</TableCell>
                        <TableCell className="text-right px-6 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6]"
                            onClick={() => router.push(`/dashboard/wallets/members/${tier.name.toLowerCase()}`)}
                          >
                            <Users className="h-3.5 w-3.5 mr-1" /> View Members
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Loyalty Tier Dialog Modal */}
      {editingTier && (
        <Dialog open={!!editingTier} onOpenChange={(open) => !open && setEditingTier(null)}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#2d3822]">Edit Loyalty Tier: {editingTier.name}</DialogTitle>
              <DialogDescription className="text-xs">
                Update tier parameters and customer qualification settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Tier Name</label>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="border-[#d2d2c4] bg-white text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Discount %</label>
                <Input
                  type="number"
                  value={editDiscount}
                  onChange={e => setEditDiscount(e.target.value)}
                  className="border-[#d2d2c4] bg-white text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Minimum Deposit (₹)</label>
                <Input
                  type="number"
                  value={editMinDeposit}
                  onChange={e => setEditMinDeposit(e.target.value)}
                  className="border-[#d2d2c4] bg-white text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Description / Benefits</label>
                <Input
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="border-[#d2d2c4] bg-white text-xs h-9"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="border border-neutral-300 text-neutral-500 hover:bg-neutral-100 text-xs h-9"
                  onClick={() => setEditingTier(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#556B2F] hover:bg-[#405223] text-white text-xs h-9 font-bold"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
