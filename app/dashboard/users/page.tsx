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
import { Eye, EyeOff, Plus, ShieldCheck } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, AdminUser } from "../DashboardContext"

export default function UsersPage() {
  const { adminUsers, handleAddAdminUser, handleUpdateStaffRole, handleDeleteStaffUser } = useDashboard()
  
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "Manager" as AdminUser["role"] })
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<{ [userId: string]: boolean }>({})

  const [rolePermissions, setRolePermissions] = useState<{ [role: string]: string[] }>({
    "Owner": ["overview", "orders", "menu", "outlets", "customers", "wallets", "coupons", "staff", "users", "rules"],
    "Admin": ["overview", "orders", "menu", "outlets", "customers", "wallets", "coupons", "staff", "users"],
    "Manager": ["overview", "orders", "menu", "outlets", "customers", "coupons", "staff"],
    "Kitchen Staff": ["orders"],
    "Delivery Staff": ["overview", "orders"],
  })

  const modulesList = [
    { id: "overview", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "menu", label: "Menu" },
    { id: "outlets", label: "Outlets" },
    { id: "customers", label: "Customers" },
    { id: "wallets", label: "Wallet & Plans" },
    { id: "coupons", label: "Coupons" },
    { id: "staff", label: "Delivery Staff" },
    { id: "users", label: "Team Control" },
    { id: "rules", label: "Global Rules" },
  ]

  const rolesList = ["Owner", "Admin", "Manager", "Kitchen Staff", "Delivery Staff"]

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nirago_role_permissions")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed["Delivery Staff"] && !parsed["Delivery Staff"].includes("overview")) {
            parsed["Delivery Staff"] = ["overview", ...parsed["Delivery Staff"]]
            localStorage.setItem("nirago_role_permissions", JSON.stringify(parsed))
          }
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
      handleAddAdminUser(newUser.name, newUser.email, newUser.password, newUser.role)
      setNewUser({ name: "", email: "", password: "", role: "Manager" })
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select Access Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Kitchen Staff">Kitchen Staff</SelectItem>
                    <SelectItem value="Delivery Staff">Delivery Staff</SelectItem>
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

      {/* Master Admin restricted notice */}
      <div className="bg-[#f5f5e6] border border-[#556B2F]/20 rounded-lg p-4 text-[#556B2F] text-sm flex items-start gap-3 shadow-xs">
        <ShieldCheck className="h-5 w-5 text-[#556B2F] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Master Admin Restricted Workspace:</span> This module is exclusively visible to and editable by the brand master administrator (`admin@nirago.com`). Use this panel to authorize and change system access levels.
        </div>
      </div>

      <Card className="border border-[#d2d2c4] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Staff Email (ID)</TableHead>
                  <TableHead>Assigned Password</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((u) => (
                  <TableRow key={`staff-user-${u.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold text-neutral-800">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500 font-semibold">
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
                    <TableCell>
                      <Badge className={cn(
                        "font-semibold",
                        u.role === "Owner" && "bg-rose-100 text-rose-800 border-rose-200",
                        u.role === "Admin" && "bg-blue-100 text-blue-800 border-blue-200",
                        u.role === "Manager" && "bg-purple-100 text-purple-800 border-purple-200",
                        u.role === "Kitchen Staff" && "bg-amber-100 text-amber-800 border-amber-200",
                        u.role === "Delivery Staff" && "bg-indigo-100 text-indigo-800 border-indigo-200"
                      )}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="xs" variant="outline" className="border-neutral-300 text-neutral-600" onClick={() => setEditingUser(u)}>
                            Change Role
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>Update Access Role</DialogTitle>
                            <DialogDescription>Modify system clearance levels for {u?.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm font-medium">User: <span className="font-bold">{u.name} ({u.email})</span></p>
                            <Select defaultValue={u.role} onValueChange={(val: any) => setEditingUser(prev => prev ? { ...prev, role: val } : null)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose New Role" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="Owner">Owner</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Kitchen Staff">Kitchen Staff</SelectItem>
                                <SelectItem value="Delivery Staff">Delivery Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => {
                              if (editingUser) {
                                handleUpdateStaffRole(u.id, editingUser.role)
                              }
                            }}>
                              Save Role Update
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button size="xs" variant="destructive" onClick={() => handleDeleteStaffUser(u.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Access Matrix (Owner Restricted Control) */}
      <Card className="border border-[#d2d2c4] bg-white overflow-hidden shadow-sm mt-6">
        <div className="bg-[#e6e6d8]/15 border-b border-[#d2d2c4] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-[#2d3822]">Assigned Role Access Permissions Matrix</h3>
            <p className="text-xs text-neutral-500">Configure what pages and modules are visible to each system role.</p>
          </div>
          <Badge className="bg-[#556B2F] text-white">Master Control</Badge>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="w-48 font-bold text-neutral-800">System Role</TableHead>
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
                      <TableCell className="font-bold text-neutral-800">
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
          <div className="text-xs text-neutral-500 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-t border-[#d2d2c4]/20 pt-4 w-full">
            <span>💡 Sidebar items will instantly update for active sessions of that role.</span>
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
