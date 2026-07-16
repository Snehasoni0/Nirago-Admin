"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboard, GlobalRules, Outlet } from "../DashboardContext"
import { Settings, Sparkles, Globe, Truck, CheckCircle2, MapPin, Loader2 } from "lucide-react"
import Swal from "sweetalert2"
import { cn } from "@/lib/utils"

const parseTime12h = (time12h: string) => {
  const defaultVal = { hour: "09", minute: "00", ampm: "AM" };
  if (!time12h) return defaultVal;
  const parts = time12h.trim().split(" ");
  if (parts.length < 2) return defaultVal;
  const [time, ampm] = parts;
  const timeParts = time.split(":");
  if (timeParts.length < 2) return defaultVal;
  return {
    hour: timeParts[0].padStart(2, "0"),
    minute: timeParts[1].padStart(2, "0"),
    ampm: ampm === "PM" ? "PM" : "AM"
  };
};

export default function RulesPage() {
  const { globalRules, updateGlobalSettings, outlets, updateOutlet, persistGlobalSettings, fetchOutletSettings, persistOutletSettings } = useDashboard()
  const [scope, setScope] = useState<"global" | string>("global") // "global" or outlet ID
  const [isSaving, setIsSaving] = useState<string | null>(null) // "Tax" | "Delivery" | "Operational" | null

  const currentOutlet = scope !== "global" ? outlets.find(o => o.id === scope) : null

  // Fetch settings for the selected outlet on scope change
  useEffect(() => {
    if (scope !== "global") {
      fetchOutletSettings(scope)
    }
  }, [scope])

  // Get field values dynamically depending on active scopes and overrides
  function getFieldValue(field: string) {
    if (scope === "global") {
      if (field === "kitchenClosed") return false; // Not configurable globally
      return globalRules[field as keyof GlobalRules]
    }
    if (currentOutlet) {
      if (field === "gst") return currentOutlet.overrideGst ?? globalRules.gst
      if (field === "vat") return currentOutlet.overrideVat ?? globalRules.vat ?? 12
      if (field === "localLevies") return currentOutlet.overrideLocalLevies ?? globalRules.localLevies ?? 2
      if (field === "packagingCharge") return currentOutlet.overridePackagingCharge ?? globalRules.packagingCharge ?? 30
      if (field === "deliveryChargeBase") return currentOutlet.overrideDeliveryFee ?? globalRules.deliveryChargeBase
      if (field === "deliveryPerKm") return currentOutlet.overrideDeliveryPerKm ?? globalRules.deliveryPerKm ?? 10
      if (field === "useDistancePricing") return currentOutlet.overrideUseDistancePricing ?? globalRules.useDistancePricing ?? false
      if (field === "storeTimings") return currentOutlet.overrideStoreTimings ?? globalRules.storeTimings
      if (field === "cashOnDelivery") return currentOutlet.overrideCod ?? globalRules.cashOnDelivery
      if (field === "maintenanceMode") return currentOutlet.overrideMaintenance ?? globalRules.maintenanceMode
      if (field === "kitchenClosed") return currentOutlet.overrideKitchenClosed ?? true
    }
    return globalRules[field as keyof GlobalRules]
  }

  const storeTimingsStr = (getFieldValue("storeTimings") as string) || "09:00 AM - 11:00 PM";
  const [openTimeStr, closeTimeStr] = storeTimingsStr.split(" - ");
  const openTime = parseTime12h(openTimeStr || "09:00 AM");
  const closeTime = parseTime12h(closeTimeStr || "11:00 PM");

  // Update specific fields based on current scope
  const handleFieldChange = (field: string, value: any) => {
    if (scope === "global") {
      if (field !== "kitchenClosed") {
        updateGlobalSettings(field as keyof GlobalRules, value)
      }
    } else if (currentOutlet) {
      let mapField = "override" + field.charAt(0).toUpperCase() + field.slice(1)
      if (field === "deliveryChargeBase") mapField = "overrideDeliveryFee"
      if (field === "gst") mapField = "overrideGst"
      if (field === "vat") mapField = "overrideVat"
      if (field === "localLevies") mapField = "overrideLocalLevies"
      if (field === "packagingCharge") mapField = "overridePackagingCharge"
      if (field === "deliveryPerKm") mapField = "overrideDeliveryPerKm"
      if (field === "useDistancePricing") mapField = "overrideUseDistancePricing"
      if (field === "storeTimings") mapField = "overrideStoreTimings"
      if (field === "cashOnDelivery") mapField = "overrideCod"
      if (field === "maintenanceMode") mapField = "overrideMaintenance"
      if (field === "kitchenClosed") mapField = "overrideKitchenClosed"

      updateOutlet(currentOutlet.id, { [mapField]: value })
    }
  }

  const handleSaveSection = async (section: string) => {
    setIsSaving(section)
    try {
      if (scope === "global") {
        const success = await persistGlobalSettings()
        if (success) {
          Swal.fire({
            title: "Saved!",
            text: `Global ${section} settings have been successfully updated.`,
            icon: "success",
            confirmButtonColor: "#556B2F"
          })
        } else {
          Swal.fire({
            title: "Failed!",
            text: "Could not save global settings on the server.",
            icon: "error",
            confirmButtonColor: "#d33"
          })
        }
      } else if (currentOutlet) {
        const success = await persistOutletSettings(currentOutlet.id)
        if (success) {
          Swal.fire({
            title: "Saved!",
            text: `${currentOutlet.name} ${section} settings have been successfully updated.`,
            icon: "success",
            confirmButtonColor: "#556B2F"
          })
        } else {
          Swal.fire({
            title: "Failed!",
            text: `Could not save ${currentOutlet.name} settings on the server.`,
            icon: "error",
            confirmButtonColor: "#d33"
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Scope Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f5f5e6]/30 border border-[#d2d2c4]/50 rounded-lg p-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#2d3822] flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#556B2F]" />
            Settings Control
          </h2>
          <p className="text-xs text-neutral-600">
            {scope === "global" 
              ? "Configure default rules for all active outlets."
              : `Configure custom settings overrides specifically for ${currentOutlet?.name}.`
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-neutral-600 uppercase">Active Scope:</span>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-[260px] border-[#d2d2c4] bg-white font-semibold text-neutral-800">
              <SelectValue placeholder="Global Settings" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="global" className="font-semibold">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#556B2F] shrink-0" />
                  <span>Configure Globally (All)</span>
                </span>
              </SelectItem>
              {outlets.filter(o => o.status === "ACTIVE").map(o => (
                <SelectItem key={`scope-outlet-${o.id}`} value={o.id}>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#556B2F] shrink-0" />
                    <span>{o.name.split("(")[0].trim()}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* Card 1: Tax Rates */}
        <Card className="border border-[#d2d2c4] bg-white shadow-xs">
          <CardHeader className="border-b border-[#e6e6d8]/50 pb-3">
            <CardTitle className="text-base font-bold text-[#556B2F] flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tax Rates & Levies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Base GST Rate (%)</label>
              </div>
              <Input 
                type="number" 
                value={getFieldValue("gst") as number} 
                onChange={(e) => handleFieldChange("gst", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">VAT Rate (%)</label>
              </div>
              <Input 
                type="number" 
                value={getFieldValue("vat") as number} 
                onChange={(e) => handleFieldChange("vat", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Local Levies Rate (%)</label>
              </div>
              <Input 
                type="number" 
                value={getFieldValue("localLevies") as number} 
                onChange={(e) => handleFieldChange("localLevies", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-[#f5f5e6]/20 py-3 border-t border-[#d2d2c4]/40 mt-auto">
            <Button 
              size="sm" 
              onClick={() => handleSaveSection("Tax")} 
              disabled={isSaving !== null} 
              className="w-full bg-[#556B2F] hover:bg-[#405223] text-white flex items-center justify-center gap-1.5"
            >
              {isSaving === "Tax" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Tax Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2: Packaging & Logistics */}
        <Card className="border border-[#d2d2c4] bg-white shadow-xs">
          <CardHeader className="border-b border-[#e6e6d8]/50 pb-3">
            <CardTitle className="text-base font-bold text-[#556B2F] flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery Charges Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Packaging Fee (₹)</label>
              </div>
              <Input 
                type="number" 
                value={getFieldValue("packagingCharge") as number} 
                onChange={(e) => handleFieldChange("packagingCharge", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Base Delivery Rate (₹)</label>
              </div>
              <Input 
                type="number" 
                value={getFieldValue("deliveryChargeBase") as number} 
                onChange={(e) => handleFieldChange("deliveryChargeBase", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Per-KM Multiplier Rate (₹)</label>
              </div>
              <Input 
                type="number" 
                disabled={!(getFieldValue("useDistancePricing") as boolean)}
                value={getFieldValue("deliveryPerKm") as number} 
                onChange={(e) => handleFieldChange("deliveryPerKm", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            {/* Distance-Based pricing toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#f5f5e6]/20 border border-[#d2d2c4]/40 rounded-lg">
              <div>
                <p className="text-xs font-bold text-[#2d3822]">Distance-Based Pricing</p>
                <span className="text-[10px] text-neutral-500 block">Calculate delivery fee dynamically</span>
              </div>
              <Button 
                size="xs" 
                variant={getFieldValue("useDistancePricing") as boolean ? "default" : "outline"}
                className={getFieldValue("useDistancePricing") as boolean
                  ? "bg-[#556B2F] hover:bg-[#405223] text-white" 
                  : "border-neutral-300 text-neutral-600"
                }
                onClick={() => handleFieldChange("useDistancePricing", !(getFieldValue("useDistancePricing") as boolean))}
              >
                {getFieldValue("useDistancePricing") as boolean ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-[#f5f5e6]/20 py-3 border-t border-[#d2d2c4]/40 mt-auto">
            <Button 
              size="sm" 
              onClick={() => handleSaveSection("Delivery")} 
              disabled={isSaving !== null} 
              className="w-full bg-[#556B2F] hover:bg-[#405223] text-white flex items-center justify-center gap-1.5"
            >
              {isSaving === "Delivery" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Delivery Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Card 3: Operations Toggles */}
        <Card className="border border-[#d2d2c4] bg-white shadow-xs flex flex-col">
          <CardHeader className="border-b border-[#e6e6d8]/50 pb-3">
            <CardTitle className="text-base font-bold text-[#556B2F] flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Operational Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-4 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 block">Store Open/Close Timings</label>
              <div className="grid grid-cols-1 gap-4">
                {/* Open Time Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Open</span>
                  <div className="flex items-center gap-1">
                    <select
                      value={openTime.hour}
                      onChange={(e) => {
                        const newOpen = `${e.target.value}:${openTime.minute} ${openTime.ampm}`;
                        handleFieldChange("storeTimings", `${newOpen} - ${closeTimeStr || "11:00 PM"}`);
                      }}
                      className="w-full border border-[#d2d2c4] rounded-md bg-white p-1 text-xs font-semibold h-9 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    >
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map(h => (
                        <option key={`open-h-${h}`} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-neutral-500 font-bold">:</span>
                    <select
                      value={openTime.minute}
                      onChange={(e) => {
                        const newOpen = `${openTime.hour}:${e.target.value} ${openTime.ampm}`;
                        handleFieldChange("storeTimings", `${newOpen} - ${closeTimeStr || "11:00 PM"}`);
                      }}
                      className="w-full border border-[#d2d2c4] rounded-md bg-white p-1 text-xs font-semibold h-9 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    >
                      {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                        <option key={`open-m-${m}`} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={openTime.ampm}
                      onChange={(e) => {
                        const newOpen = `${openTime.hour}:${openTime.minute} ${e.target.value}`;
                        handleFieldChange("storeTimings", `${newOpen} - ${closeTimeStr || "11:00 PM"}`);
                      }}
                      className="border border-[#d2d2c4] rounded-md bg-white p-1 text-xs font-bold h-9 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                {/* Close Time Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">Close</span>
                  <div className="flex items-center gap-1">
                    <select
                      value={closeTime.hour}
                      onChange={(e) => {
                        const newClose = `${e.target.value}:${closeTime.minute} ${closeTime.ampm}`;
                        handleFieldChange("storeTimings", `${openTimeStr || "09:00 AM"} - ${newClose}`);
                      }}
                      className="w-full border border-[#d2d2c4] rounded-md bg-white p-1 text-xs font-semibold h-9 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    >
                      {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map(h => (
                        <option key={`close-h-${h}`} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-neutral-500 font-bold">:</span>
                    <select
                      value={closeTime.minute}
                      onChange={(e) => {
                        const newClose = `${closeTime.hour}:${e.target.value} ${closeTime.ampm}`;
                        handleFieldChange("storeTimings", `${openTimeStr || "09:00 AM"} - ${newClose}`);
                      }}
                      className="w-full border border-[#d2d2c4] rounded-md bg-white p-1 text-xs font-semibold h-9 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    >
                      {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => (
                        <option key={`close-m-${m}`} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={closeTime.ampm}
                      onChange={(e) => {
                        const newClose = `${closeTime.hour}:${closeTime.minute} ${e.target.value}`;
                        handleFieldChange("storeTimings", `${openTimeStr || "09:00 AM"} - ${newClose}`);
                      }}
                      className="border border-[#d2d2c4] rounded-md bg-white p-1 text-xs font-bold h-9 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* COD Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#f5f5e6]/25 border border-[#d2d2c4]/45 rounded-lg">
              <div>
                <p className="text-xs font-bold text-[#2d3822]">Cash on Delivery (COD)</p>
                <span className="text-[10px] text-neutral-500 block">Allow checkout using cash option</span>
              </div>
              <Button 
                size="xs" 
                variant={getFieldValue("cashOnDelivery") as boolean ? "default" : "outline"}
                className={getFieldValue("cashOnDelivery") as boolean
                  ? "bg-[#556B2F] hover:bg-[#405223] text-white" 
                  : "border-neutral-300 text-neutral-600"
                }
                onClick={() => handleFieldChange("cashOnDelivery", !(getFieldValue("cashOnDelivery") as boolean))}
              >
                {getFieldValue("cashOnDelivery") as boolean ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {/* Kitchen Closed Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg">
              <div>
                <p className="text-xs font-bold text-amber-800">Kitchen Status (Closed)</p>
                <span className="text-[10px] text-neutral-500 block">Temporarily stop accepting orders at this kitchen</span>
              </div>
              {scope === "global" ? (
                <span className="text-[10px] text-neutral-400 font-semibold italic">Select an outlet to toggle</span>
              ) : (
                <Button 
                  size="xs" 
                  variant={getFieldValue("kitchenClosed") as boolean ? "destructive" : "outline"}
                  className={getFieldValue("kitchenClosed") as boolean
                    ? "bg-amber-600 hover:bg-amber-700 text-white border-transparent" 
                    : "border-amber-200 text-amber-600 hover:bg-amber-50"
                  }
                  onClick={() => handleFieldChange("kitchenClosed", !(getFieldValue("kitchenClosed") as boolean))}
                >
                  {getFieldValue("kitchenClosed") as boolean ? "Closed" : "Open"}
                </Button>
              )}
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-rose-50/50 border border-rose-200 rounded-lg">
              <div>
                <p className="text-xs font-bold text-rose-800">Maintenance Screen</p>
                <span className="text-[10px] text-neutral-500 block">Halt client ordering pipelines</span>
              </div>
              <Button 
                size="xs" 
                variant={getFieldValue("maintenanceMode") as boolean ? "destructive" : "outline"}
                className={getFieldValue("maintenanceMode") as boolean
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : "border-rose-200 text-rose-600 hover:bg-rose-50"
                }
                onClick={() => handleFieldChange("maintenanceMode", !(getFieldValue("maintenanceMode") as boolean))}
              >
                {getFieldValue("maintenanceMode") as boolean ? "Active" : "Inactive"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-[#f5f5e6]/20 py-3 border-t border-[#d2d2c4]/40 mt-auto">
            <Button 
              size="sm" 
              onClick={() => handleSaveSection("Operational")} 
              disabled={isSaving !== null} 
              className="w-full bg-[#556B2F] hover:bg-[#405223] text-white flex items-center justify-center gap-1.5"
            >
              {isSaving === "Operational" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Operational Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
