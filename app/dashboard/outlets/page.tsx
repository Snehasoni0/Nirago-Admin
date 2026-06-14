"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Plus } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard } from "../DashboardContext"

export default function OutletsPage() {
  const { outlets, toggleOutletStatus, handleAddOutlet } = useDashboard()
  const [newOutlet, setNewOutlet] = useState({ name: "", address: "", contact: "" })

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
      const success = handleAddOutlet(newOutlet.name, newOutlet.address, newOutlet.contact)
      if (success) {
        setNewOutlet({ name: "", address: "", contact: "" })
      }
    }
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
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white">
              <Plus className="h-4 w-4 mr-2" /> Register Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Register Outlet Location</DialogTitle>
              <DialogDescription>Input new store location specs. Maximum limit: 9 outlets.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Outlet Name</label>
                <Input placeholder="e.g. Nirago Select (Vasant Kunj)" value={newOutlet.name} onChange={(e) => setNewOutlet(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Physical Address</label>
                <Input placeholder="e.g. Ground Floor, DLF Promenade" value={newOutlet.address} onChange={(e) => setNewOutlet(prev => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Number</label>
                <Input placeholder="e.g. +91 99999 12345" value={newOutlet.contact} onChange={(e) => setNewOutlet(prev => ({ ...prev, contact: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={handleRegister}>
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
          <Card key={`outlet-card-${o.id}`} className="border border-[#d2d2c4] bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-[#f5f5e6]/25 border-b border-[#d2d2c4]/45">
              <CardTitle className="text-base font-bold text-[#556B2F]">{o.name}</CardTitle>
              <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
                {o.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs text-neutral-500 font-medium"><strong>📍 Address:</strong> {o.address}</p>
              <p className="text-xs text-neutral-500 font-medium"><strong>📞 Contact:</strong> {o.contact}</p>
            </CardContent>
            <CardFooter className="bg-neutral-50/50 border-t border-[#d2d2c4]/40 flex justify-end gap-2 p-3">
              <Button size="xs" variant="outline" className="border-neutral-300 text-neutral-600" onClick={() => toggleOutletStatus(o.id)}>
                Toggle Status
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
