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
import { Eye, EyeOff, Plus, ShieldCheck, Pencil, Trash2, Loader2 } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, AdminUser } from "../DashboardContext"
import { TablePagination } from "@/components/ui/pagination"

export default function UsersPage() {
  const { adminUsers, outlets, roles, handleAddAdminUser, handleUpdateAdminUser, handleDeleteStaffUser, handleCreateRole, handleDeleteRole, handleUpdateRole } = useDashboard()
  
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10
  const totalUsersPages = Math.ceil(adminUsers.length / usersPerPage)
  // Partition users to pin Owners to the top and filter out delivery riders
  const sortedAdminUsers = React.useMemo(() => {
    const owners = adminUsers.filter(u => u.role === "Owner" || u.role === "Super Admin");
    const others = adminUsers.filter(u => u.role !== "Owner" && u.role !== "Super Admin");
    return [...owners, ...others];
  }, [adminUsers]);

  const paginatedAdminUsers = sortedAdminUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  React.useEffect(() => {
    if (currentPage > 1 && paginatedAdminUsers.length === 0) {
      setCurrentPage(prev => Math.max(1, prev - 1))
    }
  }, [paginatedAdminUsers.length, currentPage])

  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", password: "", role: "", assignedOutlet: "" })
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<{ [userId: string]: boolean }>({})
  const [viewingRole, setViewingRole] = useState<any>(null)
  const [editingPermissions, setEditingPermissions] = useState<string[]>([])
  const [createRolePerms, setCreateRolePerms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [roleNameSelection, setRoleNameSelection] = useState("Admin")
  const [customRoleName, setCustomRoleName] = useState("")

  const modulesList = [
    { id: "overview", label: "Overview" },
    { id: "outlet-settings", label: "Outlet Settings" },
    { id: "orders", label: "Orders" },
    { id: "menu", label: "Food Menu" },
    { id: "outlets", label: "All Outlets" },
    { id: "customers", label: "Customers" },
    { id: "reviews", label: "Reviews" },
    { id: "reports", label: "Reports" },
    { id: "payments", label: "Payments" },
    { id: "wallets", label: "Loyalty Program Settings" },
    { id: "coupons", label: "Coupons" },
    { id: "staff", label: "Delivery Riders" },
    { id: "users", label: "Team Staff" },
    { id: "rules", label: "Settings" },
  ]

  const ownerRole = {
    _id: "super_admin",
    name: "Super Admin",
    description: "System Administrator with full access",
    permissions: modulesList.map(m => m.id)
  }
  
  const displayRoles = [ownerRole, ...roles.filter(r => r.name.toLowerCase() !== "owner" && r.name.toLowerCase() !== "super admin")]

  const handleRegister = async () => {
    if (newUser.name && newUser.email && newUser.password && newUser.phone && newUser.role) {
      setIsLoading(true)
      try {
        const tokenMatch = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[2] : null;

        const selectedRole = roles.find(r => r.name === newUser.role || r._id === newUser.role);
        const roleId = selectedRole ? selectedRole._id : newUser.role;
        const outlet = outlets.find(o => o.name === newUser.assignedOutlet);
        const outletId = outlet ? outlet.id : undefined;

        const payload = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          roleId: roleId,
          accessScope: newUser.assignedOutlet ? "outlet" : "global",
          ...(outletId && { outletId })
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          Swal.fire("Success", "User added successfully", "success");
          handleAddAdminUser(
            newUser.name, 
            newUser.email,
            newUser.password, 
            selectedRole ? selectedRole.name : newUser.role,
            newUser.assignedOutlet
          )
          setNewUser({ name: "", email: "", phone: "", password: "", role: "", assignedOutlet: "" })
        } else {
          Swal.fire("Error", data.message || "Failed to add user", "error");
        }
      } catch (e: any) {
        Swal.fire("Error", e.message, "error");
      } finally {
        setIsLoading(false)
      }
    } else {
      Swal.fire("Error", "Please fill all required fields", "error");
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
                <label className="text-sm font-medium">Phone Number</label>
                <Input type="tel" placeholder="e.g. 9876543210" value={newUser.phone} onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))} />
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
                <Select value={newUser.role} onValueChange={(val: any) => setNewUser(prev => ({ ...prev, role: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Access Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {displayRoles.filter(r => r._id !== "super_admin").map(r => (
                      <SelectItem key={`add-role-${r._id}`} value={r._id}>{r.name}</SelectItem>
                    ))}
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
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={handleRegister} disabled={isLoading}>
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registering...</> : "Confirm Registration"}
              </Button>            </DialogFooter>
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
                  {/* <TableHead className="px-6">Assigned Password</TableHead> */}
                  <TableHead className="px-6">Assigned Role</TableHead>
                  <TableHead className="px-6 w-[140px] min-w-[140px] max-w-[140px]">Status</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAdminUsers.map((u) => (
                  <TableRow key={`staff-user-${u.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold text-neutral-800 px-6">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {(u.role === "Owner" || u.role === "Super Admin") && (
                          <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6">{u.email}</TableCell>
                    {/* <TableCell className="font-mono text-xs text-neutral-500 font-semibold px-6">
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
                     </TableCell> */}
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
                          onClick={() => {
                            handleUpdateAdminUser(u.id, { status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
                          }}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 rounded-full border border-transparent transition-colors duration-200 ease-in-out cursor-pointer",
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

                      <Button size="xs" variant="destructive" className="cursor-pointer" disabled={isLoading} onClick={async () => {
                          const confirm = await Swal.fire({
                            title: "Remove User?",
                            text: `Are you sure you want to remove "${u.name}"?`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            confirmButtonText: "Yes, remove"
                          });
                          if (confirm.isConfirmed) {
                            setIsLoading(true)
                            try {
                              const success = await handleDeleteStaffUser(u.id);
                              if (success) {
                                Swal.fire("Removed", `"${u.name}" has been removed`, "success");
                              } else {
                                Swal.fire("Error", "Failed to remove user", "error");
                              }
                            } finally {
                              setIsLoading(false)
                            }
                          }
                        }}>
                          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Remove"}
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
              <label className="text-sm font-medium">Role</label>
              <Select 
                value={editingUser?.roleId || (roles.find(r => r.name === editingUser?.role)?._id) || ""} 
                onValueChange={(val: any) => {
                  const roleObj = roles.find(r => r._id === val);
                  setEditingUser(prev => prev ? { 
                    ...prev, 
                    role: roleObj ? roleObj.name : val, 
                    roleId: val 
                  } : null);
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Choose New Role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {displayRoles.filter(r => r._id !== "super_admin").map(r => (
                    <SelectItem key={`edit-role-${r._id}`} value={r._id}>{r.name}</SelectItem>
                  ))}
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
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" disabled={isLoading} onClick={async () => {
              if (editingUser) {
                setIsLoading(true)
                try {
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
                } finally {
                  setIsLoading(false)
                }
              }
            }}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white size-sm gap-2">
                <Plus className="h-4 w-4" /> Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Create New System Role</DialogTitle>
                <DialogDescription>Add a new role and configure its permissions.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[60vh] py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Name</label>
                  <Select value={roleNameSelection} onValueChange={setRoleNameSelection}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Predefined Role Name" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Outlet Manager">Outlet Manager</SelectItem>
                      <SelectItem value="Delivery Staff">Delivery Staff</SelectItem>
                      <SelectItem value="custom">Custom (Write manually...)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {roleNameSelection === "custom" && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-semibold text-neutral-600">Custom Role Name</label>
                    <Input 
                      value={customRoleName} 
                      onChange={e => setCustomRoleName(e.target.value)} 
                      placeholder="e.g. Content Manager" 
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input id="newRoleDesc" placeholder="e.g. Can manage menu and offers" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {modulesList.map(m => {
                      const isChecked = createRolePerms.includes(m.id)
                      const isDashboard = m.id === "overview"
                      return (
                        <label key={m.id} className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                          (isChecked || isDashboard) ? "bg-[#f5f5e6] border-[#556B2F]/30" : "bg-neutral-50 border-neutral-200 hover:border-neutral-300"
                        )}>
                          <input 
                            type="checkbox"
                            checked={isDashboard || isChecked}
                            disabled={isDashboard}
                            onChange={() => {
                              if (isDashboard) return
                              setCreateRolePerms(prev => 
                                prev.includes(m.id) ? prev.filter(p => p !== m.id) : [...prev, m.id]
                              )
                            }}
                            className="h-4 w-4 rounded border-[#d2d2c4] text-[#556B2F] accent-[#556B2F] cursor-pointer"
                          />
                          <div>
                            <span className={cn("text-sm font-medium", (isChecked || isDashboard) ? "text-neutral-800" : "text-neutral-500")}>{m.label}</span>
                            {isDashboard && <span className="text-[10px] text-neutral-400 block">Always enabled</span>}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" disabled={isLoading} onClick={async () => {
                  const name = roleNameSelection === "custom" ? customRoleName.trim() : roleNameSelection;
                  const desc = (document.getElementById("newRoleDesc") as HTMLInputElement).value;
                  const perms = ["overview", ...createRolePerms.filter(p => p !== "overview")];
                  
                  if (!name || perms.length <= 1) {
                    Swal.fire("Error", "Role name and at least one permission are required", "error");
                    return;
                  }
                  
                  setIsLoading(true)
                  try {
                    const success = await handleCreateRole(name, perms, desc);
                    if (success) {
                      Swal.fire("Success", "Role created successfully!", "success");
                      setCreateRolePerms([]);
                      setCustomRoleName("");
                    }
                  } finally {
                    setIsLoading(false)
                  }
                }}>
                  {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent className="p-0 px-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="w-1/4 font-bold text-neutral-800 px-6">Role Name</TableHead>
                  <TableHead className="w-1/4 font-bold text-neutral-800 px-6">Description</TableHead>
                  <TableHead className="w-1/4 text-center font-bold text-neutral-800 px-6">Permissions</TableHead>
                  <TableHead className="w-1/4 text-right font-bold text-neutral-800 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRoles.map(roleObj => {
                  const roleName = roleObj.name
                  const isSuperAdmin = roleObj._id === "super_admin"
                  const permCount = Array.isArray(roleObj.permissions) ? roleObj.permissions.length : 0
                  return (
                    <TableRow key={roleObj._id} className={cn("border-b border-[#d2d2c4]/40 hover:bg-[#f5f5e6]/10", isSuperAdmin && "bg-[#f5f5e6]/30")}>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-800">{roleName}</span>
                          {isSuperAdmin && <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">You</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 text-neutral-500 text-sm">
                        {roleObj.description || <span className="text-neutral-400 italic">No description</span>}
                        {isSuperAdmin && <span className="text-[10px] text-neutral-400 block">(All access by default)</span>}
                      </TableCell>
                      <TableCell className="text-center px-6">
                        <Badge className="bg-[#556B2F]/10 text-[#556B2F] border-[#556B2F]/20">
                          {isSuperAdmin ? "All" : `${permCount} module${permCount !== 1 ? "s" : ""}`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="xs" 
                            variant="outline" 
                            className="cursor-pointer text-xs border-[#556B2F]/40 text-[#556B2F] hover:bg-[#f5f5e6]"
                            onClick={() => {
                              setViewingRole(roleObj)
                              setEditingPermissions(Array.isArray(roleObj.permissions) ? [...roleObj.permissions] : [])
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Permissions
                          </Button>
                          {!isSuperAdmin && (
                            <Button 
                              size="xs" 
                              variant="destructive" 
                              className="cursor-pointer text-xs"
                              onClick={async () => {
                                const confirm = await Swal.fire({
                                  title: "Delete Role?",
                                  text: `Are you sure you want to delete "${roleName}"?`,
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#d33",
                                  confirmButtonText: "Yes, delete"
                                });
                                if (confirm.isConfirmed) {
                                  const success = await handleDeleteRole(roleObj._id);
                                  if (success) {
                                    Swal.fire("Deleted", `Role "${roleName}" deleted successfully`, "success");
                                  } else {
                                    Swal.fire("Error", "Failed to delete role", "error");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View/Edit Permissions Modal */}
      <Dialog open={!!viewingRole} onOpenChange={open => { if (!open) setViewingRole(null) }}>
        <DialogContent className="bg-white sm:max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#556B2F]" />
              {viewingRole?.name} — Permissions
            </DialogTitle>
            <DialogDescription>
              {viewingRole?._id === "super_admin" 
                ? "Super Admin has full access to all modules."
                : `Toggle module access for the "${viewingRole?.name}" role.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4 overflow-y-auto pr-2 max-h-[60vh]">
            {modulesList.map(m => {
              const isSuperAdmin = viewingRole?._id === "super_admin"
              const isChecked = isSuperAdmin || editingPermissions.includes(m.id)
              const isDashboard = m.id === "overview"
              return (
                <label key={m.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  isSuperAdmin || isDashboard ? "cursor-not-allowed" : "cursor-pointer",
                  (isChecked || isDashboard) ? "bg-[#f5f5e6] border-[#556B2F]/30" : "bg-neutral-50 border-neutral-200 hover:border-neutral-300"
                )}>
                  <input 
                    type="checkbox"
                    checked={isSuperAdmin || isDashboard || isChecked}
                    disabled={isSuperAdmin || isDashboard}
                    onChange={() => {
                      if (isSuperAdmin || isDashboard) return
                      setEditingPermissions(prev =>
                        prev.includes(m.id) ? prev.filter(p => p !== m.id) : [...prev, m.id]
                      )
                    }}
                    className="h-4 w-4 rounded border-[#d2d2c4] text-[#556B2F] accent-[#556B2F] cursor-pointer"
                  />
                  <div>
                    <span className={cn("text-sm font-medium", (isChecked || isDashboard) ? "text-neutral-800" : "text-neutral-400")}>{m.label}</span>
                    {isDashboard && <span className="text-[10px] text-neutral-400 block">Always enabled</span>}
                  </div>
                </label>
              )
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewingRole(null)} className="cursor-pointer">Cancel</Button>
            {viewingRole?._id !== "super_admin" && (
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    const perms = ["overview", ...editingPermissions.filter(p => p !== "overview")];
                    const success = await handleUpdateRole(viewingRole._id, perms);
                    if (success) {
                      Swal.fire("Updated", `Permissions for "${viewingRole.name}" updated successfully!`, "success");
                      setViewingRole(null);
                    } else {
                      Swal.fire("Error", "Failed to update permissions", "error");
                    }
                  } finally {
                    setIsLoading(false)
                  }
                }}
              >
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
