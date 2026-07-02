"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboard, GlobalRules, Outlet } from "../DashboardContext"
import { Settings, Sparkles, Globe, Truck, CheckCircle2, MapPin } from "lucide-react"
import Swal from "sweetalert2"
import { cn } from "@/lib/utils"

export default function RulesPage() {
  const { globalRules, updateGlobalSettings, outlets, updateOutlet } = useDashboard()
  const [scope, setScope] = useState<"global" | string>("global") // "global" or outlet ID

  const currentOutlet = scope !== "global" ? outlets.find(o => o.id === scope) : null

  // Update specific fields based on current scope
  const handleFieldChange = (field: string, value: any) => {
    if (scope === "global") {
      updateGlobalSettings(field as keyof GlobalRules, value)
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

      updateOutlet(currentOutlet.id, { [mapField]: value })
    }
  }

  // Get field values dynamically depending on active scopes and overrides
  const getFieldValue = (field: string) => {
    if (scope === "global") {
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
    }
    return globalRules[field as keyof GlobalRules]
  }

  const handleSaveSection = (section: string) => {
    Swal.fire({
      title: "Saved!",
      text: scope === "global" 
        ? `Global ${section} settings have been successfully updated.` 
        : `${currentOutlet?.name} ${section} settings have been successfully updated.`,
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
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
            <Button size="sm" onClick={() => handleSaveSection("Tax")} className="w-full bg-[#556B2F] hover:bg-[#405223] text-white">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Tax Settings
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
            <Button size="sm" onClick={() => handleSaveSection("Delivery")} className="w-full bg-[#556B2F] hover:bg-[#405223] text-white">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Delivery Settings
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 block">Store Open/Close Timings</label>
              </div>
              <Input 
                value={getFieldValue("storeTimings") as string} 
                onChange={(e) => handleFieldChange("storeTimings", e.target.value)} 
                className="border-[#d2d2c4] bg-white font-medium"
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
            <Button size="sm" onClick={() => handleSaveSection("Operational")} className="w-full bg-[#556B2F] hover:bg-[#405223] text-white">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Operational Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
