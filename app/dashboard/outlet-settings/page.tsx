"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useDashboard } from "../DashboardContext"
import { Power, Store, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OutletSettingsPage() {
  const { outlets, updateOutlet } = useDashboard()
  const [userRole, setUserRole] = useState("Owner")
  const [userOutlet, setUserOutlet] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const myOutletObj = outlets.find(o => o.name === userOutlet)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  const isOnline = myOutletObj?.status === "ACTIVE"
  const outletNameClean = userOutlet ? userOutlet.split("(")[0].trim() : "Kitchen"

  const handleToggleOutletStatus = async () => {
    if (!myOutletObj) {
      Swal.fire("Error", "No outlet assigned to your profile.", "error")
      return
    }
    const nextStatus = isOnline ? "INACTIVE" : "ACTIVE"
    setIsUpdating(true)
    
    // Call the API via updateOutlet from context
    const result = await updateOutlet(myOutletObj.id, { status: nextStatus })
    setIsUpdating(false)
    
    if (result === true) {
      Swal.fire({
        title: `Kitchen is ${nextStatus === "ACTIVE" ? "ONLINE 🟢" : "OFFLINE 🔴"}`,
        text: `${outletNameClean} is now ${nextStatus === "ACTIVE" ? "accepting orders" : "offline"}`,
        icon: "success",
        confirmButtonColor: "#556B2F",
        timer: 1500
      })
    } else {
      Swal.fire("Error", typeof result === "string" ? result : "Failed to update outlet status", "error")
    }
  }

  if (!myOutletObj) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <h2 className="text-2xl font-bold text-[#2d3822]">Outlet Settings</h2>
        <Card className="border border-[#d2d2c4] bg-white text-center py-10">
          <Store className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-500">No specific outlet assigned</h3>
          <p className="text-sm text-neutral-400">Please select an outlet context to manage its settings.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200 w-[380px]">
      <div>
        <h2 className="text-xl font-bold text-[#2d3822]">Outlet Settings</h2>
        <p className="text-xs text-neutral-600">Configure operational controls for {userOutlet}</p>
      </div>

      <Card className="border border-[#d2d2c4] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow gap-0 py-0">
        <CardHeader className="bg-[#e6e6d8]/15 border-b border-[#d2d2c4] p-4">
          <CardTitle className="text-sm text-[#2d3822] flex items-center gap-2">
            <Power className="h-4 w-4 text-[#556B2F]" />
            Kitchen Operational Status
          </CardTitle>
          <CardDescription className="text-[11px] text-neutral-500">Toggle whether this kitchen is currently accepting new orders.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300",
            isOnline ? "bg-emerald-50 border-emerald-200 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-rose-50 border-rose-200 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
          )}>
            <Power className="h-6 w-6 shrink-0" />
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-neutral-800">{isOnline ? "ONLINE & OPEN" : "CLOSED / OFFLINE"}</h3>
            <p className="text-xs text-neutral-500">Customers {isOnline ? "can place orders" : "cannot place orders"}.</p>
          </div>

          <button
            onClick={handleToggleOutletStatus}
            disabled={isUpdating}
            className={cn(
              "w-full max-w-sm px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all duration-300 shadow-sm border flex items-center justify-center gap-2",
              isUpdating ? "opacity-75 cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200" : (
                isOnline 
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800 cursor-pointer" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer"
              )
            )}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                Updating Status...
              </>
            ) : (
              isOnline ? "Shut Down Kitchen" : "Open Kitchen"
            )}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
