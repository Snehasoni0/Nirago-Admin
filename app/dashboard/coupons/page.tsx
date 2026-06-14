"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useDashboard } from "../DashboardContext"

export default function CouponsPage() {
  const { coupons, toggleCouponStatus, handleAddCoupon } = useDashboard()
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", minOrder: "" })

  const handleSave = () => {
    if (newCoupon.code && newCoupon.discount) {
      handleAddCoupon(newCoupon.code, newCoupon.discount, parseFloat(newCoupon.minOrder) || 0)
      setNewCoupon({ code: "", discount: "", minOrder: "" })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Discount Promotional Coupons</h2>
          <p className="text-sm text-neutral-600">Configure promotional discount codes to incentivize basket size.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Coupon Code
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
              <DialogDescription>Code details immediately reflect at checkout validation endpoints.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code (Uppercase)</label>
                <Input placeholder="e.g. FESTIVE20" value={newCoupon.code} onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Summary</label>
                <Input placeholder="e.g. 20% OFF up to ₹100" value={newCoupon.discount} onChange={(e) => setNewCoupon(prev => ({ ...prev, discount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Order Basket Value (₹)</label>
                <Input type="number" placeholder="e.g. 299" value={newCoupon.minOrder} onChange={(e) => setNewCoupon(prev => ({ ...prev, minOrder: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={handleSave}>
                Save Promo Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-[#d2d2c4] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Offer Details</TableHead>
                  <TableHead>Min Basket Value</TableHead>
                  <TableHead>Usage Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={`coupon-row-${c.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold text-[#556B2F]">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.discount}</TableCell>
                    <TableCell className="font-medium">₹{c.minOrder}</TableCell>
                    <TableCell>
                      <Badge className={c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="outline" className="border-neutral-300 text-neutral-600" onClick={() => toggleCouponStatus(c.id)}>
                        Toggle Active
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
