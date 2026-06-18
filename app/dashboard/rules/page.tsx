"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboard, GlobalRules, Outlet } from "../DashboardContext"
import { Settings, ToggleLeft, ToggleRight, Sparkles, MapPin, Globe, HelpCircle, Truck, Clock } from "lucide-react"
import Swal from "sweetalert2"
import { cn } from "@/lib/utils"

export default function RulesPage() {
  const { globalRules, updateGlobalSettings, outlets, updateOutlet } = useDashboard()
  const [scope, setScope] = useState<"global" | string>("global") // "global" or outlet ID

  const currentOutlet = scope !== "global" ? outlets.find(o => o.id === scope) : null

  const hasOverrides = currentOutlet && (
    currentOutlet.overrideGst !== undefined ||
    currentOutlet.overrideVat !== undefined ||
    currentOutlet.overrideLocalLevies !== undefined ||
    currentOutlet.overridePackagingCharge !== undefined ||
    currentOutlet.overrideDeliveryFee !== undefined ||
    currentOutlet.overrideDeliveryPerKm !== undefined ||
    currentOutlet.overrideUseDistancePricing !== undefined ||
    currentOutlet.overrideStoreTimings !== undefined ||
    currentOutlet.overrideCod !== undefined ||
    currentOutlet.overrideMaintenance !== undefined
  )

  const handleToggleOverrides = () => {
    if (!currentOutlet) return

    if (hasOverrides) {
      // Prompt confirm clear overrides
      Swal.fire({
        title: "Remove Overrides?",
        text: `Are you sure you want to delete custom configurations for ${currentOutlet.name}? It will revert back to global configurations.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#556B2F",
        confirmButtonText: "Yes, revert to global",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          updateOutlet(currentOutlet.id, {
            overrideGst: undefined,
            overrideVat: undefined,
            overrideLocalLevies: undefined,
            overridePackagingCharge: undefined,
            overrideDeliveryFee: undefined,
            overrideDeliveryPerKm: undefined,
            overrideUseDistancePricing: undefined,
            overrideStoreTimings: undefined,
            overrideCod: undefined,
            overrideMaintenance: undefined
          })
          Swal.fire("Reverted", "Outlet is now using brand global rules.", "success")
        }
      })
    } else {
      // Enable overrides, copy globals to start
      updateOutlet(currentOutlet.id, {
        overrideGst: globalRules.gst,
        overrideVat: globalRules.vat ?? 12,
        overrideLocalLevies: globalRules.localLevies ?? 2,
        overridePackagingCharge: globalRules.packagingCharge ?? 30,
        overrideDeliveryFee: globalRules.deliveryChargeBase,
        overrideDeliveryPerKm: globalRules.deliveryPerKm ?? 10,
        overrideUseDistancePricing: globalRules.useDistancePricing ?? false,
        overrideStoreTimings: globalRules.storeTimings,
        overrideCod: globalRules.cashOnDelivery,
        overrideMaintenance: globalRules.maintenanceMode
      })
      Swal.fire("Overrides Enabled", `Custom rules activated for ${currentOutlet.name}. Modify values below.`, "success")
    }
  }

  // Update specific fields based on current scope
  const handleFieldChange = (field: string, value: any) => {
    if (scope === "global") {
      updateGlobalSettings(field as keyof GlobalRules, value)
    } else if (currentOutlet && hasOverrides) {
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

      updateOutlet(currentOutlet.id, { [mapField]: value })
    }
  }

  // Get field values dynamically depending on active scopes and overrides
  const getFieldValue = (field: string) => {
    if (scope === "global") {
      return globalRules[field as keyof GlobalRules]
    }
    if (currentOutlet && hasOverrides) {
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
    }
    return globalRules[field as keyof GlobalRules]
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Scope Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f5f5e6]/30 border border-[#d2d2c4]/50 rounded-lg p-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#2d3822] flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#556B2F]" />
            Rules Configuration Control
          </h2>
          <p className="text-xs text-neutral-600">
            {scope === "global" 
              ? "Modifying global rules applied across all active outlets by default."
              : `Configuring local rule overrides specifically for ${currentOutlet?.name}.`
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
              <SelectItem value="global" className="font-semibold flex items-center">
                🌐 Configure Globally (All)
              </SelectItem>
              {outlets.filter(o => o.status === "ACTIVE").map(o => (
                <SelectItem key={`scope-outlet-${o.id}`} value={o.id}>
                  📍 {o.name.split("(")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Outlet override indicator panel */}
      {scope !== "global" && currentOutlet && (
        <div className="flex items-center justify-between p-4 bg-white border border-[#d2d2c4] rounded-lg shadow-xs animate-in fade-in duration-200">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#556B2F]" />
              <span className="font-bold text-neutral-800">{currentOutlet.name} Overrides</span>
            </div>
            <p className="text-xs text-neutral-500">
              {hasOverrides 
                ? "This outlet is running on localized configuration parameters. You can modify them independently." 
                : "This outlet is currently inheriting operational constraints directly from the brand global rules."
              }
            </p>
          </div>
          <Button 
            onClick={handleToggleOverrides}
            className={hasOverrides ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" : "bg-[#556B2F] hover:bg-[#405223] text-white"}
          >
            {hasOverrides ? "Remove Overrides" : "Enable Local Overrides"}
          </Button>
        </div>
      )}

      {/* Inputs Form */}
      <div className="grid gap-6 md:grid-cols-3">
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
                {scope !== "global" && !hasOverrides && (
                  <span className="text-[9px] bg-[#f5f5e6] text-[#556B2F] font-bold py-0.5 px-2 rounded-full">Inherited</span>
                )}
              </div>
              <Input 
                type="number" 
                disabled={scope !== "global" && !hasOverrides}
                value={getFieldValue("gst") as number} 
                onChange={(e) => handleFieldChange("gst", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">VAT Rate (%)</label>
                {scope !== "global" && !hasOverrides && (
                  <span className="text-[9px] bg-[#f5f5e6] text-[#556B2F] font-bold py-0.5 px-2 rounded-full">Inherited</span>
                )}
              </div>
              <Input 
                type="number" 
                disabled={scope !== "global" && !hasOverrides}
                value={getFieldValue("vat") as number} 
                onChange={(e) => handleFieldChange("vat", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Local Levies Rate (%)</label>
                {scope !== "global" && !hasOverrides && (
                  <span className="text-[9px] bg-[#f5f5e6] text-[#556B2F] font-bold py-0.5 px-2 rounded-full">Inherited</span>
                )}
              </div>
              <Input 
                type="number" 
                disabled={scope !== "global" && !hasOverrides}
                value={getFieldValue("localLevies") as number} 
                onChange={(e) => handleFieldChange("localLevies", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Packaging & Logistics */}
        <Card className="border border-[#d2d2c4] bg-white shadow-xs">
          <CardHeader className="border-b border-[#e6e6d8]/50 pb-3">
            <CardTitle className="text-base font-bold text-[#556B2F] flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Logistics & Delivery Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Packaging Fee (₹)</label>
                {scope !== "global" && !hasOverrides && (
                  <span className="text-[9px] bg-[#f5f5e6] text-[#556B2F] font-bold py-0.5 px-2 rounded-full">Inherited</span>
                )}
              </div>
              <Input 
                type="number" 
                disabled={scope !== "global" && !hasOverrides}
                value={getFieldValue("packagingCharge") as number} 
                onChange={(e) => handleFieldChange("packagingCharge", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Base Delivery Rate (₹)</label>
                {scope !== "global" && !hasOverrides && (
                  <span className="text-[9px] bg-[#f5f5e6] text-[#556B2F] font-bold py-0.5 px-2 rounded-full">Inherited</span>
                )}
              </div>
              <Input 
                type="number" 
                disabled={scope !== "global" && !hasOverrides}
                value={getFieldValue("deliveryChargeBase") as number} 
                onChange={(e) => handleFieldChange("deliveryChargeBase", parseFloat(e.target.value) || 0)} 
                className="border-[#d2d2c4] bg-white font-medium disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Per-KM Multiplier Rate (₹)</label>
                {scope !== "global" && !hasOverrides && (
                  <span className="text-[9px] bg-[#f5f5e6] text-[#556B2F] font-bold py-0.5 px-2 rounded-full">Inherited</span>
                )}
              </div>
              <Input 
                type="number" 
                disabled={scope !== "global" && !hasOverrides || !(getFieldValue("useDistancePricing") as boolean)}
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
                disabled={scope !== "global" && !hasOverrides}
                variant={getFieldValue("useDistancePricing") as boolean ? "default" : "outline"}
                className={getFieldValue("useDistancePricing") as boolean
                  ? "bg-[#556B2F] hover:bg-[#405223] text-white disabled:bg-[#556B2F]/60" 
                  : "border-neutral-300 text-neutral-600 disabled:opacity-60"
                }
                onClick={() => handleFieldChange("useDistancePricing", !(getFieldValue("useDistancePricing") as boolean))}
              >
                {getFieldValue("useDistancePricing") as boolean ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Operations Toggles */}
        <Card className="border border-[#d2d2c4] bg-white shadow-xs">
          <CardHeader className="border-b border-[#e6e6d8]/50 pb-3">
            <CardTitle className="text-base font-bold text-[#556B2F] flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Operational Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 block">Store Open/Close Timings</label>
                {scope !== "global" && !hasOverrides && (
                  <span className="text-[9px] bg-[#f5f5e6] text-[#556B2F] font-bold py-0.5 px-2 rounded-full">Inherited</span>
                )}
              </div>
              <Input 
                disabled={scope !== "global" && !hasOverrides}
                value={getFieldValue("storeTimings") as string} 
                onChange={(e) => handleFieldChange("storeTimings", e.target.value)} 
                className="border-[#d2d2c4] bg-white font-medium disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>

            {/* COD Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#f5f5e6]/25 border border-[#d2d2c4]/45 rounded-lg">
              <div>
                <p className="text-xs font-bold text-[#2d3822]">Cash on Delivery (COD)</p>
                <span className="text-[10px] text-neutral-500 block">Allow checkout using cash option</span>
              </div>
              <Button 
                size="xs" 
                disabled={scope !== "global" && !hasOverrides}
                variant={getFieldValue("cashOnDelivery") as boolean ? "default" : "outline"}
                className={getFieldValue("cashOnDelivery") as boolean
                  ? "bg-[#556B2F] hover:bg-[#405223] text-white disabled:bg-[#556B2F]/60" 
                  : "border-neutral-300 text-neutral-600 disabled:opacity-60"
                }
                onClick={() => handleFieldChange("cashOnDelivery", !(getFieldValue("cashOnDelivery") as boolean))}
              >
                {getFieldValue("cashOnDelivery") as boolean ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-rose-50/50 border border-rose-200 rounded-lg">
              <div>
                <p className="text-xs font-bold text-rose-800">Maintenance Screen</p>
                <span className="text-[10px] text-neutral-500 block">Halt client ordering pipelines</span>
              </div>
              <Button 
                size="xs" 
                disabled={scope !== "global" && !hasOverrides}
                variant={getFieldValue("maintenanceMode") as boolean ? "destructive" : "outline"}
                className={getFieldValue("maintenanceMode") as boolean
                  ? "bg-rose-600 hover:bg-rose-700 text-white disabled:bg-rose-600/60" 
                  : "border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                }
                onClick={() => handleFieldChange("maintenanceMode", !(getFieldValue("maintenanceMode") as boolean))}
              >
                {getFieldValue("maintenanceMode") as boolean ? "Active" : "Inactive"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-4 bg-[#f5f5e6]/20 border border-[#d2d2c4]/50 rounded-lg text-neutral-600 text-xs">
        <HelpCircle className="h-5 w-5 text-[#556B2F] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#2d3822] block">How overrides work:</span>
          <p>
            When you select an outlet and click <span className="font-semibold text-[#556B2F]">Enable Local Overrides</span>, that outlet's configurations decouple from the global configs. Any future global rules updates will NOT propagate to that outlet. Removing overrides immediately couples the outlet back to global settings, destroying any custom values defined.
          </p>
        </div>
      </div>
    </div>
  )
}
