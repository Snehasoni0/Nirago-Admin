"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Plus, ShieldCheck, Pencil } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, AdminUser } from "../DashboardContext"
import { TablePagination } from "@/components/ui/pagination"

export default function UsersPage() {
  const { adminUsers, outlets, handleAddAdminUser, handleUpdateAdminUser, handleDeleteStaffUser } = useDashboard()
  
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10
  const totalUsersPages = Math.ceil(adminUsers.length / usersPerPage)
  const paginatedAdminUsers = adminUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  React.useEffect(() => {
    if (currentPage > 1 && paginatedAdminUsers.length === 0) {
      setCurrentPage(prev => Math.max(1, prev - 1))
    }
  }, [paginatedAdminUsers.length, currentPage])

  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "Manager" as AdminUser["role"], assignedOutlet: "" })
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<{ [userId: string]: boolean }>({})

  const [rolePermissions, setRolePermissions] = useState<{ [role: string]: string[] }>({
    "Owner": ["overview", "orders", "menu", "outlets", "customers", "payments", "wallets", "coupons", "staff", "users", "rules", "reports"],
    "Admin": ["overview", "orders", "menu", "outlets", "customers", "payments", "wallets", "coupons", "staff", "users", "reports"],
    "Manager": ["overview", "orders", "menu", "outlets", "customers", "payments", "coupons", "staff", "reports"],
    "Delivery Staff": ["overview", "orders"],
    "Outlet Manager": ["overview", "orders", "menu", "customers", "payments", "staff", "reports"],
  })

  const modulesList = [
    { id: "overview", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "menu", label: "Menu" },
    { id: "outlets", label: "Outlets" },
    { id: "customers", label: "Customers" },
    { id: "payments", label: "Payments" },
    { id: "wallets", label: "Wallet & Plans" },
    { id: "coupons", label: "Coupons" },
    { id: "staff", label: "Delivery Staff" },
    { id: "users", label: "Team Control" },
    { id: "rules", label: "Global Rules" },
    { id: "reports", label: "Reports & Logs" },
  ]

  const rolesList = ["Owner", "Admin", "Manager", "Outlet Manager", "Delivery Staff"]

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nirago_role_permissions")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed["Delivery Staff"] && !parsed["Delivery Staff"].includes("overview")) {
            parsed["Delivery Staff"] = ["overview", ...parsed["Delivery Staff"]]
          }
          if (parsed["Outlet Manager"]) {
            parsed["Outlet Manager"] = parsed["Outlet Manager"].filter((p: string) => p !== "coupons")
          } else {
            parsed["Outlet Manager"] = ["overview", "orders", "menu", "customers", "payments", "staff", "reports"]
          }
          // Ensure new permission is applied if already exists in storage
          Object.keys(parsed).forEach(role => {
            if (["Owner", "Admin", "Manager", "Outlet Manager"].includes(role) && !parsed[role].includes("payments")) {
              parsed[role].push("payments")
            }
            if (["Owner", "Admin", "Manager", "Outlet Manager"].includes(role) && !parsed[role].includes("reports")) {
              parsed[role].push("reports")
            }
          })
          localStorage.setItem("nirago_role_permissions", JSON.stringify(parsed))
          setRolePermissions(parsed)
        } catch (e) {
          console.error(e)
        }
      } else {
        localStorage.setItem("nirago_role_permissions", JSON.stringify(rolePermissions))
      }
    }
  }, [])

  const handleTogglePermission = (role: string, moduleId: string) => {
    setRolePermissions(prev => {
      const current = prev[role] || []
      const updated = current.includes(moduleId)
        ? current.filter(id => id !== moduleId)
        : [...current, moduleId]
      return { ...prev, [role]: updated }
    })
  }

  const handleSavePermissions = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nirago_role_permissions", JSON.stringify(rolePermissions))
      Swal.fire({
        title: "Configuration Saved",
        text: "Role access permissions matrix updated successfully!",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  const handleRegister = () => {
    if (newUser.name && newUser.email && newUser.password) {
      handleAddAdminUser(
        newUser.name, 
        newUser.email, 
        newUser.password, 
        newUser.role,
        newUser.assignedOutlet
      )
      setNewUser({ name: "", email: "", password: "", role: "Manager", assignedOutlet: "" })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Admin Team & Role Management</h2>
          <p className="text-sm text-neutral-600">Secure control panel to register staff members and configure access permissions.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white">
              <Plus className="h-4 w-4 mr-2" /> Register Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Register Staff Member</DialogTitle>
              <DialogDescription>Add new profile. The credentials will be registered to system databases.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input placeholder="e.g. Vikas Khanna" value={newUser.name} onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address (ID)</label>
                <Input type="email" placeholder="e.g. vikas@nirago.com" value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Password</label>
                <div className="relative">
                  <Input 
                    type={showRegPassword ? "text" : "password"} 
                    placeholder="Set temporary login password" 
                    value={newUser.password} 
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer flex items-center justify-center"
                  >
                    {showRegPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">System Role</label>
                <Select defaultValue="Manager" onValueChange={(val: any) => setNewUser(prev => ({ ...prev, role: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Access Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Outlet Manager">Outlet Manager</SelectItem>
                    <SelectItem value="Delivery Staff">Delivery Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign to Outlet (Optional)</label>
                <Select value={newUser.assignedOutlet || "none"} onValueChange={(val) => setNewUser(prev => ({ ...prev, assignedOutlet: val === "none" ? "" : val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select outlet (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="none">None (Global)</SelectItem>
                    {outlets.filter(o => o.status === "ACTIVE").map(o => (
                      <SelectItem key={`reg-outlet-${o.id}`} value={o.name}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={handleRegister}>
                Confirm Registration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-[#d2d2c4] bg-white gap-0 py-0">
        <CardContent className="p-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="px-6">Staff Name</TableHead>
                  <TableHead className="px-6">Staff Email (ID)</TableHead>
                  <TableHead className="px-6">Assigned Password</TableHead>
                  <TableHead className="px-6">Assigned Role</TableHead>
                  <TableHead className="px-6 w-[140px] min-w-[140px] max-w-[140px]">Status</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAdminUsers.map((u) => (
                  <TableRow key={`staff-user-${u.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold text-neutral-800 px-6">{u.name}</TableCell>
                    <TableCell className="px-6">{u.email}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500 font-semibold px-6">
                       <div className="flex items-center gap-2">
                         <span className="min-w-20 inline-block">
                           {visiblePasswords[u.id] ? (u.password || "••••••••") : "••••••••"}
                         </span>
                         <button
                           type="button"
                           onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                           className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-[#2d3822]/40"
                         >
                           {visiblePasswords[u.id] ? (
                             <EyeOff className="h-4 w-4" />
                           ) : (
                             <Eye className="h-4 w-4" />
                           )}
                         </button>
                       </div>
                     </TableCell>
                    <TableCell className="px-6">
                      <Badge className={cn(
                        "font-semibold",
                        u.role === "Owner" && "bg-rose-100 text-rose-800 border-rose-200",
                        u.role === "Admin" && "bg-blue-100 text-blue-800 border-blue-200",
                        u.role === "Manager" && "bg-purple-100 text-purple-800 border-purple-200",
                        u.role === "Outlet Manager" && "bg-teal-100 text-teal-800 border-teal-200",
                        u.role === "Delivery Staff" && "bg-indigo-100 text-indigo-800 border-indigo-200"
                      )}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 w-[140px] min-w-[140px] max-w-[140px]">
                      {/* Status Toggle Switch */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateAdminUser(u.id, { status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            u.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
                          )}
                          role="switch"
                          aria-checked={u.status === "ACTIVE"}
                          title={u.status === "ACTIVE" ? "Click to Deactivate" : "Click to Activate"}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                              u.status === "ACTIVE" ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                        <span className={cn(
                          "text-[10px] font-bold uppercase w-12 text-left",
                          u.status === "ACTIVE" ? "text-emerald-600" : "text-neutral-500"
                        )}>
                          {u.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 space-x-2 whitespace-nowrap">
                      <Button size="xs" variant="outline" className="border-[#556B2F]/40 text-[#556B2F] hover:bg-[#f5f5e6] cursor-pointer" onClick={() => setDetailsUser(u)}>
                        Details
                      </Button>

                      <Button size="xs" variant="outline" className="border-neutral-300 text-neutral-600 hover:bg-neutral-100 cursor-pointer" onClick={() => setEditingUser(u)}>
                        Edit
                      </Button>

                      <Button size="xs" variant="destructive" className="cursor-pointer" onClick={() => handleDeleteStaffUser(u.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalUsersPages || 1}
            onPageChange={setCurrentPage}
            totalEntries={adminUsers.length}
            startEntry={(currentPage - 1) * usersPerPage + 1}
            endEntry={currentPage * usersPerPage}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={open => { if (!open) setEditingUser(null) }}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member Details</DialogTitle>
            <DialogDescription>Update details and access for {editingUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={editingUser?.name || ""} onChange={e => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email / Username</label>
              <Input value={editingUser?.email || ""} onChange={e => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password (leave blank to keep current)</label>
              <Input type="text" placeholder="New password" value={editingUser?.password || ""} onChange={e => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editingUser?.role || "Manager"} onValueChange={(val: any) => setEditingUser(prev => prev ? { ...prev, role: val } : null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose New Role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Outlet Manager">Outlet Manager</SelectItem>
                  <SelectItem value="Delivery Staff">Delivery Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-2 border-t border-dashed border-neutral-100 animate-in fade-in duration-200">
              <label className="text-sm font-medium">Assign to Outlet (Optional)</label>
              <Select 
                value={editingUser?.assignedOutlet || "none"} 
                onValueChange={(val) => setEditingUser(prev => prev ? { ...prev, assignedOutlet: val === "none" ? "" : val } : null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select outlet (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">None (Global)</SelectItem>
                  {outlets.filter(o => o.status === "ACTIVE").map(o => (
                    <SelectItem key={`edit-outlet-${o.id}`} value={o.name}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => {
              if (editingUser) {
                handleUpdateAdminUser(editingUser.id, {
                  name: editingUser.name,
                  email: editingUser.email,
                  password: editingUser.password,
                  role: editingUser.role,
                  assignedOutlet: editingUser.assignedOutlet
                })
                setEditingUser(null)
                Swal.fire({
                  title: "Updated!",
                  text: "Member details have been successfully updated.",
                  icon: "success",
                  confirmButtonColor: "#556B2F"
                })
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!detailsUser} onOpenChange={open => { if (!open) setDetailsUser(null) }}>
        <DialogContent className="bg-white sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#556B2F]">Team Member Profile</DialogTitle>
            <DialogDescription>Full registry details for {detailsUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="border border-neutral-100 rounded-lg p-4 bg-neutral-50/50 space-y-3 text-sm text-neutral-600">
              <div className="flex">
                <span className="w-28 shrink-0 font-medium">Full Name:</span>
                <span className="font-bold text-neutral-800">{detailsUser?.name}</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-medium">Email / ID:</span>
                <span className="font-bold text-neutral-800 break-all">{detailsUser?.email}</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-medium">Password:</span>
                <span className="font-bold text-neutral-800 font-mono">{detailsUser?.password || "••••••••"}</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-medium">Assigned Role:</span>
                <span>
                  <Badge className={cn(
                    "font-semibold py-0.5",
                    detailsUser?.role === "Owner" && "bg-rose-100 text-rose-800 border-rose-200",
                    detailsUser?.role === "Admin" && "bg-blue-100 text-blue-800 border-blue-200",
                    detailsUser?.role === "Manager" && "bg-purple-100 text-purple-800 border-purple-200",
                    detailsUser?.role === "Outlet Manager" && "bg-teal-100 text-teal-800 border-teal-200",
                    detailsUser?.role === "Delivery Staff" && "bg-indigo-100 text-indigo-800 border-indigo-200"
                  )}>
                    {detailsUser?.role}
                  </Badge>
                </span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-medium">Outlet:</span>
                <span className="font-bold text-[#556B2F]">
                  {detailsUser?.assignedOutlet ? detailsUser.assignedOutlet : "Global (All Outlets)"}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-medium">Status:</span>
                <span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border",
                    detailsUser?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-600 border-neutral-200"
                  )}>
                    {detailsUser?.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" onClick={() => setDetailsUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Role Access Matrix (Owner Restricted Control) */}
      <Card className="border border-[#d2d2c4] bg-white overflow-hidden shadow-sm mt-6 gap-0 py-0">
        <div className="bg-[#e6e6d8]/15 border-b border-[#d2d2c4] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-[#2d3822]">Role Permissions</h3>
            <p className="text-xs text-neutral-500">Configure module visibility for each system role.</p>
          </div>
          <Badge className="bg-[#556B2F] text-white">Master Control</Badge>
        </div>
        <CardContent className="p-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="w-48 font-bold text-neutral-800 px-6">System Role</TableHead>
                  {modulesList.map(m => (
                    <TableHead key={m.id} className="text-center text-xs font-semibold whitespace-nowrap px-3">{m.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesList.map(role => {
                  const isOwner = role === "Owner"
                  return (
                    <TableRow key={role} className="border-b border-[#d2d2c4]/40 hover:bg-[#f5f5e6]/10">
                      <TableCell className="font-bold text-neutral-800 px-6">
                        {role}
                        {isOwner && <span className="text-[10px] text-neutral-400 block font-normal">(All access by default)</span>}
                      </TableCell>
                      {modulesList.map(m => {
                        const hasAccess = rolePermissions[role]?.includes(m.id)
                        const isDashboard = m.id === "overview"
                        return (
                          <TableCell key={m.id} className="text-center px-3">
                            <input 
                              type="checkbox"
                              checked={isOwner || isDashboard || hasAccess}
                              disabled={isOwner || isDashboard}
                              onChange={() => handleTogglePermission(role, m.id)}
                              className="h-4 w-4 rounded border-[#d2d2c4] text-[#556B2F] focus:ring-[#556B2F] disabled:opacity-50 cursor-pointer accent-[#556B2F]"
                            />
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-neutral-500 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-t border-[#d2d2c4]/20 pt-4 pb-6 px-6 w-full">
            <Button 
              onClick={handleSavePermissions} 
              className="bg-[#556B2F] hover:bg-[#405223] text-white text-xs font-semibold px-4 py-2 h-auto"
            >
              Save Matrix Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
