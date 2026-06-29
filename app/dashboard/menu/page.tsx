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
import { Plus, Upload, Salad, Utensils, Coffee, Cake, ChefHat, Layers, Trash2, Settings, Sparkles } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, MenuItem, ModifierGroup } from "../DashboardContext"
import { cn } from "@/lib/utils"
import { TablePagination } from "@/components/ui/pagination"

export default function MenuPage() {
  const { 
    menuItems, 
    categories, 
    toggleMenuItemStatus, 
    handleAddMenuItem, 
    handleDeleteMenuItem,
    addLog,
    handleAddCategory,
    handleDeleteCategory,
    handleToggleCategoryStatus,
    handleUpdateItemModifiers 
  } = useDashboard()

  const [currentPage, setCurrentPage] = useState(1)
  const menuItemsPerPage = 10
  const totalMenuItemsPages = Math.ceil(menuItems.length / menuItemsPerPage)
  const paginatedMenuItems = menuItems.slice(
    (currentPage - 1) * menuItemsPerPage,
    currentPage * menuItemsPerPage
  )

  React.useEffect(() => {
    if (currentPage > 1 && paginatedMenuItems.length === 0) {
      setCurrentPage(prev => Math.max(1, prev - 1))
    }
  }, [paginatedMenuItems.length, currentPage])

  const [newMenu, setNewMenu] = useState({ name: "", category: "Main Course", price: "", description: "", image: "", images: [] as string[] })
  const [showAddMenuDialog, setShowAddMenuDialog] = useState(false)

  // Modifiers state for the NEW menu item being created
  const [newMenuModifiers, setNewMenuModifiers] = useState<ModifierGroup[]>([])
  const [newMenuGroupName, setNewMenuGroupName] = useState("")
  const [newMenuSelectionType, setNewMenuSelectionType] = useState<"SINGLE" | "MULTIPLE">("SINGLE")
  const [newMenuModifierOptions, setNewMenuModifierOptions] = useState<{ name: string; price: number }[]>([])
  const [newMenuOptionName, setNewMenuOptionName] = useState("")
  const [newMenuOptionPrice, setNewMenuOptionPrice] = useState("")

  // Categories Dialog State
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("")

  // Modifiers Dialog State
  const [showModifierDialog, setShowModifierDialog] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const currentItem = selectedMenuItem ? (menuItems.find(item => item.id === selectedMenuItem.id) || selectedMenuItem) : null
  
  const [groupName, setGroupName] = useState("")
  const [selectionType, setSelectionType] = useState<"SINGLE" | "MULTIPLE">("SINGLE")
  const [modifierOptions, setModifierOptions] = useState<{ name: string; price: number }[]>([])
  
  const [newOptionName, setNewOptionName] = useState("")
  const [newOptionPrice, setNewOptionPrice] = useState("")

  const handleSave = () => {
    if (newMenu.name && newMenu.price) {
      handleAddMenuItem(
        newMenu.name, 
        newMenu.category, 
        parseFloat(newMenu.price), 
        newMenu.description, 
        newMenu.image,
        newMenuModifiers,
        newMenu.images
      )
      setNewMenu({ name: "", category: "Main Course", price: "", description: "", image: "", images: [] })
      setNewMenuModifiers([])
      setNewMenuGroupName("")
      setNewMenuModifierOptions([])
      setShowAddMenuDialog(false)
      Swal.fire({
        title: "Success",
        text: "Menu item added successfully!",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  const preventNonNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault()
    }
  }

  const getCategoryIcon = (name: string) => {
    const matched = categories.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (matched && matched.icon) {
      return <span className="text-lg mr-1">{matched.icon}</span>
    }
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
          <h2 className="text-2xl font-bold text-[#2d3822]">Food Menu & Categories</h2>
          <p className="text-sm text-neutral-600">Manage food categories, items and availability. Same menu applies to all outlets.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Category engine drawer */}
          <Button variant="outline" className="border-[#556B2F] text-[#556B2F] hover:bg-[#f5f5e6]" onClick={() => setShowCategoryDialog(true)}>
            <Layers className="h-4 w-4 mr-2" /> Categories
          </Button>

          {/* Bulk upload simulated form */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#556B2F] text-[#556B2F] hover:bg-[#f5f5e6]">
                <Upload className="h-4 w-4 mr-2" /> Bulk Menu Import
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Menu Import (.csv format)</DialogTitle>
                <DialogDescription>Paste CSV data below or load a demo template to import categories and items automatically.</DialogDescription>
              </DialogHeader>
              
               <div className="space-y-4 my-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 block">Select CSV File</label>
                  <Input 
                    type="file" 
                    accept=".csv"
                    className="text-xs border-[#d2d2c4] bg-white cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const csvText = event.target?.result as string
                          const textarea = document.getElementById("csv-input-field") as HTMLTextAreaElement
                          if (textarea) {
                            textarea.value = csvText
                            textarea.dispatchEvent(new Event('change', { bubbles: true }))
                          }
                        }
                        reader.readAsText(file)
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-neutral-600">or Paste CSV Data (Name, Price, Category, Description)</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const demoCSV = `Name,Price,Category,Description\nWild Berry Soufflé,389,Desserts,Warm oven-baked soufflé with wild berry coulis.\nHibiscus Iced Brew,189,Drinks,Cold brewed organic hibiscus tea with lime and mint.\nCrispy Calamari Rings,429,Appetizers,Golden-fried baby squid served with spicy citrus aioli.`
                      const textarea = document.getElementById("csv-input-field") as HTMLTextAreaElement
                      if (textarea) {
                        textarea.value = demoCSV
                        textarea.dispatchEvent(new Event('change', { bubbles: true }))
                      }
                    }} 
                    className="text-xs font-bold text-[#556B2F] hover:underline"
                  >
                    Load Demo Template
                  </button>
                </div>
                
                <textarea 
                  id="csv-input-field"
                  placeholder="Paste your CSV rows here..." 
                  className="w-full h-40 p-3 text-xs border border-[#d2d2c4] rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-neutral-50/50"
                />
                
                <p className="text-[10px] text-neutral-400">
                  Note: The first row is treated as the header row. Values must be comma-separated. Leave field empty to load standard demo items.
                </p>
              </div>

              <DialogFooter>
                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={() => {
                  const textarea = document.getElementById("csv-input-field") as HTMLTextAreaElement
                  const csvText = textarea ? textarea.value : ""
                  
                  if (!csvText.trim()) {
                    // Fallback to demo items
                    const demoItems = [
                      { name: "Smoked Salmon Benedict", category: "Appetizers", price: 429, description: "Poached eggs on toasted muffins with rich hollandaise and cold-smoked salmon." },
                      { name: "Blueberry Ricotta Hotcakes", category: "Desserts", price: 349, description: "Fluffy soufflé hotcakes topped with fresh blueberries and whipped ricotta." },
                      { name: "Matcha Oat Latte", category: "Drinks", price: 229, description: "Ceremonial grade Japanese matcha stone-ground with oat milk." },
                      { name: "Wagyu Truffle Burger", category: "Main Course", price: 899, description: "Aged Wagyu beef patty, black truffle aioli, and brioche bun." }
                    ]
                    demoItems.forEach(item => {
                      handleAddMenuItem(item.name, item.category, item.price, item.description)
                    })
                    Swal.fire({
                      title: "Import Successful",
                      text: "Loaded 4 gourmet items successfully!",
                      icon: "success",
                      confirmButtonColor: "#556B2F"
                    })
                    addLog("Bulk Menu Upload", "Successfully imported 4 default menu listings.")
                    return
                  }

                  try {
                    const lines = csvText.split("\n")
                    let count = 0
                    lines.forEach((line, idx) => {
                      if (idx === 0) return // Skip header
                      if (!line.trim()) return
                      
                      const parts = line.split(",")
                      if (parts.length >= 3) {
                        const name = parts[0].replace(/"/g, "").trim()
                        const price = parseFloat(parts[1])
                        const category = parts[2].replace(/"/g, "").trim()
                        const description = parts[3] ? parts[3].replace(/"/g, "").trim() : "Fresh gourmet specialty."
                        
                        if (name && !isNaN(price) && category) {
                          handleAddMenuItem(name, category, price, description)
                          count++
                        }
                      }
                    })

                    Swal.fire({
                      title: "Import Successful",
                      text: `Successfully parsed and loaded ${count} items into the menu list!`,
                      icon: "success",
                      confirmButtonColor: "#556B2F"
                    })
                    addLog("Bulk Menu Upload", `Successfully imported ${count} menu listings from custom CSV.`)
                  } catch (e) {
                    Swal.fire("Error Parsing CSV", "Please ensure your CSV formatting matches the expected header.", "error")
                  }
                }}>
                  Process Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add menu item */}
          <Dialog open={showAddMenuDialog} onOpenChange={setShowAddMenuDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#556B2F] hover:bg-[#405223] text-white"
                onClick={() => {
                  setNewMenu({ name: "", category: "Main Course", price: "", description: "", image: "", images: [] })
                  setNewMenuModifiers([])
                  setNewMenuGroupName("")
                  setNewMenuModifierOptions([])
                  setShowAddMenuDialog(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-3xl sm:max-w-4xl overflow-y-auto max-h-[90vh]">
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
                    <Input 
                      type="number" 
                      placeholder="e.g. 499" 
                      value={newMenu.price} 
                      onChange={(e) => setNewMenu(prev => ({ ...prev, price: e.target.value }))} 
                      onKeyDown={preventNonNumeric}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select defaultValue="Main Course" onValueChange={(val) => setNewMenu(prev => ({ ...prev, category: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.filter(c => c.status === "ACTIVE").map(c => (
                        <SelectItem key={`cat-opt-${c.id}`} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Describe ingredients, allergens, etc." value={newMenu.description} onChange={(e) => setNewMenu(prev => ({ ...prev, description: e.target.value }))} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Image(s)</label>
                  <Input 
                    key={newMenu.images.length}
                    type="file" 
                    accept="image/*"
                    multiple
                    className="text-xs border-[#d2d2c4] bg-white cursor-pointer"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        const newImages: string[] = []
                        let loadedCount = 0
                        
                        Array.from(files).forEach((file) => {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            newImages.push(reader.result as string)
                            loadedCount++
                            if (loadedCount === files.length) {
                              setNewMenu(prev => ({ 
                                ...prev, 
                                image: newImages[0], 
                                images: newImages 
                              }))
                            }
                          }
                          reader.readAsDataURL(file)
                        })
                      }
                    }}
                  />
                  {newMenu.images && newMenu.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-2">
                      {newMenu.images.map((img, idx) => (
                        <div key={idx} className="relative h-14 w-14 border rounded-md overflow-hidden bg-neutral-50 shrink-0">
                          <img src={img} alt="preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newMenu.images.filter((_, i) => i !== idx)
                              setNewMenu(prev => ({
                                ...prev,
                                image: updated[0] || "",
                                images: updated
                              }))
                            }}
                            className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full h-3.5 w-3.5 flex items-center justify-center text-[10px] hover:bg-red-700 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add-ons section */}
                <div className="border-t border-[#d2d2c4] pt-4 space-y-4">
                  <h4 className="font-bold text-sm text-[#2d3822]">Add-ons & Customizer Groups (Optional)</h4>
                  
                  {/* List of currently added groups for this new item */}
                  {newMenuModifiers.length > 0 && (
                    <div className="space-y-2.5">
                      {newMenuModifiers.map((group, idx) => (
                        <div key={group.id} className="p-3 bg-[#f5f5e6]/20 border border-[#d2d2c4] rounded-xl space-y-1 relative">
                          <div className="flex items-center justify-between border-b border-[#d2d2c4]/40 pb-1">
                            <div>
                              <span className="font-bold text-[#2d3822] text-xs">{group.name}</span>
                              <span className="text-[9px] text-neutral-400 block font-semibold uppercase">{group.selectionType} Choice</span>
                            </div>
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700 h-6 px-2"
                              onClick={() => {
                                setNewMenuModifiers(prev => prev.filter((_, i) => i !== idx))
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {group.options.map((opt, oIdx) => (
                              <Badge key={oIdx} className="bg-white border border-[#d2d2c4] text-neutral-700 font-medium text-[10px] py-0">
                                {opt.name} {opt.price > 0 && `(+₹${opt.price})`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline group creator */}
                  <div className="bg-[#f5f5e6]/45 p-3 border border-[#d2d2c4] rounded-xl space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block border-b border-[#d2d2c4]/45 pb-0.5">
                      Add a New Add-on Group
                    </span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-600 block">Group Title</label>
                        <Input 
                          placeholder="e.g. Choose Crust" 
                          value={newMenuGroupName}
                          onChange={(e) => setNewMenuGroupName(e.target.value)}
                          className="border-[#d2d2c4] bg-white text-xs h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-600 block">Selection Constraint</label>
                        <Select value={newMenuSelectionType} onValueChange={(val: any) => setNewMenuSelectionType(val)}>
                          <SelectTrigger className="border-[#d2d2c4] bg-white text-xs h-8">
                            <SelectValue placeholder="Selection Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="SINGLE">Single Choice (Radio)</SelectItem>
                            <SelectItem value="MULTIPLE">Multiple Choice (Checkbox)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Option Builder */}
                    <div className="space-y-2 border-t border-dashed border-[#d2d2c4] pt-2">
                      <span className="text-[10px] font-bold text-neutral-600 block">Add-on Options</span>
                      
                      {/* Options List */}
                      {newMenuModifierOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 p-1.5 bg-white border border-[#d2d2c4]/30 rounded-lg">
                          {newMenuModifierOptions.map((opt, idx) => (
                            <Badge key={idx} className="bg-[#556B2F]/10 text-[#556B2F] hover:bg-[#556B2F]/15 flex items-center gap-1 border-[#556B2F]/20 font-bold uppercase text-[9px] py-0">
                              {opt.name} (+₹{opt.price})
                              <button 
                                type="button" 
                                onClick={() => setNewMenuModifierOptions(prev => prev.filter((_, i) => i !== idx))}
                                className="hover:text-red-700 ml-0.5"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Add Option Inputs */}
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Option Name (e.g. Extra Cheese)" 
                          value={newMenuOptionName}
                          onChange={(e) => setNewMenuOptionName(e.target.value)}
                          className="border-[#d2d2c4] bg-white text-xs h-8 flex-1"
                        />
                        <Input 
                          type="number"
                          placeholder="Price (e.g. 50)" 
                          value={newMenuOptionPrice}
                          onChange={(e) => setNewMenuOptionPrice(e.target.value)}
                          onKeyDown={preventNonNumeric}
                          className="border-[#d2d2c4] bg-white text-xs h-8 w-32"
                        />
                        <Button 
                          size="xs"
                          variant="outline"
                          className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 h-8 font-bold"
                          onClick={() => {
                            if (!newMenuOptionName.trim()) {
                              Swal.fire("Error", "Option name is required.", "error")
                              return
                            }
                            const price = parseFloat(newMenuOptionPrice) || 0
                            setNewMenuModifierOptions(prev => [...prev, { name: newMenuOptionName.trim(), price }])
                            setNewMenuOptionName("")
                            setNewMenuOptionPrice("")
                          }}
                        >
                          + Option
                        </Button>
                      </div>
                    </div>

                    <Button 
                      size="sm"
                      className="w-full bg-[#556B2F] hover:bg-[#405223] text-white text-xs"
                      onClick={() => {
                        if (!newMenuGroupName.trim()) {
                          Swal.fire("Error", "Modifier group name is required.", "error")
                          return
                        }
                        if (newMenuModifierOptions.length === 0) {
                          Swal.fire("Error", "Please add at least one option to the group.", "error")
                          return
                        }
                        const newGroup = {
                          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                          name: newMenuGroupName.trim(),
                          selectionType: newMenuSelectionType,
                          options: newMenuModifierOptions
                        }
                        setNewMenuModifiers(prev => [...prev, newGroup])
                        setNewMenuGroupName("")
                        setNewMenuModifierOptions([])
                      }}
                    >
                      Attach Group to Dish
                    </Button>
                  </div>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 animate-in fade-in duration-300">
        {categories.map(c => (
          <Card key={`cat-card-${c.id}`} className={cn("border bg-white transition-all duration-350", c.status === "ACTIVE" ? "border-[#d2d2c4] shadow-xs" : "border-dashed border-neutral-300 opacity-60")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              {getCategoryIcon(c.name)}
              <Badge className={c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-neutral-100 text-neutral-600"}>
                {c.status === "ACTIVE" ? "Active" : "Disabled"}
              </Badge>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base font-bold text-neutral-800">{c.name}</CardTitle>
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
                  <TableHead className="w-16">Preview</TableHead>
                  <TableHead>Dish Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Customizers</TableHead>
                  <TableHead>Client Visibility</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMenuItems.map((m) => (
                  <TableRow key={`menu-row-${m.id}`} className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20">
                    <TableCell className="py-2">
                      {m.image ? (
                        <img 
                          src={m.image} 
                          alt={m.name} 
                          className="h-10 w-10 object-cover rounded-lg border border-[#d2d2c4] shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-[#e6e6d8] flex items-center justify-center rounded-lg text-neutral-500 font-bold text-xs">
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-[#2d3822]">{m.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center">
                        {getCategoryIcon(m.category)}
                        {m.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-800">₹{m.price}</TableCell>
                    <TableCell className="max-w-xs truncate text-neutral-500 text-xs">{m.description}</TableCell>
                    <TableCell>
                      {m.modifierGroups && m.modifierGroups.length > 0 ? (
                        <Badge className="bg-[#556B2F]/10 text-[#556B2F] border-[#556B2F]/20 font-bold text-[10px]">
                          {m.modifierGroups.length} Add-on groups
                        </Badge>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleMenuItemStatus(m.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer inline-flex items-center gap-1",
                          m.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        )}
                        title="Click to toggle availability"
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", m.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500")} />
                        {m.status === "ACTIVE" ? "In Stock" : "Out of Stock"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                      <Button 
                        size="xs" 
                        variant="outline" 
                        className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5"
                        onClick={() => {
                          setSelectedMenuItem(m)
                          setGroupName("")
                          setSelectionType("SINGLE")
                          setModifierOptions([])
                          setShowModifierDialog(true)
                        }}
                      >
                        <Settings className="h-3.5 w-3.5 mr-1" /> Add-ons
                      </Button>
                      <Button 
                        size="xs" 
                        variant="destructive"
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                        onClick={() => {
                          Swal.fire({
                            title: "Delete Dish?",
                            text: `Are you sure you want to permanently delete "${m.name}"?`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#556B2F",
                            confirmButtonText: "Yes, delete it!",
                            cancelButtonText: "No, keep it"
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleDeleteMenuItem(m.id)
                              Swal.fire({
                                title: "Deleted!",
                                text: `"${m.name}" has been removed from the menu.`,
                                icon: "success",
                                confirmButtonColor: "#556B2F",
                                timer: 1500
                              })
                            }
                          })
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalMenuItemsPages || 1}
            onPageChange={setCurrentPage}
            totalEntries={menuItems.length}
            startEntry={(currentPage - 1) * menuItemsPerPage + 1}
            endEntry={currentPage * menuItemsPerPage}
          />
        </CardContent>
      </Card>

      {/* Category Manager Dialog Modal */}
      {showCategoryDialog && (
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
              <DialogDescription>Add, delete, or temporarily toggle display food categories.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Add category form */}
              <div className="bg-[#f5f5e6]/40 p-4 border border-[#d2d2c4]/50 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Create Category</span>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. Italian Pizzas" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="border-[#d2d2c4] bg-white flex-1"
                  />
                  <Input 
                    placeholder="Icon (e.g. 🍕)" 
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="border-[#d2d2c4] bg-white w-20 text-center"
                  />
                  <Button 
                    className="bg-[#556B2F] hover:bg-[#405223] text-white"
                    onClick={() => {
                      if (!newCatName.trim()) {
                        Swal.fire("Error", "Category name is required.", "error")
                        return
                      }
                      handleAddCategory(newCatName.trim(), newCatIcon.trim())
                      setNewCatName("")
                      setNewCatIcon("")
                      Swal.fire("Success", "Category created successfully!", "success")
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* List of categories */}
              <div className="max-h-60 overflow-y-auto space-y-2 border border-[#d2d2c4]/50 rounded-lg p-2 bg-neutral-50/50">
                {categories.map(c => (
                  <div key={`mgr-cat-${c.id}`} className="flex items-center justify-between p-2.5 bg-white border border-neutral-100 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.icon || "🍽️"}</span>
                      <span className="font-bold text-neutral-800">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="xs" 
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5",
                          c.status === "ACTIVE" ? "border-emerald-200 text-emerald-700 bg-emerald-50/30" : "border-neutral-200 text-neutral-500"
                        )}
                        onClick={() => handleToggleCategoryStatus(c.id)}
                      >
                        {c.status === "ACTIVE" ? "Active" : "Inactive"}
                      </Button>
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          Swal.fire({
                            title: "Delete Category?",
                            text: `Are you sure you want to delete the category "${c.name}"? This won't delete items, but their category association might be affected.`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#556B2F",
                            confirmButtonText: "Yes, delete",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              handleDeleteCategory(c.id)
                              Swal.fire("Deleted", "Category has been removed.", "success")
                            }
                          })
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" className="border border-neutral-300 text-neutral-500" onClick={() => setShowCategoryDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modifiers Manager Dialog Modal */}
      {showModifierDialog && currentItem && (
        <Dialog open={showModifierDialog} onOpenChange={setShowModifierDialog}>
          <DialogContent className="bg-white max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Link Add-On & Customizer Groups</DialogTitle>
              <DialogDescription>
                Configure toppings, size upgrades, or choices linked specifically to <span className="font-bold text-[#556B2F]">{currentItem.name}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 my-2">
              {/* Existing Groups */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Linked Modifier Groups</span>
                {(!currentItem.modifierGroups || currentItem.modifierGroups.length === 0) ? (
                  <p className="text-xs text-neutral-400 italic bg-neutral-50 p-4 rounded-lg border border-dashed text-center">
                    No customizers linked to this dish yet. Add one below!
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {currentItem.modifierGroups.map((group) => (
                      <div key={group.id} className="p-3 bg-[#f5f5e6]/20 border border-[#d2d2c4] rounded-xl space-y-2 relative">
                        <div className="flex items-center justify-between border-b border-[#d2d2c4]/40 pb-1.5">
                          <div>
                            <span className="font-bold text-[#2d3822] text-sm">{group.name}</span>
                            <span className="text-[10px] text-neutral-400 block font-semibold uppercase">{group.selectionType} Choice</span>
                          </div>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              const updatedGroups = currentItem.modifierGroups?.filter(g => g.id !== group.id) || []
                              handleUpdateItemModifiers(currentItem.id, updatedGroups)
                              Swal.fire("Removed", "Customizer group unlinked successfully.", "success")
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {group.options.map((opt, oIdx) => (
                            <Badge key={oIdx} className="bg-white border border-[#d2d2c4] text-neutral-700 font-medium">
                              {opt.name} {opt.price > 0 && `(+₹${opt.price})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Group Form */}
              <div className="bg-[#f5f5e6]/45 p-4 border border-[#d2d2c4] rounded-xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block border-b border-[#d2d2c4]/45 pb-1">
                  Create Customizer Group
                </span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">Group Title</label>
                    <Input 
                      placeholder="e.g. Choose Sauce" 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="border-[#d2d2c4] bg-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-600 block">Selection Constraint</label>
                    <Select value={selectionType} onValueChange={(val: any) => setSelectionType(val)}>
                      <SelectTrigger className="border-[#d2d2c4] bg-white text-xs h-9">
                        <SelectValue placeholder="Selection Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="SINGLE">Single Choice (Radio)</SelectItem>
                        <SelectItem value="MULTIPLE">Multiple Choice (Checkbox)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Option Builder */}
                <div className="space-y-2 border-t border-dashed border-[#d2d2c4] pt-3">
                  <span className="text-[11px] font-bold text-neutral-600 block">Group Options Catalog</span>
                  
                  {/* Options List */}
                  {modifierOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-[#d2d2c4]/30 rounded-lg">
                      {modifierOptions.map((opt, idx) => (
                        <Badge key={idx} className="bg-[#556B2F]/10 text-[#556B2F] hover:bg-[#556B2F]/15 flex items-center gap-1 border-[#556B2F]/20 font-bold uppercase text-[10px]">
                          {opt.name} (+₹{opt.price})
                          <button 
                            type="button" 
                            onClick={() => setModifierOptions(prev => prev.filter((_, i) => i !== idx))}
                            className="hover:text-red-700 ml-0.5"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add Option Inputs */}
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Option Name (e.g. Extra Cheese)" 
                      value={newOptionName}
                      onChange={(e) => setNewOptionName(e.target.value)}
                      className="border-[#d2d2c4] bg-white text-xs flex-1"
                    />
                    <Input 
                      type="number"
                      placeholder="Price (e.g. 50)" 
                      value={newOptionPrice}
                      onChange={(e) => setNewOptionPrice(e.target.value)}
                      onKeyDown={preventNonNumeric}
                      className="border-[#d2d2c4] bg-white text-xs w-32"
                    />
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5"
                      onClick={() => {
                        if (!newOptionName.trim()) {
                          Swal.fire("Error", "Option name is required.", "error")
                          return
                        }
                        const price = parseFloat(newOptionPrice) || 0
                        setModifierOptions(prev => [...prev, { name: newOptionName.trim(), price }])
                        setNewOptionName("")
                        setNewOptionPrice("")
                      }}
                    >
                      + Add Option
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#556B2F] hover:bg-[#405223] text-white"
                  onClick={() => {
                    if (!groupName.trim()) {
                      Swal.fire("Error", "Modifier group name is required.", "error")
                      return
                    }
                    if (modifierOptions.length === 0) {
                      Swal.fire("Error", "Please add at least one option to the group.", "error")
                      return
                    }
                    const newGroup = {
                      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                      name: groupName.trim(),
                      selectionType,
                      options: modifierOptions
                    }
                    const updated = [...(currentItem.modifierGroups || []), newGroup]
                    handleUpdateItemModifiers(currentItem.id, updated)
                    setGroupName("")
                    setModifierOptions([])
                    Swal.fire("Linked!", `Customizer group "${newGroup.name}" linked successfully.`, "success")
                  }}
                >
                  Link Modifier Group
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" className="border border-neutral-300 text-neutral-500" onClick={() => setShowModifierDialog(false)}>
                Done Configuring
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
