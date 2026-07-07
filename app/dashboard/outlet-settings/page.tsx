"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useDashboard } from "../DashboardContext"
import { Power, Store, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OutletSettingsPage() {
  const { outlets, updateOutlet } = useDashboard()
  const [userRole, setUserRole] = useState("Owner")
  const [userOutlet, setUserOutlet] = useState("")

  const myOutletObj = outlets.find(o => o.name === userOutlet)
  
  const [localLat, setLocalLat] = useState("")
  const [localLng, setLocalLng] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("nirago_user_role") || "Owner")
      setUserOutlet(localStorage.getItem("nirago_user_outlet") || "")
    }
  }, [])

  useEffect(() => {
    if (myOutletObj) {
      setLocalLat(myOutletObj.latitude?.toString() || "")
      setLocalLng(myOutletObj.longitude?.toString() || "")
    }
  }, [myOutletObj])

  const isOnline = myOutletObj?.status === "ACTIVE"
  const outletNameClean = userOutlet ? userOutlet.split("(")[0].trim() : "Kitchen"

  const handleToggleOutletStatus = () => {
    if (!myOutletObj) {
      Swal.fire("Error", "No outlet assigned to your profile.", "error")
      return
    }
    const nextStatus = isOnline ? "INACTIVE" : "ACTIVE"
    updateOutlet(myOutletObj.id, { status: nextStatus })
    Swal.fire({
      title: `Kitchen is ${nextStatus === "ACTIVE" ? "ONLINE 🟢" : "OFFLINE 🔴"}`,
      text: `${outletNameClean} is now ${nextStatus === "ACTIVE" ? "accepting orders" : "offline"}`,
      icon: "success",
      confirmButtonColor: "#556B2F",
      timer: 1500
    })
  }

  const handleSaveCoordinates = () => {
    if (!myOutletObj) return
    updateOutlet(myOutletObj.id, {
      latitude: localLat ? parseFloat(localLat) : undefined,
      longitude: localLng ? parseFloat(localLng) : undefined
    })
    Swal.fire({
      title: "Coordinates Saved",
      text: "Outlet location coordinates updated successfully.",
      icon: "success",
      confirmButtonColor: "#556B2F",
      timer: 1500
    })
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
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-[#2d3822]">Outlet Settings</h2>
        <p className="text-sm text-neutral-600">Configure operational controls for {userOutlet}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-[#d2d2c4] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow gap-0 py-0">
          <CardHeader className="bg-[#e6e6d8]/15 border-b border-[#d2d2c4] pt-4 pb-4 px-6">
            <CardTitle className="text-lg text-[#2d3822] flex items-center gap-2">
              <Power className="h-5 w-5 text-[#556B2F]" />
              Kitchen Operational Status
            </CardTitle>
            <CardDescription className="text-neutral-500">Toggle whether this kitchen is currently accepting new orders.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300",
              isOnline ? "bg-emerald-50 border-emerald-200 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-rose-50 border-rose-200 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            )}>
              <Power className="h-10 w-10 shrink-0" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-neutral-800">{isOnline ? "ONLINE & OPEN" : "CLOSED / OFFLINE"}</h3>
              <p className="text-sm text-neutral-500">Customers {isOnline ? "can place orders" : "cannot place orders"}.</p>
            </div>

            <button
              onClick={handleToggleOutletStatus}
              className={cn(
                "w-full max-w-sm px-5 py-3 rounded-xl font-bold text-sm uppercase transition-all duration-300 cursor-pointer shadow-sm border",
                isOnline 
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 animate-pulse"
              )}
            >
              {isOnline ? "Shut Down Kitchen" : "Open Kitchen"}
            </button>
          </CardContent>
        </Card>

        {/* Location Coordinates Configuration Card */}
        <Card className="border border-[#d2d2c4] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow gap-0 py-0">
          <CardHeader className="bg-[#e6e6d8]/15 border-b border-[#d2d2c4] pt-4 pb-4 px-6">
            <CardTitle className="text-lg text-[#2d3822] flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#556B2F]" />
              Location Coordinates
            </CardTitle>
            <CardDescription className="text-neutral-500">Configure latitude and longitude for delivery distance calculations.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600">Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  value={localLat}
                  onChange={(e) => setLocalLat(e.target.value)}
                  className="w-full text-xs font-semibold border border-[#d2d2c4] rounded-md px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-white text-neutral-700 h-9"
                  placeholder="e.g. 28.6139"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600">Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  value={localLng}
                  onChange={(e) => setLocalLng(e.target.value)}
                  className="w-full text-xs font-semibold border border-[#d2d2c4] rounded-md px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-white text-neutral-700 h-9"
                  placeholder="e.g. 77.2090"
                />
              </div>
            </div>
            <button
              onClick={handleSaveCoordinates}
              className="w-full px-5 py-2.5 rounded-lg bg-[#556B2F] hover:bg-[#405223] text-white font-bold text-xs uppercase transition-all duration-200 cursor-pointer shadow-sm"
            >
              Save Coordinates
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
