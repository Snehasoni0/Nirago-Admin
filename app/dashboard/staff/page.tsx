"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDashboard } from "../DashboardContext"

export default function StaffPage() {
  const { deliveryStaff, orders } = useDashboard()

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Manual Delivery Dispatch Registry</h2>
          <p className="text-sm text-neutral-600">Register internal riders. Phase 1 runs on manual dispatch assignments without rider app.</p>
        </div>
      </div>

      <Card className="border border-[#d2d2c4] bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#556B2F]">Internal Rider Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Duty Status</TableHead>
                  <TableHead>Pending Dispatches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryStaff.map((s) => (
                  <TableRow key={`staff-row-${s.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold">{s.name}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>
                      <Badge className={s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
                        {s.status === "ACTIVE" ? "Active / On Duty" : "Off Duty"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {orders.filter(o => o.deliveryStaff === s.name && o.status === "OUT_FOR_DELIVERY").length} Shipments
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
