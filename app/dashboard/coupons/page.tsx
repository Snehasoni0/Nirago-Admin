"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Store, Globe, Pencil, Trash2, Percent, IndianRupee } from "lucide-react"
import { useDashboard, Coupon } from "../DashboardContext"
import { TablePagination } from "@/components/ui/pagination"

/* ─────────────────────────────────────────────
   Discount type picker + value input sub-form
───────────────────────────────────────────── */
function DiscountField({
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
}: {
  discountType: "PERCENT" | "FLAT"
  setDiscountType: (v: "PERCENT" | "FLAT") => void
  discountValue: string
  setDiscountValue: (v: string) => void
}) {
  return (
      <div className="space-y-2">
      <label className="text-sm font-medium">Discount Type & Value</label>
      <div className="flex items-stretch gap-2">
        {/* type toggle */}
        <div className="flex rounded-lg border border-[#d2d2c4] overflow-hidden shrink-0 h-9">
          <button
            type="button"
            onClick={() => setDiscountType("PERCENT")}
            className={`flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-all ${
              discountType === "PERCENT"
                ? "bg-[#556B2F] text-white"
                : "bg-white text-neutral-500 hover:bg-[#f5f5e6]"
            }`}
          >
            <Percent className="h-3.5 w-3.5" /> Percent
          </button>
          <button
            type="button"
            onClick={() => setDiscountType("FLAT")}
            className={`flex items-center gap-1.5 px-3 h-full text-sm font-medium border-l border-[#d2d2c4] transition-all ${
              discountType === "FLAT"
                ? "bg-[#556B2F] text-white"
                : "bg-white text-neutral-500 hover:bg-[#f5f5e6]"
            }`}
          >
            <IndianRupee className="h-3.5 w-3.5" /> Flat
          </button>
        </div>
        {/* value input with inline suffix/prefix hint */}
        <div className="relative flex-1">
          <Input
            type="number"
            min={0}
            max={discountType === "PERCENT" ? 100 : undefined}
            placeholder={discountType === "PERCENT" ? "e.g. 20" : "e.g. 100"}
            value={discountValue}
            onChange={e => setDiscountValue(e.target.value)}
            className="pr-12 h-9"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium pointer-events-none select-none">
            {discountType === "PERCENT" ? "%" : "₹"}
          </span>
        </div>
      </div>
      {discountType === "PERCENT" && parseFloat(discountValue) > 100 && (
        <p className="text-xs text-red-500">Percentage cannot exceed 100%</p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Shared outlet-picker sub-form
───────────────────────────────────────────── */
function OutletPicker({
  outlets,
  outletScope,
  setOutletScope,
  selectedOutlets,
  toggleOutletSelection,
}: {
  outlets: ReturnType<typeof useDashboard>["outlets"]
  outletScope: "ALL" | "SELECTED"
  setOutletScope: (v: "ALL" | "SELECTED") => void
  selectedOutlets: string[]
  toggleOutletSelection: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Applicable Outlets</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOutletScope("ALL")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
            outletScope === "ALL"
              ? "bg-[#556B2F] text-white border-[#556B2F] shadow-sm"
              : "bg-white text-neutral-600 border-[#d2d2c4] hover:border-[#556B2F] hover:text-[#556B2F]"
          }`}
        >
          <Globe className="h-4 w-4" /> All Outlets
        </button>
        <button
          type="button"
          onClick={() => setOutletScope("SELECTED")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
            outletScope === "SELECTED"
              ? "bg-[#556B2F] text-white border-[#556B2F] shadow-sm"
              : "bg-white text-neutral-600 border-[#d2d2c4] hover:border-[#556B2F] hover:text-[#556B2F]"
          }`}
        >
          <Store className="h-4 w-4" /> Select Outlets
        </button>
      </div>

      {outletScope === "SELECTED" && (
        <div className="border border-[#d2d2c4] rounded-lg overflow-hidden">
          {outlets.length === 0 && (
            <p className="text-xs text-neutral-500 p-3">No outlets found.</p>
          )}
          {outlets.map((outlet, idx) => (
            <label
              key={outlet.id}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#f5f5e6]/60 transition-colors ${
                idx < outlets.length - 1 ? "border-b border-[#d2d2c4]" : ""
              }`}
            >
              <input
                type="checkbox"
                className="accent-[#556B2F] h-4 w-4 rounded"
                checked={selectedOutlets.includes(outlet.id)}
                onChange={() => toggleOutletSelection(outlet.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{outlet.name}</p>
                <p className="text-xs text-neutral-500 truncate">{outlet.address}</p>
              </div>
              <Badge className={outlet.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 text-[10px] px-1.5" : "bg-neutral-100 text-neutral-500 text-[10px] px-1.5"}>
                {outlet.status}
              </Badge>
            </label>
          ))}
        </div>
      )}
      {outletScope === "SELECTED" && selectedOutlets.length === 0 && (
        <p className="text-xs text-amber-600">⚠ Select at least one outlet for this coupon to apply.</p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Helper: build human-readable discount string
───────────────────────────────────────────── */
function buildDiscountLabel(type: "PERCENT" | "FLAT", value: number): string {
  if (type === "PERCENT") return `${value}% OFF`
  return `Flat ₹${value} OFF`
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function CouponsPage() {
  const { coupons, outlets, toggleCouponStatus, handleAddCoupon, handleDeleteCoupon, handleUpdateCoupon } = useDashboard()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const couponsPerPage = 10
  const totalCouponsPages = Math.ceil(coupons.length / couponsPerPage)
  const paginatedCoupons = coupons.slice(
    (currentPage - 1) * couponsPerPage,
    currentPage * couponsPerPage
  )

  /* ── Add dialog state ── */
  const [addOpen, setAddOpen] = useState(false)
  const [newCoupon, setNewCoupon] = useState({ code: "", minOrder: "" })
  const [addDiscountType, setAddDiscountType] = useState<"PERCENT" | "FLAT">("PERCENT")
  const [addDiscountValue, setAddDiscountValue] = useState("")
  const [addScope, setAddScope] = useState<"ALL" | "SELECTED">("ALL")
  const [addSelectedOutlets, setAddSelectedOutlets] = useState<string[]>([])

  const toggleAddOutlet = (id: string) =>
    setAddSelectedOutlets(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id])

  const isAddInvalid =
    !newCoupon.code ||
    !addDiscountValue ||
    parseFloat(addDiscountValue) <= 0 ||
    (addDiscountType === "PERCENT" && parseFloat(addDiscountValue) > 100) ||
    (addScope === "SELECTED" && addSelectedOutlets.length === 0)

  const handleSaveNew = () => {
    if (isAddInvalid) return
    const dv = parseFloat(addDiscountValue)
    const discountStr = buildDiscountLabel(addDiscountType, dv)
    const applicableOutlets: "ALL" | string[] = addScope === "ALL" ? "ALL" : addSelectedOutlets
    handleAddCoupon(newCoupon.code, discountStr, addDiscountType, dv, parseFloat(newCoupon.minOrder) || 0, applicableOutlets)
    setNewCoupon({ code: "", minOrder: "" })
    setAddDiscountType("PERCENT")
    setAddDiscountValue("")
    setAddScope("ALL")
    setAddSelectedOutlets([])
    setAddOpen(false)
  }

  /* ── Edit dialog state ── */
  const [editTarget, setEditTarget] = useState<Coupon | null>(null)
  const [editForm, setEditForm] = useState({ code: "", minOrder: "" })
  const [editDiscountType, setEditDiscountType] = useState<"PERCENT" | "FLAT">("PERCENT")
  const [editDiscountValue, setEditDiscountValue] = useState("")
  const [editScope, setEditScope] = useState<"ALL" | "SELECTED">("ALL")
  const [editSelectedOutlets, setEditSelectedOutlets] = useState<string[]>([])

  const openEdit = (coupon: Coupon) => {
    setEditTarget(coupon)
    setEditForm({ code: coupon.code, minOrder: String(coupon.minOrder) })
    setEditDiscountType(coupon.discountType ?? "PERCENT")
    setEditDiscountValue(String(coupon.discountValue ?? ""))
    if (coupon.applicableOutlets === "ALL") {
      setEditScope("ALL")
      setEditSelectedOutlets([])
    } else {
      setEditScope("SELECTED")
      setEditSelectedOutlets(coupon.applicableOutlets as string[])
    }
  }

  const toggleEditOutlet = (id: string) =>
    setEditSelectedOutlets(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id])

  const isEditInvalid =
    !editForm.code ||
    !editDiscountValue ||
    parseFloat(editDiscountValue) <= 0 ||
    (editDiscountType === "PERCENT" && parseFloat(editDiscountValue) > 100) ||
    (editScope === "SELECTED" && editSelectedOutlets.length === 0)

  const handleSaveEdit = () => {
    if (!editTarget || isEditInvalid) return
    const dv = parseFloat(editDiscountValue)
    const discountStr = buildDiscountLabel(editDiscountType, dv)
    const applicableOutlets: "ALL" | string[] = editScope === "ALL" ? "ALL" : editSelectedOutlets
    handleUpdateCoupon(editTarget.id, {
      code: editForm.code.toUpperCase(),
      discount: discountStr,
      discountType: editDiscountType,
      discountValue: dv,
      minOrder: parseFloat(editForm.minOrder) || 0,
      applicableOutlets,
    })
    setEditTarget(null)
  }

  /* ── Delete dialog state ── */
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  /* ── Helper ── */
  const getOutletLabel = (applicableOutlets: "ALL" | string[]) => {
    if (applicableOutlets === "ALL") return null
    return (applicableOutlets as string[])
      .map(id => outlets.find(o => o.id === id)?.name ?? `Outlet #${id}`)
      .filter(Boolean) as string[]
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Discount Promotional Coupons</h2>
          <p className="text-sm text-neutral-600">Configure promotional discount codes to incentivize basket size.</p>
        </div>

        {/* ── ADD DIALOG ── */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#556B2F] hover:bg-[#405223] text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Coupon Code
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
              <DialogDescription>Code details immediately reflect at checkout validation endpoints.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Left column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coupon Code (Uppercase)</label>
                  <Input
                    placeholder="e.g. FESTIVE20"
                    value={newCoupon.code}
                    onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>

                <DiscountField
                  discountType={addDiscountType}
                  setDiscountType={setAddDiscountType}
                  discountValue={addDiscountValue}
                  setDiscountValue={setAddDiscountValue}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Order Basket Value (₹)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 299"
                    value={newCoupon.minOrder}
                    onChange={e => setNewCoupon(prev => ({ ...prev, minOrder: e.target.value }))}
                  />
                </div>

                {/* Live preview */}
                {newCoupon.code && addDiscountValue && parseFloat(addDiscountValue) > 0 && (
                  <div className="rounded-lg border border-[#d2d2c4] bg-[#f5f5e6]/50 p-3 text-xs text-neutral-600 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Preview</p>
                    <p className="font-bold text-[#556B2F] text-sm">{newCoupon.code.toUpperCase()}</p>
                    <p className="font-medium">{buildDiscountLabel(addDiscountType, parseFloat(addDiscountValue) || 0)}</p>
                    {newCoupon.minOrder && <p>on orders above ₹{newCoupon.minOrder}</p>}
                  </div>
                )}
              </div>

              {/* Right column — outlet picker */}
              <OutletPicker
                outlets={outlets}
                outletScope={addScope}
                setOutletScope={setAddScope}
                selectedOutlets={addSelectedOutlets}
                toggleOutletSelection={toggleAddOutlet}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button
                className="bg-[#556B2F] hover:bg-[#405223] text-white"
                onClick={handleSaveNew}
                disabled={isAddInvalid}
              >
                Save Promo Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── TABLE ── */}
      <Card className="border border-[#d2d2c4] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Basket</TableHead>
                  <TableHead>Applicable Outlets</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCoupons.map((c) => {
                  const outletNames = getOutletLabel(c.applicableOutlets)
                  return (
                    <TableRow key={`coupon-row-${c.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                      <TableCell className="font-bold text-[#556B2F]">{c.code}</TableCell>
                      <TableCell className="font-semibold text-sm text-neutral-800">
                        {c.discountType === "PERCENT" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </TableCell>
                      <TableCell className="font-medium">₹{c.minOrder}</TableCell>
                      <TableCell>
                        {outletNames === null ? (
                          <Badge className="bg-blue-100 text-blue-800 gap-1 text-xs">
                            <Globe className="h-3 w-3" /> All Outlets
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {outletNames.map((name, i) => (
                              <Badge key={i} className="bg-amber-50 text-amber-800 border border-amber-200 gap-1 text-xs font-normal">
                                <Store className="h-3 w-3" />
                                {name.length > 22 ? name.substring(0, 20) + "…" : name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="xs" variant="outline" className="border-neutral-300 text-neutral-600" onClick={() => toggleCouponStatus(c.id)}>
                            {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </Button>
                          <Button size="xs" variant="outline" className="border-[#556B2F]/40 text-[#556B2F] hover:bg-[#f5f5e6]" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="xs" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(c)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalCouponsPages || 1}
            onPageChange={setCurrentPage}
            totalEntries={coupons.length}
            startEntry={(currentPage - 1) * couponsPerPage + 1}
            endEntry={Math.min(currentPage * couponsPerPage, coupons.length)}
          />
        </CardContent>
      </Card>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null) }}>
        <DialogContent className="bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Coupon — <span className="text-[#556B2F]">{editTarget?.code}</span></DialogTitle>
            <DialogDescription>Changes take effect immediately across all checkout endpoints.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code</label>
                <Input
                  value={editForm.code}
                  onChange={e => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <DiscountField
                discountType={editDiscountType}
                setDiscountType={setEditDiscountType}
                discountValue={editDiscountValue}
                setDiscountValue={setEditDiscountValue}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Min Order Basket Value (₹)</label>
                <Input
                  type="number"
                  value={editForm.minOrder}
                  onChange={e => setEditForm(prev => ({ ...prev, minOrder: e.target.value }))}
                />
              </div>

              {/* Live preview */}
              {editForm.code && editDiscountValue && parseFloat(editDiscountValue) > 0 && (
                <div className="rounded-lg border border-[#d2d2c4] bg-[#f5f5e6]/50 p-3 text-xs text-neutral-600 space-y-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Preview</p>
                  <p className="font-bold text-[#556B2F] text-sm">{editForm.code.toUpperCase()}</p>
                  <p className="font-medium">{buildDiscountLabel(editDiscountType, parseFloat(editDiscountValue) || 0)}</p>
                  {editForm.minOrder && <p>on orders above ₹{editForm.minOrder}</p>}
                </div>
              )}
            </div>

            {/* Right */}
            <OutletPicker
              outlets={outlets}
              outletScope={editScope}
              setOutletScope={setEditScope}
              selectedOutlets={editSelectedOutlets}
              toggleOutletSelection={toggleEditOutlet}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button
              className="bg-[#556B2F] hover:bg-[#405223] text-white"
              onClick={handleSaveEdit}
              disabled={isEditInvalid}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete Coupon?</DialogTitle>
            <DialogDescription>
              You are about to permanently remove the coupon code{" "}
              <span className="font-bold text-neutral-800">{deleteTarget?.code}</span>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700 space-y-1">
            <p><span className="font-semibold">Discount:</span> {deleteTarget?.discount}</p>
            <p><span className="font-semibold">Min Order:</span> ₹{deleteTarget?.minOrder}</p>
            <p><span className="font-semibold">Status:</span> {deleteTarget?.status}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deleteTarget) {
                  handleDeleteCoupon(deleteTarget.id)
                  setDeleteTarget(null)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
