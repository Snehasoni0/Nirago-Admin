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
  ArrowLeft, 
  Bike, 
  AlertCircle,
  ArrowRight,
  Loader2,
  Store,
  Users
} from "lucide-react"
import Swal from "sweetalert2"

type LoginMode = "owner-login" | "select-frontline" | "manager-login" | "rider-login";

// Normalize role names to Title Case so they match the hardcoded keys in layout.tsx
const toTitleCase = (str: string) => str.trim().toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<LoginMode>("owner-login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setError("")
    setShowPassword(false)
    setIsLoading(false)
  }

  // Unified login handler that picks the right API route based on mode
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const cleanEmail = email.trim()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      setError("Please enter both email and password.")
      setIsLoading(false)
      return
    }

    // Master admin shortcut (owner login only)
    if (mode === "owner-login") {
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
        setIsLoading(false)
        return
      }
    }

    // Determine API endpoint based on mode
    let loginPath = "/admin/auth/login"
    if (mode === "manager-login") {
      loginPath = "/outlet/auth/login"
    } else if (mode === "rider-login") {
      loginPath = "/driver/auth/login"
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${loginPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        const token = data.data.token

        const rawRole = data.data.user.role?.name || data.data.user.roleId?.name || 
          (mode === "rider-login" ? "Delivery Staff" : mode === "manager-login" ? "Outlet Manager" : "Owner")
        const finalRole = toTitleCase(rawRole)

        // Owner login form: only allow Super Admin / Owner / Admin roles
        if (mode === "owner-login") {
          const allowedAdminRoles = ["Owner", "Super Admin", "Admin"]
          if (!allowedAdminRoles.includes(finalRole)) {
            // Clear the token cookie since we're rejecting this login
            document.cookie = "nirago_admin_token=; path=/; max-age=0"
            setError("This portal is for Admin access only. Please use the 'Frontline Staff Login' button below.")
            setIsLoading(false)
            return
          }
        }

        document.cookie = `nirago_admin_token=${token}; path=/; max-age=86400; SameSite=Strict`

        localStorage.setItem("nirago_admin_logged_in", "true")
        localStorage.setItem("nirago_user_role", finalRole)
        localStorage.setItem("nirago_user_name", data.data.user.name)
        localStorage.setItem("nirago_user_email", cleanEmail.toLowerCase())

        const outletName = data.data.user.outlet?.name || data.data.user.outletId?.name
        if (outletName) {
          localStorage.setItem("nirago_user_outlet", outletName)
        } else {
          localStorage.removeItem("nirago_user_outlet")
        }

        if (data.data.isRider) {
          localStorage.setItem("nirago_is_rider", "true")
        } else {
          localStorage.removeItem("nirago_is_rider")
        }

        const welcomeTitle = mode === "rider-login" ? "Rider Logged In" : mode === "manager-login" ? "Manager Logged In" : "Login Successful"

        Swal.fire({
          title: welcomeTitle,
          text: `Welcome back, ${data.data.user.name}! Opening dashboard...`,
          icon: "success",
          confirmButtonColor: "#556B2F",
          timer: 1000,
          showConfirmButton: false
        }).then(() => {
          router.push("/dashboard")
        })
        setIsLoading(false)
        return
      }

      setError(data.message || "Invalid credentials. Please try again.")
    } catch (err) {
      console.error("Login API error:", err)
      setError("Unable to connect to server. Please check your connection and try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 bg-white/95 dark:bg-[#151911]/95 backdrop-blur-md shadow-2xl ring-1 ring-black/5 dark:ring-white/10 max-w-4xl w-full rounded-2xl">
        <CardContent className={cn("p-0", (mode === "owner-login" || mode === "manager-login" || mode === "rider-login") && "grid md:grid-cols-2")}>

          {/* ═══════════════════════════════════════ */}
          {/* DEFAULT: OWNER / ADMIN LOGIN (left form + right image) */}
          {/* ═══════════════════════════════════════ */}
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

                <form onSubmit={handleLogin} className="space-y-3.5">
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

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#2d3822] hover:bg-black text-white font-extrabold transition-all shadow-md h-10 rounded-lg cursor-pointer text-xs"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</span>
                    ) : (
                      "Verify & Access Console"
                    )}
                  </Button>
                </form>

                {/* Frontline Login Button */}
                <div className="pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => { setMode("select-frontline"); resetForm() }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[#556B2F]/20 bg-[#556B2F]/5 hover:bg-[#556B2F]/10 text-[#556B2F] font-bold text-xs transition-all cursor-pointer group"
                  >
                    <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Frontline Staff Login
                    <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center mt-1.5">
                    For Outlet Managers & Delivery Riders
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* FRONTLINE ROLE SELECTION (Manager / Rider) */}
          {/* ═══════════════════════════════════════ */}
          {mode === "select-frontline" && (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300 md:col-span-2">
              <button 
                type="button"
                onClick={() => { setMode("owner-login"); resetForm() }}
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
                  Select your role to log in with your credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl pt-2">
                {/* Store Manager Card */}
                <button
                  onClick={() => { setMode("manager-login"); resetForm() }}
                  className="flex flex-col items-center p-6 bg-[#fcfcf9] hover:bg-[#f5f5e6]/40 border border-[#d2d2c4] hover:border-[#556B2F] rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-xs hover:shadow-md text-center"
                >
                  <div className="h-14 w-14 rounded-full bg-[#556B2F]/10 text-[#556B2F] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[#556B2F]/20">
                    <Store className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#2d3822] dark:text-white mt-4">Outlet Manager</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    Manage orders, kitchen, menu & outlet staff.
                  </p>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#556B2F] bg-[#556B2F]/10 px-2 py-0.5 rounded-md mt-4">
                    Tap to Login
                  </span>
                </button>

                {/* Delivery Rider Card */}
                <button
                  onClick={() => { setMode("rider-login"); resetForm() }}
                  className="flex flex-col items-center p-6 bg-[#fcfcf9] hover:bg-[#f5f5e6]/40 border border-[#d2d2c4] hover:border-emerald-600 rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-xs hover:shadow-md text-center"
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

          {/* ═══════════════════════════════════════ */}
          {/* OUTLET MANAGER LOGIN FORM */}
          {/* ═══════════════════════════════════════ */}
          {mode === "manager-login" && (
            <div className="p-8 sm:p-10 flex flex-col justify-center animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto w-full min-h-[400px]">
              <div className="space-y-5 flex flex-col justify-center h-full">
                <button 
                  onClick={() => { setMode("select-frontline"); resetForm() }}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#556B2F] font-bold transition-all cursor-pointer mr-auto"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Roles
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#556B2F]/10 text-[#556B2F] flex items-center justify-center">
                      <Store className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-black text-[#2d3822]">Outlet Manager Login</h2>
                  </div>
                  <p className="text-xs text-neutral-500 pl-10">
                    Login with your outlet manager credentials.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Manager Email</label>
                      <Input
                        type="email"
                        placeholder="e.g., manager@nirago.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#fcfcf9] border-neutral-300 text-neutral-900 focus-visible:ring-[#556B2F] h-10 px-3 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                  </div>

                  {error && (
                    <p className="text-[11px] text-red-600 font-bold flex items-center justify-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200/50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                    </p>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#556B2F] hover:bg-[#405223] text-white font-extrabold transition-all h-10 rounded-lg cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                    ) : (
                      <><Store className="h-4 w-4" /> Enter Outlet Dashboard</>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* DELIVERY RIDER LOGIN FORM */}
          {/* ═══════════════════════════════════════ */}
          {mode === "rider-login" && (
            <div className="p-8 sm:p-10 flex flex-col justify-center animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto w-full min-h-[400px]">
              <div className="space-y-5 flex flex-col justify-center h-full">
                <button 
                  onClick={() => { setMode("select-frontline"); resetForm() }}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-emerald-600 font-bold transition-all cursor-pointer mr-auto"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Roles
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Bike className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-black text-[#2d3822]">Delivery Rider Login</h2>
                  </div>
                  <p className="text-xs text-neutral-500 pl-10">
                    Login with your rider credentials.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Rider Email</label>
                      <Input
                        type="email"
                        placeholder="e.g., rider@nirago.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#fcfcf9] border-neutral-300 text-neutral-900 focus-visible:ring-emerald-500 h-10 px-3 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Rider Password / PIN</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                  </div>

                  {error && (
                    <p className="text-[11px] text-red-600 font-bold flex items-center justify-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200/50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                    </p>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition-all h-10 rounded-lg cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                    ) : (
                      <><Bike className="h-4 w-4" /> Start Delivery Shift</>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* RIGHT SIDE IMAGE (shown on all login forms) */}
          {/* ═══════════════════════════════════════ */}
          {mode !== "select-frontline" && (
            <div className="relative hidden bg-neutral-900 md:flex min-h-[400px] items-center justify-center">
              <img
                src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg"
                alt="Restaurant background"
                className="absolute inset-0 h-full w-full object-cover opacity-85 blur-[3px]"
              />
              <div className={cn(
                "absolute inset-0 mix-blend-multiply",
                mode === "rider-login" ? "bg-emerald-800/30" : "bg-[#556B2F]/30"
              )} />
              
              <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                <img src="/brand-logo.png" alt="Nirago Logo" className="h-40 w-40 sm:h-48 sm:w-48 object-contain rounded-3xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                {mode !== "owner-login" && (
                  <div className="text-center">
                    <p className="text-white/90 font-extrabold text-sm tracking-wide drop-shadow-lg">
                      {mode === "manager-login" && "Outlet Manager Portal"}
                      {mode === "rider-login" && "Delivery Rider Portal"}
                    </p>
                    <p className="text-white/60 text-[10px] font-medium mt-1">Powered by Nirago Admin</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
