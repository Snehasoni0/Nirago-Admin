"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDashboard } from "../DashboardContext"

export default function CustomersPage() {
  const { customers, toggleCustomerStatus } = useDashboard()

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Registered Customer Base</h2>
          <p className="text-sm text-neutral-600">Audit user profiles, contact registration records, and block platform abusers.</p>
        </div>
      </div>

      <Card className="border border-[#d2d2c4] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Wallet Bal</TableHead>
                  <TableHead>Membership Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={`cust-row-${c.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell className="font-semibold text-[#556B2F]">₹{c.walletBalance}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-bold",
                        c.membership === "PREMIUM" && "bg-purple-100 text-purple-800",
                        c.membership === "GOLD" && "bg-amber-100 text-amber-800",
                        c.membership === "SILVER" && "bg-slate-100 text-slate-800",
                        c.membership === "NONE" && "bg-neutral-100 text-neutral-600"
                      )}>
                        {c.membership}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="outline" className={c.status === "ACTIVE" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"} onClick={() => toggleCustomerStatus(c.id)}>
                        {c.status === "ACTIVE" ? "Block User" : "Activate User"}
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
