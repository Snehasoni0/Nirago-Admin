"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, Truck, CreditCard, Settings, MapPin, Phone, Trash2, ArrowLeft, Users, ShoppingBag, Landmark, ArrowRightLeft, ShieldAlert, BarChart3, TrendingUp, Calendar } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, Outlet } from "../DashboardContext"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts"
import { cn } from "@/lib/utils"

function OutletCard({ 
  o, 
  toggleOutletStatus, 
  handleDeleteOutlet,
  adminUsers,
  deliveryStaff,
  roles,
  onConfigure,
  onViewSummary,
  handleQuickAssignManager,
  handleQuickToggleRider,
  derivedOutletManagers
}: { 
  o: Outlet
  toggleOutletStatus: (id: string) => void
  handleDeleteOutlet: (id: string) => Promise<boolean> | void
  adminUsers: any[]
  deliveryStaff: any[]
  roles: any[]
  onConfigure: () => void
  onViewSummary: () => void
  handleQuickAssignManager: (outletId: string, outletName: string, managerId: string) => void
  handleQuickToggleRider: (outletId: string, outletName: string, riderId: string, assign: boolean) => void
  derivedOutletManagers: any[]
}) {
  const [cardTab, setCardTab] = useState<"general" | "delivery" | "payment">("general")
  const [showRidersMenu, setShowRidersMenu] = useState(false)
  
  const managerRoleIds = roles
    .filter(r => r.name.toLowerCase() === "outlet manager")
    .map(r => r._id);

  const assignedManager = adminUsers.find(u => {
    const userRoleLower = (u.role || "").toLowerCase();
    return (
      (userRoleLower === "outlet manager" || managerRoleIds.includes(u.role)) &&
      u.assignedOutlet === o.name
    );
  })
  const assignedRiders = deliveryStaff.filter(s => s.assignedOutlet === o.name)

  return (
    <Card 
      className="border border-[#d2d2c4] bg-white shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer hover:border-[#556B2F] gap-0 py-0"
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest("button") || target.closest("input") || target.closest("select") || target.closest("[role='combobox']")) {
          return
        }
        onViewSummary()
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pt-4 pb-3 px-5 bg-[#f5f5e6]/25 border-b border-[#d2d2c4]/45">
        <CardTitle className="text-base font-bold text-[#556B2F] leading-tight truncate flex-1 min-w-0 pr-2" title={o.name}>
          {o.name}
        </CardTitle>
        <Button 
          size="xs" 
          variant="outline" 
          className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 cursor-pointer font-bold flex-shrink-0 h-6 px-2 text-[10px]"
          onClick={(e) => {
            e.stopPropagation()
            const currentRole = localStorage.getItem("nirago_user_role") || "Owner"
            localStorage.setItem("nirago_original_role", currentRole)
            localStorage.setItem("nirago_user_role", "Outlet Manager")
            localStorage.setItem("nirago_user_outlet", o.name)
            Swal.fire({
              title: "Switching View",
              text: `Redirecting to ${o.name} dashboard view...`,
              icon: "success",
              timer: 1200,
              showConfirmButton: false
            }).then(() => {
              window.location.href = "/dashboard"
            })
          }}
        >
          Visit
        </Button>
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
              <span>
                <strong>Contact:</strong> {(() => {
                  const clean = (o.contact || "").replace(/\D/g, "")
                  if (clean.length === 12 && clean.startsWith("91")) {
                    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`
                  }
                  if (clean.length === 10) {
                    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`
                  }
                  return o.contact || ""
                })()}
              </span>
            </p>
            <p className="text-xs text-neutral-600 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#556B2F] shrink-0" />
              <span>
                <strong>Coordinates:</strong> {o.latitude !== undefined ? `${o.latitude}° N` : "N/A"}, {o.longitude !== undefined ? `${o.longitude}° E` : "N/A"}
              </span>
            </p>
            
            <div className="pt-2 border-t border-dashed border-[#d2d2c4]/25 space-y-2 text-xs text-neutral-600">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-neutral-500">Quick Assign Manager:</span>
                <Select
                  value={assignedManager ? assignedManager.id : "none"}
                  onValueChange={(val) => handleQuickAssignManager(o.id, o.name, val)}
                >
                  <SelectTrigger className="w-full text-[11px] h-8 bg-white border-[#d2d2c4] focus:ring-1 focus:ring-[#556B2F]">
                    <SelectValue placeholder="Choose Manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="none">No Manager (Unassigned)</SelectItem>
                    {derivedOutletManagers.map(u => (
                      <SelectItem key={`quick-mgr-${u.id}-${o.id}`} value={u.id}>
                        {u.name} {u.assignedOutlet && u.assignedOutlet !== o.name ? `(${u.assignedOutlet})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1 pt-1 relative">
                <span className="font-semibold text-neutral-500">Quick Assign Riders:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRidersMenu(!showRidersMenu);
                  }}
                  className="w-full text-[11px] h-8 bg-white border border-[#d2d2c4] rounded px-3 flex items-center justify-between hover:bg-neutral-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                >
                  <span className="truncate">
                    {assignedRiders.length > 0 
                      ? `${assignedRiders.length} Rider(s) Assigned (${assignedRiders.map(r => r.name).join(", ")})` 
                      : "Select Riders"}
                  </span>
                  <span className="text-[10px] text-neutral-400">▼</span>
                </button>

                {showRidersMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRidersMenu(false);
                      }}
                    />
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#d2d2c4] rounded shadow-lg max-h-40 overflow-y-auto z-50 p-1.5 space-y-1">
                      {deliveryStaff.map(rider => {
                        const isAssigned = rider.assignedOutlet === o.name;
                        return (
                          <label
                            key={`quick-rider-item-${rider.id}-${o.id}`}
                            className="flex items-center gap-2 hover:bg-neutral-50 p-1.5 rounded text-[11px] cursor-pointer text-neutral-700 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => {
                                handleQuickToggleRider(o.id, o.name, rider.id, e.target.checked);
                              }}
                              className="rounded border-[#d2d2c4] text-[#556B2F] focus:ring-[#556B2F] h-3 w-3 accent-[#556B2F] cursor-pointer"
                            />
                            <span className="truncate">
                              {rider.name} {rider.assignedOutlet && !isAssigned ? `(${rider.assignedOutlet})` : ""}
                            </span>
                          </label>
                        );
                      })}
                      {deliveryStaff.length === 0 && (
                        <span className="text-[10px] text-neutral-400 italic p-1.5 block">No riders registered.</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-[10px] text-neutral-400 italic pt-2 border-t border-neutral-100">
              Click the status toggle to modify operations or click configure to modify settings.
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
                  <span>Minimum order for free delivery (₹):</span>
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
                <span>Razorpay ID:</span>
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

      <CardFooter className="bg-neutral-50/50 border-t border-[#d2d2c4]/40 flex justify-between items-center p-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] uppercase font-extrabold text-neutral-400">
            {o.status === "ACTIVE" ? "Open" : "Closed"}
          </span>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleOutletStatus(o.id)
            }}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer relative",
              o.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
            )}
            title="Click to toggle status"
          >
            <div 
              className={cn(
                "w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs",
                o.status === "ACTIVE" ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>
        <div className="flex gap-2">
          <Button 
            size="xs" 
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer p-1 h-7 w-7 flex items-center justify-center" 
            title="Delete Outlet"
            onClick={() => {
              Swal.fire({
                title: "Delete Outlet?",
                text: `Are you sure you want to permanently delete "${o.name}"? This action cannot be undone.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it"
              }).then((result) => {
                if (result.isConfirmed) {
                   handleDeleteOutlet(o.id)
                   Swal.fire({
                     title: "Deleted",
                     text: "Outlet listing removed successfully.",
                     icon: "success",
                     confirmButtonColor: "#556B2F"
                   })
                }
              })
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="xs" 
            className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation()
              onConfigure()
            }}
          >
            <Settings className="h-3 w-3 mr-1" /> Configure
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

const parseDeliveryTime = (timeStr: string) => {
  const match = (timeStr || "").match(/(\d+)-(\d+)/);
  if (match) {
    return { min: match[1], max: match[2] };
  }
  return { min: "30", max: "45" };
};

const parseTimeHelper = (timeStr: string) => {
  const match = (timeStr || "09:00 AM").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hr = match[1].padStart(2, "0");
    let min = match[2];
    let period = match[3].toUpperCase();
    return { hour: hr, minute: min, period: period };
  }
  return { hour: "09", minute: "00", period: "AM" };
};

const formatTimeHelper = (hour: string, minute: string, period: string) => {
  return `${hour}:${minute} ${period}`;
};

export default function OutletsPage() {
  const { 
    outlets, 
    toggleOutletStatus, 
    handleAddOutlet, 
    updateOutlet, 
    handleDeleteOutlet,
    adminUsers,
    setAdminUsers,
    deliveryStaff,
    setDeliveryStaff,
    orders,
    roles,
    handleUpdateAdminUser
  } = useDashboard()

  console.log("=== ALL OUTLETS STATE DATA ===", outlets);

  const handleQuickAssignManager = (outletId: string, outletName: string, managerId: string) => {
    const previousAdminUsers = [...adminUsers];
    const prevManager = previousAdminUsers.find(u => u.assignedOutlet === outletName);

    if (prevManager?.id === managerId) {
      return; // No change needed, same manager is already selected
    }

    // Optimistically update frontend UI immediately
    setAdminUsers((prev: any[]) => prev.map(u => {
      if (u.assignedOutlet === outletName) {
        return { ...u, assignedOutlet: "" }
      }
      if (u.id === managerId) {
        return { ...u, assignedOutlet: outletName }
      }
      return u
    }));

    // Trigger API synchronization in the background
    (async () => {
      try {
        const promises = [];
        if (prevManager) {
          promises.push(handleUpdateAdminUser(prevManager.id, { assignedOutlet: "" }));
        }
        if (managerId !== "none") {
          promises.push(handleUpdateAdminUser(managerId, { assignedOutlet: outletName }));
        }

        const results = await Promise.all(promises);
        if (results.some(r => r === false)) {
          // Rollback on failure
          setAdminUsers(previousAdminUsers);
          Swal.fire({ title: "Update Failed", text: "Failed to save manager assignment on server.", icon: "error" });
        } else {
          Swal.fire({ title: "Success", text: "Manager assigned successfully.", icon: "success", timer: 800, showConfirmButton: false });
        }
      } catch (err) {
        console.error("Error quick assigning manager:", err);
        setAdminUsers(previousAdminUsers);
      }
    })();
  }

  const handleQuickToggleRider = (outletId: string, outletName: string, riderId: string, assign: boolean) => {
    const previousAdminUsers = [...adminUsers];

    // Optimistically update frontend UI immediately
    setAdminUsers((prev: any[]) => prev.map(u => {
      if (u.id === riderId) {
        return { ...u, assignedOutlet: assign ? outletName : "" }
      }
      return u
    }));

    // Trigger API synchronization in the background
    (async () => {
      try {
        const success = await handleUpdateAdminUser(riderId, { assignedOutlet: assign ? outletName : "" });
        if (!success) {
          setAdminUsers(previousAdminUsers);
          Swal.fire({ title: "Update Failed", text: "Failed to save rider assignment on server.", icon: "error" });
        } else {
          Swal.fire({ title: "Success", text: assign ? "Rider assigned successfully." : "Rider unassigned successfully.", icon: "success", timer: 800, showConfirmButton: false });
        }
      } catch (err) {
        console.error("Error quick toggling rider:", err);
        setAdminUsers(previousAdminUsers);
      }
    })();
  }

  const derivedDeliveryStaff = React.useMemo(() => {
    const deliveryRoleIds = roles
      .filter(r => {
        const name = r.name.toLowerCase();
        return name === "delivery staff" || name === "delivery riders" || name === "delivery rider" || name === "rider" || name === "riders";
      })
      .map(r => r._id);

    return adminUsers.filter(u => {
      const userRoleLower = (u.role || "").toLowerCase();
      return (
        userRoleLower === "delivery staff" ||
        userRoleLower === "delivery riders" ||
        userRoleLower === "delivery rider" ||
        userRoleLower === "rider" ||
        userRoleLower === "riders" ||
        deliveryRoleIds.includes(u.role)
      );
    });
  }, [adminUsers, roles])

  // Derive outlet managers from adminUsers
  const derivedOutletManagers = React.useMemo(() => {
    const managerRoleIds = roles
      .filter(r => r.name.toLowerCase() === "outlet manager")
      .map(r => r._id);

    return adminUsers.filter(u => {
      const userRoleLower = (u.role || "").toLowerCase();
      return (
        userRoleLower === "outlet manager" ||
        managerRoleIds.includes(u.role)
      );
    });
  }, [adminUsers, roles])
  
  // Register staffing states
  const [newOutletManagerId, setNewOutletManagerId] = useState<string>("none")
  const [newOutletRiderIds, setNewOutletRiderIds] = useState<string[]>([])
  
  // Register outlet states
  const [newOutlet, setNewOutlet] = useState({ 
    name: "Nirago Café Central", 
    address: "Connaught Place, New Delhi", 
    contact: "9876543210",
    deliveryEnabled: true,
    deliveryCharge: 40,
    minFreeDelivery: 500,
    estimatedDeliveryTime: "30-45 mins",
    paymentStatus: "ACTIVE" as "ACTIVE" | "INACTIVE" | "PENDING",
    merchantId: "",
    transactionId: "",
    allowedPaymentMethods: ["CASH", "UPI", "CARD"],
    latitude: "28.6139",
    longitude: "77.2090",
    code: "",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    email: "central@nirago.com",
    openingTime: "09:00 AM",
    closingTime: "11:00 PM",
    taxPercentage: 5,
    offersPickup: true,
    offersDineIn: true,
    offersInCar: true,
    image: ""
  })

  // Edit outlet states
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)
  const [editLat, setEditLat] = useState<string>("")
  const [editLng, setEditLng] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"general" | "delivery" | "payment" | "staffing">("general")
  const [selectedOutletSummary, setSelectedOutletSummary] = useState<Outlet | null>(null)
  const [outletImagePreview, setOutletImagePreview] = useState<string | null>(null)
  const [registerTab, setRegisterTab] = useState<"general" | "delivery" | "payment" | "staffing">("general")

  const handleRegister = async () => {
    if (outlets.length >= 9) {
      Swal.fire({
        title: "Outlet License Limit",
        text: "WARNING: Maximum limit of 9 outlets reached. Please upgrade to the Premium Plan to configure additional outlet networks.",
        icon: "warning",
        confirmButtonColor: "#556B2F"
      })
      return
    }
    if (newOutlet.contact.length !== 10) {
      Swal.fire({
        title: "Invalid Contact",
        text: "Contact number must be exactly 10 digits.",
        icon: "warning",
        confirmButtonColor: "#556B2F"
      })
      return
    }
    if (newOutlet.name && newOutlet.address) {
      const result = await handleAddOutlet(
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
        newOutlet.allowedPaymentMethods,
        newOutlet.latitude ? parseFloat(newOutlet.latitude) : undefined,
        newOutlet.longitude ? parseFloat(newOutlet.longitude) : undefined,
        {
          code: newOutlet.code || newOutlet.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          city: newOutlet.city,
          state: newOutlet.state,
          pincode: newOutlet.pincode,
          email: newOutlet.email,
          openingTime: newOutlet.openingTime,
          closingTime: newOutlet.closingTime,
          taxPercentage: newOutlet.taxPercentage,
          offersPickup: newOutlet.offersPickup,
          offersDineIn: newOutlet.offersDineIn,
          offersInCar: newOutlet.offersInCar,
          image: newOutlet.image
        }
      )
      if (result.success) {
        const newlyCreatedOutletName = newOutlet.name
        const createdId = result.id

        // API token match
        const tokenMatch = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/)
        const token = tokenMatch ? tokenMatch[2] : null

        if (newOutletManagerId !== "none") {
          setAdminUsers(prev => prev.map(u => {
            if (u.id === newOutletManagerId) {
              return { ...u, assignedOutlet: newlyCreatedOutletName }
            }
            return u
          }))
          if (token && createdId) {
            try {
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/${newOutletManagerId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  accessScope: "outlet",
                  outletId: createdId
                })
              })
            } catch (err) {
              console.error("API error assigning manager:", err)
            }
          }
        }
        if (newOutletRiderIds.length > 0) {
          setAdminUsers(prev => prev.map(u => {
            if (newOutletRiderIds.includes(u.id)) {
              return { ...u, assignedOutlet: newlyCreatedOutletName }
            }
            return u
          }))
          if (token && createdId) {
            newOutletRiderIds.forEach(riderId => {
              try {
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/${riderId}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    accessScope: "outlet",
                    outletId: createdId
                  })
                })
              } catch (err) {
                console.error("API error assigning rider:", err)
              }
            })
          }
        }

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
          allowedPaymentMethods: ["CASH", "UPI", "CARD"],
          latitude: "",
          longitude: "",
          code: "",
          city: "",
          state: "",
          pincode: "",
          email: "",
          openingTime: "09:00 AM",
          closingTime: "11:00 PM",
          taxPercentage: 5,
          offersPickup: true,
          offersDineIn: true,
          offersInCar: true,
          image: ""
        })
        setNewOutletManagerId("none")
        setNewOutletRiderIds([])

        Swal.fire({
          title: "Outlet Registered",
          text: "Physical outlet successfully deployed in system records with assigned staff.",
          icon: "success",
          confirmButtonColor: "#556B2F"
        })
      } else {
        const errMsgs = result.errors 
          ? Object.entries(result.errors).map(([field, msgs]: any) => `${field}: ${msgs.join(', ')}`).join('\n') 
          : result.message;
        Swal.fire({
          title: "Registration Failed",
          text: errMsgs || "Validation failed on the server.",
          icon: "error"
        })
      }
    }
  }

  const handleSaveOutletSettings = async () => {
    if (editingOutlet) {
      const cleanContact = (editingOutlet.contact || "").replace(/\D/g, "")
      if (cleanContact.length !== 10) {
        Swal.fire({
          title: "Invalid Contact",
          text: "Contact number must be exactly 10 digits.",
          icon: "warning",
          confirmButtonColor: "#556B2F"
        })
        return
      }
      
      // Preserve existing lat/lng from outlet if user didn't change them
      const updatedOutlet = {
        ...editingOutlet,
        contact: cleanContact,
        latitude: editLat ? parseFloat(editLat) : editingOutlet.latitude,
        longitude: editLng ? parseFloat(editLng) : editingOutlet.longitude
      }
      
      const result = await updateOutlet(editingOutlet.id, updatedOutlet)
      setEditingOutlet(null)
      if (result === true) {
        Swal.fire({
          title: "Store Configured",
          text: `Successfully updated settings for ${editingOutlet.name}.`,
          icon: "success",
          confirmButtonColor: "#556B2F"
        })
      } else {
        Swal.fire({
          title: "Update Failed",
          text: result || "Failed to save outlet settings.",
          icon: "error",
          confirmButtonColor: "#556B2F"
        })
      }
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

  if (selectedOutletSummary) {
    const o = selectedOutletSummary
    const outletOrders = orders.filter((ord: any) => ord.outlet === o.name)
    const outletCompletedOrders = outletOrders.filter((ord: any) => ord.status !== "CANCELLED" && ord.status !== "REJECTED")
    const totalRevenue = outletCompletedOrders.reduce((sum: number, ord: any) => sum + (ord.total || 0), 0)
    const activeOrdersCount = outletOrders.filter((ord: any) => ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && ord.status !== "REJECTED").length
    const uniqueCustomers = Array.from(new Set(outletOrders.map((ord: any) => ord.customerName)))
    
    // Delivery vs Pickup
    const deliveryCount = outletOrders.filter((ord: any) => ord.fulfillmentType === "DELIVERY").length
    const pickupCount = outletOrders.filter((ord: any) => ord.fulfillmentType === "PICKUP").length

    // Assigned Manager
    const managerRoleIds = roles
      .filter(r => r.name.toLowerCase() === "outlet manager")
      .map(r => r._id);

    const assignedManager = adminUsers.find(u => {
      const userRoleLower = (u.role || "").toLowerCase();
      return (
        (userRoleLower === "outlet manager" || managerRoleIds.includes(u.role)) &&
        u.assignedOutlet === o.name
      );
    })
    // Assigned Drivers
    const assignedRiders = derivedDeliveryStaff.filter(d => d.assignedOutlet === o.name)

    // Order status distribution
    const statusCounts = {
      PLACED: outletOrders.filter((ord: any) => ord.status === "PLACED").length,
      ACCEPTED: outletOrders.filter((ord: any) => ord.status === "ACCEPTED").length,
      PREPARING: outletOrders.filter((ord: any) => ord.status === "PREPARING").length,
      READY: outletOrders.filter((ord: any) => ord.status === "READY").length,
      OUT_FOR_DELIVERY: outletOrders.filter((ord: any) => ord.status === "OUT_FOR_DELIVERY").length,
      DELIVERED: outletOrders.filter((ord: any) => ord.status === "DELIVERED").length,
      CANCELLED: outletOrders.filter((ord: any) => ord.status === "CANCELLED" || ord.status === "REJECTED").length,
    }
    const statusChartData = [
      { name: "Placed", count: statusCounts.PLACED, color: "#3b82f6" },
      { name: "Accepted", count: statusCounts.ACCEPTED, color: "#06b6d4" },
      { name: "Preparing", count: statusCounts.PREPARING, color: "#f59e0b" },
      { name: "Ready", count: statusCounts.READY, color: "#8b5cf6" },
      { name: "Transit", count: statusCounts.OUT_FOR_DELIVERY, color: "#6366f1" },
      { name: "Delivered", count: statusCounts.DELIVERED, color: "#10b981" },
      { name: "Cancelled", count: statusCounts.CANCELLED, color: "#ef4444" },
    ]

    // 7-day sales trend data for this outlet
    const getOutletSalesTrend = () => {
      const days: { label: string; dateKey: string; sales: number }[] = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateKey = d.toISOString().substring(0, 10)
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        days.push({ label, dateKey, sales: 0 })
      }
      outletCompletedOrders.forEach((order: any) => {
        let oDate = order.deliveryDate
        if (!oDate) {
          const idNum = parseInt(order.id.replace("#", ""), 10)
          if (!isNaN(idNum)) {
            const diff = 1024 - idNum 
            const d = new Date()
            d.setDate(today.getDate() - Math.min(Math.max(diff, 0), 6))
            oDate = d.toISOString().substring(0, 10)
          } else {
            oDate = today.toISOString().substring(0, 10)
          }
        }
        const found = days.find(day => day.dateKey === oDate)
        if (found) {
          found.sales += order.total
        }
      })
      return days
    }
    const outletSalesTrendData = getOutletSalesTrend()

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-[#d2d2c4]/40 pb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-neutral-300 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              onClick={() => setSelectedOutletSummary(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#2d3822]">{o.name}</h2>
                <Badge className={o.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
                  {o.status}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 font-semibold">{o.address} • {o.contact}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Total Revenue</span>
                <div className="text-2xl font-black text-[#2d3822]">₹{totalRevenue.toLocaleString()}</div>
                <span className="text-[9px] text-neutral-400 font-semibold block">From {outletCompletedOrders.length} completed orders</span>
              </div>
              <Landmark className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Active Orders</span>
                <div className="text-2xl font-black text-[#556B2F]">{activeOrdersCount}</div>
                <span className="text-[9px] text-neutral-400 font-semibold block">Currently in processing pipeline</span>
              </div>
              <ShoppingBag className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>

          {/* Customers */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Unique Customers</span>
                <div className="text-2xl font-black text-[#2d3822]">{uniqueCustomers.length}</div>
                <span className="text-[9px] text-neutral-400 font-semibold block">Served in outlet history</span>
              </div>
              <Users className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>

          {/* Logistics Mix */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardContent className="p-5 flex items-center justify-between relative">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Fulfillment Mix</span>
                <div className="text-sm font-bold text-neutral-800 mt-1.5">
                  Delivery: <span className="text-[#556B2F] font-black">{deliveryCount}</span> • Pickup: <span className="text-[#556B2F] font-black">{pickupCount}</span>
                </div>
                <span className="text-[9px] text-neutral-400 font-semibold block">Total tracked orders: {outletOrders.length}</span>
              </div>
              <ArrowRightLeft className="h-10 w-10 text-[#556B2F]/10 stroke-[1.5]" />
            </CardContent>
          </Card>
        </div>

        {/* Outlet Details Information */}
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {/* Store Identity */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-bold text-[#2d3822] flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#556B2F]" /> Store Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Code</span>
                <span className="font-bold text-neutral-800 font-mono">{o.code || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Email</span>
                <span className="font-bold text-neutral-800">{o.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Phone</span>
                <span className="font-bold text-neutral-800">{o.contact || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Tax %</span>
                <span className="font-bold text-neutral-800">{o.taxPercentage ?? 5}%</span>
              </div>
              {o.image && (
                <div className="pt-1 cursor-pointer" onClick={() => setOutletImagePreview(o.image || null)}>
                  <img src={o.image} alt={o.name} className="w-full h-24 object-cover rounded-md border border-[#d2d2c4] hover:opacity-90 hover:border-[#556B2F] transition-all" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Timings */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-bold text-[#2d3822] flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#556B2F]" /> Location & Timings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">City</span>
                <span className="font-bold text-neutral-800">{o.city || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">State</span>
                <span className="font-bold text-neutral-800">{o.state || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Pincode</span>
                <span className="font-bold text-neutral-800 font-mono">{o.pincode || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Opening</span>
                <span className="font-bold text-neutral-800">{o.openingTime || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Closing</span>
                <span className="font-bold text-neutral-800">{o.closingTime || "—"}</span>
              </div>
              {(o.latitude || o.longitude) && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Coordinates</span>
                  <span className="font-bold text-neutral-800 font-mono text-[10px]">{o.latitude?.toFixed(4)}, {o.longitude?.toFixed(4)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery & Payment */}
          <Card className="border border-[#d2d2c4] bg-white shadow-xs rounded-md">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-bold text-[#2d3822] flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-[#556B2F]" /> Delivery & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Delivery</span>
                <Badge className={o.deliveryEnabled ? "bg-emerald-100 text-emerald-800 text-[9px]" : "bg-neutral-100 text-neutral-600 text-[9px]"}>
                  {o.deliveryEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Delivery Charge</span>
                <span className="font-bold text-neutral-800">₹{o.deliveryCharge ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Free Above</span>
                <span className="font-bold text-neutral-800">₹{o.minFreeDelivery ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-semibold">Est. Time</span>
                <span className="font-bold text-neutral-800">{o.estimatedDeliveryTime || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-semibold">Service Modes</span>
                <div className="flex gap-1">
                  {(o.offersPickup ?? true) && <span className="bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 text-[8px] font-bold px-1 py-0.5 rounded">Pickup</span>}
                  {(o.offersDineIn ?? true) && <span className="bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 text-[8px] font-bold px-1 py-0.5 rounded">Dine-In</span>}
                  {(o.offersInCar ?? true) && <span className="bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 text-[8px] font-bold px-1 py-0.5 rounded">In-Car</span>}
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-neutral-100">
                <span className="text-neutral-500 font-semibold">Gateway Status</span>
                <Badge className={
                  o.paymentStatus === "ACTIVE" ? "bg-emerald-100 text-emerald-800 text-[9px]" 
                  : o.paymentStatus === "PENDING" ? "bg-amber-100 text-amber-800 text-[9px]" 
                  : "bg-neutral-100 text-neutral-600 text-[9px]"
                }>
                  {o.paymentStatus || "INACTIVE"}
                </Badge>
              </div>
              {o.merchantId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-semibold">Merchant ID</span>
                  <span className="font-mono text-[10px] text-neutral-700 font-bold">{o.merchantId}</span>
                </div>
              )}
              {(o.allowedPaymentMethods && o.allowedPaymentMethods.length > 0) && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 font-semibold">Methods</span>
                  <div className="flex gap-1">
                    {o.allowedPaymentMethods.map(m => (
                      <span key={m} className="bg-neutral-100 text-neutral-700 text-[8px] font-bold px-1.5 py-0.5 rounded">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts & Staff Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Revenue Line Chart */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-[#556B2F]" /> Sales Revenue Trend (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-1 min-h-[220px]">
              <div className="relative w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={outletSalesTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOutletSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#556B2F" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#556B2F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis 
                      dataKey="label" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #d2d2c4', borderRadius: '6px', fontSize: '11px' }}
                      formatter={(val: any) => [`₹${val}`, 'Sales']}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#556B2F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutletSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-[#556B2F]" /> Orders Pipeline Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex-1 min-h-[220px]">
              <div className="relative w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusChartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 9, fontWeight: 600 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: '#888888', fontSize: 10, fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #d2d2c4', borderRadius: '6px', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff & Recent Orders */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Staffing Overview */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-[#556B2F]" /> Outlet Staffing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 flex-1">
              {/* Manager info */}
              <div className="bg-[#f5f5e6]/20 border border-[#d2d2c4]/45 p-3 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Assigned Manager</span>
                {assignedManager ? (
                  <div>
                    <div className="font-bold text-sm text-[#2d3822]">{assignedManager.name}</div>
                    <div className="text-xs text-neutral-500 font-semibold">{assignedManager.email}</div>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400 italic font-semibold">No Manager Assigned</span>
                )}
              </div>

              {/* Drivers list */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">Assigned Delivery Team ({assignedRiders.length})</span>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {assignedRiders.map((rider: any) => (
                    <div key={rider.id} className="flex justify-between items-center text-xs p-2 bg-neutral-50 border rounded-md">
                      <span className="font-bold text-[#2d3822]">{rider.name}</span>
                      <span className="text-neutral-500 font-mono">{rider.phone}</span>
                    </div>
                  ))}
                  {assignedRiders.length === 0 && (
                    <p className="text-xs text-neutral-400 italic py-2">No delivery staff assigned.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders List */}
          <Card className="border border-[#d2d2c4] bg-white rounded-md lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#2d3822] flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#556B2F]" /> Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="p-3 font-bold text-neutral-600">ID</th>
                      <th className="p-3 font-bold text-neutral-600">Customer</th>
                      <th className="p-3 font-bold text-neutral-600">Method</th>
                      <th className="p-3 font-bold text-neutral-600">Status</th>
                      <th className="p-3 font-bold text-neutral-600 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outletOrders.slice(0, 5).map((ord: any) => (
                      <tr key={ord.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                        <td className="p-3 font-black text-[#556B2F]">{ord.id}</td>
                        <td className="p-3 font-semibold text-neutral-800">{ord.customerName}</td>
                        <td className="p-3 text-neutral-500">{ord.paymentMethod}</td>
                        <td className="p-3">
                          <Badge className="text-[9px] py-0.5 px-1.5 font-bold">
                            {ord.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-neutral-800 text-right">₹{ord.total}</td>
                      </tr>
                    ))}
                    {outletOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-400 italic font-semibold">
                          No order transactions recorded for this outlet yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white cursor-pointer" onClick={() => setRegisterTab("general")}>
              <Plus className="h-4 w-4 mr-2" /> Register Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-xl w-full overflow-y-auto max-h-[90vh] no-scrollbar">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold text-[#2d3822]">Register New Outlet</DialogTitle>
              <DialogDescription>Configure all store details. Maximum limit: 9 outlets.</DialogDescription>
            </DialogHeader>

            {/* Tabs Bar */}
            <div className="flex border-b border-[#d2d2c4] my-2">
              <button type="button" className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${registerTab === "general" ? "border-[#556B2F] text-[#556B2F]" : "border-transparent text-neutral-500 hover:text-neutral-700"}`} onClick={() => setRegisterTab("general")}>General</button>
              <button type="button" className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${registerTab === "delivery" ? "border-[#556B2F] text-[#556B2F]" : "border-transparent text-neutral-500 hover:text-neutral-700"}`} onClick={() => setRegisterTab("delivery")}>Delivery</button>
              <button type="button" className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${registerTab === "payment" ? "border-[#556B2F] text-[#556B2F]" : "border-transparent text-neutral-500 hover:text-neutral-700"}`} onClick={() => setRegisterTab("payment")}>Payment</button>
              <button type="button" className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${registerTab === "staffing" ? "border-[#556B2F] text-[#556B2F]" : "border-transparent text-neutral-500 hover:text-neutral-700"}`} onClick={() => setRegisterTab("staffing")}>Staffing</button>
            </div>

            {/* General Tab */}
            {registerTab === "general" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Outlet Name</label>
                  <Input placeholder="e.g. Nirago Select (Vasant Kunj)" value={newOutlet.name} onChange={(e) => setNewOutlet(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Physical Address</label>
                  <Input placeholder="e.g. Ground Floor, DLF Promenade" value={newOutlet.address} onChange={(e) => setNewOutlet(prev => ({ ...prev, address: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Contact Number</label>
                  <div className="flex rounded-md shadow-xs">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 text-xs font-semibold">+91</span>
                    <Input placeholder="e.g. 9876543210" value={newOutlet.contact} className="rounded-l-none" onChange={(e) => setNewOutlet(prev => ({ ...prev, contact: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Latitude</label>
                    <Input type="number" step="any" placeholder="28.6139" value={newOutlet.latitude} onChange={(e) => setNewOutlet(prev => ({ ...prev, latitude: e.target.value }))} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Longitude</label>
                    <Input type="number" step="any" placeholder="77.2090" value={newOutlet.longitude} onChange={(e) => setNewOutlet(prev => ({ ...prev, longitude: e.target.value }))} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Code / Identifier</label>
                    <Input placeholder="e.g. central-cp" value={newOutlet.code} onChange={(e) => setNewOutlet(prev => ({ ...prev, code: e.target.value }))} className="h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">City</label>
                    <Input placeholder="Delhi" value={newOutlet.city} onChange={(e) => setNewOutlet(prev => ({ ...prev, city: e.target.value }))} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">State</label>
                    <Input placeholder="Delhi" value={newOutlet.state} onChange={(e) => setNewOutlet(prev => ({ ...prev, state: e.target.value }))} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Pincode</label>
                    <Input placeholder="110001" value={newOutlet.pincode} onChange={(e) => setNewOutlet(prev => ({ ...prev, pincode: e.target.value }))} className="h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Email Address</label>
                    <Input type="email" placeholder="cp@nirago.com" value={newOutlet.email} onChange={(e) => setNewOutlet(prev => ({ ...prev, email: e.target.value }))} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Tax % (GST)</label>
                    <Input type="number" placeholder="5" value={newOutlet.taxPercentage} onChange={(e) => setNewOutlet(prev => ({ ...prev, taxPercentage: Number(e.target.value) || 0 }))} className="h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Opening Time</label>
                    <div className="flex gap-1 items-center">
                      <select 
                        className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                        value={parseTimeHelper(newOutlet.openingTime || "09:00 AM").hour}
                        onChange={(e) => {
                          const parsed = parseTimeHelper(newOutlet.openingTime || "09:00 AM");
                          setNewOutlet(prev => ({ ...prev, openingTime: formatTimeHelper(e.target.value, parsed.minute, parsed.period) }));
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                          <option key={`reg-open-h-${h}`} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-neutral-400 text-xs font-bold">:</span>
                      <select 
                        className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                        value={parseTimeHelper(newOutlet.openingTime || "09:00 AM").minute}
                        onChange={(e) => {
                          const parsed = parseTimeHelper(newOutlet.openingTime || "09:00 AM");
                          setNewOutlet(prev => ({ ...prev, openingTime: formatTimeHelper(parsed.hour, e.target.value, parsed.period) }));
                        }}
                      >
                        {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                          <option key={`reg-open-m-${m}`} value={m}>{m}</option>
                        ))}
                      </select>
                      <select 
                        className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                        value={parseTimeHelper(newOutlet.openingTime || "09:00 AM").period}
                        onChange={(e) => {
                          const parsed = parseTimeHelper(newOutlet.openingTime || "09:00 AM");
                          setNewOutlet(prev => ({ ...prev, openingTime: formatTimeHelper(parsed.hour, parsed.minute, e.target.value) }));
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Closing Time</label>
                    <div className="flex gap-1 items-center">
                      <select 
                        className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                        value={parseTimeHelper(newOutlet.closingTime || "11:00 PM").hour}
                        onChange={(e) => {
                          const parsed = parseTimeHelper(newOutlet.closingTime || "11:00 PM");
                          setNewOutlet(prev => ({ ...prev, closingTime: formatTimeHelper(e.target.value, parsed.minute, parsed.period) }));
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                          <option key={`reg-close-h-${h}`} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="text-neutral-400 text-xs font-bold">:</span>
                      <select 
                        className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                        value={parseTimeHelper(newOutlet.closingTime || "11:00 PM").minute}
                        onChange={(e) => {
                          const parsed = parseTimeHelper(newOutlet.closingTime || "11:00 PM");
                          setNewOutlet(prev => ({ ...prev, closingTime: formatTimeHelper(parsed.hour, e.target.value, parsed.period) }));
                        }}
                      >
                        {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                          <option key={`reg-close-m-${m}`} value={m}>{m}</option>
                        ))}
                      </select>
                      <select 
                        className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                        value={parseTimeHelper(newOutlet.closingTime || "11:00 PM").period}
                        onChange={(e) => {
                          const parsed = parseTimeHelper(newOutlet.closingTime || "11:00 PM");
                          setNewOutlet(prev => ({ ...prev, closingTime: formatTimeHelper(parsed.hour, parsed.minute, e.target.value) }));
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Store Front Image</label>
                  <Input 
                    type="file" accept="image/*" className="h-9 text-xs cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 3 * 1024 * 1024) {
                          Swal.fire({ title: "File Too Large", text: "Store image must be smaller than 3MB.", icon: "warning", confirmButtonColor: "#556B2F" })
                          e.target.value = ""
                          return
                        }
                        const reader = new FileReader()
                        reader.onloadend = () => { setNewOutlet(prev => ({ ...prev, image: reader.result as string })) }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Active Service Modes</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={newOutlet.offersPickup} onChange={(e) => setNewOutlet(prev => ({ ...prev, offersPickup: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Pickup</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={newOutlet.offersDineIn} onChange={(e) => setNewOutlet(prev => ({ ...prev, offersDineIn: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Dine In</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={newOutlet.offersInCar} onChange={(e) => setNewOutlet(prev => ({ ...prev, offersInCar: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>In-Car</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Tab */}
            {registerTab === "delivery" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Enable Delivery</label>
                  <Select value={newOutlet.deliveryEnabled ? "yes" : "no"} onValueChange={(val) => setNewOutlet(prev => ({ ...prev, deliveryEnabled: val === "yes" }))}>
                    <SelectTrigger className="bg-white text-xs h-9"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="yes">Enabled</SelectItem>
                      <SelectItem value="no">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Delivery Charge (₹)</label>
                    <Input type="number" className="h-9" value={newOutlet.deliveryCharge} onChange={(e) => setNewOutlet(prev => ({ ...prev, deliveryCharge: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Free Delivery Minimum (₹)</label>
                    <Input type="number" className="h-9" value={newOutlet.minFreeDelivery} onChange={(e) => setNewOutlet(prev => ({ ...prev, minFreeDelivery: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 block">Estimated Delivery Time Window</label>
                  <div className="flex items-center gap-1">
                    <select 
                      className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      value={parseDeliveryTime(newOutlet.estimatedDeliveryTime).min}
                      onChange={(e) => { const parsed = parseDeliveryTime(newOutlet.estimatedDeliveryTime); setNewOutlet(prev => ({ ...prev, estimatedDeliveryTime: `${e.target.value}-${parsed.max} mins` })); }}
                    >
                      {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120].map(m => (
                        <option key={`reg-min-${m}`} value={m}>{m}m</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-neutral-500 font-bold">to</span>
                    <select 
                      className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      value={parseDeliveryTime(newOutlet.estimatedDeliveryTime).max}
                      onChange={(e) => { const parsed = parseDeliveryTime(newOutlet.estimatedDeliveryTime); setNewOutlet(prev => ({ ...prev, estimatedDeliveryTime: `${parsed.min}-${e.target.value} mins` })); }}
                    >
                      {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120].map(m => (
                        <option key={`reg-max-${m}`} value={m}>{m}m</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {registerTab === "payment" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Gateway Status</label>
                  <Select value={newOutlet.paymentStatus} onValueChange={(val: "ACTIVE" | "PENDING" | "INACTIVE") => setNewOutlet(prev => ({ ...prev, paymentStatus: val }))}>
                    <SelectTrigger className="bg-white text-xs h-9"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending Setup</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Razorpay Merchant ID</label>
                  <Input placeholder="e.g. rzp_live_xxxxxxx" value={newOutlet.merchantId} onChange={(e) => setNewOutlet(prev => ({ ...prev, merchantId: e.target.value }))} className="h-9 text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Razorpay Key / Transaction ID</label>
                  <Input placeholder="e.g. rzp_test_xxxxxxx" value={newOutlet.transactionId} onChange={(e) => setNewOutlet(prev => ({ ...prev, transactionId: e.target.value }))} className="h-9 text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Allowed Payment Methods</label>
                  <div className="flex gap-3">
                    {["CASH", "UPI", "CARD"].map(method => (
                      <label key={method} className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={newOutlet.allowedPaymentMethods.includes(method)} onChange={(e) => {
                          const updated = e.target.checked ? [...newOutlet.allowedPaymentMethods, method] : newOutlet.allowedPaymentMethods.filter(m => m !== method)
                          setNewOutlet(prev => ({ ...prev, allowedPaymentMethods: updated }))
                        }} className="rounded accent-[#556B2F]" />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded p-2">⚠️ Payment fields require backend support. Values may not persist until backend adds these fields.</p>
              </div>
            )}

            {/* Staffing Tab */}
            {registerTab === "staffing" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Assign Manager</label>
                  <Select value={newOutletManagerId} onValueChange={setNewOutletManagerId}>
                    <SelectTrigger className="bg-white text-xs h-9"><SelectValue placeholder="Select Manager" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">No Manager (Unassigned)</SelectItem>
                      {derivedOutletManagers.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} {u.assignedOutlet ? `(Currently: ${u.assignedOutlet})` : "(Unassigned)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 block">Assign Delivery Partners</label>
                  <div className="max-h-40 overflow-y-auto border border-[#d2d2c4] rounded-md p-2 bg-white space-y-1.5">
                    {derivedDeliveryStaff.map(staff => (
                      <label key={staff.id} className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newOutletRiderIds.includes(staff.id)}
                          onChange={(e) => {
                            if (e.target.checked) { setNewOutletRiderIds(prev => [...prev, staff.id]) } 
                            else { setNewOutletRiderIds(prev => prev.filter(id => id !== staff.id)) }
                          }}
                          className="rounded border-[#d2d2c4] text-[#556B2F] focus:ring-[#556B2F]"
                        />
                        <span>{staff.name} {staff.assignedOutlet ? `(Currently: ${staff.assignedOutlet})` : ""}</span>
                      </label>
                    ))}
                    {derivedDeliveryStaff.length === 0 && (
                      <span className="text-[10px] text-neutral-400 italic">No delivery staff registered.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {outlets.map(o => (
          <OutletCard 
            key={`outlet-card-${o.id}`} 
            o={o} 
            toggleOutletStatus={toggleOutletStatus} 
            handleDeleteOutlet={handleDeleteOutlet}
            adminUsers={adminUsers}
            deliveryStaff={derivedDeliveryStaff}
            roles={roles}
            handleQuickAssignManager={handleQuickAssignManager}
            handleQuickToggleRider={handleQuickToggleRider}
            derivedOutletManagers={derivedOutletManagers}
            onConfigure={() => {
              setEditingOutlet({ 
                ...o,
                contact: (o.contact || "").replace(/^\+91/, "").replace(/\D/g, "").slice(-10)
              })
              setEditLat(o.latitude !== undefined && o.latitude !== null ? o.latitude.toString() : "")
              setEditLng(o.longitude !== undefined && o.longitude !== null ? o.longitude.toString() : "")
              setActiveTab("general")
            }}
            onViewSummary={() => setSelectedOutletSummary(o)}
          />
        ))}
      </div>

      {/* Detailed Configure Dialog Modal with Tabs */}
      {editingOutlet && (
        <Dialog open={!!editingOutlet} onOpenChange={(open) => !open && setEditingOutlet(null)}>
          <DialogContent className="bg-white sm:max-w-xl w-full overflow-y-auto max-h-[90vh] no-scrollbar">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold text-[#2d3822]">Configure {editingOutlet.name}</DialogTitle>
              <DialogDescription>Modify status, delivery logistics, and payment gateway rules.</DialogDescription>
            </DialogHeader>

            {/* Custom Premium Tabs Bar */}
            <div className="flex border-b border-[#d2d2c4] my-2">
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "delivery"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("delivery")}
              >
                Delivery
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "payment"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("payment")}
              >
                Payments
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "staffing"
                    ? "border-[#556B2F] text-[#556B2F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
                onClick={() => setActiveTab("staffing")}
              >
                Staffing
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
                    <div className="flex rounded-md shadow-xs">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 text-xs font-semibold">
                        +91
                      </span>
                      <Input 
                        placeholder="e.g. 9876543210"
                        value={(editingOutlet.contact || "").replace(/^\+91/, "").replace(/\s/g, "")} 
                        className="rounded-l-none"
                        onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, contact: e.target.value.replace(/\D/g, "").slice(0, 10) } : null)} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Latitude</label>
                      <Input 
                        type="text"
                        placeholder="e.g. 28.6139"
                        value={editLat} 
                        onChange={(e) => setEditLat(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Longitude</label>
                      <Input 
                        type="text"
                        placeholder="e.g. 77.2090"
                        value={editLng} 
                        onChange={(e) => setEditLng(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Outlet Code</label>
                      <Input 
                        placeholder="e.g. central-cp"
                        value={editingOutlet.code || ""} 
                        onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, code: e.target.value } : null)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">City</label>
                      <Input 
                        placeholder="Delhi"
                        value={editingOutlet.city || ""} 
                        onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, city: e.target.value } : null)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">State</label>
                      <Input 
                        placeholder="Delhi"
                        value={editingOutlet.state || ""} 
                        onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, state: e.target.value } : null)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Pincode</label>
                      <Input 
                        placeholder="110001"
                        value={editingOutlet.pincode || ""} 
                        onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, pincode: e.target.value } : null)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Email Address</label>
                      <Input 
                        type="email"
                        placeholder="cp@nirago.com"
                        value={editingOutlet.email || ""} 
                        onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, email: e.target.value } : null)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Tax Percentage (GST %)</label>
                      <Input 
                        type="number"
                        placeholder="5"
                        value={editingOutlet.taxPercentage ?? 5} 
                        onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, taxPercentage: Number(e.target.value) || 0 } : null)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Opening Time</label>
                      <div className="flex gap-1 items-center">
                        <select 
                          className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                          value={parseTimeHelper(editingOutlet.openingTime || "09:00 AM").hour}
                          onChange={(e) => {
                            const parsed = parseTimeHelper(editingOutlet.openingTime || "09:00 AM");
                            setEditingOutlet(prev => prev ? { ...prev, openingTime: formatTimeHelper(e.target.value, parsed.minute, parsed.period) } : null);
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                            <option key={`edit-open-h-${h}`} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-neutral-400 text-xs font-bold">:</span>
                        <select 
                          className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                          value={parseTimeHelper(editingOutlet.openingTime || "09:00 AM").minute}
                          onChange={(e) => {
                            const parsed = parseTimeHelper(editingOutlet.openingTime || "09:00 AM");
                            setEditingOutlet(prev => prev ? { ...prev, openingTime: formatTimeHelper(parsed.hour, e.target.value, parsed.period) } : null);
                          }}
                        >
                          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                            <option key={`edit-open-m-${m}`} value={m}>{m}</option>
                          ))}
                        </select>
                        <select 
                          className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                          value={parseTimeHelper(editingOutlet.openingTime || "09:00 AM").period}
                          onChange={(e) => {
                            const parsed = parseTimeHelper(editingOutlet.openingTime || "09:00 AM");
                            setEditingOutlet(prev => prev ? { ...prev, openingTime: formatTimeHelper(parsed.hour, parsed.minute, e.target.value) } : null);
                          }}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">Closing Time</label>
                      <div className="flex gap-1 items-center">
                        <select 
                          className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                          value={parseTimeHelper(editingOutlet.closingTime || "11:00 PM").hour}
                          onChange={(e) => {
                            const parsed = parseTimeHelper(editingOutlet.closingTime || "11:00 PM");
                            setEditingOutlet(prev => prev ? { ...prev, closingTime: formatTimeHelper(e.target.value, parsed.minute, parsed.period) } : null);
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                            <option key={`edit-close-h-${h}`} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="text-neutral-400 text-xs font-bold">:</span>
                        <select 
                          className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                          value={parseTimeHelper(editingOutlet.closingTime || "11:00 PM").minute}
                          onChange={(e) => {
                            const parsed = parseTimeHelper(editingOutlet.closingTime || "11:00 PM");
                            setEditingOutlet(prev => prev ? { ...prev, closingTime: formatTimeHelper(parsed.hour, e.target.value, parsed.period) } : null);
                          }}
                        >
                          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                            <option key={`edit-close-m-${m}`} value={m}>{m}</option>
                          ))}
                        </select>
                        <select 
                          className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                          value={parseTimeHelper(editingOutlet.closingTime || "11:00 PM").period}
                          onChange={(e) => {
                            const parsed = parseTimeHelper(editingOutlet.closingTime || "11:00 PM");
                            setEditingOutlet(prev => prev ? { ...prev, closingTime: formatTimeHelper(parsed.hour, parsed.minute, e.target.value) } : null);
                          }}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Store Front Image</label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 3 * 1024 * 1024) {
                            Swal.fire({
                              title: "File Too Large",
                              text: "Store image must be smaller than 3MB.",
                              icon: "warning",
                              confirmButtonColor: "#556B2F"
                            })
                            e.target.value = ""
                            return
                          }
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setEditingOutlet(prev => prev ? { ...prev, image: reader.result as string } : null)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-neutral-600 block">Active Service Modes</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={editingOutlet.offersPickup ?? true} onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, offersPickup: e.target.checked } : null)} className="rounded accent-[#556B2F]" />
                        <span>Offers Pickup</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={editingOutlet.offersDineIn ?? true} onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, offersDineIn: e.target.checked } : null)} className="rounded accent-[#556B2F]" />
                        <span>Offers Dine In</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={editingOutlet.offersInCar ?? true} onChange={(e) => setEditingOutlet(prev => prev ? { ...prev, offersInCar: e.target.checked } : null)} className="rounded accent-[#556B2F]" />
                        <span>Offers In-Car</span>
                      </label>
                    </div>
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
                        <label className="text-xs font-semibold text-neutral-600 block">Estimated Delivery Time Window</label>
                        <div className="flex items-center gap-1">
                          <select 
                            className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                            value={parseDeliveryTime(editingOutlet.estimatedDeliveryTime || "").min}
                            onChange={(e) => {
                              const parsed = parseDeliveryTime(editingOutlet.estimatedDeliveryTime || "");
                              setEditingOutlet(prev => prev ? { ...prev, estimatedDeliveryTime: `${e.target.value}-${parsed.max} mins` } : null);
                            }}
                          >
                            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120].map(m => (
                              <option key={`edit-min-${m}`} value={m}>{m}m</option>
                            ))}
                          </select>
                          <span className="text-[10px] text-neutral-500 font-bold">to</span>
                          <select 
                            className="h-9 flex-1 rounded-md border border-[#d2d2c4] bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                            value={parseDeliveryTime(editingOutlet.estimatedDeliveryTime || "").max}
                            onChange={(e) => {
                              const parsed = parseDeliveryTime(editingOutlet.estimatedDeliveryTime || "");
                              setEditingOutlet(prev => prev ? { ...prev, estimatedDeliveryTime: `${parsed.min}-${e.target.value} mins` } : null);
                            }}
                          >
                            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120].map(m => (
                              <option key={`edit-max-${m}`} value={m}>{m}m</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PAYMENT */}
              {activeTab === "payment" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Gateway Razorpay Status</label>
                    <Select 
                      value={editingOutlet.paymentStatus || "ACTIVE"} 
                      onValueChange={(val: "ACTIVE" | "PENDING" | "INACTIVE") => setEditingOutlet(prev => prev ? { ...prev, paymentStatus: val } : null)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="ACTIVE">ACTIVE (Accepting Online Payments)</SelectItem>
                        <SelectItem value="PENDING">PENDING (Razorpay Setup In Progress)</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE (Gateways Disabled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Gateway Razorpay ID</label>
                    <Input 
                      placeholder="e.g. rzp_live_xxxxxxxxxxxxxx" 
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
              
              {/* TAB: STAFFING */}
              {activeTab === "staffing" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-600">Assign Outlet Manager</label>
                    <Select 
                      value={derivedOutletManagers.find(u => u.assignedOutlet === editingOutlet.name)?.id || "none"}
                      onValueChange={async (userId) => {
                        // 1. Remove previous manager of this outlet
                        const prevManager = derivedOutletManagers.find(u => u.assignedOutlet === editingOutlet.name)
                        if (prevManager) {
                          await handleUpdateAdminUser(prevManager.id, { assignedOutlet: "" })
                        }

                        // 2. Set new manager
                        if (userId !== "none") {
                          await handleUpdateAdminUser(userId, { assignedOutlet: editingOutlet.name })
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select Manager" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="none">No Manager (Unassigned)</SelectItem>
                        {derivedOutletManagers.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} {u.assignedOutlet ? `(Currently: ${u.assignedOutlet})` : "(Unassigned)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-600 block">Assign Delivery Partners</label>
                    <div className="max-h-40 overflow-y-auto border border-[#d2d2c4] rounded-lg p-2.5 space-y-2 bg-white">
                      {derivedDeliveryStaff.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic">No delivery staff registered.</p>
                      ) : (
                        derivedDeliveryStaff.map(staff => {
                          const isAssigned = staff.assignedOutlet === editingOutlet.name
                          return (
                            <label key={staff.id} className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={isAssigned}
                                onChange={async (e) => {
                                  const checked = e.target.checked
                                  await handleUpdateAdminUser(staff.id, { assignedOutlet: checked ? editingOutlet.name : "" })
                                }}
                                className="rounded border-[#d2d2c4] text-[#556B2F] focus:ring-[#556B2F]"
                              />
                              <span>{staff.name} {staff.assignedOutlet && !isAssigned ? `(Currently: ${staff.assignedOutlet})` : ""}</span>
                            </label>
                          )
                        })
                      )}
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

      {/* Full Image Preview Dialog */}
      {outletImagePreview && (
        <Dialog open={!!outletImagePreview} onOpenChange={(open) => !open && setOutletImagePreview(null)}>
          <DialogContent className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] bg-black/95 p-1 border-0 flex items-center justify-center overflow-hidden">
            <DialogTitle className="sr-only">Outlet Image Preview</DialogTitle>
            <div className="relative w-full max-h-[85vh] flex items-center justify-center">
              <img src={outletImagePreview} alt="Outlet Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
              <button 
                onClick={() => setOutletImagePreview(null)}
                className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/85 rounded-full p-2.5 hover:scale-105 transition-all text-sm font-bold w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
