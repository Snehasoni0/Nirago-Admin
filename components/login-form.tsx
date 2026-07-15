"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { 
  Eye, 
  EyeOff, 
  UserCheck, 
  Smartphone, 
  HelpCircle, 
  ArrowLeft, 
  ShieldAlert, 
  User, 
  Bike, 
  ChefHat,
  Users,
  MapPin,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import Swal from "sweetalert2"

type LoginMode = "select-role" | "owner-login" | "manager-login" | "rider-login"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<LoginMode>("owner-login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [demoMode, setDemoMode] = useState(true)
  const [usersList, setUsersList] = useState<any[]>([])
  const router = useRouter()

  React.useEffect(() => {
    const defaultUsers = [
      { id: "1", name: "Siddharth Goel", email: "siddharth@nirago.com", password: "Password123", role: "Owner", status: "ACTIVE" },
      { id: "2", name: "Rohan Khanna", email: "rohan@nirago.com", password: "Password123", role: "Manager", status: "ACTIVE" },
      { id: "3", name: "Chef Vikas", email: "vikas@nirago.com", password: "Password123", role: "Kitchen Staff", status: "ACTIVE" },
      { id: "4", name: "Amit Kumar", email: "amit@nirago.com", password: "Password123", role: "Delivery Staff", status: "ACTIVE" },
      { id: "5", name: "Ramesh Kumar", email: "ramesh@nirago.com", password: "Ramesh123", role: "Delivery Staff", status: "ACTIVE" },
      { id: "6", name: "Priya Mehra", email: "priya@nirago.com", password: "Priya123", role: "Outlet Manager", status: "ACTIVE", assignedOutlet: "Nirago Elite (Connaught Place)" },
      { id: "7", name: "Neha Verma", email: "neha@nirago.com", password: "Neha123", role: "Outlet Manager", status: "ACTIVE", assignedOutlet: "Nirago Express (GK-2)" },
      { id: "8", name: "Arjun Kapoor", email: "arjun@nirago.com", password: "Arjun123", role: "Outlet Manager", status: "ACTIVE", assignedOutlet: "Nirago Bistro (DLF Phase 3)" },
    ]

    // Commented out to prevent 401 console error before login
    /*
    const fetchUsersDirectly = async () => {
      try {
        const tokenMatch = document.cookie.match(/(^| )nirago_admin_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[2] : null;
        console.log("[LOGIN-FORM] API Token present in cookies:", !!token);

        const headers: any = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/user?page=1&limit=100`;
        console.log("[LOGIN-FORM] Requesting users list from API:", url);

        const res = await fetch(url, { headers });
        console.log("[LOGIN-FORM] HTTP Status Response:", res.status);

        const data = await res.json();
        console.log("[LOGIN-FORM] Users API Full Response payload:", data);

        if (res.ok && data.success) {
          const usersArray = data.data?.users || data.data?.docs || (Array.isArray(data.data) ? data.data : []);
          console.log("[LOGIN-FORM] Parsed users count:", usersArray.length);

          if (usersArray.length > 0) {
            const mappedUsers = usersArray.map((u: any) => ({
              id: u._id || u.id,
              name: u.name,
              email: u.email,
              password: "",
              role: u.role?.name || (typeof u.roleId === 'object' ? u.roleId?.name : u.roleId) || "Manager",
              status: u.status ? u.status.toUpperCase() : "ACTIVE",
              assignedOutlet: u.outlet?.name || (typeof u.outletId === 'object' ? u.outletId?.name : u.outletId) || u.assignedOutlet || "",
            }));
            
            setUsersList(mappedUsers);
            localStorage.setItem("nirago_admin_users", JSON.stringify(mappedUsers));
            console.log("[LOGIN-FORM] Mapped & stored database users successfully:", mappedUsers);
            return;
          }
        }
      } catch (err) {
        console.error("[LOGIN-FORM] Failed to fetch users list directly:", err);
      }
    };
    fetchUsersDirectly();
    */

    // Local storage fallback
    if (typeof window !== "undefined") {
      const savedUsersRaw = localStorage.getItem("nirago_admin_users")
      if (savedUsersRaw) {
        try {
          setUsersList(JSON.parse(savedUsersRaw))
        } catch (e) {
          setUsersList(defaultUsers)
        }
      } else {
        localStorage.setItem("nirago_admin_users", JSON.stringify(defaultUsers))
        setUsersList(defaultUsers)
      }
    }
  }, [])

  // Core login execution logic
  const executeLogin = async (userEmail: string, userPass: string) => {
    setError("")
    const cleanEmail = userEmail.trim()
    const cleanPassword = userPass.trim()

    const masterEmail = process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL || "admin@nirago.com"
    const masterPassword = process.env.NEXT_PUBLIC_MASTER_ADMIN_PASSWORD || "NiragoAdmin2026"

    if (cleanEmail.toLowerCase() === masterEmail.toLowerCase() && cleanPassword === masterPassword) {
      localStorage.setItem("nirago_admin_logged_in", "true")
      localStorage.setItem("nirago_user_role", "Owner")
      localStorage.setItem("nirago_user_name", "Master Admin")
      localStorage.setItem("nirago_user_email", cleanEmail.toLowerCase())
      localStorage.removeItem("nirago_user_outlet")
      
      Swal.fire({
        title: "Welcome Admin",
        text: "Directing to Owner console...",
        icon: "success",
        confirmButtonColor: "#556B2F",
        timer: 800,
        showConfirmButton: false
      }).then(() => {
        router.push("/dashboard")
      })
      return
    }

    // Try API authentication first so we support real passwords from the database
    try {
      let loginType = "admin"
      if (mode === "rider-login") loginType = "driver"
      else if (mode === "manager-login") loginType = "outlet"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword, loginType })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Set token in cookies for authenticating dashboard requests
        const token = data.data.token;
        document.cookie = `nirago_admin_token=${token}; path=/; max-age=86400; SameSite=Strict`;
        
        localStorage.setItem("nirago_admin_logged_in", "true")
        const finalRole = data.data.user.role?.name || data.data.user.roleId?.name || (loginType === "driver" ? "Delivery Staff" : "Manager");
        localStorage.setItem("nirago_user_role", finalRole)
        localStorage.setItem("nirago_user_name", data.data.user.name)
        localStorage.setItem("nirago_user_email", cleanEmail.toLowerCase())
        if (data.data.user.outlet?.name || data.data.user.outletId?.name) {
          localStorage.setItem("nirago_user_outlet", data.data.user.outlet?.name || data.data.user.outletId?.name)
        } else {
          localStorage.removeItem("nirago_user_outlet")
        }

        Swal.fire({
          title: "Login Successful",
          text: `Welcome back, ${data.data.user.name}! Opening dashboard...`,
          icon: "success",
          confirmButtonColor: "#556B2F",
          timer: 1000,
          showConfirmButton: false
        }).then(() => {
          router.push("/dashboard")
        })
        return;
      }
    } catch (err) {
      console.error("API login failed/errored, trying local fallback:", err);
    }

    if (typeof window !== "undefined") {
      const savedUsersRaw = localStorage.getItem("nirago_admin_users")
      let allUsers: any[] = []
      if (savedUsersRaw) {
        try {
          allUsers = JSON.parse(savedUsersRaw)
        } catch (err) {
          console.error("Error parsing admin users", err)
        }
      }

      const matchedUser = allUsers.find(
        (u: any) => u.email.toLowerCase() === cleanEmail.toLowerCase() && u.password === cleanPassword
      )

      if (matchedUser) {
        if (matchedUser.status === "BLOCKED" || matchedUser.status === "INACTIVE") {
          setError("Your account is currently inactive or blocked. Please contact the owner.")
          return
        }
        localStorage.setItem("nirago_admin_logged_in", "true")
        localStorage.setItem("nirago_user_role", matchedUser.role)
        localStorage.setItem("nirago_user_name", matchedUser.name)
        localStorage.setItem("nirago_user_email", matchedUser.email.toLowerCase())
        if (matchedUser.assignedOutlet) {
          localStorage.setItem("nirago_user_outlet", matchedUser.assignedOutlet)
        } else {
          localStorage.removeItem("nirago_user_outlet")
        }

        Swal.fire({
          title: "Login Successful",
          text: `Welcome back, ${matchedUser.name}! Opening dashboard...`,
          icon: "success",
          confirmButtonColor: "#556B2F",
          timer: 1000,
          showConfirmButton: false
        }).then(() => {
          router.push("/dashboard")
        })
        return
      }
    }

    setError("Incorrect password. Please verify the credentials and try again.")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "owner-login") {
      executeLogin(email, password)
    } else if (selectedUser) {
      executeLogin(selectedUser.email, password)
    }
  }

  const handleQuickSelection = (userObj: any) => {
    setSelectedUser(userObj)
    setEmail(userObj.email)
    setPassword("") // Do not auto-fetch/prefill password. User will type it.
    setError("")
  }

  // Pre-configured profiles categories derived dynamically from stored users
  const managers = React.useMemo(() => {
    return usersList
      .filter((u: any) => u.role === "Outlet Manager")
      .map((u: any) => ({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        outlet: u.assignedOutlet || "Brand Head Office",
        desc: "Live orders & kitchen manager"
      }));
  }, [usersList]);

  const riders = React.useMemo(() => {
    return usersList
      .filter((u: any) => u.role === "Delivery Staff" || u.role === "Rider")
      .map((u: any) => {
        let statusText = "🏍️ Active (General)"
        let descText = "Deliveries assigned"
        if (u.assignedOutlet) {
          statusText = `🏍️ Active (${u.assignedOutlet.replace(/Nirago\s+\w+\s+\((.*?)\)/, "$1").replace(" Outlet", "")} Area)`
          descText = `Deliveries assigned in ${u.assignedOutlet}`
        }
        return {
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          status: statusText,
          desc: descText
        }
      });
  }, [usersList]);

  const admins = [
    { name: "Siddharth Goel", email: "siddharth@nirago.com", password: "Password123", role: "Owner", desc: "Access full analytics & settings" },
    { name: "Master Admin", email: "admin@nirago.com", password: "NiragoAdmin2026", role: "Owner", desc: "System default override credentials" }
  ]

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 bg-white/95 dark:bg-[#151911]/95 backdrop-blur-md shadow-2xl ring-1 ring-black/5 dark:ring-white/10 max-w-4xl w-full rounded-2xl">
        <CardContent className={cn("p-0", mode === "owner-login" && "grid md:grid-cols-2")}>
          
          {/* STAGE 1: CHOOSE ROLE */}
          {mode === "select-role" && (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300">
              <button 
                type="button"
                onClick={() => {
                  setMode("owner-login")
                  setSelectedUser(null)
                  setPassword("")
                  setError("")
                }}
                className="flex items-center gap-1.5 text-xs text-[#556B2F] hover:text-[#405223] font-bold transition-all cursor-pointer mr-auto"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Secure Login
              </button>

              <div className="space-y-2">
                <img src="/brand-logo.png" alt="Nirago Logo" className="h-14 w-14 object-contain mx-auto rounded-md" />
                <h1 className="text-3xl font-black tracking-tight text-[#2d3822] dark:text-[#FFFFF0] pt-2">
                  Welcome to Nirago Portal
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                  Simple, one-click access for our store managers and riders. Please select your role to log in.
                </p>
              </div>

              {/* Big Visual Role Selector Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl pt-2">
                {/* 1. Store Manager Card */}
                <button
                  onClick={() => {
                    setMode("manager-login")
                    setSelectedUser(null)
                    setError("")
                  }}
                  className="flex flex-col items-center p-6 bg-[#fcfcf9] hover:bg-[#f5f5e6]/40 border border-[#d2d2c4] hover:border-[#556B2F] rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-xs hover:shadow-md text-center"
                >
                  <div className="h-14 w-14 rounded-full bg-[#556B2F]/10 text-[#556B2F] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[#556B2F]/20">
                    <ChefHat className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#2d3822] dark:text-white mt-4">Store Manager</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    Accept kitchen orders, manage cooking status & staff.
                  </p>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#556B2F] bg-[#556B2F]/10 px-2 py-0.5 rounded-md mt-4">
                    Tap to Login
                  </span>
                </button>

                {/* 2. Delivery Rider Card */}
                <button
                  onClick={() => {
                    setMode("rider-login")
                    setSelectedUser(null)
                    setError("")
                  }}
                  className="flex flex-col items-center p-6 bg-[#fcfcf9] hover:bg-[#f5f5e6]/40 border border-[#d2d2c4] hover:border-[#556B2F] rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-xs hover:shadow-md text-center"
                >
                  <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-emerald-100">
                    <Bike className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#2d3822] dark:text-white mt-4">Delivery Rider</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    Track deliveries, check maps & collect cash.
                  </p>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-4">
                    Tap to Login
                  </span>
                </button>
              </div>



            </div>
          )}

          {/* STAGE 2: STORE MANAGER LOGIN */}
          {mode === "manager-login" && (
            <div className="p-8 sm:p-10 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setMode("select-role")}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#556B2F] font-bold transition-all mb-6 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Roles
              </button>

              <div className="grid md:grid-cols-12 gap-8">
                {/* Left: Quick Select Grid */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-[#2d3822]">Choose your Store Manager profile</h2>
                    <p className="text-xs text-neutral-500">Tap your name to log in immediately without typing email.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {managers.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickSelection(m)}
                        className={cn(
                          "p-4 border rounded-xl text-left transition-all relative flex flex-col justify-between h-[125px] shadow-xs cursor-pointer",
                          selectedUser?.email === m.email 
                            ? "bg-[#556B2F]/10 border-[#556B2F] ring-1 ring-[#556B2F]" 
                            : "bg-white border-[#d2d2c4] hover:bg-[#f5f5e6]/20 hover:border-[#556B2F]"
                        )}
                      >
                        <div>
                          <span className="text-xs font-black text-neutral-800 block">{m.name}</span>
                          <span className="text-[9px] uppercase font-bold text-[#556B2F] mt-1 inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {m.outlet.replace(" Outlet", "")}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-medium leading-none block line-clamp-2 pr-2">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Prefilled Verification Block */}
                <div className="md:col-span-5 bg-white border border-[#d2d2c4] rounded-2xl p-6 flex flex-col justify-center min-h-[300px]">
                  {selectedUser ? (
                    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
                      <div className="text-center space-y-2 pb-2 border-b border-neutral-100">
                        <div className="h-12 w-12 rounded-full bg-[#556B2F] text-white flex items-center justify-center font-black text-base mx-auto">
                          {selectedUser.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#2d3822] text-sm">{selectedUser.name}</h3>
                          <span className="text-[10px] font-bold text-neutral-400 block">{selectedUser.outlet}</span>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-700">Enter Password</label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className="w-full bg-[#fcfcf9] border-neutral-300 text-neutral-900 focus-visible:ring-[#556B2F] h-10 pl-3 pr-10 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer flex items-center justify-center"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {error && (
                          <p className="text-[10px] text-red-600 font-bold flex items-center justify-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200/50">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                          </p>
                        )}

                        <Button 
                          type="submit" 
                          className="w-full bg-[#556B2F] hover:bg-[#405223] text-white font-extrabold transition-all h-10 rounded-lg cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <ArrowRight className="h-4 w-4" /> Enter Kitchen Dashboard
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-8 text-neutral-400 space-y-2">
                      <ChefHat className="h-10 w-10 text-[#556B2F]/20 mx-auto" />
                      <p className="text-xs font-bold">Please select a manager profile on the left to sign in.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: DELIVERY RIDER LOGIN */}
          {mode === "rider-login" && (
            <div className="p-8 sm:p-10 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setMode("select-role")}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-emerald-600 font-bold transition-all mb-6 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Roles
              </button>

              <div className="grid md:grid-cols-12 gap-8">
                {/* Left: Quick Select Grid */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-[#2d3822]">Select your Delivery Rider profile</h2>
                    <p className="text-xs text-neutral-500">Tap your card to log in instantly. Direct mobile portal will open.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {riders.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickSelection(r)}
                        className={cn(
                          "p-4 border rounded-xl text-left transition-all relative flex flex-col justify-between h-[125px] shadow-xs cursor-pointer",
                          selectedUser?.email === r.email 
                            ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500" 
                            : "bg-white border-[#d2d2c4] hover:bg-emerald-50/20 hover:border-emerald-500"
                        )}
                      >
                        <div>
                          <span className="text-xs font-black text-neutral-800 block">{r.name}</span>
                          <span className="text-[9px] font-bold text-emerald-600 mt-1 inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            <Bike className="h-3 w-3" /> {r.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-medium leading-none block line-clamp-2 pr-2">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Prefilled Verification Block */}
                <div className="md:col-span-5 bg-white border border-[#d2d2c4] rounded-2xl p-6 flex flex-col justify-center min-h-[300px]">
                  {selectedUser ? (
                    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
                      <div className="text-center space-y-2 pb-2 border-b border-neutral-100">
                        <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-base mx-auto">
                          <Bike className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#2d3822] text-sm">{selectedUser.name}</h3>
                          <span className="text-[10px] font-bold text-emerald-600 block">{selectedUser.status}</span>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-700">Enter Rider PIN / Password</label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className="w-full bg-[#fcfcf9] border-neutral-300 text-neutral-900 focus-visible:ring-emerald-500 h-10 pl-3 pr-10 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer flex items-center justify-center"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {error && (
                          <p className="text-[10px] text-red-600 font-bold flex items-center justify-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200/50">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                          </p>
                        )}

                        <Button 
                          type="submit" 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition-all h-10 rounded-lg cursor-pointer text-xs flex items-center justify-center gap-1.5"
                        >
                          <Bike className="h-4 w-4" /> Start Delivery Shift
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-8 text-neutral-400 space-y-2">
                      <Bike className="h-10 w-10 text-emerald-600/20 mx-auto" />
                      <p className="text-xs font-bold">Please select a rider profile on the left to sign in.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: OWNER / ADMIN SECURITY LOGIN */}
          {mode === "owner-login" && (
            <div className="p-8 sm:p-10 flex flex-col justify-center animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto w-full min-h-[400px]">
              <div className="space-y-4 flex flex-col justify-center h-full">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[#2d3822] flex items-center gap-2">
                    Owner Portal Sign-In
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Standard email validation required for admin control panel access.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold text-neutral-700">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g., siddharth@nirago.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#fcfcf9] border-neutral-300 text-neutral-900 focus-visible:ring-[#2d3822] h-10 px-3 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="password" className="text-xs font-bold text-neutral-700">
                        Password
                      </label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#fcfcf9] border-neutral-300 text-neutral-900 focus-visible:ring-[#2d3822] h-10 pl-3 pr-10 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer flex items-center justify-center animate-in fade-in"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-[11px] text-red-600 font-bold flex items-center justify-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200/50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                    </p>
                  )}

                  <Button type="submit" className="w-full bg-[#2d3822] hover:bg-black text-white font-extrabold transition-all shadow-md h-10 rounded-lg cursor-pointer text-xs">
                    Verify & Access Console
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Right side background image column */}
          {mode === "owner-login" && (
            <div className="relative hidden bg-neutral-900 md:flex min-h-[400px] items-center justify-center">
              <img
                src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg"
                alt="Restaurant background"
                className="absolute inset-0 h-full w-full object-cover opacity-85 blur-[3px]"
              />
              <div className="absolute inset-0 bg-[#556B2F]/30 mix-blend-multiply" />
              
              <div className="relative z-10 flex items-center justify-center">
                <img src="/brand-logo.png" alt="Nirago Logo" className="h-40 w-40 sm:h-48 sm:w-48 object-contain rounded-3xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

