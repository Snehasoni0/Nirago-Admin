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
import { useDashboard, AdminUser } from "../DashboardContext"

export default function UsersPage() {
  const { adminUsers, handleAddAdminUser, handleUpdateStaffRole, handleDeleteStaffUser } = useDashboard()
  
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "Manager" as AdminUser["role"] })
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<{ [userId: string]: boolean }>({})

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
    </div>
  )
}
