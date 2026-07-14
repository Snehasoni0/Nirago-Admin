"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import Swal from "sweetalert2"

// Types based on the API Contract
export interface ModifierGroup {
  id: string
  name: string
  selectionType: "SINGLE" | "MULTIPLE"
  options: { name: string; price: number }[]
}

export interface Outlet {
  id: string
  name: string
  address: string
  status: "ACTIVE" | "INACTIVE"
  contact: string
  image?: string
  deliveryEnabled?: boolean
  deliveryCharge?: number
  minFreeDelivery?: number
  estimatedDeliveryTime?: string
  paymentStatus?: "ACTIVE" | "INACTIVE" | "PENDING"
  merchantId?: string
  transactionId?: string
  allowedPaymentMethods?: string[]
  overrideGst?: number
  overridePackagingCharge?: number
  overrideDeliveryFee?: number
  overrideStoreTimings?: string
  overrideCod?: boolean
  overrideMaintenance?: boolean
  overrideVat?: number
  overrideLocalLevies?: number
  overrideDeliveryPerKm?: number
  overrideUseDistancePricing?: boolean
  latitude?: number
  longitude?: number
}

export interface MenuItem {
  id: string
  name: string
  category: string
  categoryId?: string
  price: number
  status: "ACTIVE" | "INACTIVE"
  description: string
  image?: string
  images?: string[]
  modifierGroups?: ModifierGroup[]
}

export interface Order {
  id: string
  customerName: string
  customerPhone?: string
  customerAddress?: string
  items: string
  structuredItems?: {
    name: string
    price: number
    quantity: number
    addOns?: string[]
  }[]
  subtotal?: number
  gst?: number
  packagingCharge?: number
  deliveryCharge?: number
  discount?: number
  total: number
  paymentMethod: "CASH" | "CARD" | "UPI"
  paymentStatus?: "PAID" | "PENDING" | "FAILED"
  fulfillmentType?: "DELIVERY" | "PICKUP"
  status: "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REJECTED"
  estimatedMinutes?: number
  deliveryStaff?: string
  outlet: string
  specialInstructions?: string
  deliveryDate?: string
  transactionId?: string
  cancellationReason?: string
  dbId?: string
  orderNumber?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  walletBalance: number
  membership: string
  status: "ACTIVE" | "BLOCKED"
  createdDate?: string
  orderVolume?: number
  lifetimeValue?: number
  address?: string
}

export interface LoyaltyTier {
  id: string
  name: string
  discountPercent: number
  minDeposit: number
  status: "ACTIVE" | "INACTIVE"
}

export interface DeliveryStaff {
  id: string
  name: string
  phone: string
  status: "ACTIVE" | "INACTIVE"
  assignedOutlet?: string
}

export interface Coupon {
  id: string
  code: string
  discount: string
  discountType: "PERCENT" | "FLAT"
  discountValue: number
  minOrder: number
  status: "ACTIVE" | "INACTIVE"
  applicableOutlets: "ALL" | string[]
  validFrom?: string
  validTill?: string
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  password?: string
  role: string
  roleId?: string
  status: "ACTIVE" | "INACTIVE"
  assignedOutlet?: string
  outletId?: string
}

export interface Role {
  _id: string
  name: string
  permissions: string[]
  description: string
}

export interface GlobalRules {
  gst: number
  vat: number
  localLevies: number
  packagingCharge: number
  deliveryChargeBase: number
  deliveryPerKm: number
  useDistancePricing: boolean
  storeTimings: string
  cashOnDelivery: boolean
  maintenanceMode: boolean
}

export interface SystemNotification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: 'order' | 'system' | 'wallet' | 'outlet'
}

