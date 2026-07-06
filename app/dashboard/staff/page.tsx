"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, MapPin, Globe } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, DeliveryStaff } from "../DashboardContext"
import { TablePagination } from "@/components/ui/pagination"

export default function StaffPage() {
  const { deliveryStaff, orders, outlets, handleAddDeliveryStaff, handleUpdateDeliveryStaff } = useDashboard()
  
  const [currentPage, setCurrentPage] = useState(1)
  const staffPerPage = 10
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [assignedOutlet, setAssignedOutlet] = useState("ALL")
  
  const [editTarget, setEditTarget] = useState<DeliveryStaff | null>(null)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editOutlet, setEditOutlet] = useState("ALL")

  const openEdit = (staff: DeliveryStaff) => {
    setEditTarget(staff)
    setEditName(staff.name)
    setEditPhone(staff.phone)
    setEditOutlet(staff.assignedOutlet || "ALL")
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editPhone.trim() || !editTarget) {
      Swal.fire({ title: 'Error', text: 'Name and Phone are required.', icon: 'error', confirmButtonColor: '#556B2F' })
      return
    }
    handleUpdateDeliveryStaff(editTarget.id, {
      name: editName,
      phone: editPhone,
      assignedOutlet: editOutlet === "ALL" ? undefined : editOutlet
    })
    setEditTarget(null)
    Swal.fire({ title: 'Success', text: 'Driver settings updated.', icon: 'success', confirmButtonColor: '#556B2F' })
  }

  const [userRole, setUserRole] = useState("Owner")
  const [userOutlet, setUserOutlet] = useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !email) {
      Swal.fire("Error", "Please fill in Name, Phone, and Email.", "error")
      return
    }
    const outletVal = userRole === "Outlet Manager" ? userOutlet : (assignedOutlet && assignedOutlet !== "none" ? assignedOutlet : undefined)
    handleAddDeliveryStaff(name, phone, email, password || "Password123", outletVal)
    setName("")
    setPhone("")
    setEmail("")
    setPassword("")
    setAssignedOutlet("")
    setIsOpen(false)
    Swal.fire({
      title: "Success!",
      text: "Delivery Agent registered successfully.",
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
  }

  const visibleStaff = deliveryStaff.filter(s => {
    if (userRole === "Outlet Manager" && userOutlet) {
      return !s.assignedOutlet || s.assignedOutlet === userOutlet
    }
    return true
  })

  const totalStaffPages = Math.ceil(visibleStaff.length / staffPerPage)
  const paginatedStaff = visibleStaff.slice(
    (currentPage - 1) * staffPerPage,
    currentPage * staffPerPage
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Delivery Riders</h2>
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
              {userRole !== "Outlet Manager" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Assign to Outlet (Optional)</label>
                  <Select value={assignedOutlet} onValueChange={setAssignedOutlet}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Global Rider (All Outlets)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">Global Rider (All Outlets)</SelectItem>
                      {outlets.filter(o => o.status === "ACTIVE").map(o => (
                        <SelectItem key={`staff-reg-outlet-${o.id}`} value={o.name}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#556B2F] hover:bg-[#405223] text-white">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-[#d2d2c4] bg-white gap-0 py-0">
        <CardHeader className="pt-4 pb-3 px-5 border-b border-[#d2d2c4]/40 bg-neutral-50/50">
          <CardTitle className="text-lg font-bold text-[#556B2F]">All Delivery Riders</CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="px-6">Staff Name</TableHead>
                  <TableHead className="px-6">Phone Number</TableHead>
                  <TableHead className="px-6">Assigned Outlet</TableHead>
                  <TableHead className="px-6">Pending Dispatches</TableHead>
                  <TableHead className="px-6">Completed Deliveries</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.map((s) => (
                  <TableRow key={`staff-row-${s.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold px-6">{s.name}</TableCell>
                    <TableCell className="px-6">{s.phone}</TableCell>
                    <TableCell className="px-6">
                      <span className="text-xs font-semibold text-neutral-700 inline-flex items-center gap-1">
                        {s.assignedOutlet ? (
                          <>
                            <MapPin className="h-3.5 w-3.5 text-[#556B2F] shrink-0" />
                            <span>{s.assignedOutlet}</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            <span>Global (All Outlets)</span>
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-amber-600 px-6">
                      {orders.filter(o => o.deliveryStaff === s.name && o.status === "OUT_FOR_DELIVERY").length} Shipments
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 px-6">
                      {orders.filter(o => o.deliveryStaff === s.name && o.status === "DELIVERED").length} Completed
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button size="xs" variant="outline" className="border-[#556B2F]/40 text-[#556B2F] hover:bg-[#f5f5e6] cursor-pointer" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalStaffPages || 1}
            onPageChange={setCurrentPage}
            totalEntries={visibleStaff.length}
            startEntry={(currentPage - 1) * staffPerPage + 1}
            endEntry={currentPage * staffPerPage}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null) }}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Driver Settings</DialogTitle>
            <DialogDescription>Update details for {editTarget?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="e.g. Rahul Sharma" value={editName} onChange={e => setEditName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input placeholder="e.g. +91 98765 43210" value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned Outlet</label>
              <Select value={editOutlet} onValueChange={setEditOutlet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Outlet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Global (All Outlets)</SelectItem>
                  {outlets.map(o => (
                    <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" className="bg-[#556B2F] hover:bg-[#405223] text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
