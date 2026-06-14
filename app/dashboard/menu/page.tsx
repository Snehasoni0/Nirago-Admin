"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Salad, Utensils, Coffee, Cake, ChefHat } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard } from "../DashboardContext"

export default function MenuPage() {
  const { menuItems, categories, toggleMenuItemStatus, handleAddMenuItem, addLog } = useDashboard()
  const [newMenu, setNewMenu] = useState({ name: "", category: "Main Course", price: "", description: "" })

  const handleSave = () => {
    if (newMenu.name && newMenu.price) {
      handleAddMenuItem(newMenu.name, newMenu.category, parseFloat(newMenu.price), newMenu.description)
      setNewMenu({ name: "", category: "Main Course", price: "", description: "" })
    }
  }

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "Appetizers": return <Salad className="h-5 w-5 text-[#556B2F]" />
      case "Main Course": return <Utensils className="h-5 w-5 text-[#556B2F]" />
      case "Drinks": return <Coffee className="h-5 w-5 text-[#556B2F]" />
      case "Desserts": return <Cake className="h-5 w-5 text-[#556B2F]" />
      default: return <ChefHat className="h-5 w-5 text-[#556B2F]" />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3822]">Dynamic Menu & Categories</h2>
          <p className="text-sm text-neutral-600">Manage food categories, items and availability. Same menu applies to all outlets.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Bulk upload simulated form */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#556B2F] text-[#556B2F] hover:bg-[#f5f5e6]">
                <Upload className="h-4 w-4 mr-2" /> Bulk Menu Import
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Bulk Menu Import (.csv / .xlsx)</DialogTitle>
                <DialogDescription>Upload a spreadsheet to import categories and items automatically.</DialogDescription>
              </DialogHeader>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <Upload className="h-10 w-10 mx-auto text-neutral-400 mb-3" />
                <p className="text-sm font-semibold">Drag & drop CSV template file or click to browse</p>
                <span className="text-xs text-neutral-400">Template must contain columns: Name, Price, Category, Description</span>
              </div>
              <DialogFooter>
                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => {
                  Swal.fire({
                    title: "Import Successful",
                    text: "CSV Import simulated successfully! Loaded 14 items.",
                    icon: "success",
                    confirmButtonColor: "#556B2F"
                  })
                  addLog("Bulk Menu Upload", "Successfully imported 14 menu listings from menu_dump.csv")
                }}>
                  Process Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add menu item */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Create New Menu Item</DialogTitle>
                <DialogDescription>Populate the required details below. The item immediately reflects on all client apps.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Item Name</label>
                    <Input placeholder="e.g. Garlic Sautéed Prawns" value={newMenu.name} onChange={(e) => setNewMenu(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (₹)</label>
                    <Input type="number" placeholder="e.g. 499" value={newMenu.price} onChange={(e) => setNewMenu(prev => ({ ...prev, price: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select defaultValue="Main Course" onValueChange={(val) => setNewMenu(prev => ({ ...prev, category: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map(c => (
                        <SelectItem key={`cat-opt-${c.id}`} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Describe ingredients, allergens, etc." value={newMenu.description} onChange={(e) => setNewMenu(prev => ({ ...prev, description: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={handleSave}>
                  Save Menu Listing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Menu Categories List */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {categories.map(c => (
          <Card key={`cat-card-${c.id}`} className="border border-[#d2d2c4] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              {getCategoryIcon(c.name)}
              <Badge className="bg-[#f5f5e6] text-[#556B2F] border-[#d2d2c4]">{c.status}</Badge>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base font-bold">{c.name}</CardTitle>
              <span className="text-xs text-neutral-400 mt-1 block">
                {menuItems.filter(m => m.category === c.name).length} Dishes listed
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Menu Items Table */}
      <Card className="border border-[#d2d2c4] bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#556B2F]">Gourmet Food Offerings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead>Dish Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Client Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((m) => (
                  <TableRow key={`menu-row-${m.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="font-bold text-[#2d3822]">{m.name}</TableCell>
                    <TableCell>{m.category}</TableCell>
                    <TableCell className="font-semibold">₹{m.price}</TableCell>
                    <TableCell className="max-w-xs truncate text-neutral-500 text-xs">{m.description}</TableCell>
                    <TableCell>
                      <Badge className={m.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-800"}>
                        {m.status === "ACTIVE" ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="xs" variant="outline" className="border-neutral-300 text-neutral-600" onClick={() => toggleMenuItemStatus(m.id)}>
                        Toggle Stock
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
