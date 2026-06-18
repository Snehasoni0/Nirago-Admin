"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, Truck, CreditCard, Settings, MapPin, Phone } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, Outlet } from "../DashboardContext"

function OutletCard({ 
  o, 
  toggleOutletStatus, 
  onConfigure 
}: { 
  o: Outlet
  toggleOutletStatus: (id: string) => void
  onConfigure: () => void
}) {
  const [cardTab, setCardTab] = useState<"general" | "delivery" | "payment">("general")

  return (
    <Card className="border border-[#d2d2c4] bg-white shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-[#f5f5e6]/25 border-b border-[#d2d2c4]/45">
        <CardTitle className="text-base font-bold text-[#556B2F] truncate max-w-[170px]" title={o.name}>{o.name}</CardTitle>
        <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
          {o.status}
        </Badge>
      </CardHeader>

      {/* Card interactive tabs */}
      <div className="flex border-b border-[#d2d2c4]/30 bg-neutral-50/50 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setCardTab("general")}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            cardTab === "general"
              ? "border-[#556B2F] text-[#556B2F] bg-white font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50"
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setCardTab("delivery")}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            cardTab === "delivery"
              ? "border-[#556B2F] text-[#556B2F] bg-white font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50"
          }`}
        >
          Delivery
        </button>
        <button
          type="button"
          onClick={() => setCardTab("payment")}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            cardTab === "payment"
              ? "border-[#556B2F] text-[#556B2F] bg-white font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50"
          }`}
        >
          Payments & TXNs
        </button>
      </div>

      <CardContent className="pt-4 flex-1 min-h-[140px] space-y-3">
        {/* GENERAL TAB CONTENT */}
        {cardTab === "general" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <p className="text-xs text-neutral-600 flex items-start gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#556B2F] shrink-0 mt-0.5" />
              <span><strong>Address:</strong> {o.address}</span>
            </p>
            <p className="text-xs text-neutral-600 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-[#556B2F] shrink-0" />
              <span><strong>Contact:</strong> {o.contact}</span>
            </p>
            <div className="text-[10px] text-neutral-400 italic pt-2 border-t border-dashed border-[#d2d2c4]/25">
              Click configure to modify basic store settings or toggle operations status.
            </div>
          </div>
        )}

        {/* DELIVERY TAB CONTENT */}
        {cardTab === "delivery" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#556B2F] flex items-center gap-1 uppercase tracking-wider">
                <Truck className="h-3.5 w-3.5" /> Service Status
              </span>
              <Badge className={o.deliveryEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 px-2" : "bg-red-50 text-red-700 border-red-200 text-[10px] py-0.5 px-2"}>
                {o.deliveryEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {o.deliveryEnabled ? (
              <div className="space-y-1 text-xs text-neutral-600 bg-[#f5f5e6]/20 p-2.5 rounded border border-[#d2d2c4]/20">
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-neutral-800">₹{o.deliveryCharge ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Time Window:</span>
                  <span className="font-semibold text-neutral-800">{o.estimatedDeliveryTime || "N/A"}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200/50">
                  <span>Free above order value:</span>
                  <span className="font-bold text-[#556B2F]">₹{o.minFreeDelivery ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">Delivery logistics are disabled for this location.</p>
            )}
          </div>
        )}

        {/* PAYMENT TAB CONTENT */}
        {cardTab === "payment" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#556B2F] flex items-center gap-1 uppercase tracking-wider">
                <CreditCard className="h-3.5 w-3.5" /> Gateway Status
              </span>
              <Badge className={
                o.paymentStatus === "ACTIVE" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0.5 px-2"
                  : o.paymentStatus === "PENDING"
                    ? "bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0.5 px-2"
                    : "bg-red-50 text-red-700 border-red-200 text-[10px] py-0.5 px-2"
              }>
                {o.paymentStatus || "INACTIVE"}
              </Badge>
            </div>
            
            <div className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded border border-[#d2d2c4]/20">
              <div className="flex justify-between">
                <span>Merchant ID:</span>
                <span className="font-mono text-[10px] text-neutral-800 font-semibold">{o.merchantId || "Not Set"}</span>
              </div>
              <div className="flex justify-between">
                <span>Test Transaction ID:</span>
                <span className="font-mono text-[10px] text-neutral-800 font-semibold">{o.transactionId || "Not Set"}</span>
              </div>
              {o.allowedPaymentMethods && o.allowedPaymentMethods.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-neutral-200/50">
                  {o.allowedPaymentMethods.map(method => (
                    <span key={method} className="bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide">{method}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-neutral-50/50 border-t border-[#d2d2c4]/40 flex justify-end gap-2 p-3">
        <Button size="xs" variant="outline" className="border-neutral-300 text-neutral-600 cursor-pointer" onClick={() => toggleOutletStatus(o.id)}>
          Toggle Status
        </Button>
        <Button 
          size="xs" 
          className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" 
          onClick={onConfigure}
        >
          <Settings className="h-3 w-3 mr-1" /> Configure
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function OutletsPage() {
  const { outlets, toggleOutletStatus, handleAddOutlet, updateOutlet } = useDashboard()
  
  // Register outlet states
  const [newOutlet, setNewOutlet] = useState({ 
    name: "", 
    address: "", 
    contact: "",
    deliveryEnabled: true,
    deliveryCharge: 40,
    minFreeDelivery: 500,
    estimatedDeliveryTime: "30-45 mins",
    paymentStatus: "ACTIVE" as "ACTIVE" | "INACTIVE" | "PENDING",
    merchantId: "",
    transactionId: "",
    allowedPaymentMethods: ["CASH", "UPI", "CARD"]
  })

  // Edit outlet states
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)
  const [activeTab, setActiveTab] = useState<"general" | "delivery" | "payment">("general")

  const handleRegister = () => {
    if (outlets.length >= 9) {
      Swal.fire({
        title: "Outlet License Limit",
        text: "WARNING: Maximum limit of 9 outlets reached. Please upgrade to the Premium Plan to configure additional outlet networks.",
        icon: "warning",
        confirmButtonColor: "#556B2F"
      })
      return
    }
    if (newOutlet.name && newOutlet.address) {
      const success = handleAddOutlet(
        newOutlet.name, 
        newOutlet.address, 
        newOutlet.contact,
        newOutlet.deliveryEnabled,
        newOutlet.deliveryCharge,
        newOutlet.minFreeDelivery,
        newOutlet.estimatedDeliveryTime,
        newOutlet.paymentStatus,
        newOutlet.merchantId || undefined,
        newOutlet.transactionId || undefined,
        newOutlet.allowedPaymentMethods
      )
      if (success) {
        setNewOutlet({ 
          name: "", 
          address: "", 
          contact: "",
          deliveryEnabled: true,
          deliveryCharge: 40,
          minFreeDelivery: 500,
          estimatedDeliveryTime: "30-45 mins",
          paymentStatus: "ACTIVE",
          merchantId: "",
          transactionId: "",
          allowedPaymentMethods: ["CASH", "UPI", "CARD"]
        })
        Swal.fire({
          title: "Outlet Registered",
          text: "Physical outlet successfully deployed in system records.",
          icon: "success",
          confirmButtonColor: "#556B2F"
        })
      }
    }
  }

  const handleSaveOutletSettings = () => {
    if (editingOutlet) {
      updateOutlet(editingOutlet.id, editingOutlet)
      setEditingOutlet(null)
      Swal.fire({
        title: "Store Configured",
        text: `Successfully updated settings for ${editingOutlet.name}.`,
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  const toggleEditPaymentMethod = (method: string) => {
    if (!editingOutlet) return
    const current = editingOutlet.allowedPaymentMethods || []
    const updated = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method]
    setEditingOutlet({ ...editingOutlet, allowedPaymentMethods: updated })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Outlet Network Limits</h2>
          <p className="text-sm text-neutral-600">Manage physical cafe outlets. The framework natively supports up to 9 active outlets.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Register Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-lg overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-[#2d3822] font-bold text-lg">Register Outlet Location</DialogTitle>
              <DialogDescription>Input new store location specs. Maximum limit: 9 outlets.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-600">Outlet Name</label>
                <Input placeholder="e.g. Nirago Select (Vasant Kunj)" value={newOutlet.name} onChange={(e) => setNewOutlet(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-600">Physical Address</label>
                <Input placeholder="e.g. Ground Floor, DLF Promenade" value={newOutlet.address} onChange={(e) => setNewOutlet(prev => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-600">Contact Number</label>
                <Input placeholder="e.g. +91 99999 12345" value={newOutlet.contact} onChange={(e) => setNewOutlet(prev => ({ ...prev, contact: e.target.value }))} />
              </div>
              
              <div className="border-t border-[#d2d2c4]/45 pt-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#556B2F] flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Initial Delivery Config (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Enable Delivery</label>
                    <Select 
                      value={newOutlet.deliveryEnabled ? "yes" : "no"} 
                      onValueChange={(val) => setNewOutlet(prev => ({ ...prev, deliveryEnabled: val === "yes" }))}
                    >
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="yes">Enabled</SelectItem>
                        <SelectItem value="no">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Delivery Charge (₹)</label>
                    <Input type="number" className="h-9" value={newOutlet.deliveryCharge} onChange={(e) => setNewOutlet(prev => ({ ...prev, deliveryCharge: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Free threshold (₹)</label>
                    <Input type="number" className="h-9" value={newOutlet.minFreeDelivery} onChange={(e) => setNewOutlet(prev => ({ ...prev, minFreeDelivery: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Est. Time (e.g. 20-30m)</label>
                    <Input className="h-9" value={newOutlet.estimatedDeliveryTime} onChange={(e) => setNewOutlet(prev => ({ ...prev, estimatedDeliveryTime: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-3">
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" onClick={handleRegister}>
                Register Store
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {outlets.length >= 9 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-800 text-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Outlet License Alert:</span> You have reached the maximum allowed limit of 9 outlets under the standard license. To configure additional physical outlets, please contact ADVLST support at MSME licensing slots to upgrade your plan.
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {outlets.map(o => (
          <OutletCard 
            key={`outlet-card-${o.id}`} 
            o={o} 
            toggleOutletStatus={toggleOutletStatus} 
            onConfigure={() => {
              setEditingOutlet({ ...o })
              setActiveTab("general")
            }}
          />
        ))}
      </div>

      {/* Detailed Configure Dialog Modal with Tabs */}
      {editingOutlet && (
        <Dialog open={!!editingOutlet} onOpenChange={(open) => !open && setEditingOutlet(null)}>
          <DialogContent className="bg-white sm:max-w-md w-full overflow-y-auto max-h-[90vh]">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold text-[#2d3822]">Configure {editingOutlet.name}</DialogTitle>
              <DialogDescription>Modify status, delivery logistics, and payment gateway rules.</DialogDescription>
            </DialogHeader>

            {/* Custom Premium Tabs Bar */}
            <div className="flex border-b border-[#d2d2c4] my-2">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("general")}
              >
                General Info
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "delivery"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("delivery")}
              >
                Delivery Setup
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "payment"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("payment")}
              >
                Payments & Transactions
              </button>
            </div>

            {/* Tab Contents */}
            <div className="py-2 space-y-4">
              {/* TAB: GENERAL */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Store Outlet Name</label>
                    <Input 
                      value={editingOutlet.name} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, name: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Physical Address</label>
                    <Input 
                      value={editingOutlet.address} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, address: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Contact Telephone</label>
                    <Input 
                      value={editingOutlet.contact} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, contact: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Operational Status</label>
                    <Select 
                      value={editingOutlet.status} 
                      onValueChange={(val: "ACTIVE" | "INACTIVE") => setEditingOutlet(prev => prev ? { ...prev, status: val } : null)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="ACTIVE">ACTIVE (Store Open)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Store Closed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* TAB: DELIVERY */}
              {activeTab === "delivery" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Fulfillment Delivery Service</label>
                    <Select 
                      value={editingOutlet.deliveryEnabled ? "yes" : "no"} 
                      onValueChange={(val) => setEditingOutlet(prev => prev ? { ...prev, deliveryEnabled: val === "yes" } : null)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="yes">Enable Deliveries</SelectItem>
                        <SelectItem value="no">Disable Deliveries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editingOutlet.deliveryEnabled && (
                    <div className="space-y-4 border border-[#d2d2c4] rounded-lg p-3 bg-neutral-50/50 animate-in slide-in-from-top-2 duration-150">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600">Delivery Fee (₹)</label>
                        <Input 
                          type="number" 
                          value={editingOutlet.deliveryCharge ?? 0} 
                          onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, deliveryCharge: parseFloat(e.target.value) || 0 } : null)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600">Free Delivery Minimum (₹)</label>
                        <Input 
                          type="number" 
                          value={editingOutlet.minFreeDelivery ?? 0} 
                          onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, minFreeDelivery: parseFloat(e.target.value) || 0 } : null)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-600">Estimated Delivery Time Window</label>
                        <Input 
                          placeholder="e.g. 30-45 mins" 
                          value={editingOutlet.estimatedDeliveryTime ?? ""} 
                          onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, estimatedDeliveryTime: e.target.value } : null)} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PAYMENT */}
              {activeTab === "payment" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Gateway Merchant Status</label>
                    <Select 
                      value={editingOutlet.paymentStatus || "ACTIVE"} 
                      onValueChange={(val: "ACTIVE" | "PENDING" | "INACTIVE") => setEditingOutlet(prev => prev ? { ...prev, paymentStatus: val } : null)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="ACTIVE">ACTIVE (Accepting Online Payments)</SelectItem>
                        <SelectItem value="PENDING">PENDING (Merchant Setup In Progress)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Gateways Disabled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Gateway Merchant ID</label>
                    <Input 
                      placeholder="e.g. MERCH_VASANT_KUNJ" 
                      value={editingOutlet.merchantId ?? ""} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, merchantId: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Test / Initial Transaction ID</label>
                    <Input 
                      placeholder="e.g. TXN_VASANT_INIT_01" 
                      value={editingOutlet.transactionId ?? ""} 
                      onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, transactionId: e.target.value } : null)} 
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-neutral-600 block">Allowed Payment Channels</label>
                    <div className="flex gap-2">
                      {["CASH", "UPI", "CARD"].map(method => {
                        const isActive = (editingOutlet.allowedPaymentMethods || []).includes(method)
                        return (
                          <Button
                            key={method}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            className={isActive ? "bg-[#556B2F] hover:bg-[#405223] text-white flex-1 font-bold cursor-pointer" : "border-neutral-300 text-neutral-600 flex-1 cursor-pointer"}
                            onClick={() => toggleEditPaymentMethod(method)}
                          >
                            {method}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-3 gap-2">
              <Button 
                variant="outline" 
                className="border-neutral-300 text-neutral-600 cursor-pointer" 
                onClick={() => setEditingOutlet(null)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" 
                onClick={handleSaveOutletSettings}
              >
                Save Configurations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
