"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDashboard } from "../DashboardContext"

export default function LogsPage() {
  const { auditLogs } = useDashboard()

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">System Audit Logs</h2>
          <p className="text-sm text-neutral-600">Chronological trail of administrative actions performed on this dashboard.</p>
        </div>
      </div>

      <Card className="border border-[#d2d2c4] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User Account</TableHead>
                  <TableHead>Action Layer</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={`log-row-${log.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20 font-mono text-xs">
                    <TableCell className="text-neutral-500 font-semibold">{log.timestamp}</TableCell>
                    <TableCell className="font-bold text-[#556B2F]">{log.user}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#f5f5e6] text-[#2d3822] border-[#d2d2c4]">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-[#2d3822]">{log.details}</TableCell>
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
