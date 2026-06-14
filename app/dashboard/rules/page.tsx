"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDashboard } from "../DashboardContext"

export default function RulesPage() {
  const { globalRules, updateGlobalSettings } = useDashboard()

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Global Outlet Rules Configuration</h2>
          <p className="text-sm text-neutral-600">Configure global parameters, packaging charges, base taxes, and store timings.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-[#d2d2c4] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#556B2F]">Operational Fees & Taxes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Base GST Tax Rate (%)</label>
              <Input type="number" value={globalRules.gst} onChange={(e) => updateGlobalSettings("gst", parseFloat(e.target.value) || 0)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Standard Packaging Charge (₹)</label>
              <Input type="number" value={globalRules.packagingCharge} onChange={(e) => updateGlobalSettings("packagingCharge", parseFloat(e.target.value) || 0)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Base Delivery Fee (₹)</label>
              <Input type="number" value={globalRules.deliveryChargeBase} onChange={(e) => updateGlobalSettings("deliveryChargeBase", parseFloat(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#d2d2c4] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#556B2F]">System Operation Toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Store Open/Close Hours</label>
              <Input value={globalRules.storeTimings} onChange={(e) => updateGlobalSettings("storeTimings", e.target.value)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#f5f5e6]/30 border border-[#d2d2c4] rounded-lg">
              <div>
                <p className="text-sm font-bold text-[#2d3822]">Cash on Delivery (COD)</p>
                <span className="text-xs text-neutral-500">Allow physical cash settlements at doorsteps</span>
              </div>
              <Button 
                size="sm" 
                variant={globalRules.cashOnDelivery ? "default" : "outline"}
                className={globalRules.cashOnDelivery ? "bg-[#556B2F] hover:bg-[#405223] text-white" : "border-neutral-300 text-neutral-600"}
                onClick={() => updateGlobalSettings("cashOnDelivery", !globalRules.cashOnDelivery)}
              >
                {globalRules.cashOnDelivery ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="text-sm font-bold text-red-800">Maintenance Mode</p>
                <span className="text-xs text-neutral-500">Block customer client ordering apps completely</span>
              </div>
              <Button 
                size="sm" 
                variant={globalRules.maintenanceMode ? "destructive" : "outline"}
                className={globalRules.maintenanceMode ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-300 text-red-600 hover:bg-red-50"}
                onClick={() => updateGlobalSettings("maintenanceMode", !globalRules.maintenanceMode)}
              >
                {globalRules.maintenanceMode ? "Active" : "Inactive"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
