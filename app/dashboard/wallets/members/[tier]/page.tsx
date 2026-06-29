"use client"

import * as React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/pagination"
import { Award, Crown, Medal, ArrowLeft, Search, Users } from "lucide-react"
import { useDashboard } from "../../../DashboardContext"

const TIER_META: Record<string, { label: string; color: string; icon: React.ReactNode; spend: string; benefits: string }> = {
  SILVER: {
    label: "Silver Member",
    color: "text-slate-600",
    icon: <Award className="h-5 w-5 text-slate-400" />,
    spend: "₹10,000+ Lifetime",
    benefits: "Free packaging fees on all orders",
  },
  GOLD: {
    label: "Gold Member",
    color: "text-amber-600",
    icon: <Medal className="h-5 w-5 text-amber-500" />,
    spend: "₹25,000+ Lifetime",
    benefits: "5% wallet cashback + Free delivery",
  },
  PREMIUM: {
    label: "Premium Member",
    color: "text-purple-600",
    icon: <Crown className="h-5 w-5 text-purple-500" />,
    spend: "₹50,000+ Lifetime",
    benefits: "10% cashback + Express dispatch + Free KOT edits",
  },
}

const PER_PAGE = 15

export default function TierMembersPage({ params }: { params: Promise<{ tier: string }> }) {
  const { tier } = use(params)
  const router = useRouter()
  const { customers } = useDashboard()

  const tierKey = tier.toUpperCase()
  const meta = TIER_META[tierKey]

  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const tierCustomers = customers.filter(c => c.membership === tierKey)

  const filtered = tierCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-neutral-500 text-lg">Unknown membership tier.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6]"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${meta.color}`}>
            {meta.icon} {meta.label}
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">{meta.spend} · {meta.benefits}</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-[#d2d2c4] rounded-lg px-4 py-2.5 text-sm">
          <Users className="h-4 w-4 text-[#556B2F]" />
          <span className="font-semibold text-[#2d3822]">{tierCustomers.length}</span>
          <span className="text-neutral-500">Total Members</span>
        </div>
        {search && (
          <div className="text-sm text-neutral-500">
            Showing <span className="font-semibold text-neutral-800">{filtered.length}</span> results for "<span className="italic">{search}</span>"
          </div>
        )}
      </div>

      {/* Main table card */}
      <Card className="border border-[#d2d2c4] bg-white">
        <CardHeader className="pb-3 border-b border-[#d2d2c4]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-[#2d3822]">Members Directory</CardTitle>
              <CardDescription>All customers enrolled in {meta.label}</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search by name, email, phone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 border-[#d2d2c4] bg-white text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-10 w-10 text-neutral-300 mb-3" />
              <p className="text-neutral-500 font-medium">
                {search ? "No members match your search." : "No customers in this tier yet."}
              </p>
              {search && (
                <Button variant="ghost" size="sm" className="mt-2 text-[#556B2F]" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-[#f5f5e6]/40">
                  <TableRow className="border-b border-[#d2d2c4]">
                    <TableHead className="w-8 text-center">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Wallet Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((c, idx) => (
                    <TableRow key={c.id} className="border-b border-neutral-100 hover:bg-[#f5f5e6]/20">
                      <TableCell className="text-center text-neutral-400 text-sm">
                        {(currentPage - 1) * PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">{c.name}</TableCell>
                      <TableCell className="text-neutral-500 text-sm">{c.email}</TableCell>
                      <TableCell className="text-neutral-500 text-sm">{c.phone}</TableCell>
                      <TableCell>
                        <Badge className={c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-500"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#556B2F]">
                        ₹{(c.walletBalance ?? 0).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalEntries={filtered.length}
                  startEntry={(currentPage - 1) * PER_PAGE + 1}
                  endEntry={Math.min(currentPage * PER_PAGE, filtered.length)}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