interface DashboardContextType {
  outlets: Outlet[]
  setOutlets: React.Dispatch<React.SetStateAction<Outlet[]>>
  menuItems: MenuItem[]
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>
  categories: { id: string; name: string; status: string; icon: string }[]
  setCategories: React.Dispatch<React.SetStateAction<{ id: string; name: string; status: string; icon: string }[]>>
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  customers: Customer[]
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>
  deliveryStaff: DeliveryStaff[]
  setDeliveryStaff: React.Dispatch<React.SetStateAction<DeliveryStaff[]>>
  coupons: Coupon[]
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>
  auditLogs: AuditLog[]
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>
  adminUsers: AdminUser[]
  setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>
  globalRules: GlobalRules
  setGlobalRules: React.Dispatch<React.SetStateAction<GlobalRules>>
  notifications: SystemNotification[]
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>
  loyaltyTiers: LoyaltyTier[]
  setLoyaltyTiers: React.Dispatch<React.SetStateAction<LoyaltyTier[]>>
  addLog: (action: string, details: string) => void
  handleAddOutlet: (
    name: string,
    address: string,
    contact?: string,
    deliveryEnabled?: boolean,
    deliveryCharge?: number,
    minFreeDelivery?: number,
    estimatedDeliveryTime?: string,
    paymentStatus?: "ACTIVE" | "INACTIVE" | "PENDING",
    merchantId?: string,
    transactionId?: string,
    allowedPaymentMethods?: string[],
    latitude?: number,
    longitude?: number
  ) => Promise<{ success: boolean; id?: string; message?: string; errors?: any }>
  updateOutlet: (id: string, updated: Partial<Outlet>) => Promise<boolean>
  handleDeleteOutlet: (id: string) => Promise<boolean>
  handleAddMenuItem: (name: string, category: string, price: number, description?: string, image?: string, modifierGroups?: ModifierGroup[], images?: string[]) => Promise<boolean>
  handleUpdateMenuItem: (id: string, updated: Partial<MenuItem>) => Promise<boolean>
  handleDeleteMenuItem: (id: string) => Promise<boolean>
  handleAddCoupon: (code: string, discount: string, discountType: "PERCENT" | "FLAT", discountValue: number, minOrder: number, applicableOutlets: "ALL" | string[], validFrom?: string, validTill?: string) => Promise<boolean>
  handleDeleteCoupon: (id: string) => Promise<boolean>
  handleUpdateCoupon: (id: string, updated: Partial<Coupon>) => Promise<boolean>
  handleAddAdminUser: (name: string, email: string, password?: string, role?: AdminUser["role"], assignedOutlet?: string) => void
  handleUpdateAdminUser: (id: string, updated: Partial<AdminUser>) => Promise<boolean>
  handleAddDeliveryStaff: (name: string, phone: string, email: string, password?: string, assignedOutlet?: string) => void
  handleUpdateDeliveryStaff: (id: string, updated: Partial<DeliveryStaff>) => void
  toggleOutletStatus: (id: string) => void
  toggleMenuItemStatus: (id: string) => Promise<void> | void
  toggleCouponStatus: (id: string) => Promise<boolean>
  toggleCustomerStatus: (id: string) => void
  updateOrderStatus: (orderId: string, nextStatus: Order["status"], cancellationReason?: string) => void
  updateOrderPayment: (orderId: string, status: "PAID" | "PENDING" | "FAILED", transactionId?: string) => void
  assignStaffToOrder: (orderId: string, staffName: string) => void
  setOrderEstTime: (orderId: string, minutes: number) => void
  handleWalletTransaction: (customerId: string, amount: number, type: "CREDIT" | "DEBIT") => void
  updateGlobalSettings: (field: keyof GlobalRules, value: any) => void
  persistGlobalSettings: () => Promise<boolean>
  handleDeleteStaffUser: (id: string) => Promise<boolean>
  handleUpdateStaffRole: (id: string, newRole: AdminUser["role"], assignedOutlet?: string) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  deleteNotification: (id: string) => void
  handleAddLoyaltyTier: (name: string, discountPercent: number, minDeposit: number) => void
  toggleLoyaltyTierStatus: (id: string) => void
  handleCustomerDeposit: (customerId: string, amount: number) => void
  handleAssignCustomerTier: (customerId: string, tierName: string) => void
  handleAddCategory: (name: string, icon: string) => Promise<boolean>
  handleDeleteCategory: (id: string) => Promise<boolean>
  handleToggleCategoryStatus: (id: string) => Promise<boolean>
  handleUpdateItemModifiers: (itemId: string, groups: ModifierGroup[]) => Promise<boolean>
  handleAddModifierGroup: (name: string, selectionType: "SINGLE" | "MULTIPLE", options: { name: string; price: number }[]) => Promise<ModifierGroup | null>
  roles: Role[]
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>
  fetchRoles: () => Promise<void>
  handleCreateRole: (name: string, permissions: string[], description: string) => Promise<boolean>
  handleDeleteRole: (id: string) => Promise<boolean>
  handleUpdateRole: (id: string, permissions: string[]) => Promise<boolean>
  fetchOrders: (outletId?: string) => Promise<void>
  fetchOutletSettings: (outletId: string) => Promise<boolean>
  persistOutletSettings: (outletId: string) => Promise<boolean>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])

  const [outlets, setOutlets] = useState<Outlet[]>([])

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  const [categories, setCategories] = useState<{ id: string; name: string; status: string; icon: string }[]>([])

  const [orders, setOrders] = useState<Order[]>([])

  const [customers, setCustomers] = useState<Customer[]>([])

  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>([])

  const [coupons, setCoupons] = useState<Coupon[]>([])

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])

  const [globalRules, setGlobalRules] = useState<GlobalRules>({
    gst: 5,
    vat: 12,
    localLevies: 2,
    packagingCharge: 30,
    deliveryChargeBase: 40,
    deliveryPerKm: 10,
    useDistancePricing: false,
    storeTimings: "09:00 AM - 11:00 PM",
    cashOnDelivery: true,
    maintenanceMode: false,
  })

  const [notifications, setNotifications] = useState<SystemNotification[]>([])

  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([
    { id: "1", name: "BRONZE", discountPercent: 5, minDeposit: 500, status: "ACTIVE" },
    { id: "2", name: "SILVER", discountPercent: 10, minDeposit: 1500, status: "ACTIVE" },
    { id: "3", name: "GOLD", discountPercent: 15, minDeposit: 3000, status: "ACTIVE" },
    { id: "4", name: "PREMIUM", discountPercent: 20, minDeposit: 5000, status: "ACTIVE" },
  ])

  // Sync delivery staff list dynamically from active database users (adminUsers) and roles
  useEffect(() => {
    const deliveryRoleIds = roles
      .filter(r => {
        const name = r.name.toLowerCase();
        return name === "delivery staff" || name === "delivery riders" || name === "delivery rider";
      })
      .map(r => r._id);

    const derived = adminUsers.filter(u => {
      const userRoleLower = (u.role || "").toLowerCase();
      return (
        userRoleLower === "delivery staff" ||
        userRoleLower === "delivery riders" ||
        userRoleLower === "delivery rider" ||
        deliveryRoleIds.includes(u.role)
      );
    }).map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone || "",
      status: u.status || "ACTIVE",
      assignedOutlet: u.assignedOutlet || ""
    }));

    setDeliveryStaff(derived);
  }, [adminUsers, roles]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLoyaltyTiers = localStorage.getItem("nirago_loyalty_tiers")
      if (savedLoyaltyTiers) {
        setLoyaltyTiers(JSON.parse(savedLoyaltyTiers))
      } else {
        localStorage.setItem("nirago_loyalty_tiers", JSON.stringify(loyaltyTiers))
      }
    }
  }, [])



  // User state is synced via backend API

  useEffect(() => {
    if (typeof window !== "undefined" && loyaltyTiers.length > 0) {
      localStorage.setItem("nirago_loyalty_tiers", JSON.stringify(loyaltyTiers))
    }
  }, [loyaltyTiers])

  useEffect(() => {
    if (typeof window !== "undefined" && customers.length > 0) {
      localStorage.setItem("nirago_customers", JSON.stringify(customers))
    }
  }, [customers])

  useEffect(() => {
    if (typeof window !== "undefined" && deliveryStaff.length > 0) {
      localStorage.setItem("nirago_delivery_staff", JSON.stringify(deliveryStaff))
    }
  }, [deliveryStaff])

  // Disable auto-save to localStorage for testing purposes (resets orders on refresh)
  // useEffect(() => {
  //   if (typeof window !== "undefined" && orders.length > 0) {
  //     localStorage.setItem("nirago_orders", JSON.stringify(orders))
  //   }
  // }, [orders])



  useEffect(() => {
    if (typeof window !== "undefined" && globalRules) {
      localStorage.setItem("nirago_global_rules", JSON.stringify(globalRules))
    }
  }, [globalRules])

  // Add Log Helper
  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: "admin@nirago.com",
      action,
      details
    }
    setAuditLogs(prev => [newLog, ...prev])
  }

  const fetchOutlets = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/outlets?page=1&limit=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const outletsArray = Array.isArray(data.data) ? data.data : (data.data.docs || data.data.outlets || []);
          const mappedOutlets = outletsArray.map((o: any) => ({
            id: o._id || o.id,
            name: o.name,
            address: o.address,
            contact: o.phone || "",
            status: o.status === "active" ? "ACTIVE" : (o.status === "inactive" ? "INACTIVE" : o.status || "ACTIVE"),
            image: o.image || "",
            deliveryEnabled: o.offersDelivery ?? true,
            deliveryCharge: o.deliveryCharge ?? 40,
            minFreeDelivery: o.minOrderForFreeDelivery ?? 0,
            estimatedDeliveryTime: o.estimatedDeliveryTime || "",
            paymentStatus: o.paymentStatus || "ACTIVE",
            merchantId: o.merchantId || "",
            transactionId: o.transactionId || "",
            allowedPaymentMethods: o.allowedPaymentMethods || ["CASH", "UPI", "CARD"],
            latitude: o.location?.coordinates?.[1] ?? o.latitude,
            longitude: o.location?.coordinates?.[0] ?? o.longitude,
            code: o.code || "",
            city: o.city || "",
            state: o.state || "",
            pincode: o.pincode || "",
            email: o.email || "",
            openingTime: o.openingTime || "",
            closingTime: o.closingTime || ""
          }));
          setOutlets(mappedOutlets);
          prefetchAllOutletSettings(mappedOutlets);
        }
      }
    } catch (err) {
      console.error("Failed to fetch outlets API:", err);
    }
  }

  const prefetchAllOutletSettings = async (outletsList: Outlet[]) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return;

      const activeOutlets = outletsList.filter(o => o.status === "ACTIVE");

      // Fetch all outlet settings in parallel in the background
      await Promise.all(activeOutlets.map(async (o) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/outlet-settings/${o.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            const s = data.data;
            setOutlets(prev => prev.map(item => {
              if (item.id === o.id) {
                return {
                  ...item,
                  overrideGst: s.baseGstRate,
                  overrideVat: s.vatRate,
                  overrideLocalLevies: s.localLeviesRate,
                  overridePackagingCharge: s.packagingFee,
                  overrideDeliveryFee: s.baseDeliveryRate,
                  overrideDeliveryPerKm: s.perKmMultiplierRate,
                  overrideUseDistancePricing: s.distanceBasedPricing,
                  overrideStoreTimings: s.storeOpeningTime && s.storeClosingTime ? `${s.storeOpeningTime} - ${s.storeClosingTime}` : undefined,
                  overrideCod: s.codEnabled,
                  overrideMaintenance: s.maintenanceMode
                };
              }
              return item;
            }));
          }
        } catch (err) {
          // Quietly ignore network or initialization errors for non-existent settings
        }
      }));
    } catch (err) {
      console.error("Failed to prefetch outlet settings:", err);
    }
  }

  const fetchRoles = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles?page=1&limit=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const rolesArray = Array.isArray(data.data) ? data.data : (data.data.docs || data.data.roles || []);
          setRoles(rolesArray);
        }
      }
    } catch (err) {
      console.error("Failed to fetch roles API:", err);
    }
  }

  const fetchUsers = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user?page=1&limit=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const usersArray = data.success ? (Array.isArray(data.data) ? data.data : (data.data.docs || data.data.users || [])) : [];
        if (usersArray.length > 0) {
          const mappedUsers = usersArray.map((u: any) => ({
            id: u._id || u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            password: "",
            role: u.role?.name || (typeof u.roleId === 'object' ? u.roleId?.name : u.roleId) || "Manager",
            roleId: typeof u.roleId === 'object' ? u.roleId?._id : (u.roleId || undefined),
            status: u.status ? u.status.toUpperCase() : "ACTIVE",
            assignedOutlet: u.outlet?.name || (typeof u.outletId === 'object' ? u.outletId?.name : u.outletId) || "",
            outletId: typeof u.outletId === 'object' ? u.outletId?._id : (u.outletId || undefined)
          }));
          setAdminUsers(mappedUsers);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users API:", err);
    }
  }

  const fetchCategories = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories?page=1&limit=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const categoriesArray = Array.isArray(data.data) ? data.data : (data.data.docs || data.data.categories || []);
          const mapped = categoriesArray.map((c: any) => ({
            id: c._id || c.id,
            name: c.name,
            status: c.status === "active" ? "ACTIVE" : "INACTIVE",
            icon: c.icon || "salad"
          }));
          setCategories(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories API:", err);
    }
  }

  const fetchMenuItems = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/menu-items?page=1&limit=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("FETCH MENU ITEMS API RESPONSE DATA:", data);
        if (data.success && data.data) {
          const itemsArray = Array.isArray(data.data) ? data.data : (data.data.docs || data.data.menuItems || []);
          const mapped = itemsArray.map((m: any) => ({
            id: m._id || m.id,
            name: m.name,
            category: m.categoryId?.name || m.category || "Main Course",
            price: m.price || 0,
            status: m.status === "active" ? "ACTIVE" : "INACTIVE",
            description: m.description || "",
            image: Array.isArray(m.image) ? m.image[0] : (m.image || ""),
            images: Array.isArray(m.image) ? m.image : [m.image || ""],
            modifierGroups: (m.modifierGroupIds && m.modifierGroupIds.length > 0)
              ? m.modifierGroupIds.map((g: any) => typeof g === "object" ? {
                id: g._id || g.id,
                name: g.name,
                selectionType: g.selectionType === "multiple" ? "MULTIPLE" : "SINGLE",
                options: g.options || []
              } : { id: g, name: `Group #${g}`, selectionType: "SINGLE", options: [] })
              : (m.modifierGroups || []),
            categoryId: typeof m.categoryId === "object" ? m.categoryId?._id : m.categoryId
          }));
          setMenuItems(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch menu items API:", err);
    }
  }

  const fetchCoupons = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coupons?page=1&limit=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response fetching coupons:", resText);
          return;
        }
        const couponsArray = data.success ? (Array.isArray(data.data) ? data.data : (data.data.docs || data.data.coupons || [])) : [];
        const mapped = couponsArray.map((c: any) => ({
          id: c._id || c.id,
          code: c.code,
          discount: c.discountType === "percentage" ? `${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`,
          discountType: c.discountType === "percentage" ? "PERCENT" : "FLAT",
          discountValue: c.discountValue || 0,
          minOrder: c.minimumOrderValue || 0,
          status: c.status === "active" ? "ACTIVE" : "INACTIVE",
          applicableOutlets: (c.outletIds && c.outletIds.length > 0) ? c.outletIds.map((o: any) => typeof o === "object" ? o._id || o.id : o) : "ALL",
          validFrom: c.validFrom,
          validTill: c.validTill
        }));
        setCoupons(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch coupons API:", err);
    }
  }

  const fetchSettings = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const s = data.data;
          setGlobalRules({
            gst: s.baseGstRate ?? 5,
            vat: s.vatRate ?? 12,
            localLevies: s.localLeviesRate ?? 2,
            packagingCharge: s.packagingFee ?? 30,
            deliveryChargeBase: s.baseDeliveryRate ?? 40,
            deliveryPerKm: s.perKmMultiplierRate ?? 10,
            useDistancePricing: s.distanceBasedPricing ?? false,
            storeTimings: `${s.storeOpeningTime || "09:00 AM"} - ${s.storeClosingTime || "11:00 PM"}`,
            cashOnDelivery: s.codEnabled ?? true,
            maintenanceMode: s.maintenanceMode ?? false,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings API:", err);
    }
  }

  const fetchOrders = async (outletId?: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/orders?page=1&limit=100`;
        if (outletId && outletId !== "all") {
          url += `&outletId=${outletId}`;
        }
        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("FETCH ORDERS API RESPONSE DATA:", data);
        if (data.success && data.data) {
          const docs = Array.isArray(data.data) ? data.data : (data.data.docs || data.data.orders || []);
          const mapped = docs.map((o: any) => {
            const customerName = o.customerId?.name || o.addressSnapshot?.name || "Customer";
            const customerPhone = o.customerId?.phone || o.addressSnapshot?.phone || "";
            const customerAddress = o.addressSnapshot
              ? `${o.addressSnapshot.addressLine1 || ""}, ${o.addressSnapshot.addressLine2 || ""}, ${o.addressSnapshot.city || ""}, ${o.addressSnapshot.state || ""} - ${o.addressSnapshot.pincode || ""}`
              : "";

            const itemsString = o.items ? o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ") : "";
            const structured = o.items ? o.items.map((i: any) => ({
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              addOns: i.modifiers ? i.modifiers.map((m: any) => `${m.name} (+₹${m.price})`) : []
            })) : [];

            let frontendStatus: Order["status"] = "PLACED";
            if (o.orderStatus === "placed") frontendStatus = "PLACED";
            else if (o.orderStatus === "accepted") frontendStatus = "ACCEPTED";
            else if (o.orderStatus === "preparing") frontendStatus = "PREPARING";
            else if (o.orderStatus === "ready") {
              if (o.deliveryStatus === "picked_up" || o.deliveryStatus === "on_the_way" || o.deliveryStatus === "assigned") {
                frontendStatus = "OUT_FOR_DELIVERY";
              } else {
                frontendStatus = "READY";
              }
            }
            else if (o.orderStatus === "completed") frontendStatus = "DELIVERED";
            else if (o.orderStatus === "cancelled") frontendStatus = "CANCELLED";

             return {
               id: o.orderNumber ? `#${o.orderNumber}` : (o._id || o.id),
               dbId: o._id || o.id,
               orderNumber: o.orderNumber,
               customerName,
              customerPhone,
              customerAddress,
              items: itemsString,
              structuredItems: structured,
              subtotal: o.subtotal || 0,
              gst: o.tax || 0,
              packagingCharge: o.packingCharge || 0,
              deliveryCharge: o.deliveryCharge || 0,
              discount: o.discount || 0,
              total: o.grandTotal || 0,
              paymentMethod: "UPI",
              paymentStatus: o.paymentStatus ? o.paymentStatus.toUpperCase() : "PENDING",
              fulfillmentType: o.orderType === "delivery" ? "DELIVERY" : "PICKUP",
              status: frontendStatus,
              estimatedMinutes: o.estimatedPreparationTime || 0,
              deliveryStaff: o.assignedDeliveryStaffId?.name || "",
              outlet: o.outletId?.name || "Nirago Outlet",
              specialInstructions: o.orderComment || o.deliveryComment || "",
              deliveryDate: o.createdAt ? o.createdAt.substring(0, 10) : "",
              transactionId: o.transactionId || "",
              cancellationReason: o.cancellationReason || ""
            };
          });
          setOrders(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders API:", err);
    }
  }

  const fetchCustomers = async () => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers?page=1&limit=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const docs = Array.isArray(data.data) ? data.data : (data.data.docs || data.data.customers || []);
          const mapped = docs.map((c: any) => ({
            id: c._id || c.id,
            name: c.name,
            email: c.email || "",
            phone: c.phone || "",
            walletBalance: c.walletBalance ?? 0,
            membership: c.walletBalance >= 5000 ? "PREMIUM" : (c.walletBalance >= 3000 ? "GOLD" : (c.walletBalance >= 1500 ? "SILVER" : "NONE")),
            status: c.status === "blocked" ? "BLOCKED" : "ACTIVE",
            createdDate: c.createdAt ? c.createdAt.substring(0, 10) : "",
            orderVolume: c.orderVolume ?? 0,
            lifetimeValue: c.lifetimeWalletDeposit ?? c.lifetimeValue ?? 0,
            address: c.address || ""
          }));
          setCustomers(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch customers API:", err);
    }
  }

  useEffect(() => {
    fetchOutlets();
    fetchRoles();
    fetchUsers();
    fetchCategories();
    fetchMenuItems();
    fetchCoupons();
    fetchSettings();
    fetchCustomers();
    fetchOrders();
  }, [])

  // Handle Outlet Add
  const handleAddOutlet = async (
    name: string,
    address: string,
    contact?: string,
    deliveryEnabled: boolean = true,
    deliveryCharge: number = 40,
    minFreeDelivery: number = 500,
    estimatedDeliveryTime: string = "30-45 mins",
    paymentStatus: "ACTIVE" | "INACTIVE" | "PENDING" = "ACTIVE",
    merchantId: string = "MERCH_" + name.replace(/[^A-Z0-9]/ig, "_").toUpperCase(),
    transactionId: string = "TXN_INIT_" + Math.floor(Math.random() * 100),
    allowedPaymentMethods: string[] = ["CASH", "UPI", "CARD"],
    latitude?: number,
    longitude?: number
  ): Promise<{ success: boolean; id?: string; message?: string; errors?: any }> => {
    if (outlets.length >= 9) {
      return { success: false, message: "Maximum limit of 9 outlets reached." }
    }

    let token = "";
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
      if (match) token = match[2];
    }

    let serverId: string | null = null;

    try {
      const payload = {
        name,
        address,
        code: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        phone: contact || "+91 99999 99999",
        email: name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@nirago.com",
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
        status: "active",
        deliveryCharge,
        minOrderForFreeDelivery: minFreeDelivery,
        estimatedDeliveryTime,
        offersDelivery: deliveryEnabled,
        offersPickup: true,
        offersDineIn: true,
        offersInCar: true,
        location: {
          type: "Point",
          coordinates: [longitude || 77.2090, latitude || 28.6139] // [longitude, latitude]
        },
        latitude: latitude || 28.6139,
        longitude: longitude || 77.2090,
        paymentStatus,
        merchantId,
        transactionId,
        allowedPaymentMethods
      };

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/outlets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to add outlet via API:", data);
          return { success: false, message: data.message || "Validation failed", errors: data.data };
        }
        serverId = data.data?._id || data.data?.id;
      }
    } catch (e: any) {
      console.error("API error adding outlet:", e);
      return { success: false, message: e.message || "Network error occurred." };
    }

    let createdId = "";
    setOutlets(prev => {
      const nextId = serverId || (prev.length > 0 ? Math.max(...prev.map(o => parseInt(o.id) || 0)) + 1 : 1).toString();
      createdId = nextId;
      const added: Outlet = {
        id: nextId,
        name,
        address,
        contact: contact || "+91 99999 99999",
        status: "ACTIVE",
        deliveryEnabled,
        deliveryCharge,
        minFreeDelivery,
        estimatedDeliveryTime,
        paymentStatus,
        merchantId,
        transactionId,
        allowedPaymentMethods,
        latitude,
        longitude
      }
      return [...prev, added]
    })
    addLog("Outlet Added", `Created new outlet: ${name}`)
    return { success: true, id: createdId }
  }

  // Handle Outlet Update
  const updateOutlet = async (id: string, updated: Partial<Outlet>) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const payload = {
        name: updated.name,
        address: updated.address,
        code: updated.name ? updated.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined,
        city: (updated as any).city || "Delhi",
        state: (updated as any).state || "Delhi",
        pincode: (updated as any).pincode || "110001",
        phone: updated.contact,
        email: (updated as any).email || (updated.name ? (updated.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@nirago.com") : undefined),
        openingTime: (updated as any).openingTime || "09:00 AM",
        closingTime: (updated as any).closingTime || "11:00 PM",
        status: updated.status ? (updated.status === "ACTIVE" ? "active" : "inactive") : undefined,
        deliveryCharge: updated.deliveryCharge,
        minOrderForFreeDelivery: updated.minFreeDelivery,
        estimatedDeliveryTime: updated.estimatedDeliveryTime,
        offersDelivery: updated.deliveryEnabled,
        location: (updated.longitude !== undefined || updated.latitude !== undefined) ? {
          type: "Point",
          coordinates: [updated.longitude ?? 77.2090, updated.latitude ?? 28.6139]
        } : undefined,
        latitude: updated.latitude,
        longitude: updated.longitude,
        paymentStatus: updated.paymentStatus,
        merchantId: updated.merchantId,
        transactionId: updated.transactionId,
        allowedPaymentMethods: updated.allowedPaymentMethods
      };

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/outlets/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to update outlet via API:", data);
          return false;
        }
      }
    } catch (e) {
      console.error("API error updating outlet:", e);
      return false;
    }

    setOutlets(prev => prev.map(o => {
      if (o.id === id) {
        addLog("Outlet Configured", `Updated configuration for outlet: ${o.name}`)
        return { ...o, ...updated }
      }
      return o
    }));
    return true;
  }

  // Handle Outlet Delete
  const handleDeleteOutlet = async (id: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/outlets/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to delete outlet via API:", data);
          return false;
        }
      }
    } catch (e) {
      console.error("API error deleting outlet:", e);
      return false;
    }

    setOutlets(prev => {
      const itemToDelete = prev.find(o => o.id === id)
      if (itemToDelete) {
        addLog("Outlet Deleted", `Removed outlet: ${itemToDelete.name}`)
      }
      return prev.filter(o => o.id !== id)
    });
    return true;
  }

  // Handle Menu Item Add
  const handleAddMenuItem = async (
    name: string,
    category: string,
    price: number,
    description?: string,
    image?: string,
    modifierGroups?: ModifierGroup[],
    images?: string[]
  ): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const catObj = categories.find(c => c.name === category);
      const categoryId = catObj ? catObj.id : "6a51c0ebe2c6003316af4483"; // Use selected category or fallback

      const payload = {
        categoryId,
        name,
        description: description || "Freshly cooked gourmet specialty.",
        image: (images && images.length > 0) ? images : (image ? [image] : undefined),
        price: Number(price),
        isVeg: true,
        isFeatured: false,
        preparation: "Freshly cooked in 15 mins",
        modifierGroupIds: modifierGroups ? modifierGroups.map(g => g.id) : [],
        status: "active"
      };

      let dbId = "";
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/menu-items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response adding menu item:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to add menu item:", data);
          Swal.fire("Error", data.message || "Failed to create menu item", "error");
          return false;
        }
        dbId = data.data?._id || data.data?.id;
      }

      setMenuItems(prev => {
        const nextId = dbId || (prev.length > 0 ? Math.max(...prev.map(item => parseInt(item.id) || 0)) + 1 : 1).toString();
        const added: MenuItem = {
          id: nextId,
          name,
          category,
          price,
          status: "ACTIVE",
          description: description || "Freshly cooked gourmet specialty.",
          image: image || (images && images[0]) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop",
          images: images || (image ? [image] : ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop"]),
          modifierGroups: modifierGroups || [],
          categoryId
        };
        return [...prev, added];
      });
      addLog("Menu Item Added", `Created new menu listing: ${name} (₹${price})`);
      return true;
    } catch (e: any) {
      console.error("API error adding menu item:", e);
      return false;
    }
  }

  // Handle Menu Item Update
  const handleUpdateMenuItem = async (id: string, updated: Partial<MenuItem>): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      let categoryId = updated.categoryId;
      if (!categoryId && updated.category) {
        const catObj = categories.find(c => c.name === updated.category);
        if (catObj) categoryId = catObj.id;
      }

      const payload = {
        categoryId,
        name: updated.name,
        description: updated.description,
        image: (updated.images && updated.images.length > 0) ? updated.images : (updated.image ? [updated.image] : undefined),
        price: updated.price ? Number(updated.price) : undefined,
        status: updated.status ? (updated.status === "ACTIVE" ? "active" : "inactive") : undefined,
        modifierGroupIds: updated.modifierGroups ? updated.modifierGroups.map(g => g.id) : undefined
      };

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/menu-items/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response updating menu item:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to update menu item:", data);
          Swal.fire("Error", data.message || "Failed to update menu item", "error");
          return false;
        }
      }

      setMenuItems(prev => prev.map(m => {
        if (m.id === id) {
          addLog("Menu Item Updated", `Updated details for menu item: ${updated.name || m.name}`);
          return { ...m, ...updated };
        }
        return m;
      }));
      return true;
    } catch (e: any) {
      console.error("API error updating menu item:", e);
      return false;
    }
  }

  // Handle Menu Item Delete
  const handleDeleteMenuItem = async (id: string): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/menu-items/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to delete menu item:", data);
          Swal.fire("Error", data.message || "Failed to delete menu item", "error");
          return false;
        }
      }

      setMenuItems(prev => {
        const itemToDelete = prev.find(m => m.id === id);
        if (itemToDelete) {
          addLog("Menu Item Deleted", `Removed dish: ${itemToDelete.name}`);
        }
        return prev.filter(m => m.id !== id);
      });
      return true;
    } catch (e: any) {
      console.error("API error deleting menu item:", e);
      return false;
    }
  }

  // Handle Coupon Add
  const handleAddCoupon = async (
    code: string,
    discount: string,
    discountType: "PERCENT" | "FLAT",
    discountValue: number,
    minOrder: number,
    applicableOutlets: "ALL" | string[] = "ALL",
    validFrom?: string,
    validTill?: string
  ): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      let outletIds: string[] = [];
      if (applicableOutlets !== "ALL") {
        outletIds = applicableOutlets;
      }

      const finalValidFrom = validFrom ? new Date(validFrom).toISOString() : new Date().toISOString();
      const finalValidTill = validTill ? new Date(validTill).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        code: code.toUpperCase(),
        discountType: discountType === "PERCENT" ? "percentage" : "fixed",
        discountValue,
        minimumOrderValue: minOrder,
        maximumDiscount: discountType === "FLAT" ? discountValue : 1000,
        validFrom: finalValidFrom,
        validTill: finalValidTill,
        outletIds,
        status: "active"
      };

      let dbId = "";
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coupons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response adding coupon:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to add coupon:", data);
          Swal.fire("Error", data.message || "Failed to create coupon", "error");
          return false;
        }
        dbId = data.data?._id || data.data?.id;
      }

      const nextId = dbId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const added: Coupon = {
        id: nextId,
        code: code.toUpperCase(),
        discount,
        discountType,
        discountValue,
        minOrder,
        status: "ACTIVE",
        applicableOutlets,
        validFrom: finalValidFrom,
        validTill: finalValidTill
      };

      setCoupons(prev => [...prev, added]);
      const outletLabel = applicableOutlets === "ALL" ? "all outlets" : `${(applicableOutlets as string[]).length} outlet(s)`;
      addLog("Coupon Added", `Created coupon: ${code} — ${discount} (applies to ${outletLabel})`);
      return true;
    } catch (e: any) {
      console.error("API error adding coupon:", e);
      return false;
    }
  }

  // Handle Coupon Delete
  const handleDeleteCoupon = async (id: string): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coupons/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response deleting coupon:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to delete coupon:", data);
          Swal.fire("Error", data.message || "Failed to delete coupon", "error");
          return false;
        }
      }

      setCoupons(prev => {
        const target = prev.find(c => c.id === id);
        if (target) addLog("Coupon Deleted", `Removed coupon code: ${target.code}`);
        return prev.filter(c => c.id !== id);
      });
      return true;
    } catch (e: any) {
      console.error("API error deleting coupon:", e);
      return false;
    }
  }

  // Handle Coupon Update
  const handleUpdateCoupon = async (id: string, updated: Partial<Coupon>): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const targetCoupon = coupons.find(c => c.id === id);
      if (!targetCoupon) return false;

      let outletIds: string[] | undefined = undefined;
      if (updated.applicableOutlets !== undefined) {
        outletIds = updated.applicableOutlets === "ALL" ? [] : updated.applicableOutlets;
      }

      const payload = {
        code: updated.code ? updated.code.toUpperCase() : undefined,
        discountType: updated.discountType ? (updated.discountType === "PERCENT" ? "percentage" : "fixed") : undefined,
        discountValue: updated.discountValue,
        minimumOrderValue: updated.minOrder,
        status: updated.status ? updated.status.toLowerCase() : undefined,
        outletIds,
        validFrom: updated.validFrom ? new Date(updated.validFrom).toISOString() : undefined,
        validTill: updated.validTill ? new Date(updated.validTill).toISOString() : undefined
      };

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coupons/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response updating coupon:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to update coupon:", data);
          Swal.fire("Error", data.message || "Failed to update coupon", "error");
          return false;
        }
      }

      setCoupons(prev => prev.map(c => {
        if (c.id === id) {
          addLog("Coupon Updated", `Edited coupon code: ${updated.code || c.code}`);
          return { ...c, ...updated };
        }
        return c;
      }));
      return true;
    } catch (e: any) {
      console.error("API error updating coupon:", e);
      return false;
    }
  }

  // Handle Add Admin User
  const handleAddAdminUser = (name: string, email: string, password?: string, role?: AdminUser["role"], assignedOutlet?: string) => {
    const added: AdminUser = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      password: password || "Password123",
      role: role || "Manager",
      status: "ACTIVE",
      ...(assignedOutlet ? { assignedOutlet } : {})
    }
    setAdminUsers(prev => [...prev, added])
    addLog("Staff Registered", `Registered new staff member: ${name} as ${role || "Manager"} with custom credentials.`)
  }

  // Handle Add Delivery Staff
  const handleAddDeliveryStaff = (name: string, phone: string, email: string, password?: string, assignedOutlet?: string) => {
    const newStaff: DeliveryStaff = {
      id: `${Date.now()}-staff`,
      name,
      phone,
      status: "ACTIVE",
      ...(assignedOutlet ? { assignedOutlet } : {})
    }
    setDeliveryStaff(prev => [...prev, newStaff])

    const newAdminUser: AdminUser = {
      id: `${Date.now()}-user`,
      name,
      email,
      password: password || "Password123",
      role: "Delivery Staff",
      status: "ACTIVE",
      ...(assignedOutlet ? { assignedOutlet } : {})
    }
    setAdminUsers(prev => [...prev, newAdminUser])

    addLog("Staff Registered", `Registered new delivery rider: ${name} with email ${email}`)
  }

  // Handle Create Role API
  const handleCreateRole = async (name: string, permissions: string[], description: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const payload = { name, permissions, description };
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to create role:", data);
          return false;
        }
        await fetchRoles(); // refresh roles list
        addLog("Role Created", `Created system role: ${name}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error("API error creating role:", e);
      return false;
    }
  }

  // Handle Delete Role API
  const handleDeleteRole = async (id: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to delete role:", data);
          return false;
        }
        await fetchRoles();
        addLog("Role Deleted", `Deleted system role with id: ${id}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error("API error deleting role:", e);
      return false;
    }
  }

  // Handle Update Role Permissions API
  const handleUpdateRole = async (id: string, permissions: string[]) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ permissions })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to update role:", data);
          return false;
        }
        await fetchRoles();
        addLog("Role Updated", `Updated permissions for role`);
        return true;
      }
      return false;
    } catch (e) {
      console.error("API error updating role:", e);
      return false;
    }
  }

  // Handle Update Delivery Staff
  const handleUpdateDeliveryStaff = (id: string, updated: Partial<DeliveryStaff>) => {
    setDeliveryStaff(prev => prev.map(s => {
      if (s.id === id) {
        addLog("Staff Updated", `Updated delivery rider: ${s.name}`)
        return { ...s, ...updated }
      }
      return s
    }))
  }

  // Toggle statuses
  const toggleOutletStatus = (id: string) => {
    setOutlets(prev => prev.map(o => {
      if (o.id === id) {
        const nextStatus = o.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        addLog("Outlet Status Toggled", `${o.name} set to ${nextStatus}`)
        return { ...o, status: nextStatus }
      }
      return o
    }))
  }

  const toggleMenuItemStatus = async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    const nextStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await handleUpdateMenuItem(id, { status: nextStatus });
  }

  const toggleCouponStatus = async (id: string): Promise<boolean> => {
    const target = coupons.find(c => c.id === id);
    if (!target) return false;
    const nextStatus = target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    return await handleUpdateCoupon(id, { status: nextStatus });
  }

  const toggleCustomerStatus = async (id: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const customer = customers.find(c => c.id === id);
      if (!customer) return;

      const nextStatus = customer.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      const dbStatus = nextStatus === "BLOCKED" ? "blocked" : "active";

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: dbStatus })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to toggle customer status:", data);
          Swal.fire("Error", data.message || "Failed to update customer status", "error");
          return;
        }
      }

      setCustomers(prev => prev.map(c => {
        if (c.id === id) {
          addLog("Customer Account Status Changed", `Account of ${c.name} was ${nextStatus === "BLOCKED" ? "Blocked/Suspended" : "Re-activated"}`);
          return { ...c, status: nextStatus };
        }
        return c;
      }));
    } catch (e: any) {
      console.error("API error toggling customer status:", e);
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, nextStatus: Order["status"], cancellationReason?: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const orderObj = orders.find(o => o.id === orderId);
      const targetId = orderObj?.dbId || orderId;

      let dbStatus = "placed";
      if (nextStatus === "PLACED") dbStatus = "placed";
      else if (nextStatus === "ACCEPTED") dbStatus = "accepted";
      else if (nextStatus === "PREPARING") dbStatus = "preparing";
      else if (nextStatus === "READY") dbStatus = "ready";
      else if (nextStatus === "DELIVERED") dbStatus = "completed";
      else if (nextStatus === "CANCELLED" || nextStatus === "REJECTED") dbStatus = "cancelled";

      const payload: any = { orderStatus: dbStatus };
      if (cancellationReason) {
        payload.cancellationReason = cancellationReason;
      }

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${targetId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to update order status:", data);
          Swal.fire("Error", data.message || "Failed to update order status", "error");
          return;
        }
      }

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const details = cancellationReason
            ? `Order ${orderId} marked as ${nextStatus}. Reason: ${cancellationReason}`
            : `Order ${orderId} progressed to ${nextStatus}`
          addLog("Order Status Updated", details)
          if (nextStatus === "DELIVERED") {
            const todayStr = new Date().toISOString().substring(0, 10)
            return { ...o, status: nextStatus, deliveryDate: todayStr }
          }
          return { ...o, status: nextStatus, ...(cancellationReason ? { cancellationReason } : {}) }
        }
        return o
      }));
    } catch (e: any) {
      console.error("API error updating order status:", e);
    }
  }

  // Update order payment status and transaction ID
  const updateOrderPayment = async (orderId: string, status: "PAID" | "PENDING" | "FAILED", transactionId?: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const orderObj = orders.find(o => o.id === orderId);
      const targetId = orderObj?.dbId || orderId;

      const payload = {
        paymentStatus: status.toLowerCase(),
        ...(transactionId && { transactionId })
      };

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${targetId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to update order payment:", data);
          Swal.fire("Error", data.message || "Failed to update order payment", "error");
          return;
        }
      }

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          addLog("Payment Updated", `Updated payment status for Order ${orderId} to ${status}`)
          return {
            ...o,
            paymentStatus: status,
            ...(transactionId ? { transactionId } : o.transactionId ? { transactionId: o.transactionId } : {})
          }
        }
        return o
      }));
    } catch (e: any) {
      console.error("API error updating order payment:", e);
    }
  }

  // Assign delivery personnel
  const assignStaffToOrder = async (orderId: string, staffName: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const orderObj = orders.find(o => o.id === orderId);
      const targetId = orderObj?.dbId || orderId;

      const staffObj = deliveryStaff.find(s => s.name === staffName);
      if (!staffObj) return;

      const payload = {
        assignedDeliveryStaffId: staffObj.id,
        deliveryStatus: "assigned"
      };

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${targetId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to assign rider:", data);
          Swal.fire("Error", data.message || "Failed to assign rider", "error");
          return;
        }
      }

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          addLog("Delivery Rider Assigned", `Rider ${staffName} manually assigned to Order ${orderId}`)
          return { ...o, deliveryStaff: staffName }
        }
        return o
      }));
    } catch (e: any) {
      console.error("API error assigning rider:", e);
    }
  }

  // Set Estimated delivery time
  const setOrderEstTime = async (orderId: string, minutes: number) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const orderObj = orders.find(o => o.id === orderId);
      const targetId = orderObj?.dbId || orderId;

      const payload = {
        estimatedPreparationTime: minutes
      };

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${targetId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to set estimated time:", data);
          Swal.fire("Error", data.message || "Failed to set preparation time", "error");
          return;
        }
      }

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          addLog("Estimated Delivery Time Set", `Order ${orderId} estimated at ${minutes} minutes`)
          return { ...o, estimatedMinutes: minutes }
        }
        return o
      }));
    } catch (e: any) {
      console.error("API error setting prep time:", e);
    }
  }

  // Wallet manual credit/debit
  const handleWalletTransaction = async (customerId: string, amount: number, type: "CREDIT" | "DEBIT") => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const finalBal = type === "CREDIT" ? customer.walletBalance + amount : customer.walletBalance - amount;
      const extraPayload: any = { walletBalance: finalBal };
      if (type === "CREDIT") {
        extraPayload.lifetimeWalletDeposit = (customer.lifetimeValue || 0) + amount;
      }

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers/${customerId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(extraPayload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to update wallet balance on backend:", data);
          Swal.fire("Error", data.message || "Failed to update wallet balance", "error");
          return;
        }
      }

      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          addLog("Wallet Adjustments", `Manually ${type}ED ₹${amount} to/from ${c.name}'s wallet. New balance: ₹${finalBal}`);
          return {
            ...c,
            walletBalance: finalBal,
            ...(type === "CREDIT" && { lifetimeValue: extraPayload.lifetimeWalletDeposit })
          };
        }
        return c;
      }));
    } catch (e: any) {
      console.error("API error updating wallet transaction:", e);
    }
  }

  // Add new Loyalty Tier
  const handleAddLoyaltyTier = (name: string, discountPercent: number, minDeposit: number) => {
    const newTier: LoyaltyTier = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: name.toUpperCase(),
      discountPercent,
      minDeposit,
      status: "ACTIVE"
    }
    setLoyaltyTiers(prev => [...prev, newTier])
    addLog("Loyalty Tier Added", `Created new tier: ${newTier.name} (Discount: ${discountPercent}%, Min Deposit: ₹${minDeposit})`)
  }

  // Toggle Loyalty Tier status
  const toggleLoyaltyTierStatus = (id: string) => {
    setLoyaltyTiers(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        addLog("Loyalty Tier Status Toggled", `Loyalty tier ${t.name} set to ${nextStatus}`)
        return { ...t, status: nextStatus }
      }
      return t
    }))
  }

  // Customer wallet deposit with auto-promotion
  const handleCustomerDeposit = async (customerId: string, amount: number) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const nextBalance = customer.walletBalance + amount;
      const nextLifetimeDeposit = (customer.lifetimeValue || 0) + amount;

      let matchedTier = customer.membership;
      const activeTiers = loyaltyTiers
        .filter(t => t.status === "ACTIVE")
        .sort((a, b) => b.minDeposit - a.minDeposit);

      const eligibleTier = activeTiers.find(t => nextBalance >= t.minDeposit);
      if (eligibleTier) {
        matchedTier = eligibleTier.name;
      }

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers/${customerId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            walletBalance: nextBalance,
            lifetimeWalletDeposit: nextLifetimeDeposit
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to update wallet balance on backend:", data);
          Swal.fire("Error", data.message || "Failed to update wallet balance", "error");
          return;
        }
      }

      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          addLog("Wallet Deposit", `Deposited ₹${amount} into ${c.name}'s wallet. New Balance: ₹${nextBalance}. Tier: ${matchedTier}`);
          return {
            ...c,
            walletBalance: nextBalance,
            membership: matchedTier,
            lifetimeValue: nextLifetimeDeposit
          };
        }
        return c;
      }));
    } catch (e: any) {
      console.error("API error depositing wallet:", e);
    }
  }

  // Assign Customer Tier manually
  const handleAssignCustomerTier = (customerId: string, tierName: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        addLog("Loyalty Tier Override", `Manually assigned ${c.name} to tier ${tierName}`)
        return {
          ...c,
          membership: tierName
        }
      }
      return c
    }))
  }

  const handleAddCategory = async (name: string, icon: string): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const payload = {
        name,
        icon: icon || "pizza",
        image: "",
        displayOrder: 1,
        status: "active"
      };

      let dbId = "";
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response adding category:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to add category:", data);
          Swal.fire("Error", data.message || "Failed to create category", "error");
          return false;
        }
        dbId = data.data?._id || data.data?.id;
      }

      const newId = dbId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setCategories(prev => [
        ...prev,
        {
          id: newId,
          name,
          status: "ACTIVE",
          icon: icon || "pizza"
        }
      ]);
      addLog("Category Added", `Created new category: ${name}`);
      return true;
    } catch (e: any) {
      console.error("API error adding category:", e);
      return false;
    }
  }

  const handleDeleteCategory = async (id: string): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response deleting category:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to delete category:", data);
          Swal.fire("Error", data.message || "Failed to delete category", "error");
          return false;
        }
      }

      const cat = categories.find(c => c.id === id);
      if (cat) {
        setCategories(prev => prev.filter(c => c.id !== id));
        addLog("Category Deleted", `Removed category: ${cat.name}`);
      }
      return true;
    } catch (e: any) {
      console.error("API error deleting category:", e);
      return false;
    }
  }

  const handleToggleCategoryStatus = async (id: string): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const cat = categories.find(c => c.id === id);
      if (!cat) return false;

      const nextStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const action = cat.status === "ACTIVE" ? "disable" : "enable";

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${id}/toggle`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ action })
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response toggling category:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to toggle category:", data);
          Swal.fire("Error", data.message || "Failed to toggle category status", "error");
          return false;
        }
      }

      setCategories(prev => prev.map(c => {
        if (c.id === id) {
          addLog("Category Status Toggled", `Category ${c.name} set to ${nextStatus}`);
          return { ...c, status: nextStatus };
        }
        return c;
      }));
      return true;
    } catch (e: any) {
      console.error("API error toggling category:", e);
      return false;
    }
  }

  const handleUpdateItemModifiers = async (itemId: string, groups: ModifierGroup[]): Promise<boolean> => {
    return await handleUpdateMenuItem(itemId, { modifierGroups: groups });
  }

  const handleAddModifierGroup = async (
    name: string,
    selectionType: "SINGLE" | "MULTIPLE",
    options: { name: string; price: number }[]
  ): Promise<ModifierGroup | null> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return null;

      const groupRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/modifier-groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          selectionType: selectionType === "MULTIPLE" ? "multiple" : "single",
          minimumSelection: selectionType === "SINGLE" ? 1 : 0,
          maximumSelection: selectionType === "SINGLE" ? 1 : 10,
          status: "active"
        })
      });
      const groupData = await groupRes.json();
      if (!groupRes.ok || !groupData.success) {
        throw new Error(groupData.message || "Failed to create modifier group");
      }
      const newGroup = groupData.data;
      const groupId = newGroup._id || newGroup.id;

      const createdOptions: any[] = [];
      for (const opt of options) {
        const optRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/modifier-options`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: opt.name,
            price: Number(opt.price),
            modifierGroupId: groupId,
            status: "active"
          })
        });
        const optData = await optRes.json();
        if (optRes.ok && optData.success) {
          createdOptions.push({
            id: optData.data?._id || optData.data?.id,
            name: opt.name,
            price: opt.price
          });
        }
      }

      return {
        id: groupId,
        name,
        selectionType,
        options: createdOptions
      };
    } catch (e: any) {
      console.error("API error adding modifier group/options:", e);
      Swal.fire("Error", e.message || "Network error adding modifier group", "error");
      return null;
    }
  }

  // Global settings update
  const updateGlobalSettings = (field: keyof GlobalRules, value: any) => {
    setGlobalRules(prev => {
      addLog("Global Config Update", `Field [${field.toUpperCase()}] updated to ${value}`)
      return { ...prev, [field]: value }
    })
  }

  const persistGlobalSettings = async (): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return false;

      const parts = (globalRules.storeTimings || "09:00 AM - 11:00 PM").split(" - ");
      const storeOpeningTime = parts[0] || "09:00 AM";
      const storeClosingTime = parts[1] || "11:00 PM";

      const bodyPayload = {
        restaurantName: "Nirago",
        baseGstRate: globalRules.gst,
        vatRate: globalRules.vat,
        localLeviesRate: globalRules.localLevies,
        packagingFee: globalRules.packagingCharge,
        baseDeliveryRate: globalRules.deliveryChargeBase,
        perKmMultiplierRate: globalRules.deliveryPerKm,
        distanceBasedPricing: globalRules.useDistancePricing,
        storeOpeningTime,
        storeClosingTime,
        codEnabled: globalRules.cashOnDelivery,
        maintenanceMode: globalRules.maintenanceMode
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addLog("Global Settings Saved", "Settings persisted to backend database successfully.");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to save global settings API:", err);
      return false;
    }
  }

  const fetchOutletSettings = async (outletId: string): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return false;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/outlet-settings/${outletId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const s = data.data;
        setOutlets(prev => prev.map(o => {
          if (o.id === outletId) {
            return {
              ...o,
              overrideGst: s.baseGstRate,
              overrideVat: s.vatRate,
              overrideLocalLevies: s.localLeviesRate,
              overridePackagingCharge: s.packagingFee,
              overrideDeliveryFee: s.baseDeliveryRate,
              overrideDeliveryPerKm: s.perKmMultiplierRate,
              overrideUseDistancePricing: s.distanceBasedPricing,
              overrideStoreTimings: s.storeOpeningTime && s.storeClosingTime ? `${s.storeOpeningTime} - ${s.storeClosingTime}` : undefined,
              overrideCod: s.codEnabled,
              overrideMaintenance: s.maintenanceMode
            };
          }
          return o;
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to fetch outlet settings API:", err);
      return false;
    }
  }

  const persistOutletSettings = async (outletId: string): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;
      if (!token) return false;

      const outlet = outlets.find(o => o.id === outletId);
      if (!outlet) return false;

      const parts = (outlet.overrideStoreTimings || globalRules.storeTimings || "09:00 AM - 11:00 PM").split(" - ");
      const storeOpeningTime = parts[0] || "09:00 AM";
      const storeClosingTime = parts[1] || "11:00 PM";

      const bodyPayload = {
        baseGstRate: outlet.overrideGst !== undefined ? outlet.overrideGst : globalRules.gst,
        vatRate: outlet.overrideVat !== undefined ? outlet.overrideVat : globalRules.vat,
        localLeviesRate: outlet.overrideLocalLevies !== undefined ? outlet.overrideLocalLevies : globalRules.localLevies,
        packagingFee: outlet.overridePackagingCharge !== undefined ? outlet.overridePackagingCharge : globalRules.packagingCharge,
        baseDeliveryRate: outlet.overrideDeliveryFee !== undefined ? outlet.overrideDeliveryFee : globalRules.deliveryChargeBase,
        perKmMultiplierRate: outlet.overrideDeliveryPerKm !== undefined ? outlet.overrideDeliveryPerKm : globalRules.deliveryPerKm,
        distanceBasedPricing: outlet.overrideUseDistancePricing !== undefined ? outlet.overrideUseDistancePricing : globalRules.useDistancePricing,
        storeOpeningTime,
        storeClosingTime,
        codEnabled: outlet.overrideCod !== undefined ? outlet.overrideCod : globalRules.cashOnDelivery,
        maintenanceMode: outlet.overrideMaintenance !== undefined ? outlet.overrideMaintenance : globalRules.maintenanceMode
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/outlet-settings/${outletId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addLog("Outlet Settings Saved", `Settings for outlet ${outlet.name} persisted to database successfully.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to save outlet settings API:", err);
      return false;
    }
  }

  // Staff roles removal
  const handleDeleteStaffUser = async (id: string) => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          console.error("Failed to delete user:", data);
          return false;
        }
        const userToDelete = adminUsers.find(u => u.id === id);
        setAdminUsers(prev => prev.filter(u => u.id !== id));
        addLog("Staff Suspended/Removed", `Removed ${userToDelete?.name || id} from staff list`);
        return true;
      }
      return false;
    } catch (e) {
      console.error("API error deleting user:", e);
      return false;
    }
  }

  const handleUpdateStaffRole = (id: string, newRole: AdminUser["role"], assignedOutlet?: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === id) {
        addLog("Staff Role Updated", `Updated role for ${u.name} to ${newRole}`)
        return {
          ...u,
          role: newRole,
          assignedOutlet: assignedOutlet !== undefined ? assignedOutlet : u.assignedOutlet
        }
      }
      return u
    }))
  }

  const handleUpdateAdminUser = async (id: string, updated: Partial<AdminUser>): Promise<boolean> => {
    try {
      const tokenMatch = typeof document !== "undefined" ? document.cookie.match(/(^| )nirago_admin_token=([^;]+)/) : null;
      const token = tokenMatch ? tokenMatch[2] : null;

      const userToUpdate = adminUsers.find(u => u.id === id);
      if (!userToUpdate) {
        console.error("[DEBUG] User not found in state adminUsers!");
        return false;
      }

      // Map role name to roleId if role is changing
      const roleName = updated.role || userToUpdate.role;
      const roleObj = roles.find(r => r.name === roleName);
      const roleId = roleObj ? roleObj._id : userToUpdate.roleId;

      const finalOutlet = updated.assignedOutlet !== undefined ? updated.assignedOutlet : userToUpdate.assignedOutlet;
      const outletObj = finalOutlet ? outlets.find(o => o.name === finalOutlet) : undefined;
      const outletId = outletObj ? outletObj.id : userToUpdate.outletId;

      const payload = {
        name: updated.name || userToUpdate.name,
        email: updated.email || userToUpdate.email,
        phone: updated.phone || userToUpdate.phone,
        roleId,
        accessScope: finalOutlet ? "outlet" : "global",
        status: updated.status ? updated.status.toLowerCase() : userToUpdate.status?.toLowerCase(),
        ...(outletId && { outletId })
      };

      if (token) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/user/${id}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch (err) {
          console.error("Non-JSON API response updating user:", resText);
          Swal.fire("Error", `Server error (${res.status}): ${resText.substring(0, 200)}`, "error");
          return false;
        }
        if (!res.ok || !data.success) {
          console.error("Failed to update user:", data);
          Swal.fire("Error", data.message || "Failed to update user", "error");
          return false;
        }
      }

      setAdminUsers(prev => prev.map(u => {
        if (u.id === id) {
          addLog("Staff Details Updated", `Updated details/status for ${updated.name || u.name}`);
          return {
            ...u,
            ...updated,
            assignedOutlet: finalOutlet
          };
        }
        return u;
      }));
      return true;
    } catch (e: any) {
      console.error("API error updating user:", e);
      return false;
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <DashboardContext.Provider
      value={{
        outlets,
        setOutlets,
        menuItems,
        setMenuItems,
        categories,
        setCategories,
        orders,
        setOrders,
        customers,
        setCustomers,
        deliveryStaff,
        setDeliveryStaff,
        coupons,
        setCoupons,
        auditLogs,
        setAuditLogs,
        adminUsers,
        setAdminUsers,
        globalRules,
        setGlobalRules,
        notifications,
        setNotifications,
        loyaltyTiers,
        setLoyaltyTiers,
        addLog,
        handleAddOutlet,
        updateOutlet,
        handleDeleteOutlet,
        handleAddMenuItem,
        handleUpdateMenuItem,
        handleDeleteMenuItem,
        handleAddCoupon,
        handleDeleteCoupon,
        handleUpdateCoupon,
        handleAddAdminUser,
        handleAddDeliveryStaff,
        handleUpdateDeliveryStaff,
        toggleOutletStatus,
        toggleMenuItemStatus,
        toggleCouponStatus,
        toggleCustomerStatus,
        updateOrderStatus,
        updateOrderPayment,
        assignStaffToOrder,
        setOrderEstTime,
        handleWalletTransaction,
        updateGlobalSettings,
        persistGlobalSettings,
        handleDeleteStaffUser,
        handleUpdateStaffRole,
        handleUpdateAdminUser,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        handleAddLoyaltyTier,
        toggleLoyaltyTierStatus,
        handleCustomerDeposit,
        handleAssignCustomerTier,
        handleAddCategory,
        handleDeleteCategory,
        handleToggleCategoryStatus,
        handleUpdateItemModifiers,
        handleAddModifierGroup,
        roles,
        setRoles,
        fetchRoles,
        handleCreateRole,
        handleDeleteRole,
        handleUpdateRole,
        fetchOrders,
        fetchOutletSettings,
        persistOutletSettings
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
