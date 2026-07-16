"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DashboardProvider, useDashboard } from "./DashboardContext"
import {
  LayoutDashboard,
  Store,
  Menu as HamburgerIcon,
  ShoppingBag,
  Users,
  Wallet,
  Ticket,
  Settings as SettingsIcon,
  UserCheck,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
  Mail,
  Key,
  Image as ImageIcon,
  Camera,
  Trash2,
  Check,
  BellOff,
  CreditCard,
  BarChart3,
  MapPin,
  Star,
  Send,
  Plus
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Swal from "sweetalert2"

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    orders,
    outlets,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    roles,
    customers,
    handleCreateNotification
  } = useDashboard()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifActiveTab, setNotifActiveTab] = useState<"all" | "unread" | "order" | "system" | "wallet" | "outlet" | "payment" | "promotion">("all")
  const [sentNotifIds, setSentNotifIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const ids = JSON.parse(localStorage.getItem("nirago_sent_notification_ids") || "[]")
        setSentNotifIds(ids)
      } catch (e) {
        console.error(e)
      }
    }
  }, [isNotificationsOpen])
  
  // Send Notification States
  const [isSendNotifOpen, setIsSendNotifOpen] = useState(false)
  const [notifCustomerId, setNotifCustomerId] = useState("")
  const [notifTitle, setNotifTitle] = useState("")
  const [notifMessage, setNotifMessage] = useState("")
  const [notifType, setNotifType] = useState<"order" | "payment" | "wallet" | "coupon" | "promotion" | "system">("system")
  const [isSendingNotif, setIsSendingNotif] = useState(false)

  const [userRole, setUserRole] = useState("Owner")
  const [userName, setUserName] = useState("Master Admin")
  const [userEmail, setUserEmail] = useState("admin@nirago.com")
  const [userOutlet, setUserOutlet] = useState("")
  const [userImage, setUserImage] = useState("")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [newProfileName, setNewProfileName] = useState("")
  const [newProfileImage, setNewProfileImage] = useState("")
  const [originalRole, setOriginalRole] = useState<string | null>(null)

  // Edit & OTP States
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [currentPasswordInput, setCurrentPasswordInput] = useState("")
  const [savedPassword, setSavedPassword] = useState("Password123")
  const [otpSent, setOtpSent] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [enteredOtp, setEnteredOtp] = useState("")
  const [pendingField, setPendingField] = useState<"email" | "password" | null>(null)

  // Temp fields
  const [tempEmail, setTempEmail] = useState("")
  const [tempPassword, setTempPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Normalize role names to Title Case so they always match the hardcoded permission keys
  const toTitleCase = (str: string) => str.trim().toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawRole = localStorage.getItem("nirago_user_role") || "Owner"
      const role = toTitleCase(rawRole)
      const name = localStorage.getItem("nirago_user_name") || "Master Admin"
      const email = localStorage.getItem("nirago_user_email") || "admin@nirago.com"
      const outlet = localStorage.getItem("nirago_user_outlet") || ""
      const orig = localStorage.getItem("nirago_original_role")
      setUserRole(role)
      // Save the normalized role back so it's consistent everywhere
      localStorage.setItem("nirago_user_role", role)
      setUserName(name)
      setUserEmail(email)
      setUserOutlet(outlet)
      setNewProfileName(name)
      setOriginalRole(orig)

      // Reset states
      setIsEditingEmail(false)
      setIsEditingPassword(false)
      setOtpSent(false)
      setCurrentPasswordInput("")
      setTempEmail("")
      setTempPassword("")
      setConfirmPassword("")

      // Fetch user details if available in saved users
      const savedUsersRaw = localStorage.getItem("nirago_admin_users")
      if (savedUsersRaw) {
        try {
          const users = JSON.parse(savedUsersRaw)
          const matched = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
          if (matched) {
            setUserImage(matched.image || "")
            setNewProfileImage(matched.image || "")
            setSavedPassword(matched.password || "Password123")
          } else if (email === "admin@nirago.com") {
            setSavedPassword("NiragoAdmin2026")
          }
        } catch (e) {
          console.error(e)
        }
      } else if (email === "admin@nirago.com") {
        setSavedPassword("NiragoAdmin2026")
      }
    }
  }, [isProfileOpen])

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  // Authentication check
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("nirago_admin_logged_in")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  // Fetch user details from /me API
  useEffect(() => {
    const fetchMe = async () => {
      if (typeof document === "undefined") return;
      const match = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
      const token = match ? match[2] : null;
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        
        if (res.ok && data) {
          const userObj = data.data || data; // Based on the API response structure you provided
          
           if (userObj.name) {
            setUserName(userObj.name);
            setNewProfileName(userObj.name);
          }
          if (userObj.email) setUserEmail(userObj.email);
          if (userObj._id || userObj.id) {
            localStorage.setItem("nirago_user_id", userObj._id || userObj.id);
          }
          
          // Map granular backend permissions
          const mapPermsToFrontend = (perms: string[]): string[] => {
            if (!perms) return [];
            const mapping: Record<string, string> = {
              "Dashboard": "overview",
              "Orders": "orders",
              "Menu": "menu",
              "Outlets": "outlets",
              "Outlet Settings": "outlet-settings",
              "Customers": "customers",
              "Reports & Logs": "reports",
              "Payments": "payments",
              "Wallet & Plans": "wallets",
              "Coupons": "coupons",
              "Delivery Staff": "staff",
              "Team Control": "users",
              "Global Rules": "rules"
            };
            const result: string[] = [];
            perms.forEach(p => {
              const mapped = mapping[p] || p.toLowerCase();
              result.push(mapped);
              if (p === "Outlets") {
                result.push("outlet-settings");
              }
            });

            if (perms.some(p => p.startsWith("outlet."))) {
              result.push("outlets");
            }
            if (perms.some(p => p.startsWith("outletSetting."))) {
              result.push("outlet-settings");
            }

            return Array.from(new Set(result));
          };

          let userPerms: string[] = [];
          if (userObj.roleId?.permissions) {
            userPerms = mapPermsToFrontend(userObj.roleId.permissions);
          }
          
          // Role is nested under roleId.name — normalize and persist
          if (userObj.roleId?.name || userObj.role) {
            const rawRoleName = userObj.roleId?.name || userObj.role;
            const normalized = toTitleCase(rawRoleName);
            setUserRole(normalized);
            localStorage.setItem("nirago_user_role", normalized);
            
            // Fallback for Rider roles (backend doesn't populate roleId for riders in /me)
            if (userPerms.length === 0 && ["Delivery Staff", "Delivery Rider", "Delivery Riders", "Rider", "Riders"].includes(normalized)) {
              userPerms = ["overview", "orders"];
            }

            // Sync current user's exact backend permissions
            if (userPerms.length > 0) {
              setRolePermissions(prev => {
                const merged = { ...prev, [normalized]: userPerms };
                localStorage.setItem("nirago_role_permissions", JSON.stringify(merged));
                return merged;
              });
            }
          }
          // Also persist outlet name from /me if available
          if (userObj.outletId?.name) {
            setUserOutlet(userObj.outletId.name);
            localStorage.setItem("nirago_user_outlet", userObj.outletId.name);
            const oid = userObj.outletId._id || userObj.outletId.id;
            if (oid) {
              localStorage.setItem("nirago_user_outlet_id", oid);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch /me API:", err);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#556B2F",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (typeof document !== "undefined") {
          const match = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
          const token = match ? match[2] : null;
          if (token) {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              });
            } catch (err) {
              console.error("Failed to logout from server:", err);
            }
          }
          document.cookie = "nirago_admin_token=; path=/; max-age=0;";
        }
        
        localStorage.removeItem("nirago_admin_logged_in")
        localStorage.removeItem("nirago_user_role")
        localStorage.removeItem("nirago_user_name")
        localStorage.removeItem("nirago_user_email")
        localStorage.removeItem("nirago_user_outlet")
        router.push("/login")
      }
    })
  }

  const handleSaveBasicProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nirago_user_name", newProfileName)
      setUserName(newProfileName)
      setUserImage(newProfileImage)

      const savedUsersRaw = localStorage.getItem("nirago_admin_users")
      if (savedUsersRaw) {
        try {
          const users = JSON.parse(savedUsersRaw)
          const updated = users.map((u: any) => {
            if (u.email.toLowerCase() === userEmail.toLowerCase()) {
              return { ...u, name: newProfileName, image: newProfileImage }
            }
            return u
          })
          localStorage.setItem("nirago_admin_users", JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
      }

      Swal.fire({
        title: "Profile Updated",
        text: "Basic profile details saved successfully!",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  const handleUpdatePasswordDirectly = () => {
    if (!currentPasswordInput || !tempPassword || !confirmPassword) {
      Swal.fire("Error", "Please fill all password fields.", "error")
      return
    }
    if (currentPasswordInput !== savedPassword) {
      Swal.fire("Incorrect Password", "The current password you entered is incorrect.", "error")
      return
    }
    if (tempPassword !== confirmPassword) {
      Swal.fire("Mismatch", "New passwords do not match.", "error")
      return
    }

    if (typeof window !== "undefined") {
      const savedUsersRaw = localStorage.getItem("nirago_admin_users")
      if (savedUsersRaw) {
        try {
          const users = JSON.parse(savedUsersRaw)
          const updated = users.map((u: any) => {
            if (u.email.toLowerCase() === userEmail.toLowerCase()) {
              return { ...u, password: tempPassword }
            }
            return u
          })
          localStorage.setItem("nirago_admin_users", JSON.stringify(updated))
          setSavedPassword(tempPassword)
        } catch (e) {
          console.error(e)
        }
      }

      setCurrentPasswordInput("")
      setTempPassword("")
      setConfirmPassword("")
      setIsEditingPassword(false)

      Swal.fire({
        title: "Password Updated",
        text: "Your password has been changed successfully!",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
    }
  }

  const handleForgotPasswordAPI = (prefilledEmail?: string) => {
    setIsProfileOpen(false);
    Swal.fire({
      title: "Reset Password",
      text: "We will send a reset token to your registered email address:",
      input: "email",
      inputValue: prefilledEmail || userEmail || "",
      inputPlaceholder: "email@nirago.com",
      showCancelButton: true,
      confirmButtonColor: "#2d3822",
      cancelButtonColor: "#d33",
      confirmButtonText: "Verify Mail",
      showLoaderOnConfirm: true,
      preConfirm: async (emailInput) => {
        if (!emailInput) {
          Swal.showValidationMessage("Please enter your email address")
          return false
        }
        const targetEmail = emailInput.trim().toLowerCase()
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: targetEmail }),
          })
          const data = await res.json()
          if (!res.ok || !data.success) {
            throw new Error(data.message || "User not found or error occurred")
          }
          return { resetToken: data.data.resetToken, email: targetEmail }
        } catch (error: any) {
          Swal.showValidationMessage(`Request failed: ${error.message}`)
          return false
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value?.resetToken) {
        const { resetToken } = result.value
        
        // Show reset password dialog
        Swal.fire({
          title: "Reset Password",
          html: `
            <div style="position: relative; margin-bottom: 10px; text-align: left;">
              <input type="password" id="swal-input1" class="swal2-input" placeholder="New Password" style="margin: 0; width: 100%; box-sizing: border-box; padding-right: 40px;">
              <button type="button" id="toggle-swal-input1" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #666; display: flex; align-items: center; justify-content: center; height: 100%; padding: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div style="position: relative; text-align: left;">
              <input type="password" id="swal-input2" class="swal2-input" placeholder="Confirm Password" style="margin: 0; width: 100%; box-sizing: border-box; padding-right: 40px;">
              <button type="button" id="toggle-swal-input2" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #666; display: flex; align-items: center; justify-content: center; height: 100%; padding: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          `,
          didOpen: () => {
            const toggle1 = document.getElementById('toggle-swal-input1')
            const toggle2 = document.getElementById('toggle-swal-input2')
            const input1 = document.getElementById('swal-input1') as HTMLInputElement
            const input2 = document.getElementById('swal-input2') as HTMLInputElement
            
            const eyeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
            const eyeOffIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>'
            
            toggle1?.addEventListener('click', () => {
              if (input1.type === 'password') {
                input1.type = 'text'
                toggle1.innerHTML = eyeOffIcon
              } else {
                input1.type = 'password'
                toggle1.innerHTML = eyeIcon
              }
            })
            
            toggle2?.addEventListener('click', () => {
              if (input2.type === 'password') {
                input2.type = 'text'
                toggle2.innerHTML = eyeOffIcon
              } else {
                input2.type = 'password'
                toggle2.innerHTML = eyeIcon
              }
            })
          },
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonColor: "#556B2F",
          confirmButtonText: "Update Password",
          showLoaderOnConfirm: true,
          preConfirm: async () => {
            const newPass = (document.getElementById('swal-input1') as HTMLInputElement).value
            const confPass = (document.getElementById('swal-input2') as HTMLInputElement).value
            
            if (!newPass || newPass.trim().length < 6) {
              Swal.showValidationMessage("Password must be at least 6 characters.")
              return false
            }
            if (newPass !== confPass) {
              Swal.showValidationMessage("Passwords do not match!")
              return false
            }
            
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: resetToken, password: newPass.trim() }),
              })
              const data = await res.json()
              if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to reset password")
              }
              return data
            } catch (error: any) {
              Swal.showValidationMessage(`Update failed: ${error.message}`)
              return false
            }
          }
        }).then((passResult) => {
          if (passResult.isConfirmed) {
            Swal.fire("Success", "Password updated successfully!", "success")
            setIsEditingPassword(false)
          }
        })
      }
    })
  }

  const handleSendOtp = (type: "email" | "password") => {
    if (type === "email" && !tempEmail) {
      Swal.fire("Error", "Please enter a valid email address.", "error")
      return
    }
    if (type === "password" && (!tempPassword || tempPassword !== confirmPassword)) {
      Swal.fire("Error", "New passwords do not match or are empty.", "error")
      return
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(otp)
    setPendingField(type)
    setOtpSent(true)

    Swal.fire({
      title: "OTP Sent!",
      html: `We have sent a verification code to your registered email.<br/><br/><b class="text-xl text-[#556B2F]">Mock OTP: ${otp}</b>`,
      icon: "info",
      confirmButtonColor: "#556B2F"
    })
  }

  const handleVerifyOtpAndSave = () => {
    if (enteredOtp !== generatedOtp) {
      Swal.fire("Invalid OTP", "The entered OTP code is incorrect. Please try again.", "error")
      return
    }

    if (typeof window !== "undefined") {
      const savedUsersRaw = localStorage.getItem("nirago_admin_users")
      let users = []
      if (savedUsersRaw) {
        try {
          users = JSON.parse(savedUsersRaw)
        } catch (e) {
          console.error(e)
        }
      }

      if (pendingField === "email") {
        const updated = users.map((u: any) => {
          if (u.email.toLowerCase() === userEmail.toLowerCase()) {
            return { ...u, email: tempEmail.toLowerCase() }
          }
          return u
        })
        localStorage.setItem("nirago_admin_users", JSON.stringify(updated))
        localStorage.setItem("nirago_user_email", tempEmail.toLowerCase())
        setUserEmail(tempEmail.toLowerCase())
        setTempEmail("")
        Swal.fire("Success", "Email updated successfully!", "success")
      } else if (pendingField === "password") {
        const updated = users.map((u: any) => {
          if (u.email.toLowerCase() === userEmail.toLowerCase()) {
            return { ...u, password: tempPassword }
          }
          return u
        })
        localStorage.setItem("nirago_admin_users", JSON.stringify(updated))
        setTempPassword("")
        setConfirmPassword("")
        Swal.fire("Success", "Password updated successfully!", "success")
      }

      setOtpSent(false)
      setEnteredOtp("")
      setPendingField(null)
    }
  }

  const handleMarkNotifAsRead = (id: string) => {
    markNotificationAsRead(id)
  }

  const handleMarkAllNotifsAsRead = () => {
    markAllNotificationsAsRead()
    Swal.fire({
      title: "Success!",
      text: "All notifications marked as read.",
      icon: "success",
      confirmButtonColor: "#556B2F"
    })
  }

  const handleNotifDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#556B2F",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteNotification(id)
        Swal.fire({
          title: "Deleted!",
          text: "Notification has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#556B2F"
        })
      }
    })
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notifCustomerId) {
      Swal.fire("Error", "Please select a customer.", "error")
      return
    }
    if (!notifTitle.trim()) {
      Swal.fire("Error", "Please enter a title.", "error")
      return
    }
    if (!notifMessage.trim()) {
      Swal.fire("Error", "Please enter a message.", "error")
      return
    }

    setIsSendingNotif(true)
    const success = await handleCreateNotification({
      customerId: notifCustomerId,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType
    })
    setIsSendingNotif(false)

    if (success) {
      Swal.fire({
        title: "Sent!",
        text: "Notification has been sent successfully.",
        icon: "success",
        confirmButtonColor: "#556B2F"
      })
      setIsSendNotifOpen(false)
      setIsNotificationsOpen(false)
      // Reset form states
      setNotifCustomerId("")
      setNotifTitle("")
      setNotifMessage("")
      setNotifType("system")
    } else {
      Swal.fire("Failed", "Failed to send notification. Please try again.", "error")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-5 w-5 text-amber-600" />
      case "system":
        return <SettingsIcon className="h-5 w-5 text-blue-600" />
      case "wallet":
        return <Wallet className="h-5 w-5 text-emerald-600" />
      case "payment":
        return <Wallet className="h-5 w-5 text-rose-600" />
      case "coupon":
      case "promotion":
        return <Ticket className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-neutral-600" />
    }
  }

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "order":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "system":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "wallet":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "payment":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "coupon":
      case "promotion":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200"
    }
  }

  // Map active route name for top header breadcrumbs
  const getActiveTabName = () => {
    if (pathname === "/dashboard") return "overview"
    return pathname.replace("/dashboard/", "")
  }

  const activeTab = getActiveTabName()

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { id: "outlet-settings", label: "Outlet Settings", icon: Store, path: "/dashboard/outlet-settings" },
    { id: "orders", label: "Orders", icon: ShoppingBag, path: "/dashboard/orders", badge: orders.filter(o => o.status === "PLACED" || o.status === "PREPARING").length },
    { id: "menu", label: "Food Menu", icon: HamburgerIcon, path: "/dashboard/menu" },
    { id: "outlets", label: "All Outlets", icon: Store, path: "/dashboard/outlets", badge: outlets.length },
    { id: "customers", label: "Customers", icon: Users, path: "/dashboard/customers" },
    { id: "reviews", label: "Reviews", icon: Star, path: "/dashboard/reviews" },
    { id: "reports", label: "Reports", icon: BarChart3, path: "/dashboard/reports" },
    { id: "payments", label: "Payments", icon: CreditCard, path: "/dashboard/payments" },
    { id: "wallets", label: "Loyalty Program Settings", icon: Wallet, path: "/dashboard/wallets" },
    { id: "coupons", label: "Coupons", icon: Ticket, path: "/dashboard/coupons" },
    { id: "staff", label: "Delivery Riders", icon: UserCheck, path: "/dashboard/staff" },
    { id: "users", label: "Team Staff", icon: ShieldCheck, path: "/dashboard/users" },
    { id: "rules", label: "Settings", icon: SettingsIcon, path: "/dashboard/rules" },
  ]

  const [rolePermissions, setRolePermissions] = useState<{ [role: string]: string[] }>({
    "Owner": ["overview", "orders", "menu", "outlets", "customers", "payments", "wallets", "coupons", "staff", "users", "rules", "reports", "reviews"],
    "Rider": ["overview", "orders"],
    "Delivery Staff": ["overview", "orders"],
    "Delivery Rider": ["overview", "orders"],
    "Delivery Riders": ["overview", "orders"],
    "Riders": ["overview", "orders"],
  })

  const isRiderRole = ["Delivery Staff", "Delivery Rider", "Delivery Riders", "Rider", "Riders"].includes(userRole);

  // Sync roles and permissions from backend database/context to local state
  useEffect(() => {
    if (roles && roles.length > 0) {
      const permsMap: { [role: string]: string[] } = {};
      roles.forEach(r => {
        const normalizedName = r.name.trim().toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        permsMap[normalizedName] = r.permissions || [];
      });
      setRolePermissions(prev => {
        const merged = { ...prev, ...permsMap };
        if (typeof window !== "undefined") {
          localStorage.setItem("nirago_role_permissions", JSON.stringify(merged));
        }
        return merged;
      });
    }
  }, [roles])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPerms = localStorage.getItem("nirago_role_permissions")
      if (savedPerms) {
        try {
          const parsed = JSON.parse(savedPerms)
          
          // Ensure Owner always has full access
          if (!parsed["Owner"]) {
            parsed["Owner"] = ["overview", "orders", "menu", "outlets", "customers", "payments", "wallets", "coupons", "staff", "users", "rules", "reports", "reviews"]
          }

          // Ensure Rider roles always have access (backend does not populate roleId/permissions for riders in /me)
          const riderRoles = ["Delivery Staff", "Delivery Rider", "Delivery Riders", "Rider", "Riders"];
          riderRoles.forEach(r => {
            if (!parsed[r]) {
              parsed[r] = ["overview", "orders"];
            }
          });
          
          setRolePermissions(parsed)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [pathname])

  useEffect(() => {
    if (typeof window !== "undefined" && userRole) {
      const currentTab = getActiveTabName()
      const savedPerms = localStorage.getItem("nirago_role_permissions")
      let perms = rolePermissions
      if (savedPerms) {
        try {
          perms = JSON.parse(savedPerms)
        } catch (e) {
          console.error(e)
        }
      }

      const allowed = perms[userRole] || []
      const isOwner = userRole === "Owner" || userRole === "super admin" || userRole === "Super Admin"

      if (!isOwner && currentTab !== "overview" && currentTab !== "" && !allowed.includes(currentTab)) {
        const fallback = allowed[0] ? `/dashboard/${allowed[0]}` : "/dashboard"
        router.push(fallback)
      }
    }
  }, [pathname, userRole])

  const allowedItems = rolePermissions[userRole] || []

  const filteredNavItems = navItems.filter(item => {
    const isOwner = userRole === "Owner" || userRole === "super admin" || userRole === "Super Admin"
    if (isOwner && item.id === "outlet-settings") return false
    if (isOwner) return true
    if (item.id === "overview") return true
    return allowedItems.includes(item.id)
  }).map(item => {
    if (isRiderRole && item.id === "orders") {
      return {
        ...item,
        label: "My Deliveries",
        badge: orders.filter(o => o.deliveryStaff === userName && o.status === "OUT_FOR_DELIVERY").length
      }
    }
    if (userRole === "Outlet Manager" && item.id === "orders") {
      return {
        ...item,
        badge: orders.filter(o => o.outlet === userOutlet && (o.status === "PLACED" || o.status === "PREPARING")).length
      }
    }
    return item
  })

  const renderSidebar = (onItemClick?: () => void) => (
    <div className="flex flex-col justify-between h-full bg-[#f5f5e6]">
      <div>
        {/* Logo & Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#d2d2c4] gap-3 bg-[#e6e6d8]/30">
          <img src="/Cafe-logo.png" alt="NIRAGO Logo" className="h-9 w-9 object-contain" />
          <div>
            <h1 className="font-bold text-[#556B2F] tracking-tight leading-none text-base">NIRAGO</h1>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              {isRiderRole ? "Riders Section" : userRole === "Outlet Manager" ? "Outlet Section" : "Admin Section"}
            </span>
          </div>
        </div>

        {/* Outlet Manager: Show assigned outlet name */}
        {userRole === "Outlet Manager" && userOutlet && (
          <div className="mx-4 mt-1 px-3 py-1.5 bg-[#556B2F]/10 border border-[#556B2F]/20 rounded-lg">
            <span className="text-[10px] font-bold text-[#556B2F] uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{userOutlet}</span>
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar">
          {filteredNavItems.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.path
            return (
              <Link
                key={`tab-${tab.id}`}
                href={tab.path}
                onClick={onItemClick}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-[#556B2F] text-[#FFFFF0] shadow-sm"
                    : "text-[#2d3822]/80 hover:bg-[#e6e6d8] hover:text-[#556B2F]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#FFFFF0]" : "text-[#556B2F]")} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-xs font-bold rounded-full",
                    isActive ? "bg-[#FFFFF0] text-[#556B2F]" : "bg-[#556B2F] text-[#FFFFF0]"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#d2d2c4] bg-[#e6e6d8]/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-all text-left cursor-pointer"
            title="Edit Profile"
          >
            <Avatar className="h-9 w-9 border border-[#556B2F]/20 shrink-0">
              {userImage ? (
                <img src={userImage} alt={userName} className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-[#556B2F] text-[#FFFFF0] font-bold text-xs">
                  {userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-none truncate text-[#2d3822]">{userName}</p>
              <span className="text-[10px] text-neutral-500 truncate block">{userRole}</span>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-neutral-500 transition-colors cursor-pointer shrink-0"
            title="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-[#FFFFF0] text-[#2d3822] font-sans overflow-hidden">

      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className={cn(
        "hidden xl:flex bg-[#f5f5e6] border-r border-[#d2d2c4] flex-col justify-between shrink-0 shadow-sm transition-all duration-300",
        isSidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"
      )}>
        {renderSidebar()}
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#d2d2c4] bg-white flex items-center justify-between px-4 xl:px-8 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="xl:hidden border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6] h-8.5 w-8.5">
                  <HamburgerIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-[#f5f5e6] border-r border-[#d2d2c4] h-full" showCloseButton={false}>
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Nirago Admin control panel routing options</SheetDescription>
                </SheetHeader>
                {renderSidebar(() => setIsMobileOpen(false))}
              </SheetContent>
            </Sheet>

            {/* Desktop Sidebar Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden xl:flex border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6] h-8.5 w-8.5 items-center justify-center cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <HamburgerIcon className="h-5 w-5" />
            </Button>

            <span className="text-[10px] xl:text-xs font-semibold text-neutral-400 whitespace-nowrap">Nirago Admin</span>
            <ChevronRight className="h-3 w-3 text-neutral-400 shrink-0" />
            <span className="text-[10px] xl:text-xs font-semibold text-[#556B2F] uppercase tracking-wider whitespace-nowrap">{activeTab}</span>
          </div>

          <div className="flex items-center gap-2 xl:gap-4">
            {originalRole && (
              <Button
                variant="outline"
                size="xs"
                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 text-[10px] md:text-xs font-bold py-1 px-2.5 rounded flex items-center gap-1 cursor-pointer shrink-0"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("nirago_user_role", originalRole)
                    localStorage.removeItem("nirago_original_role")
                    localStorage.removeItem("nirago_user_outlet")
                    Swal.fire({
                      title: "Switching back",
                      text: "Returning to Master Admin panel...",
                      icon: "success",
                      timer: 1200,
                      showConfirmButton: false
                    }).then(() => {
                      window.location.href = "/dashboard"
                    })
                  }
                }}
              >
                Return to Master Admin
              </Button>
            )}


            {!isRiderRole && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsNotificationsOpen(true)}
                className="h-8 md:h-8.5 w-8 md:w-8.5 relative border-[#d2d2c4] text-[#556B2F] hover:bg-[#f5f5e6] cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none shadow-sm">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </header>

        {/* Dynamic Pages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FFFFF0]">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-[#d2d2c4] bg-white flex flex-col sm:flex-row items-center justify-between px-4 md:px-8 py-3 shrink-0 gap-2 text-xs text-neutral-500 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-center sm:text-left leading-relaxed">
            <span className="font-playfair italic font-bold text-[#556B2F] tracking-wide text-sm">Cafe De Nira®</span>
            <span> is brand owned by </span>
            <span className="font-semibold text-neutral-700">Naviraasat Group of Private limited®</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            © {new Date().getFullYear()} Nirago Admin. All rights reserved.
          </div>
        </footer>
      </main>

      {/* User Profile Sheet */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent
          side="right"
          className="bg-[#FFFFF0] border-l border-[#d2d2c4] !w-full sm:!max-w-md p-6 overflow-y-auto z-[100] dark:text-[#2d3822]"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <SheetHeader className="pb-4 border-b border-[#d2d2c4] pr-8">
            <SheetTitle className="text-xl font-bold text-[#2d3822] flex items-center gap-2 whitespace-nowrap">
              <User className="h-5 w-5 text-[#556B2F]" /> My Profile Details
            </SheetTitle>
            <SheetDescription className="text-neutral-500">
              View and update your personal credentials, contact email, and password.
            </SheetDescription>
          </SheetHeader>

          {/* Profile Image & Role Banner */}
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-[#556B2F]/40 shadow-md">
                {newProfileImage ? (
                  <img src={newProfileImage} alt={userName} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-[#556B2F] text-[#FFFFF0] font-bold text-xl">
                    {userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-[#2d3822] text-lg">{userName}</h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#556B2F]/10 text-[#556B2F] border border-[#556B2F]/20 uppercase tracking-wider">
                {userRole}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Basic Info Card */}
            <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#556B2F] flex items-center gap-2 border-b border-neutral-100 pb-2">
                <User className="h-4 w-4" /> Basic Information
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Full Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Profile Image URL</label>
                  <div className="relative">
                    <Input
                      placeholder="Paste image link address"
                      value={newProfileImage}
                      onChange={(e) => setNewProfileImage(e.target.value)}
                      className="pr-10"
                    />
                    <ImageIcon className="h-4 w-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <Button
                  className="w-full bg-[#556B2F] hover:bg-[#405223] text-white"
                  onClick={handleSaveBasicProfile}
                >
                  Save Basic Details
                </Button>
              </div>
            </div>

            {/* Email Verification / Change Card */}
            <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#556B2F] flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</span>
                <button
                  onClick={() => {
                    setIsEditingEmail(!isEditingEmail)
                    setOtpSent(false)
                    setTempEmail("")
                  }}
                  className="p-1 hover:bg-[#e6e6d8] rounded-md transition-colors text-neutral-500 hover:text-[#556B2F] cursor-pointer"
                  title="Edit Email"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </h3>
              <div className="space-y-3">
                <div className="text-xs text-neutral-500">
                  Current Email: <span className="font-semibold text-neutral-700">{userEmail}</span>
                </div>
                {isEditingEmail && (!otpSent || pendingField !== "email") && (
                  <div className="space-y-3 pt-2 border-t border-dashed border-neutral-100 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-600">New Email Address</label>
                      <Input
                        type="email"
                        placeholder="new-email@nirago.com"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5"
                      onClick={() => handleSendOtp("email")}
                    >
                      Send OTP Verification
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Verification / Change Card */}
            <div className="bg-white p-4 rounded-xl border border-[#d2d2c4] space-y-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#556B2F] flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="flex items-center gap-2"><Key className="h-4 w-4" /> Password</span>
                <button
                  onClick={() => {
                    setIsEditingPassword(!isEditingPassword)
                    setOtpSent(false)
                    setCurrentPasswordInput("")
                    setTempPassword("")
                    setConfirmPassword("")
                  }}
                  className="p-1 hover:bg-[#e6e6d8] rounded-md transition-colors text-neutral-500 hover:text-[#556B2F] cursor-pointer"
                  title="Edit Password"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </h3>
              <div className="space-y-3">
                {isEditingPassword && (!otpSent || pendingField !== "password") && (
                  <div className="space-y-3 pt-2 border-t border-dashed border-neutral-100 animate-in fade-in duration-200">
                    <p className="text-xs text-neutral-600">
                      To change your password, we will send a secure token to your registered email address.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        className="w-full bg-[#556B2F] hover:bg-[#405223] text-white"
                        onClick={() => handleForgotPasswordAPI(userEmail)}
                      >
                        Reset Password via Email
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OTP Input Form (Conditional on pending verification) */}
            {otpSent && pendingField && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3 shadow-xs">
                <h4 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Verify OTP Security Code
                </h4>
                <p className="text-xs text-neutral-600">
                  Please enter the 6-digit verification code sent to your registered account to confirm updates.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter 6-digit OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    maxLength={6}
                    className="bg-white text-center font-mono tracking-widest text-lg font-bold"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                      onClick={handleVerifyOtpAndSave}
                    >
                      Verify & Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="border-neutral-300 text-neutral-600 text-xs"
                      onClick={() => {
                        setOtpSent(false)
                        setEnteredOtp("")
                        setPendingField(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Notifications Drawer */}
      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent side="right" className="bg-[#FFFFF0] border-l border-[#d2d2c4] !w-full sm:!max-w-xl p-6 overflow-y-auto z-[100] flex flex-col h-full dark:text-[#2d3822]">
          <SheetHeader className="pb-4 border-b border-[#d2d2c4] shrink-0 pr-8">
            <div className="flex items-center justify-between gap-4">
              <SheetTitle className="text-xl font-bold text-[#2d3822] flex items-center gap-2 whitespace-nowrap">
                <Bell className="h-5 w-5 text-[#556B2F]" /> Sent Notifications
              </SheetTitle>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="xs"
                  className="border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/10 text-[10px] h-7 px-2 font-semibold cursor-pointer flex items-center gap-1"
                  onClick={() => {
                    setIsSendNotifOpen(true)
                    setIsNotificationsOpen(false)
                  }}
                >
                  <Plus className="h-3 w-3" /> Send
                </Button>
              </div>
            </div>
            <SheetDescription className="text-neutral-500">
              Monitor history and read status of custom notifications sent to customers.
            </SheetDescription>
          </SheetHeader>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 py-4 border-b border-neutral-200 shrink-0">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: `Unread (${notifications.filter(n => sentNotifIds.includes(n.id) && !n.read).length})` },
              { id: "order", label: "Orders" },
              { id: "payment", label: "Payments" },
              { id: "wallet", label: "Wallet" },
              { id: "promotion", label: "Promotions" },
              { id: "system", label: "System" }
            ].map((tab) => (
              <button
                key={`drawer-tab-${tab.id}`}
                onClick={() => setNotifActiveTab(tab.id as any)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer",
                  notifActiveTab === tab.id
                    ? "bg-[#556B2F] border-[#556B2F] text-[#FFFFF0] shadow-sm"
                    : "bg-white border-[#d2d2c4] text-neutral-600 hover:border-[#556B2F] hover:text-[#556B2F]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List scroll container */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 no-scrollbar">
            {(() => {
              const list = notifications
                .filter(n => sentNotifIds.includes(n.id))
                .filter(n => {
                  if (notifActiveTab === "all") return true
                  if (notifActiveTab === "unread") return !n.read
                  if (notifActiveTab === "promotion") return (n.type as string) === "promotion" || (n.type as string) === "coupon"
                  return (n.type as string) === notifActiveTab
                })

              if (list.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <BellOff className="h-8 w-8 text-neutral-400" />
                    <p className="text-xs font-bold text-[#2d3822]">No notifications found</p>
                    <span className="text-[10px] text-neutral-500">All caught up!</span>
                  </div>
                )
              }

              return list.map((notif) => (
                <div
                  key={`drawer-notif-${notif.id}`}
                  className={cn(
                    "p-3 rounded-lg border flex gap-3 transition-all relative",
                    notif.read
                      ? "border-[#d2d2c4] bg-white/50 opacity-80"
                      : "border-[#556B2F]/30 bg-[#f5f5e6]/25 shadow-xs border-l-4 border-l-[#556B2F]"
                  )}
                >
                  <div className="p-2 bg-white rounded-md border border-[#d2d2c4]/60 shrink-0 h-9 w-9 flex items-center justify-center shadow-xs">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5 text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-neutral-800 truncate">{notif.title}</span>
                      <span className={cn("text-[8px] font-bold uppercase px-1 py-0.2 rounded border", getBadgeStyle(notif.type))}>
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-normal line-clamp-3">{notif.description}</p>
                    {notif.customerName && (
                      <div className="text-[10px] font-bold text-[#556B2F] bg-[#f5f5e6] border border-[#d2d2c4]/50 px-2 py-0.5 rounded w-max mt-1">
                        To: {notif.customerName} {notif.customerEmail && `(${notif.customerEmail})`}
                      </div>
                    )}
                    <span className="text-[9px] font-mono text-neutral-400 block pt-0.5">{notif.timestamp}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 shrink-0 self-center">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkNotifAsRead(notif.id)}
                        className="p-1 hover:bg-[#e6e6d8] rounded text-[#556B2F] hover:text-[#2d3822] cursor-pointer"
                        title="Mark as Read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleNotifDelete(notif.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700 cursor-pointer"
                      title="Delete Notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            })()}
          </div>
        </SheetContent>
      </Sheet>

      {/* Send Notification Dialog */}
      <Dialog open={isSendNotifOpen} onOpenChange={setIsSendNotifOpen}>
        <DialogContent className="bg-[#FFFFF0] border border-[#d2d2c4] text-[#2d3822] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#556B2F] font-bold text-lg flex items-center gap-2">
              <Send className="h-5 w-5" /> Send Custom Notification
            </DialogTitle>
            <DialogDescription className="text-neutral-600 text-xs">
              Send a real-time push notification and status log to a customer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3822]">Select Customer</label>
              <select
                value={notifCustomerId}
                onChange={(e) => setNotifCustomerId(e.target.value)}
                className="w-full rounded-md border border-[#d2d2c4] bg-white px-3 py-2 text-xs text-[#2d3822] focus:border-[#556B2F] focus:outline-none"
              >
                <option value="">-- Choose a Customer --</option>
                {customers && customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email || c.phone || "No contact info"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3822]">Notification Type</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as any)}
                className="w-full rounded-md border border-[#d2d2c4] bg-white px-3 py-2 text-xs text-[#2d3822] focus:border-[#556B2F] focus:outline-none"
              >
                <option value="system">System Alert</option>
                <option value="order">Order Update</option>
                <option value="payment">Payment Alert</option>
                <option value="wallet">Wallet Update</option>
                <option value="coupon">Coupon Code</option>
                <option value="promotion">Promotion/Offer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3822]">Title</label>
              <Input
                type="text"
                placeholder="e.g. Special Discount Just For You!"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="bg-white border-[#d2d2c4] text-xs text-[#2d3822] focus-visible:ring-[#556B2F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2d3822]">Message</label>
              <textarea
                placeholder="Type notification message here..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-[#d2d2c4] bg-white px-3 py-2 text-xs text-[#2d3822] focus:border-[#556B2F] focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSendNotifOpen(false)}
                className="border-[#d2d2c4] text-neutral-600 hover:bg-[#d2d2c4]/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSendingNotif}
                className="bg-[#556B2F] hover:bg-[#556B2F]/90 text-[#FFFFF0] font-bold text-xs"
              >
                {isSendingNotif ? "Sending..." : "Send Notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
