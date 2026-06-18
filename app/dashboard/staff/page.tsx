"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard } from "../DashboardContext"

export default function StaffPage() {
  const { deliveryStaff, orders, handleAddDeliveryStaff } = useDashboard()
  
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !email) {
      Swal.fire("Error", "Please fill in Name, Phone, and Email.", "error")
      return
    }
    handleAddDeliveryStaff(name, phone, email, password || "Password123")
    setName("")
    setPhone("")
    setEmail("")
    setPassword("")
    setIsOpen(false)
    Swal.fire({
      title: "Success!",
      text: "Delivery Agent registered successfully.",
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Manual Delivery Dispatch Registry</h2>
          <p className="text-sm text-neutral-600">Register internal riders. Phase 1 runs on manual dispatch assignments without rider app.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white flex items-center gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Delivery Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Register Delivery Staff</DialogTitle>
              <DialogDescription>
                Create a new rider account. They will be able to log in to track their dispatches.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Rider Name</label>
                <Input 
                  required
                  placeholder="e.g. Ramesh Kumar" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Phone Number</label>
                <Input 
                  required
                  placeholder="e.g. +91 99887 76655" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Email Address (Login ID)</label>
                <Input 
                  required
                  type="email"
                  placeholder="e.g. ramesh@nirago.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Login Password</label>
                <Input 
                  type="password"
                  placeholder="Leave blank for default: Password123" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#556B2F] hover:bg-[#405223] text-white">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-[#d2d2c4] bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#556B2F]">Internal Rider Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Duty Status</TableHead>
                  <TableHead>Pending Dispatches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryStaff.map((s) => (
                  <TableRow key={`staff-row-${s.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold">{s.name}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>
                      <Badge className={s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 animate-in fade-in" : "bg-neutral-100 text-neutral-800"}>
                        {s.status === "ACTIVE" ? "Active / On Duty" : "Off Duty"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {orders.filter(o => o.deliveryStaff === s.name && o.status === "OUT_FOR_DELIVERY").length} Shipments
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
