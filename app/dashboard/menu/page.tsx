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
import { Plus, Upload, Salad, Utensils, Coffee, Cake, ChefHat, Layers, Trash2, Settings, Sparkles, UtensilsCrossed, Pizza, GlassWater, Star, Heart, Flame, Search } from "lucide-react"
import Swal from "sweetalert2"
import { useDashboard, MenuItem, ModifierGroup } from "../DashboardContext"
import { cn } from "@/lib/utils"
import { TablePagination } from "@/components/ui/pagination"

export default function MenuPage() {
  const {
    menuItems,
    categories,
    setCategories,
    toggleMenuItemStatus,
    handleAddMenuItem,
    handleBulkUploadMenuItems,
    handleUpdateMenuItem,
    handleDeleteMenuItem,
    addLog,
    handleAddCategory,
    handleDeleteCategory,
    handleToggleCategoryStatus,
    handleUpdateItemModifiers,
    handleAddModifierGroup
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

  const [newMenu, setNewMenu] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    images: [] as string[],
    foodType: "veg" as "veg" | "non_veg" | "egg" | "jain" | "vegan",
    preparationTime: 15,
    isFeatured: false,
    isRecommended: false,
    isBestSeller: false,
    isHidden: false,
    isOutOfStock: false,
    autoOutOfStock: false,
    quantityAvailable: "" as number | "",
    availableFor: { dineIn: true, takeaway: true, pickup: true, delivery: true },
    tax: { applicable: false, percentage: 5 },
    serviceCharge: { applicable: false, type: "percentage" as "percentage" | "fixed", value: 0 },
    packingCharge: { applicable: false, amount: 0 },
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[],
    availableTimeStart: "00:00",
    availableTimeEnd: "23:59",
    displayOrder: 0,
    itemCode: "",
    allergens: "",
    specialInstructions: ""
  })
  const [showAddMenuDialog, setShowAddMenuDialog] = useState(false)
  const [activeAddTab, setActiveAddTab] = useState("general")
  const [activeEditTab, setActiveEditTab] = useState("general")

  // Modifiers state for the NEW menu item being created
  const [newMenuModifiers, setNewMenuModifiers] = useState<ModifierGroup[]>([])
  const [newMenuGroupName, setNewMenuGroupName] = useState("")
  const [newMenuSelectionType, setNewMenuSelectionType] = useState<"SINGLE" | "MULTIPLE">("SINGLE")
  const [newMenuModifierOptions, setNewMenuModifierOptions] = useState<{ name: string; price: number }[]>([])
  const [newMenuOptionName, setNewMenuOptionName] = useState("")
  const [newMenuOptionPrice, setNewMenuOptionPrice] = useState("")

  // Categories Dialog State
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showAllCategoriesDialog, setShowAllCategoriesDialog] = useState(false)
  const [addMainCatId, setAddMainCatId] = useState<string>("")
  const [addSubCatId, setAddSubCatId] = useState<string>("  ")
  const [editMainCatId, setEditMainCatId] = useState<string>("")
  const [editSubCatId, setEditSubCatId] = useState<string>("")
  const [newCatName, setNewCatName] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("")
  const [newCatParentId, setNewCatParentId] = useState<string>("main")

  // Sub Category States
  const [newSubCatName, setNewSubCatName] = useState("")
  const [newSubCatIcon, setNewSubCatIcon] = useState("")
  const [newSubCatParentId, setNewSubCatParentId] = useState("")
  const [catCreationTab, setCatCreationTab] = useState<"main" | "sub">("main")

  // Loading States
  const [isSavingMenu, setIsSavingMenu] = useState(false)
  const [isSavingEditMenu, setIsSavingEditMenu] = useState(false)
  const [isCreatingCat, setIsCreatingCat] = useState(false)
  const [isCreatingSubCat, setIsCreatingSubCat] = useState(false)

  // Custom Category States
  const [categorySearchQuery, setCategorySearchQuery] = useState("")
  const [categoryPage, setCategoryPage] = useState(1)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [editCatName, setEditCatName] = useState("")
  const [editCatIcon, setEditCatIcon] = useState("")
  const [editCatParentId, setEditCatParentId] = useState<string>("main")
  const [viewingSubCatsParent, setViewingSubCatsParent] = useState<any | null>(null)

  // Modifiers Dialog State
  const [showModifierDialog, setShowModifierDialog] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const currentItem = selectedMenuItem ? (menuItems.find(item => item.id === selectedMenuItem.id) || selectedMenuItem) : null
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [showMenuDetailsModal, setShowMenuDetailsModal] = useState<MenuItem | null>(null)
  const [activeFullImage, setActiveFullImage] = useState<string | null>(null)
  const [editMenuName, setEditMenuName] = useState("")
  const [editMenuCategory, setEditMenuCategory] = useState("")
  const [editMenuPrice, setEditMenuPrice] = useState("")
  const [editMenuDescription, setEditMenuDescription] = useState("")
  const [editMenuImage, setEditMenuImage] = useState("")
  const [editMenuImages, setEditMenuImages] = useState<string[]>([])
  const [editMenuModifiers, setEditMenuModifiers] = useState<ModifierGroup[]>([])

  const [editMenuExtra, setEditMenuExtra] = useState({
    foodType: "veg" as "veg" | "non_veg" | "egg" | "jain" | "vegan",
    preparationTime: 15,
    isFeatured: false,
    isRecommended: false,
    isBestSeller: false,
    isHidden: false,
    isOutOfStock: false,
    autoOutOfStock: false,
    quantityAvailable: "" as number | "",
    availableFor: { dineIn: true, takeaway: true, pickup: true, delivery: true },
    tax: { applicable: false, percentage: 5 },
    serviceCharge: { applicable: false, type: "percentage" as "percentage" | "fixed", value: 0 },
    packingCharge: { applicable: false, amount: 0 },
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[],
    availableTimeStart: "00:00",
    availableTimeEnd: "23:59",
    displayOrder: 0,
    itemCode: "",
    allergens: "",
    specialInstructions: ""
  })

  const [editMenuGroupName, setEditMenuGroupName] = useState("")
  const [editMenuSelectionType, setEditMenuSelectionType] = useState<"SINGLE" | "MULTIPLE">("SINGLE")
  const [editMenuModifierOptions, setEditMenuModifierOptions] = useState<{ name: string; price: number }[]>([])
  const [editMenuOptionName, setEditMenuOptionName] = useState("")
  const [editMenuOptionPrice, setEditMenuOptionPrice] = useState("")

  const startEditing = (item: MenuItem) => {
    const currentCat = categories.find(c => c.name === item.category);
    if (currentCat) {
      if (currentCat.parentId && currentCat.parentId !== "main") {
        setEditMainCatId(currentCat.parentId);
        setEditSubCatId(currentCat.id);
      } else {
        setEditMainCatId(currentCat.id);
        setEditSubCatId("");
      }
    } else {
      setEditMainCatId("");
      setEditSubCatId("");
    }

    setEditingMenuItem(item)
    setEditMenuName(item.name)
    setEditMenuCategory(item.category)
    setEditMenuPrice(item.price.toString())
    setEditMenuDescription(item.description || "")
    setEditMenuImage(item.image || "")
    setEditMenuImages(item.images || (item.image ? [item.image] : []))
    setEditMenuModifiers(item.modifierGroups || [])

    setEditMenuExtra({
      foodType: item.foodType || "veg",
      preparationTime: item.preparationTime || 15,
      isFeatured: item.isFeatured || false,
      isRecommended: item.isRecommended || false,
      isBestSeller: item.isBestSeller || false,
      isHidden: item.isHidden || false,
      isOutOfStock: item.isOutOfStock || false,
      autoOutOfStock: item.autoOutOfStock || false,
      quantityAvailable: item.quantityAvailable ?? "",
      availableFor: item.availableFor || { dineIn: true, takeaway: true, pickup: true, delivery: true },
      tax: item.tax || { applicable: false, percentage: 5 },
      serviceCharge: item.serviceCharge || { applicable: false, type: "percentage", value: 0 },
      packingCharge: item.packingCharge || { applicable: false, amount: 0 },
      availableDays: item.availableDays || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      availableTimeStart: item.availableTimeStart || "00:00",
      availableTimeEnd: item.availableTimeEnd || "23:59",
      displayOrder: item.displayOrder || 0,
      itemCode: item.itemCode || "",
      allergens: item.allergens || "",
      specialInstructions: item.specialInstructions || ""
    })

    setActiveEditTab("general")
    setEditMenuGroupName("")
    setEditMenuSelectionType("SINGLE")
    setEditMenuModifierOptions([])
    setEditMenuOptionName("")
    setEditMenuOptionPrice("")
  }

  const handleSaveEdit = async () => {
    if (editingMenuItem && editMenuName && editMenuPrice) {
      if (!editMenuCategory || editMenuCategory === "placeholder-disabled") {
        Swal.fire("Error", "Please select a category.", "error")
        return
      }
      setIsSavingEditMenu(true)
      try {
        const success = await handleUpdateMenuItem(editingMenuItem.id, {
          name: editMenuName,
          category: editMenuCategory,
          price: parseFloat(editMenuPrice) || 0,
          description: editMenuDescription,
          image: editMenuImage,
          images: editMenuImages,
          modifierGroups: editMenuModifiers,
          ...editMenuExtra,
          quantityAvailable: editMenuExtra.quantityAvailable === "" ? null : Number(editMenuExtra.quantityAvailable)
        })
        setEditingMenuItem(null)
        if (success) {
          Swal.fire({
            title: "Success",
            text: "Menu item updated successfully!",
            icon: "success",
            confirmButtonColor: "#556B2F"
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsSavingEditMenu(false)
      }
    }
  }

  const [groupName, setGroupName] = useState("")
  const [selectionType, setSelectionType] = useState<"SINGLE" | "MULTIPLE">("SINGLE")
  const [modifierOptions, setModifierOptions] = useState<{ name: string; price: number }[]>([])

  const [newOptionName, setNewOptionName] = useState("")
  const [newOptionPrice, setNewOptionPrice] = useState("")

  const handleSave = async () => {
    if (newMenu.name && newMenu.price) {
      const { name, category, price, description, image, images, ...extra } = newMenu;
      if (!category || category === "placeholder-disabled") {
        Swal.fire("Error", "Please select a category.", "error")
        return
      }
      setIsSavingMenu(true)
      try {
        const success = await handleAddMenuItem(
          name,
          category,
          parseFloat(price),
          description,
          image,
          newMenuModifiers,
          images,
          {
            ...extra,
            quantityAvailable: extra.quantityAvailable === "" ? null : Number(extra.quantityAvailable)
          }
        )
        if (success) {
          setNewMenu({
            name: "",
            category: "",
            price: "",
            description: "",
            image: "",
            images: [] as string[],
            foodType: "veg" as "veg" | "non_veg" | "egg" | "jain" | "vegan",
            preparationTime: 15,
            isFeatured: false,
            isRecommended: false,
            isBestSeller: false,
            isHidden: false,
            isOutOfStock: false,
            autoOutOfStock: false,
            quantityAvailable: "" as number | "",
            availableFor: { dineIn: true, takeaway: true, pickup: true, delivery: true },
            tax: { applicable: false, percentage: 5 },
            serviceCharge: { applicable: false, type: "percentage" as "percentage" | "fixed", value: 0 },
            packingCharge: { applicable: false, amount: 0 },
            availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[],
            availableTimeStart: "00:00",
            availableTimeEnd: "23:59",
            displayOrder: 0,
            itemCode: "",
            allergens: "",
            specialInstructions: ""
          })
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
      } catch (err) {
        console.error(err)
      } finally {
        setIsSavingMenu(false)
      }
    }
  }

  const preventNonNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault()
    }
  }

  const handleSaveCategoryEdit = async () => {
    if (!editCatName.trim()) {
      Swal.fire("Error", "Category name is required.", "error")
      return
    }

    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const parentIdValue = editCatParentId === "main" ? null : editCatParentId;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editCatName.trim(),
            icon: editCatIcon.trim(),
            parentId: parentIdValue
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          Swal.fire("Error", data.message || "Failed to update category", "error")
          return
        }
      }

      setCategories(prev => prev.map(c => {
        if (c.id === editingCategory.id) {
          return {
            ...c,
            name: editCatName.trim(),
            icon: editCatIcon.trim(),
            parentId: parentIdValue
          }
        }
        return c
      }))

      // Update the viewing parent if subcategory was edited
      if (viewingSubCatsParent) {
        const updatedParent = categories.find(p => p.id === viewingSubCatsParent.id);
        if (updatedParent) {
          setViewingSubCatsParent(updatedParent);
        }
      }

      setEditingCategory(null)
      Swal.fire("Success", "Category updated successfully!", "success")
    } catch (err) {
      console.error("Error updating category:", err)
      Swal.fire("Error", "Failed to update category.", "error")
    }
  }

  const renderCategoryIconComponent = (iconStr: string, className = "h-5 w-5 text-[#556B2F]") => {
    const iconLower = (iconStr || "").toLowerCase().trim()
    if (iconStr && (iconStr.startsWith("http") || iconStr.startsWith("data:image") || iconStr.startsWith("/"))) {
      return <img src={iconStr} alt="icon" className={cn("object-contain rounded-xs", className)} />
    }
    switch (iconLower) {
      case "🌮":
      case "salad":
      case "appetizers":
        return <Salad className={className} />
      case "🍝":
      case "utensils":
      case "main course":
      case "main-course":
        return <Utensils className={className} />
      case "☕":
      case "coffee":
      case "drinks":
        return <Coffee className={className} />
      case "🍰":
      case "cake":
      case "desserts":
        return <Cake className={className} />
      case "🍕":
      case "pizza":
        return <Pizza className={className} />
      case "🍹":
      case "🥤":
      case "glasswater":
      case "beverage":
        return <GlassWater className={className} />
      default:
        if (iconLower.includes("salad") || iconLower.includes("appetizer")) return <Salad className={className} />
        if (iconLower.includes("drink") || iconLower.includes("beverage") || iconLower.includes("water") || iconLower.includes("juice")) return <GlassWater className={className} />
        if (iconLower.includes("dessert") || iconLower.includes("sweet") || iconLower.includes("cake")) return <Cake className={className} />
        if (iconLower.includes("pizza")) return <Pizza className={className} />
        if (iconLower.includes("main") || iconLower.includes("course") || iconLower.includes("food") || iconLower.includes("utensil")) return <Utensils className={className} />
        return <UtensilsCrossed className={className} />
    }
  }

  const getCategoryIcon = (name: string) => {
    const matched = categories.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (matched && matched.icon) {
      return renderCategoryIconComponent(matched.icon, "h-5 w-5 text-[#556B2F] mr-1")
    }
    switch (name) {
      case "Appetizers": return <Salad className="h-5 w-5 text-[#556B2F] mr-1" />
      case "Main Course": return <Utensils className="h-5 w-5 text-[#556B2F] mr-1" />
      case "Drinks": return <Coffee className="h-5 w-5 text-[#556B2F] mr-1" />
      case "Desserts": return <Cake className="h-5 w-5 text-[#556B2F] mr-1" />
      default: return <ChefHat className="h-5 w-5 text-[#556B2F] mr-1" />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
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
                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white" onClick={async () => {
                  const textarea = document.getElementById("csv-input-field") as HTMLTextAreaElement
                  const csvText = textarea ? textarea.value : ""

                  let itemsToUpload: { name: string; price: number; category: string; description: string }[] = []

                  if (!csvText.trim()) {
                    // Fallback to demo items
                    itemsToUpload = [
                      { name: "Smoked Salmon Benedict", price: 429, category: "Appetizers", description: "Poached eggs on toasted muffins with rich hollandaise and cold-smoked salmon." },
                      { name: "Blueberry Ricotta Hotcakes", price: 349, category: "Desserts", description: "Fluffy soufflé hotcakes topped with fresh blueberries and whipped ricotta." },
                      { name: "Matcha Oat Latte", price: 229, category: "Drinks", description: "Ceremonial grade Japanese matcha stone-ground with oat milk." },
                      { name: "Wagyu Truffle Burger", price: 899, category: "Main Course", description: "Aged Wagyu beef patty, black truffle aioli, and brioche bun." }
                    ]
                  } else {
                    try {
                      const lines = csvText.split("\n")
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
                            itemsToUpload.push({ name, price, category, description })
                          }
                        }
                      })
                    } catch (e) {
                      Swal.fire("Error Parsing CSV", "Please ensure your CSV formatting matches the expected header.", "error")
                      return
                    }
                  }

                  if (itemsToUpload.length === 0) {
                    Swal.fire("No Items Found", "No valid items parsed from the input.", "warning")
                    return
                  }

                  // Show loading alert
                  Swal.fire({
                    title: "Importing...",
                    text: "Uploading menu items in bulk to the server...",
                    allowOutsideClick: false,
                    didOpen: () => {
                      Swal.showLoading()
                    }
                  })

                  const result = await handleBulkUploadMenuItems(itemsToUpload)

                  if (result.success) {
                    Swal.fire({
                      title: "Import Successful",
                      text: `Successfully uploaded ${result.count} items!`,
                      icon: "success",
                      confirmButtonColor: "#556B2F"
                    })
                    if (textarea) textarea.value = ""
                  } else {
                    Swal.fire({
                      title: "Upload Failed",
                      text: result.message || "An error occurred during bulk upload.",
                      icon: "error",
                      confirmButtonColor: "#556B2F"
                    })
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
                  setNewMenu({
                    name: "",
                    category: "",
                    price: "",
                    description: "",
                    image: "",
                    images: [] as string[],
                    foodType: "veg" as "veg" | "non_veg" | "egg" | "jain" | "vegan",
                    preparationTime: 15,
                    isFeatured: false,
                    isRecommended: false,
                    isBestSeller: false,
                    isHidden: false,
                    isOutOfStock: false,
                    autoOutOfStock: false,
                    quantityAvailable: "" as number | "",
                    availableFor: { dineIn: true, takeaway: true, pickup: true, delivery: true },
                    tax: { applicable: false, percentage: 5 },
                    serviceCharge: { applicable: false, type: "percentage" as "percentage" | "fixed", value: 0 },
                    packingCharge: { applicable: false, amount: 0 },
                    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[],
                    availableTimeStart: "00:00",
                    availableTimeEnd: "23:59",
                    displayOrder: 0,
                    itemCode: "",
                    allergens: "",
                    specialInstructions: ""
                  })
                  setNewMenuModifiers([])
                  setNewMenuGroupName("")
                  setNewMenuModifierOptions([])
                  setAddMainCatId("")
                  setAddSubCatId("")
                  setShowAddMenuDialog(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-3xl sm:max-w-5xl overflow-y-auto max-h-[90vh] no-scrollbar">
              <DialogHeader>
                <DialogTitle>Create New Menu Item</DialogTitle>
                <DialogDescription>Populate the required details below. The item immediately reflects on all client apps.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Tabs Header */}
                <div className="flex gap-1.5 border-b border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
                  {[
                    { id: "general", label: "General Info" },
                    { id: "availability", label: "Availability" },
                    { id: "charges", label: "Charges & Taxes" },
                    { id: "inventory", label: "Stock & Settings" },
                    { id: "addons", label: "Add-ons (Optional)" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveAddTab(tab.id)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                        activeAddTab === tab.id
                          ? "bg-[#556B2F] text-white shadow-xs"
                          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab: General Info */}
                {activeAddTab === "general" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Item Name</label>
                        <Input placeholder="e.g. Garlic Sautéed Prawns" value={newMenu.name} onChange={(e) => setNewMenu(prev => ({ ...prev, name: e.target.value }))} className="text-xs h-9 bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-700 block">Price (₹)</label>
                          <Input type="number" placeholder="e.g. 499" value={newMenu.price} onChange={(e) => setNewMenu(prev => ({ ...prev, price: e.target.value }))} onKeyDown={preventNonNumeric} className="text-xs h-9 bg-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-700 block">Prep Time (mins)</label>
                          <Input type="number" placeholder="15" value={newMenu.preparationTime} onChange={(e) => setNewMenu(prev => ({ ...prev, preparationTime: Number(e.target.value) || 0 }))} onKeyDown={preventNonNumeric} className="text-xs h-9 bg-white" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Category (Main)</label>
                        <Select
                          value={addMainCatId}
                          onValueChange={(val) => {
                            setAddMainCatId(val);
                            const selectedCatObj = categories.find(c => c.id === val);
                            if (selectedCatObj) {
                              setNewMenu(prev => ({ ...prev, category: selectedCatObj.name }));
                            }
                            setAddSubCatId(""); // reset subcategory on parent change
                          }}
                        >
                          <SelectTrigger className="w-full text-xs h-9 bg-white">
                            <SelectValue placeholder="Choose Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="placeholder-disabled" disabled>-- Choose Category --</SelectItem>
                            {categories
                              .filter(c => c.status === "ACTIVE" && (!c.parentId || c.parentId === "main" || c.parentId === ""))
                              .map(c => (
                                <SelectItem key={`cat-add-opt-${c.id}`} value={c.id}>{c.name}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Sub-Category (Optional)</label>
                        <Select
                          value={addSubCatId}
                          disabled={!addMainCatId}
                          onValueChange={(val) => {
                            setAddSubCatId(val);
                            if (val && val !== "none") {
                              const selectedSubObj = categories.find(c => c.id === val);
                              if (selectedSubObj) {
                                setNewMenu(prev => ({ ...prev, category: selectedSubObj.name }));
                              }
                            } else {
                              const parentCatObj = categories.find(c => c.id === addMainCatId);
                              if (parentCatObj) {
                                setNewMenu(prev => ({ ...prev, category: parentCatObj.name }));
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="w-full text-xs h-9 bg-white">
                            <SelectValue placeholder="Choose Sub-Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="none">None (Use Main Category)</SelectItem>
                            {categories
                              .filter(c => c.status === "ACTIVE" && c.parentId === addMainCatId)
                              .map(c => (
                                <SelectItem key={`sub-add-opt-${c.id}`} value={c.id}>{c.name}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Food Type</label>
                        <Select value={newMenu.foodType} onValueChange={(val: any) => setNewMenu(prev => ({ ...prev, foodType: val }))}>
                          <SelectTrigger className="w-full text-xs h-9 bg-white">
                            <SelectValue placeholder="Veg / Non-Veg / etc." />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="veg">Vegetarian (Veg)</SelectItem>
                            <SelectItem value="non_veg">Non-Vegetarian (Non-Veg)</SelectItem>
                            <SelectItem value="egg">Egg</SelectItem>
                            <SelectItem value="jain">Jain</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Description</label>
                      <Input placeholder="Describe ingredients, allergens, etc." value={newMenu.description} onChange={(e) => setNewMenu(prev => ({ ...prev, description: e.target.value }))} className="text-xs h-9 bg-white" />
                    </div>

                    {/* Image Upload Block */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Upload Image(s)</label>
                      <Input
                        key={newMenu.images.length}
                        type="file"
                        accept="image/*"
                        multiple
                        className="text-xs border-[#d2d2c4] bg-white cursor-pointer h-9"
                        onChange={(e) => {
                          const files = e.target.files
                          if (files && files.length > 0) {
                            const validFiles = Array.from(files).filter(file => {
                              if (file.size > 3 * 1024 * 1024) {
                                Swal.fire({
                                  title: "File Too Large",
                                  text: `File "${file.name}" exceeds the 3MB limit and was skipped.`,
                                  icon: "warning",
                                  confirmButtonColor: "#556B2F"
                                })
                                return false
                              }
                              return true
                            })

                            if (validFiles.length === 0) {
                              e.target.value = ""
                              return
                            }

                            const newImages: string[] = []
                            let loadedCount = 0

                            validFiles.forEach((file) => {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                newImages.push(reader.result as string)
                                loadedCount++
                                if (loadedCount === validFiles.length) {
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
                  </div>
                )}

                {/* Tab: Availability & Scheduling */}
                {activeAddTab === "availability" && (
                  <div className="space-y-4 animate-in fade-in duration-200 bg-[#f5f5e6]/20 p-4 border border-[#d2d2c4]/50 rounded-xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block border-b pb-1">Service & Timing Settings</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {["dineIn", "takeaway", "pickup", "delivery"].map((field) => (
                        <label key={field} className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(newMenu.availableFor as any)[field]}
                            onChange={(e) => setNewMenu(prev => ({
                              ...prev,
                              availableFor: {
                                ...prev.availableFor,
                                [field]: e.target.checked
                              }
                            }))}
                            className="rounded accent-[#556B2F]"
                          />
                          <span className="capitalize">{field.replace("dineIn", "Dine In")}</span>
                        </label>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Available Start Time</label>
                        <Input type="time" value={newMenu.availableTimeStart} onChange={(e) => setNewMenu(prev => ({ ...prev, availableTimeStart: e.target.value }))} className="text-xs h-9 bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Available End Time</label>
                        <Input type="time" value={newMenu.availableTimeEnd} onChange={(e) => setNewMenu(prev => ({ ...prev, availableTimeEnd: e.target.value }))} className="text-xs h-9 bg-white" />
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t pt-3">
                      <label className="text-xs font-bold text-neutral-700 block">Available Days</label>
                      <div className="flex flex-wrap gap-2">
                        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => {
                          const isSelected = newMenu.availableDays.includes(day as any)
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setNewMenu(prev => {
                                  const list = prev.availableDays.includes(day as any)
                                    ? prev.availableDays.filter(d => d !== day)
                                    : [...prev.availableDays, day as any]
                                  return { ...prev, availableDays: list }
                                })
                              }}
                              className={cn(
                                "px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer border transition-all",
                                isSelected
                                  ? "bg-[#556B2F] border-[#556B2F] text-white"
                                  : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                              )}
                            >
                              {day.substring(0, 3)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Charges & Taxes */}
                {activeAddTab === "charges" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-[#f5f5e6]/20 p-4 border border-[#d2d2c4]/50 rounded-xl space-y-4">
                      {/* Tax Settings */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newMenu.tax.applicable}
                            onChange={(e) => setNewMenu(prev => ({ ...prev, tax: { ...prev.tax, applicable: e.target.checked } }))}
                            className="rounded accent-[#556B2F]"
                          />
                          <span>Tax Applicable</span>
                        </label>
                        {newMenu.tax.applicable && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-600 font-medium">Percentage (%):</span>
                            <Input type="number" value={newMenu.tax.percentage} onChange={(e) => setNewMenu(prev => ({ ...prev, tax: { ...prev.tax, percentage: Number(e.target.value) || 0 } }))} className="w-16 h-8 text-xs bg-white text-center" />
                          </div>
                        )}
                      </div>

                      {/* Service Charge Settings */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newMenu.serviceCharge.applicable}
                            onChange={(e) => setNewMenu(prev => ({ ...prev, serviceCharge: { ...prev.serviceCharge, applicable: e.target.checked } }))}
                            className="rounded accent-[#556B2F]"
                          />
                          <span>Service Charge Applicable</span>
                        </label>
                        {newMenu.serviceCharge.applicable && (
                          <div className="flex items-center gap-2">
                            <Select value={newMenu.serviceCharge.type} onValueChange={(val: any) => setNewMenu(prev => ({ ...prev, serviceCharge: { ...prev.serviceCharge, type: val } }))}>
                              <SelectTrigger className="h-8 text-xs bg-white w-28">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Flat (₹)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input type="number" value={newMenu.serviceCharge.value} onChange={(e) => setNewMenu(prev => ({ ...prev, serviceCharge: { ...prev.serviceCharge, value: Number(e.target.value) || 0 } }))} className="w-16 h-8 text-xs bg-white text-center" />
                          </div>
                        )}
                      </div>

                      {/* Packing Charge Settings */}
                      <div className="flex items-center justify-between pb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newMenu.packingCharge.applicable}
                            onChange={(e) => setNewMenu(prev => ({ ...prev, packingCharge: { ...prev.packingCharge, applicable: e.target.checked } }))}
                            className="rounded accent-[#556B2F]"
                          />
                          <span>Packaging Charges Applicable</span>
                        </label>
                        {newMenu.packingCharge.applicable && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-600 font-medium">Amount (₹):</span>
                            <Input type="number" value={newMenu.packingCharge.amount} onChange={(e) => setNewMenu(prev => ({ ...prev, packingCharge: { ...prev.packingCharge, amount: Number(e.target.value) || 0 } }))} className="w-16 h-8 text-xs bg-white text-center" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Stock & Settings */}
                {activeAddTab === "inventory" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#f5f5e6]/25 p-4 border border-[#d2d2c4]/50 rounded-xl">
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={newMenu.isFeatured} onChange={(e) => setNewMenu(prev => ({ ...prev, isFeatured: e.target.checked }))} className="rounded accent-[#556B2F]" />
                        <span>Featured</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={newMenu.isRecommended} onChange={(e) => setNewMenu(prev => ({ ...prev, isRecommended: e.target.checked }))} className="rounded accent-[#556B2F]" />
                        <span>Recommended</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={newMenu.isBestSeller} onChange={(e) => setNewMenu(prev => ({ ...prev, isBestSeller: e.target.checked }))} className="rounded accent-[#556B2F]" />
                        <span>Bestseller</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={newMenu.isHidden} onChange={(e) => setNewMenu(prev => ({ ...prev, isHidden: e.target.checked }))} className="rounded accent-[#556B2F]" />
                        <span>Hide from menu</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={newMenu.isOutOfStock} onChange={(e) => setNewMenu(prev => ({ ...prev, isOutOfStock: e.target.checked }))} className="rounded accent-[#556B2F]" />
                        <span>Out of Stock</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input type="checkbox" checked={newMenu.autoOutOfStock} onChange={(e) => setNewMenu(prev => ({ ...prev, autoOutOfStock: e.target.checked }))} className="rounded accent-[#556B2F]" />
                        <span>Auto Out of Stock</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Quantity Available</label>
                        <Input type="number" placeholder="Infinity" value={newMenu.quantityAvailable} onChange={(e) => setNewMenu(prev => ({ ...prev, quantityAvailable: e.target.value === "" ? "" : Number(e.target.value) }))} className="text-xs h-9 bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">SKU / Item Code</label>
                        <Input placeholder="e.g. SKU-1234" value={newMenu.itemCode} onChange={(e) => setNewMenu(prev => ({ ...prev, itemCode: e.target.value }))} className="text-xs h-9 bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Display Order</label>
                        <Input type="number" value={newMenu.displayOrder} onChange={(e) => setNewMenu(prev => ({ ...prev, displayOrder: Number(e.target.value) || 0 }))} className="text-xs h-9 bg-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Allergens (Comma separated)</label>
                        <Input placeholder="e.g. Nuts, Dairy" value={newMenu.allergens} onChange={(e) => setNewMenu(prev => ({ ...prev, allergens: e.target.value }))} className="text-xs h-9 bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Special Instructions</label>
                        <Input placeholder="e.g. Medium spicy" value={newMenu.specialInstructions} onChange={(e) => setNewMenu(prev => ({ ...prev, specialInstructions: e.target.value }))} className="text-xs h-9 bg-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Add-ons section */}
                {activeAddTab === "addons" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
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
                          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#d2d2c4]/30 rounded-lg">
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
                )}

              </div>
              <DialogFooter>
                <Button className="bg-[#556B2F] hover:bg-[#405223] text-white flex items-center justify-center gap-1.5" onClick={handleSave} disabled={isSavingMenu}>
                  {isSavingMenu ? "Saving..." : "Save Menu Listing"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Menu Categories List - Showing only first 4 categories */}
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#d2d2c4]">
          <div>
            <h3 className="text-sm font-bold text-[#2d3822]">Menu Categories</h3>
            <p className="text-[11px] text-neutral-500 font-semibold">Showing up to 4 main categories.</p>
          </div>
          <Button
            variant="outline"
            className="border-[#556B2F] text-[#556B2F] hover:bg-[#f5f5e6] text-xs font-bold h-9"
            onClick={() => setShowAllCategoriesDialog(true)}
          >
            Manage & See All Categories ({categories.filter(c => !c.parentId).length}) →
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {categories.filter(c => !c.parentId).slice(0, 4).map(parent => {
            const subCats = categories.filter(sub => sub.parentId === parent.id);
            const totalDishes = menuItems.filter(m => m.category === parent.name || subCats.some(sub => m.category === sub.name)).length;

            return (
              <Card
                key={`cat-card-main-${parent.id}`}
                className={cn(
                  "border bg-white transition-all p-3 relative overflow-hidden flex flex-col justify-between min-h-[120px]",
                  parent.status === "ACTIVE" ? "border-[#d2d2c4]" : "border-dashed border-neutral-200 opacity-60"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#556B2F]/10 flex items-center justify-center border border-[#556B2F]/20 shrink-0">
                        {renderCategoryIconComponent(parent.icon, "h-4 w-4 text-[#556B2F]")}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-neutral-800 line-clamp-1 leading-tight">{parent.name}</h4>
                        <span className="text-[9px] text-neutral-400 font-semibold">{totalDishes} Dishes</span>
                      </div>
                    </div>

                    {/* CRUD Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="xs"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                        onClick={() => {
                          setEditingCategory(parent);
                          setEditCatName(parent.name);
                          setEditCatIcon(parent.icon);
                          setEditCatParentId(parent.parentId || "main");
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <button
                        onClick={() => handleToggleCategoryStatus(parent.id)}
                        className={cn(
                          "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none align-middle self-center mx-1",
                          parent.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
                        )}
                        role="switch"
                        aria-checked={parent.status === "ACTIVE"}
                        title={parent.status === "ACTIVE" ? "Active" : "Inactive"}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out absolute top-[2px] left-[2px]",
                            parent.status === "ACTIVE" ? "translate-x-3" : "translate-x-0"
                          )}
                        />
                      </button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                        onClick={() => {
                          Swal.fire({
                            title: "Delete Category?",
                            text: `Are you sure you want to delete "${parent.name}"? This won't delete items, but their category association might be affected.`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#556B2F",
                            confirmButtonText: "Yes, delete",
                          }).then(async (result) => {
                            if (result.isConfirmed) {
                              const success = await handleDeleteCategory(parent.id)
                              if (success) {
                                Swal.fire("Deleted", "Category has been removed.", "success")
                              }
                            }
                          })
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories section */}
                  <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[9px] text-neutral-400 font-semibold">{subCats.length} Sub-categories</span>
                    <Button
                      size="xs"
                      variant="link"
                      className="text-[#556B2F] font-bold text-[9px] h-auto p-0 hover:underline"
                      onClick={() => {
                        setViewingSubCatsParent(parent);
                      }}
                    >
                      See Subcategories →
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Menu Items Table */}
      <Card className="border border-[#d2d2c4] bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#556B2F]">Food Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e6e6d8]/20">
                <TableRow className="border-b border-[#d2d2c4]">
                  <TableHead className="w-16 px-6">Preview</TableHead>
                  <TableHead className="px-6">Dish Name</TableHead>
                  <TableHead className="px-6">Pricing</TableHead>
                  <TableHead className="px-6 w-[160px] min-w-[160px] max-w-[160px]">Stock</TableHead>
                  <TableHead className="text-right font-semibold px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMenuItems.map((m) => (
                  <TableRow
                    key={`menu-row-${m.id}`}
                    className="border-b border-[#d2d2c4] hover:bg-[#f5f5e6]/20"
                  >
                    <TableCell className="py-2 px-6">
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
                    <TableCell
                      className="px-6 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenuDetailsModal(m)
                      }}
                    >
                      <div className="font-bold text-[#2d3822] hover:text-[#556B2F] hover:underline">{m.name}</div>
                      <span className="text-[10px] text-neutral-400 block mt-0.5 font-medium">{m.category}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-800 px-6">₹{m.price}</TableCell>
                    <TableCell className="px-6 w-[160px] min-w-[160px] max-w-[160px]">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMenuItemStatus(m.id)
                          }}
                          className={cn(
                            "relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            m.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
                          )}
                          role="switch"
                          aria-checked={m.status === "ACTIVE"}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                              m.status === "ACTIVE" ? "translate-x-4.5" : "translate-x-0"
                            )}
                          />
                        </button>
                        <span className="text-xs font-semibold text-neutral-600">
                          {m.status === "ACTIVE" ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6" onClick={(e) => e.stopPropagation()}>
                      {/* Desktop actions */}
                      <div className="hidden md:flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(m)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          className="bg-rose-500 hover:bg-rose-600 text-white shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
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
                      </div>

                      {/* Mobile actions */}
                      <div className="flex md:hidden items-center justify-end">
                        <Button
                          size="xs"
                          className="bg-[#556B2F] hover:bg-[#405223] text-white shrink-0 font-bold text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(m)
                          }}
                        >
                          Edit
                        </Button>
                      </div>
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
          <DialogContent className="bg-white max-w-xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
              <DialogDescription>Add, delete, or temporarily toggle display food categories.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Tab Header to Choose Creation Type */}
              <div className="flex gap-2 border-b border-neutral-200 pb-2">
                <button
                  type="button"
                  onClick={() => setCatCreationTab("main")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    catCreationTab === "main"
                      ? "bg-[#556B2F] text-white shadow-xs"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  )}
                >
                  Create Main Category
                </button>
                <button
                  type="button"
                  onClick={() => setCatCreationTab("sub")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    catCreationTab === "sub"
                      ? "bg-[#556B2F] text-white shadow-xs"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  )}
                >
                  Create Sub-Category
                </button>
              </div>

              {/* Add category form */}
              {catCreationTab === "main" ? (
                <div className="bg-[#f5f5e6]/40 p-4 border border-[#d2d2c4]/50 rounded-xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Create Main Category</span>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-600 block">Category Name</label>
                      <Input
                        placeholder="e.g. Italian Pizzas"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="border-[#d2d2c4] bg-white text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-600 block">Category Icon Image</label>
                      <Input
                        type="file"
                        accept="image/*"
                        className="border-[#d2d2c4] bg-white text-xs h-9 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 3 * 1024 * 1024) {
                              Swal.fire({
                                title: "File Too Large",
                                text: "Category icon image must be smaller than 3MB.",
                                icon: "warning",
                                confirmButtonColor: "#556B2F"
                              })
                              e.target.value = ""
                              return
                            }
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setNewCatIcon(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      {newCatIcon && newCatIcon.startsWith("data:image") && (
                        <div className="flex items-center gap-2 pt-1">
                          <img src={newCatIcon} alt="Selected Icon" className="h-8 w-8 object-contain border border-[#d2d2c4] rounded-md bg-white" />
                          <button
                            type="button"
                            onClick={() => setNewCatIcon("")}
                            className="text-[10px] text-red-500 font-bold hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    className="bg-[#556B2F] hover:bg-[#405223] text-white w-full text-xs h-9 font-bold flex items-center justify-center gap-1.5"
                    disabled={isCreatingCat}
                    onClick={async () => {
                      if (!newCatName.trim()) {
                        Swal.fire("Error", "Category name is required.", "error")
                        return
                      }
                      setIsCreatingCat(true)
                      try {
                        const success = await handleAddCategory(newCatName.trim(), newCatIcon.trim(), null)
                        if (success) {
                          setNewCatName("")
                          setNewCatIcon("")
                          Swal.fire("Success", "Main Category created successfully!", "success")
                        } else {
                          Swal.fire("Error", "Failed to create main category.", "error")
                        }
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setIsCreatingCat(false)
                      }
                    }}
                  >
                    {isCreatingCat ? "Creating..." : "Create Main Category"}
                  </Button>
                </div>
              ) : (
                <div className="bg-[#f5f5e6]/40 p-4 border border-[#d2d2c4]/50 rounded-xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">Create Sub-Category</span>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-600 block">Sub-Category Name</label>
                      <Input
                        placeholder="e.g. Thin Crust"
                        value={newSubCatName}
                        onChange={(e) => setNewSubCatName(e.target.value)}
                        className="border-[#d2d2c4] bg-white text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-600 block">Sub-Category Icon Image</label>
                      <Input
                        type="file"
                        accept="image/*"
                        className="border-[#d2d2c4] bg-white text-xs h-9 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 3 * 1024 * 1024) {
                              Swal.fire({
                                title: "File Too Large",
                                text: "Sub-category icon image must be smaller than 3MB.",
                                icon: "warning",
                                confirmButtonColor: "#556B2F"
                              })
                              e.target.value = ""
                              return
                            }
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setNewSubCatIcon(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      {newSubCatIcon && newSubCatIcon.startsWith("data:image") && (
                        <div className="flex items-center gap-2 pt-1">
                          <img src={newSubCatIcon} alt="Selected Icon" className="h-8 w-8 object-contain border border-[#d2d2c4] rounded-md bg-white" />
                          <button
                            type="button"
                            onClick={() => setNewSubCatIcon("")}
                            className="text-[10px] text-red-500 font-bold hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-600 block">Parent Category</label>
                      <Select value={newSubCatParentId} onValueChange={setNewSubCatParentId}>
                        <SelectTrigger className="border-[#d2d2c4] bg-white text-xs h-9 w-full">
                          <SelectValue placeholder="-- Select Parent Category --" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="placeholder-disabled" disabled>-- Select Parent Category --</SelectItem>
                          {categories
                            .filter(c => (!c.parentId || c.parentId === "main" || c.parentId === "") && !["mains", "main", "main course"].includes(c.name.toLowerCase()))
                            .map(c => (
                              <SelectItem key={`sub-parent-opt-${c.id}`} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="bg-[#556B2F] hover:bg-[#405223] text-white w-full text-xs h-9 font-bold flex items-center justify-center gap-1.5"
                    disabled={isCreatingSubCat}
                    onClick={async () => {
                      if (!newSubCatName.trim()) {
                        Swal.fire("Error", "Sub-category name is required.", "error")
                        return
                      }
                      if (!newSubCatParentId || newSubCatParentId === "placeholder-disabled") {
                        Swal.fire("Error", "Please select a parent category.", "error")
                        return
                      }
                      setIsCreatingSubCat(true)
                      try {
                        const success = await handleAddCategory(newSubCatName.trim(), newSubCatIcon.trim(), newSubCatParentId)
                        if (success) {
                          setNewSubCatName("")
                          setNewSubCatIcon("")
                          setNewSubCatParentId("")
                          Swal.fire("Success", "Sub-category created successfully!", "success")
                        } else {
                          Swal.fire("Error", "Failed to create sub-category.", "error")
                        }
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setIsCreatingSubCat(false)
                      }
                    }}
                  >
                    {isCreatingSubCat ? "Creating..." : "Create Sub-Category"}
                  </Button>
                </div>
              )}
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
          <DialogContent
            className="bg-white max-w-3xl overflow-y-auto max-h-[90vh] no-scrollbar"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
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
                            onClick={async () => {
                              const updatedGroups = currentItem.modifierGroups?.filter(g => g.id !== group.id) || []
                              const success = await handleUpdateItemModifiers(currentItem.id, updatedGroups)
                              if (success) {
                                currentItem.modifierGroups = updatedGroups
                                Swal.fire("Removed", "Customizer group unlinked successfully.", "success")
                              }
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
                  onClick={async () => {
                    if (!groupName.trim()) {
                      Swal.fire("Error", "Modifier group name is required.", "error")
                      return
                    }
                    if (modifierOptions.length === 0) {
                      Swal.fire("Error", "Please add at least one option to the group.", "error")
                      return
                    }

                    // Create the modifier group and options via API
                    const createdGroup = await handleAddModifierGroup(groupName.trim(), selectionType, modifierOptions)
                    console.log("[DEBUG] createdGroup returned from handleAddModifierGroup:", createdGroup);
                    if (createdGroup) {
                      const updated = [...(currentItem.modifierGroups || []), createdGroup]
                      const success = await handleUpdateItemModifiers(currentItem.id, updated)
                      if (success) {
                        // Update current item UI state locally in dialog
                        currentItem.modifierGroups = updated
                        setGroupName("")
                        setModifierOptions([])
                        Swal.fire("Linked!", `Customizer group "${createdGroup.name}" created and linked successfully.`, "success")
                      }
                    }
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

      {/* Menu Item Edit Dialog Modal */}
      {editingMenuItem && (
        <Dialog open={!!editingMenuItem} onOpenChange={(open) => !open && setEditingMenuItem(null)}>
          <DialogContent
            className="bg-white max-w-3xl sm:max-w-5xl overflow-y-auto max-h-[90vh] no-scrollbar"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Edit Menu Item: {editingMenuItem.name}</DialogTitle>
              <DialogDescription>
                Modify specifications, price, categories, images and add-ons for this dish.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Tabs Header */}
              <div className="flex gap-1.5 border-b border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "general", label: "General Info" },
                  { id: "availability", label: "Availability" },
                  { id: "charges", label: "Charges & Taxes" },
                  { id: "inventory", label: "Stock & Settings" },
                  { id: "addons", label: "Add-ons (Optional)" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveEditTab(tab.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                      activeEditTab === tab.id
                        ? "bg-[#556B2F] text-white shadow-xs"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: General Info */}
              {activeEditTab === "general" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Item Name</label>
                      <Input placeholder="e.g. Garlic Sautéed Prawns" value={editMenuName} onChange={(e) => setEditMenuName(e.target.value)} className="text-xs h-9 bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Price (₹)</label>
                        <Input type="number" placeholder="e.g. 499" value={editMenuPrice} onChange={(e) => setEditMenuPrice(e.target.value)} onKeyDown={preventNonNumeric} className="text-xs h-9 bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700 block">Prep Time (mins)</label>
                        <Input type="number" placeholder="15" value={editMenuExtra.preparationTime} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, preparationTime: Number(e.target.value) || 0 }))} onKeyDown={preventNonNumeric} className="text-xs h-9 bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Category (Main)</label>
                      <Select
                        value={editMainCatId}
                        onValueChange={(val) => {
                          setEditMainCatId(val);
                          const selectedCatObj = categories.find(c => c.id === val);
                          if (selectedCatObj) {
                            setEditMenuCategory(selectedCatObj.name);
                          }
                          setEditSubCatId(""); // reset subcategory on parent change
                        }}
                      >
                        <SelectTrigger className="w-full text-xs h-9 bg-white">
                          <SelectValue placeholder="Choose Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="placeholder-disabled" disabled>-- Choose Category --</SelectItem>
                          {categories
                            .filter(c => c.status === "ACTIVE" && (!c.parentId || c.parentId === "main" || c.parentId === ""))
                            .map(c => (
                              <SelectItem key={`cat-edit-opt-${c.id}`} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Sub-Category (Optional)</label>
                      <Select
                        value={editSubCatId || "none"}
                        disabled={!editMainCatId}
                        onValueChange={(val) => {
                          setEditSubCatId(val);
                          if (val && val !== "none") {
                            const selectedSubObj = categories.find(c => c.id === val);
                            if (selectedSubObj) {
                              setEditMenuCategory(selectedSubObj.name);
                            }
                          } else {
                            const parentCatObj = categories.find(c => c.id === editMainCatId);
                            if (parentCatObj) {
                              setEditMenuCategory(parentCatObj.name);
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-full text-xs h-9 bg-white">
                          <SelectValue placeholder="Choose Sub-Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="none">None (Use Main Category)</SelectItem>
                          {categories
                            .filter(c => c.status === "ACTIVE" && c.parentId === editMainCatId)
                            .map(c => (
                              <SelectItem key={`sub-edit-opt-${c.id}`} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Food Type</label>
                      <Select value={editMenuExtra.foodType} onValueChange={(val: any) => setEditMenuExtra(prev => ({ ...prev, foodType: val }))}>
                        <SelectTrigger className="w-full text-xs h-9 bg-white">
                          <SelectValue placeholder="Veg / Non-Veg / etc." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="veg">Vegetarian (Veg)</SelectItem>
                          <SelectItem value="non_veg">Non-Vegetarian (Non-Veg)</SelectItem>
                          <SelectItem value="egg">Egg</SelectItem>
                          <SelectItem value="jain">Jain</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">Description</label>
                    <Input placeholder="Describe ingredients, allergens, etc." value={editMenuDescription} onChange={(e) => setEditMenuDescription(e.target.value)} className="text-xs h-9 bg-white" />
                  </div>

                  {/* Image Upload Block */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 block">Upload Image(s)</label>
                    <Input
                      key={editMenuImages.length}
                      type="file"
                      accept="image/*"
                      multiple
                      className="text-xs border-[#d2d2c4] bg-white cursor-pointer h-9"
                      onChange={(e) => {
                        const files = e.target.files
                        if (files && files.length > 0) {
                          const validFiles = Array.from(files).filter(file => {
                            if (file.size > 3 * 1024 * 1024) {
                              Swal.fire({
                                title: "File Too Large",
                                text: `File "${file.name}" exceeds the 3MB limit and was skipped.`,
                                icon: "warning",
                                confirmButtonColor: "#556B2F"
                              })
                              return false
                            }
                            return true
                          })

                          if (validFiles.length === 0) {
                            e.target.value = ""
                            return
                          }

                          const newImages: string[] = []
                          let loadedCount = 0

                          validFiles.forEach((file) => {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              newImages.push(reader.result as string)
                              loadedCount++
                              if (loadedCount === validFiles.length) {
                                setEditMenuImage(newImages[0])
                                setEditMenuImages(prev => [...prev, ...newImages])
                              }
                            }
                            reader.readAsDataURL(file)
                          })
                        }
                      }}
                    />
                    {editMenuImages && editMenuImages.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-2">
                        {editMenuImages.map((img, idx) => (
                          <div key={idx} className="relative h-14 w-14 border rounded-md overflow-hidden bg-neutral-50 shrink-0">
                            <img src={img} alt="preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editMenuImages.filter((_, i) => i !== idx)
                                setEditMenuImage(updated[0] || "")
                                setEditMenuImages(updated)
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
                </div>
              )}

              {/* Tab: Availability & Scheduling */}
              {activeEditTab === "availability" && (
                <div className="space-y-4 animate-in fade-in duration-200 bg-[#f5f5e6]/20 p-4 border border-[#d2d2c4]/50 rounded-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block border-b pb-1">Service & Timing Settings</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {["dineIn", "takeaway", "pickup", "delivery"].map((field) => (
                      <label key={field} className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(editMenuExtra.availableFor as any)[field]}
                          onChange={(e) => setEditMenuExtra(prev => ({
                            ...prev,
                            availableFor: {
                              ...prev.availableFor,
                              [field]: e.target.checked
                            }
                          }))}
                          className="rounded accent-[#556B2F]"
                        />
                        <span className="capitalize">{field.replace("dineIn", "Dine In")}</span>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3 mt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Available Start Time</label>
                      <Input type="time" value={editMenuExtra.availableTimeStart} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, availableTimeStart: e.target.value }))} className="text-xs h-9 bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Available End Time</label>
                      <Input type="time" value={editMenuExtra.availableTimeEnd} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, availableTimeEnd: e.target.value }))} className="text-xs h-9 bg-white" />
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t pt-3">
                    <label className="text-xs font-bold text-neutral-700 block">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => {
                        const isSelected = editMenuExtra.availableDays.includes(day as any)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setEditMenuExtra(prev => {
                                const list = prev.availableDays.includes(day as any)
                                  ? prev.availableDays.filter(d => d !== day)
                                  : [...prev.availableDays, day as any]
                                return { ...prev, availableDays: list }
                              })
                            }}
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer border transition-all",
                              isSelected
                                ? "bg-[#556B2F] border-[#556B2F] text-white"
                                : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                            )}
                          >
                            {day.substring(0, 3)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Charges & Taxes */}
              {activeEditTab === "charges" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-[#f5f5e6]/20 p-4 border border-[#d2d2c4]/50 rounded-xl space-y-4">
                    {/* Tax Settings */}
                    <div className="flex items-center justify-between border-b pb-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editMenuExtra.tax.applicable}
                          onChange={(e) => setEditMenuExtra(prev => ({ ...prev, tax: { ...prev.tax, applicable: e.target.checked } }))}
                          className="rounded accent-[#556B2F]"
                        />
                        <span>Tax Applicable</span>
                      </label>
                      {editMenuExtra.tax.applicable && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-600 font-medium">Percentage (%):</span>
                          <Input type="number" value={editMenuExtra.tax.percentage} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, tax: { ...prev.tax, percentage: Number(e.target.value) || 0 } }))} className="w-16 h-8 text-xs bg-white text-center" />
                        </div>
                      )}
                    </div>

                    {/* Service Charge Settings */}
                    <div className="flex items-center justify-between border-b pb-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editMenuExtra.serviceCharge.applicable}
                          onChange={(e) => setEditMenuExtra(prev => ({ ...prev, serviceCharge: { ...prev.serviceCharge, applicable: e.target.checked } }))}
                          className="rounded accent-[#556B2F]"
                        />
                        <span>Service Charge Applicable</span>
                      </label>
                      {editMenuExtra.serviceCharge.applicable && (
                        <div className="flex items-center gap-2">
                          <Select value={editMenuExtra.serviceCharge.type} onValueChange={(val: any) => setEditMenuExtra(prev => ({ ...prev, serviceCharge: { ...prev.serviceCharge, type: val } }))}>
                            <SelectTrigger className="h-8 text-xs bg-white w-28">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Flat (₹)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="number" value={editMenuExtra.serviceCharge.value} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, serviceCharge: { ...prev.serviceCharge, value: Number(e.target.value) || 0 } }))} className="w-16 h-8 text-xs bg-white text-center" />
                        </div>
                      )}
                    </div>

                    {/* Packing Charge Settings */}
                    <div className="flex items-center justify-between pb-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editMenuExtra.packingCharge.applicable}
                          onChange={(e) => setEditMenuExtra(prev => ({ ...prev, packingCharge: { ...prev.packingCharge, applicable: e.target.checked } }))}
                          className="rounded accent-[#556B2F]"
                        />
                        <span>Packaging Charges Applicable</span>
                      </label>
                      {editMenuExtra.packingCharge.applicable && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-600 font-medium">Amount (₹):</span>
                          <Input type="number" value={editMenuExtra.packingCharge.amount} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, packingCharge: { ...prev.packingCharge, amount: Number(e.target.value) || 0 } }))} className="w-16 h-8 text-xs bg-white text-center" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Stock & Settings */}
              {activeEditTab === "inventory" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#f5f5e6]/25 p-4 border border-[#d2d2c4]/50 rounded-xl">
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={editMenuExtra.isFeatured} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, isFeatured: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Featured</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={editMenuExtra.isRecommended} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, isRecommended: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Recommended</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={editMenuExtra.isBestSeller} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, isBestSeller: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Bestseller</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={editMenuExtra.isHidden} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, isHidden: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Hide from menu</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={editMenuExtra.isOutOfStock} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, isOutOfStock: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Out of Stock</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={editMenuExtra.autoOutOfStock} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, autoOutOfStock: e.target.checked }))} className="rounded accent-[#556B2F]" />
                      <span>Auto Out of Stock</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3 mt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Quantity Available</label>
                      <Input type="number" placeholder="Infinity" value={editMenuExtra.quantityAvailable} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, quantityAvailable: e.target.value === "" ? "" : Number(e.target.value) }))} className="text-xs h-9 bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">SKU / Item Code</label>
                      <Input placeholder="e.g. SKU-1234" value={editMenuExtra.itemCode} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, itemCode: e.target.value }))} className="text-xs h-9 bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Display Order</label>
                      <Input type="number" value={editMenuExtra.displayOrder} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, displayOrder: Number(e.target.value) || 0 }))} className="text-xs h-9 bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Allergens (Comma separated)</label>
                      <Input placeholder="e.g. Nuts, Dairy" value={editMenuExtra.allergens} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, allergens: e.target.value }))} className="text-xs h-9 bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Special Instructions</label>
                      <Input placeholder="e.g. Medium spicy" value={editMenuExtra.specialInstructions} onChange={(e) => setEditMenuExtra(prev => ({ ...prev, specialInstructions: e.target.value }))} className="text-xs h-9 bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Add-ons section */}
              {activeEditTab === "addons" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="font-bold text-sm text-[#2d3822]">Add-ons & Customizer Groups (Optional)</h4>

                  {/* List of currently added groups for this edited item */}
                  {editMenuModifiers.length > 0 && (
                    <div className="space-y-2.5">
                      {editMenuModifiers.map((group, idx) => (
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
                                setEditMenuModifiers(prev => prev.filter((_, i) => i !== idx))
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

                  {/* Inline group creator for Edit */}
                  <div className="bg-[#f5f5e6]/45 p-3 border border-[#d2d2c4] rounded-xl space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block border-b border-[#d2d2c4]/45 pb-0.5">
                      Add a New Add-on Group
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-600 block">Group Title</label>
                        <Input
                          placeholder="e.g. Choose Crust"
                          value={editMenuGroupName}
                          onChange={(e) => setEditMenuGroupName(e.target.value)}
                          className="border-[#d2d2c4] bg-white text-xs h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-600 block">Selection Constraint</label>
                        <Select value={editMenuSelectionType} onValueChange={(val: any) => setEditMenuSelectionType(val)}>
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
                      {editMenuModifierOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 p-1.5 bg-white border border-[#d2d2c4]/30 rounded-lg">
                          {editMenuModifierOptions.map((opt, idx) => (
                            <Badge key={idx} className="bg-[#556B2F]/10 text-[#556B2F] hover:bg-[#556B2F]/15 flex items-center gap-1 border-[#556B2F]/20 font-bold uppercase text-[9px] py-0">
                              {opt.name} (+₹{opt.price})
                              <button
                                type="button"
                                onClick={() => setEditMenuModifierOptions(prev => prev.filter((_, i) => i !== idx))}
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
                          value={editMenuOptionName}
                          onChange={(e) => setEditMenuOptionName(e.target.value)}
                          className="border-[#d2d2c4] bg-white text-xs h-8 flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Price (e.g. 50)"
                          value={editMenuOptionPrice}
                          onChange={(e) => setEditMenuOptionPrice(e.target.value)}
                          onKeyDown={preventNonNumeric}
                          className="border-[#d2d2c4] bg-white text-xs h-8 w-32"
                        />
                        <Button
                          size="xs"
                          variant="outline"
                          className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5 h-8 font-bold"
                          onClick={() => {
                            if (!editMenuOptionName.trim()) {
                              Swal.fire("Error", "Option name is required.", "error")
                              return
                            }
                            const price = parseFloat(editMenuOptionPrice) || 0
                            setEditMenuModifierOptions(prev => [...prev, { name: editMenuOptionName.trim(), price }])
                            setEditMenuOptionName("")
                            setEditMenuOptionPrice("")
                          }}
                        >
                          + Option
                        </Button>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-[#556B2F] hover:bg-[#405223] text-white text-xs"
                      onClick={async () => {
                        if (!editMenuGroupName.trim()) {
                          Swal.fire("Error", "Modifier group name is required.", "error")
                          return
                        }
                        if (editMenuModifierOptions.length === 0) {
                          Swal.fire("Error", "Please add at least one option to the group.", "error")
                          return
                        }
                        const createdGroup = await handleAddModifierGroup(editMenuGroupName.trim(), editMenuSelectionType, editMenuModifierOptions)
                        if (createdGroup) {
                          setEditMenuModifiers(prev => [...prev, createdGroup])
                          setEditMenuGroupName("")
                          setEditMenuModifierOptions([])
                          Swal.fire("Linked!", `Customizer group "${createdGroup.name}" created and linked successfully.`, "success")
                        }
                      }}
                    >
                      Attach Group to Dish
                    </Button>
                  </div>
                </div>
              )}

            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" className="border-neutral-300 text-neutral-600" onClick={() => setEditingMenuItem(null)}>
                Cancel
              </Button>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white flex items-center justify-center gap-1.5" onClick={handleSaveEdit} disabled={isSavingEditMenu}>
                {isSavingEditMenu ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Menu Item Details Dialog Modal */}
      {showMenuDetailsModal && (
        <Dialog open={!!showMenuDetailsModal} onOpenChange={(open) => !open && setShowMenuDetailsModal(null)}>
          <DialogContent className="bg-[#FFFFF0] border border-[#d2d2c4] max-w-[80vw] w-[80vw] sm:max-w-4xl md:max-w-5xl lg:max-w-[80vw] overflow-y-auto max-h-[90vh] no-scrollbar">
            <DialogHeader className="pr-8 pb-3 border-b border-[#d2d2c4]/40">
              <div className="flex justify-between items-center mr-6">
                <DialogTitle className="text-xl font-bold text-[#2d3822] flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-[#556B2F]" />
                  {showMenuDetailsModal.name}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      toggleMenuItemStatus(showMenuDetailsModal.id)
                      setShowMenuDetailsModal(prev => prev ? { ...prev, status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : null)
                    }}
                    className={cn(
                      "relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      showMenuDetailsModal.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
                    )}
                    role="switch"
                    aria-checked={showMenuDetailsModal.status === "ACTIVE"}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                        showMenuDetailsModal.status === "ACTIVE" ? "translate-x-4.5" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className="text-xs font-semibold text-neutral-600">
                    {showMenuDetailsModal.status === "ACTIVE" ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <DialogDescription className="text-xs text-neutral-500">
                Full specifications and availability status for this dish. Click on any image to view it full screen.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4 text-xs font-semibold text-neutral-600">
              {/* Top summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#d2d2c4]/60 p-3 rounded-lg">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Category</span>
                  <span className="text-sm font-black text-neutral-800 flex items-center">
                    {getCategoryIcon(showMenuDetailsModal.category)}
                    {showMenuDetailsModal.category}
                  </span>
                </div>
                <div className="bg-white border border-[#d2d2c4]/60 p-3 rounded-lg">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Price</span>
                  <span className="text-sm font-black text-[#556B2F]">₹{showMenuDetailsModal.price}</span>
                </div>
                <div className="bg-white border border-[#d2d2c4]/60 p-3 rounded-lg">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Food Type</span>
                  <span className="text-sm font-black text-neutral-800 capitalize">
                    {showMenuDetailsModal.foodType || "Veg"}
                  </span>
                </div>
                <div className="bg-white border border-[#d2d2c4]/60 p-3 rounded-lg">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Prep Time</span>
                  <span className="text-sm font-black text-neutral-800">{showMenuDetailsModal.preparationTime || 15} mins</span>
                </div>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Side: Images, Description, Tags, Stock details */}
                <div className="space-y-4">
                  {/* Images */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Dish Images (Click to zoom)</span>
                    {showMenuDetailsModal.images && showMenuDetailsModal.images.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {showMenuDetailsModal.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveFullImage(imgUrl)}
                            className="h-32 w-32 rounded-lg overflow-hidden border border-[#d2d2c4] shrink-0 bg-neutral-100 cursor-pointer hover:opacity-90 hover:border-[#556B2F] transition-all"
                          >
                            <img src={imgUrl} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : showMenuDetailsModal.image ? (
                      <div
                        onClick={() => setActiveFullImage(showMenuDetailsModal.image || null)}
                        className="w-full h-40 rounded-lg overflow-hidden border border-[#d2d2c4] bg-neutral-100 cursor-pointer hover:opacity-90 transition-all"
                      >
                        <img src={showMenuDetailsModal.image} alt={showMenuDetailsModal.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-neutral-400 italic">No image uploaded</div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="bg-white border border-[#d2d2c4]/40 p-3.5 rounded-xl">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Description</span>
                    <span className="text-neutral-800 font-medium leading-relaxed font-sans block">{showMenuDetailsModal.description || "No description provided."}</span>
                  </div>

                  {/* Settings tags/badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {showMenuDetailsModal.isFeatured && (
                      <Badge className="bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Featured
                      </Badge>
                    )}
                    {showMenuDetailsModal.isRecommended && (
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-blue-500 text-blue-500" /> Recommended
                      </Badge>
                    )}
                    {showMenuDetailsModal.isBestSeller && (
                      <Badge className="bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Flame className="h-3 w-3 fill-purple-500 text-purple-500" /> Bestseller
                      </Badge>
                    )}
                    {showMenuDetailsModal.isHidden && <Badge className="bg-red-100 text-red-800 border border-red-200">Hidden from menu</Badge>}
                  </div>

                  {/* Stock & Codes */}
                  <div className="bg-white border border-[#d2d2c4]/40 p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block border-b pb-1">Stock & Settings</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-400">Qty Available:</span>{" "}
                        <span className="text-neutral-800 font-bold">{showMenuDetailsModal.quantityAvailable ?? "Unlimited"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Auto Out of Stock:</span>{" "}
                        <span className="text-neutral-800 font-bold">{showMenuDetailsModal.autoOutOfStock ? "Yes" : "No"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">SKU / Item Code:</span>{" "}
                        <span className="text-neutral-800 font-bold">{showMenuDetailsModal.itemCode || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Display Order:</span>{" "}
                        <span className="text-neutral-800 font-bold">{showMenuDetailsModal.displayOrder ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Allergens & Instructions */}
                  <div className="bg-white border border-[#d2d2c4]/40 p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block border-b pb-1">Additional details</span>
                    <div>
                      <span className="text-neutral-400">Allergens:</span>{" "}
                      <span className="text-neutral-800 font-bold">{showMenuDetailsModal.allergens || "None declared"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Special Instructions:</span>{" "}
                      <span className="text-neutral-800 font-bold">{showMenuDetailsModal.specialInstructions || "None"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Availability, Charges & Taxes, Add-ons */}
                <div className="space-y-4">
                  {/* Availability */}
                  <div className="bg-white border border-[#d2d2c4]/40 p-3.5 rounded-xl space-y-3">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block border-b pb-1">Availability & Timings</span>

                    {/* Days */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-400 block">Available Days</span>
                      <div className="flex flex-wrap gap-1">
                        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => {
                          const active = showMenuDetailsModal.availableDays?.includes(day as any) ?? true;
                          return (
                            <span key={day} className={cn("px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border", active ? "bg-[#556B2F]/10 border-[#556B2F]/30 text-[#556B2F]" : "bg-neutral-50 border-neutral-200 text-neutral-400")}>
                              {day.substring(0, 3)}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Start Time</span>
                        <span className="text-neutral-800 font-bold">{showMenuDetailsModal.availableTimeStart || "00:00"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">End Time</span>
                        <span className="text-neutral-800 font-bold">{showMenuDetailsModal.availableTimeEnd || "23:59"}</span>
                      </div>
                    </div>

                    {/* Channels */}
                    <div className="pt-2 border-t border-dashed space-y-1">
                      <span className="text-[10px] text-neutral-400 block">Service Channels</span>
                      <div className="flex flex-wrap gap-1">
                        {showMenuDetailsModal.availableFor && Object.entries(showMenuDetailsModal.availableFor).map(([channel, active]) => (
                          <span key={channel} className={cn("px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border", active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-neutral-50 border-neutral-200 text-neutral-400")}>
                            {channel.replace("dineIn", "Dine In")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Charges & Taxes */}
                  <div className="bg-white border border-[#d2d2c4]/40 p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block border-b pb-1">Charges & Taxes</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Taxes:</span>
                        <span className="text-neutral-800 font-bold">
                          {showMenuDetailsModal.tax?.applicable ? `${showMenuDetailsModal.tax.percentage}%` : "Not Applicable"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Service Charge:</span>
                        <span className="text-neutral-800 font-bold">
                          {showMenuDetailsModal.serviceCharge?.applicable ? (
                            showMenuDetailsModal.serviceCharge.type === "percentage"
                              ? `${showMenuDetailsModal.serviceCharge.value}%`
                              : `₹${showMenuDetailsModal.serviceCharge.value} flat`
                          ) : "Not Applicable"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Packaging Charges:</span>
                        <span className="text-neutral-800 font-bold">
                          {showMenuDetailsModal.packingCharge?.applicable ? `₹${showMenuDetailsModal.packingCharge.amount}` : "Not Applicable"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="bg-white border border-[#d2d2c4]/40 p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block border-b pb-1">Add-ons & Modifiers</span>
                    {showMenuDetailsModal.modifierGroups && showMenuDetailsModal.modifierGroups.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {showMenuDetailsModal.modifierGroups.map((group) => (
                          <div key={group.id} className="p-2 bg-neutral-50/50 border border-neutral-200/50 rounded-lg space-y-1">
                            <div className="flex justify-between text-[10px] font-extrabold text-[#2d3822]">
                              <span>{group.name}</span>
                              <span className="text-[8px] uppercase font-bold text-neutral-400">{group.selectionType} choice</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {group.options.map((opt, oIdx) => (
                                <Badge key={oIdx} className="bg-white text-neutral-600 border border-neutral-200 text-[9px] py-0 px-1 font-semibold">
                                  {opt.name} {opt.price > 0 && `(+₹${opt.price})`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">No add-ons associated.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#d2d2c4]/40 mt-4 flex gap-2">
              <Button
                variant="outline"
                className="border-neutral-300 text-neutral-600 font-bold text-xs"
                onClick={() => setShowMenuDetailsModal(null)}
              >
                Close Details
              </Button>
              <Button
                className="bg-[#556B2F] hover:bg-[#405223] text-white font-bold text-xs"
                onClick={() => {
                  startEditing(showMenuDetailsModal)
                  setShowMenuDetailsModal(null)
                }}
              >
                Edit Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {activeFullImage && (
        <Dialog open={!!activeFullImage} onOpenChange={(open) => !open && setActiveFullImage(null)}>
          <DialogContent className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] bg-black/95 p-1 border-0 flex items-center justify-center overflow-hidden">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <div className="relative w-full max-h-[85vh] flex items-center justify-center">
              <img src={activeFullImage} alt="Full Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
              <button
                onClick={() => setActiveFullImage(null)}
                className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/85 rounded-full p-2.5 hover:scale-105 transition-all text-sm font-bold w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Custom Subcategories popup dialog */}
      {viewingSubCatsParent && (
        <Dialog open={!!viewingSubCatsParent} onOpenChange={() => setViewingSubCatsParent(null)}>
          <DialogContent className="bg-white max-w-xl sm:max-w-2xl md:max-w-3xl overflow-y-auto max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="text-base font-black text-[#2d3822] flex items-center gap-2">
                {renderCategoryIconComponent(viewingSubCatsParent.icon, "h-5 w-5 text-[#556B2F]")}
                <span>Subcategories of {viewingSubCatsParent.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-neutral-400">
                Manage, edit, or delete linked sub-categories.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Quick Add Subcategory Form */}
              <div className="bg-[#f5f5e6]/30 p-3 border border-[#d2d2c4]/50 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Add New Subcategory</span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-600 block">Subcategory Name</label>
                  <Input
                    placeholder="e.g. Thin Crust Pizzas"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="border-[#d2d2c4] bg-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-600 block">Subcategory Icon Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="border-[#d2d2c4] bg-white text-xs h-9 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 3 * 1024 * 1024) {
                          Swal.fire({
                            title: "File Too Large",
                            text: "Subcategory icon image must be smaller than 3MB.",
                            icon: "warning",
                            confirmButtonColor: "#556B2F"
                          })
                          e.target.value = ""
                          return
                        }
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setNewCatIcon(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  {newCatIcon && newCatIcon.startsWith("data:image") && (
                    <div className="flex items-center gap-2 pt-1">
                      <img src={newCatIcon} alt="Selected Icon" className="h-8 w-8 object-contain border border-[#d2d2c4] rounded-md bg-white" />
                      <button
                        type="button"
                        onClick={() => setNewCatIcon("")}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  className="bg-[#556B2F] hover:bg-[#405223] text-white text-xs h-9 font-bold w-full"
                  disabled={isCreatingSubCat}
                  onClick={async () => {
                    if (!newCatName.trim()) {
                      Swal.fire("Error", "Name is required.", "error")
                      return
                    }
                    setIsCreatingSubCat(true)
                    try {
                      const success = await handleAddCategory(newCatName.trim(), newCatIcon.trim(), viewingSubCatsParent.id)
                      if (success) {
                        setNewCatName("")
                        setNewCatIcon("")
                        Swal.fire("Success", "Subcategory added!", "success")
                        // Refresh parent view
                        const updatedParent = categories.find(p => p.id === viewingSubCatsParent.id);
                        if (updatedParent) {
                          setViewingSubCatsParent(updatedParent);
                        }
                      }
                    } catch (err) {
                      console.error(err)
                    } finally {
                      setIsCreatingSubCat(false)
                    }
                  }}
                >
                  {isCreatingSubCat ? "Adding..." : "Add Subcategory"}
                </Button>
              </div>

              {/* List of Subcategories */}
              <div className="grid gap-2 grid-cols-2 max-h-64 overflow-y-auto pr-1">
                {categories.filter(sub => sub.parentId === viewingSubCatsParent.id).length === 0 ? (
                  <div className="text-xs text-neutral-400 italic text-center py-4 col-span-2">No subcategories found.</div>
                ) : (
                  categories.filter(sub => sub.parentId === viewingSubCatsParent.id).map(sub => {
                    const subDishesCount = menuItems.filter(m => m.category === sub.name).length;
                    return (
                      <Card
                        key={`sub-list-item-${sub.id}`}
                        className={cn(
                          "border bg-white transition-all p-2 flex flex-col justify-between min-h-[70px] text-xs shadow-xs",
                          sub.status === "ACTIVE" ? "border-[#d2d2c4]" : "border-dashed border-neutral-200 opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <div className="h-6 w-6 rounded-md bg-[#556B2F]/10 flex items-center justify-center border border-[#556B2F]/20 shrink-0">
                              {renderCategoryIconComponent(sub.icon, "h-3.5 w-3.5 text-[#556B2F]")}
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-bold text-neutral-700 block line-clamp-1 leading-tight text-[11px]">{sub.name}</span>
                              <span className="text-[9px] text-neutral-400 font-semibold">{subDishesCount} Dishes</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => handleToggleCategoryStatus(sub.id)}
                              className={cn(
                                "relative inline-flex h-3.5 w-6.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none align-middle self-center",
                                sub.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
                              )}
                              role="switch"
                              aria-checked={sub.status === "ACTIVE"}
                              title={sub.status === "ACTIVE" ? "Active" : "Inactive"}
                            >
                              <span
                                className={cn(
                                  "pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out absolute top-[1px] left-[1px]",
                                  sub.status === "ACTIVE" ? "translate-x-3" : "translate-x-0"
                                )}
                              />
                            </button>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="h-5 w-5 p-0 text-neutral-500 hover:text-neutral-700"
                              onClick={() => {
                                setEditingCategory(sub);
                                setEditCatName(sub.name);
                                setEditCatIcon(sub.icon);
                                setEditCatParentId(sub.parentId || "main");
                              }}
                            >
                              <Settings className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="h-5 w-5 p-0 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                Swal.fire({
                                  title: "Delete Subcategory?",
                                  text: `Are you sure you want to delete "${sub.name}"?`,
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#d33",
                                  cancelButtonColor: "#556B2F",
                                  confirmButtonText: "Yes, delete",
                                }).then(async (result) => {
                                  if (result.isConfirmed) {
                                    const success = await handleDeleteCategory(sub.id)
                                    if (success) {
                                      Swal.fire("Deleted", "Subcategory removed.", "success")
                                      const updatedParent = categories.find(p => p.id === viewingSubCatsParent.id);
                                      if (updatedParent) {
                                        setViewingSubCatsParent(updatedParent);
                                      }
                                    }
                                  }
                                })
                              }}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Custom Edit Category dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-black text-[#2d3822]">Edit Category</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-neutral-400">
                Modify category details and parent relation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-600 block">Category Name</label>
                  <Input
                    placeholder="e.g. Italian Pizzas"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="border-[#d2d2c4] bg-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-600 block">Icon Name or Image URL</label>
                  <Input
                    placeholder="e.g. pizza, salad, coffee, cake, or an image link"
                    value={editCatIcon}
                    onChange={(e) => setEditCatIcon(e.target.value)}
                    className="border-[#d2d2c4] bg-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-600 block">Parent Category</label>
                  <Select value={editCatParentId || "main"} onValueChange={setEditCatParentId}>
                    <SelectTrigger className="border-[#d2d2c4] bg-white text-xs h-9 w-full">
                      <SelectValue placeholder="Parent Cat" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="main">None (Main Category)</SelectItem>
                      {categories
                        .filter(c => (!c.parentId || c.parentId === "main" || c.parentId === "") && c.id !== editingCategory.id)
                        .map(c => (
                          <SelectItem key={`edit-parent-opt-${c.id}`} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="bg-[#556B2F] hover:bg-[#405223] text-white w-full text-xs h-9 font-bold"
                onClick={handleSaveCategoryEdit}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* See All Categories Dialog Modal with full CRUD */}
      {showAllCategoriesDialog && (
        <Dialog open={showAllCategoriesDialog} onOpenChange={setShowAllCategoriesDialog}>
          <DialogContent className="bg-[#FFFFF0] border border-[#d2d2c4] max-w-[90vw] w-[90vw] sm:max-w-4xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <DialogHeader className="pb-3 border-b border-[#d2d2c4]/40">
              <DialogTitle className="text-lg font-bold text-[#2d3822] flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#556B2F]" />
                <span>All Categories ({categories.filter(c => !c.parentId).length})</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 font-semibold">
                Search, update, toggle status or delete your food categories.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Search categories by name..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="pl-10 border-[#d2d2c4] bg-white w-full text-xs h-9"
                />
              </div>

              {/* Categories Grid inside Dialog */}
              {(() => {
                const filtered = categories
                  .filter(c => !c.parentId)
                  .filter(c => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()));

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10 bg-white border border-[#d2d2c4] rounded-xl">
                      <Layers className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400 font-bold italic">No matching categories found.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                    {filtered.map(parent => {
                      const subCats = categories.filter(sub => sub.parentId === parent.id);
                      const totalDishes = menuItems.filter(m => m.category === parent.name || subCats.some(sub => m.category === sub.name)).length;

                      return (
                        <Card
                          key={`mgr-all-card-${parent.id}`}
                          className={cn(
                            "border bg-white transition-all p-3 relative overflow-hidden flex flex-col justify-between min-h-[120px]",
                            parent.status === "ACTIVE" ? "border-[#d2d2c4]" : "border-dashed border-neutral-200 opacity-60"
                          )}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-[#556B2F]/10 flex items-center justify-center border border-[#556B2F]/20 shrink-0">
                                  {renderCategoryIconComponent(parent.icon, "h-4 w-4 text-[#556B2F]")}
                                </div>
                                <div className="overflow-hidden">
                                  <h4 className="text-xs font-bold text-neutral-800 line-clamp-1 leading-tight">{parent.name}</h4>
                                  <span className="text-[9px] text-neutral-400 font-semibold">{totalDishes} Dishes</span>
                                </div>
                              </div>

                              {/* CRUD Controls */}
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                                  onClick={() => {
                                    setEditingCategory(parent);
                                    setEditCatName(parent.name);
                                    setEditCatIcon(parent.icon);
                                    setEditCatParentId(parent.parentId || "main");
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                                <button
                                  onClick={() => handleToggleCategoryStatus(parent.id)}
                                  className={cn(
                                    "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none align-middle self-center mx-1",
                                    parent.status === "ACTIVE" ? "bg-[#556B2F]" : "bg-neutral-300"
                                  )}
                                  role="switch"
                                  aria-checked={parent.status === "ACTIVE"}
                                  title={parent.status === "ACTIVE" ? "Active" : "Inactive"}
                                >
                                  <span
                                    className={cn(
                                      "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out absolute top-[2px] left-[2px]",
                                      parent.status === "ACTIVE" ? "translate-x-3" : "translate-x-0"
                                    )}
                                  />
                                </button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    Swal.fire({
                                      title: "Delete Category?",
                                      text: `Are you sure you want to delete "${parent.name}"? This won't delete items, but their category association might be affected.`,
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonColor: "#d33",
                                      cancelButtonColor: "#556B2F",
                                      confirmButtonText: "Yes, delete",
                                    }).then(async (result) => {
                                      if (result.isConfirmed) {
                                        const success = await handleDeleteCategory(parent.id)
                                        if (success) {
                                          Swal.fire("Deleted", "Category has been removed.", "success")
                                        }
                                      }
                                    })
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Subcategories section */}
                            <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                              <span className="text-[9px] text-neutral-400 font-semibold">{subCats.length} Sub-categories</span>
                              <Button
                                size="xs"
                                variant="link"
                                className="text-[#556B2F] font-bold text-[9px] h-auto p-0 hover:underline"
                                onClick={() => {
                                  setViewingSubCatsParent(parent);
                                }}
                              >
                                See Subcategories →
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <DialogFooter>
              <Button className="bg-[#556B2F] hover:bg-[#405223] text-white font-bold text-xs" onClick={() => setShowAllCategoriesDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
