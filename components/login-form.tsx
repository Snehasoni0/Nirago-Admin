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
  MapPin,
  ArrowRight,
  AlertTriangle
} from "lucide-react"
import Swal from "sweetalert2"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem("nirago_admin_logged_in")
    const hasToken = document.cookie.includes("nirago_admin_token")
    if (isLoggedIn === "true" && hasToken) {
      router.push("/dashboard")
    }
  }, [router])

  const executeLogin = async (userEmail: string, userPass: string) => {
    setError("")
    const cleanEmail = userEmail.trim()
    const cleanPassword = userPass.trim()
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      })
      
      let data;
      let rawText = "";
      try {
        rawText = await res.text();
        data = JSON.parse(rawText);
      } catch (e) {
        console.error("Failed to parse JSON response. Raw response:", rawText);
      }
      
      if (res.ok && data) {
        const actualToken = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
        const userObj = data.user || data.data?.user || {};
        
        if (actualToken) {
          document.cookie = `nirago_admin_token=${actualToken}; path=/; max-age=2592000; SameSite=Lax`;
        } else {
          console.error("Token not found in the response object!");
        }

        // Important: Dashboard layout relies on this localStorage item to stay logged in
        localStorage.setItem("nirago_admin_logged_in", "true")
        
        // Try to set user details from API response, fallback to input email and Owner role
        localStorage.setItem("nirago_user_role", userObj.roleId?.name || userObj.role || "Owner")
        localStorage.setItem("nirago_user_name", userObj.name || "API Admin")
        localStorage.setItem("nirago_user_email", (userObj.email || cleanEmail).toLowerCase())
        if (userObj.assignedOutlet) {
          localStorage.setItem("nirago_user_outlet", userObj.assignedOutlet)
        } else {
          localStorage.removeItem("nirago_user_outlet")
        }
        
        Swal.fire({
          title: "Welcome Back",
          text: "Directing to console...",
          icon: "success",
          confirmButtonColor: "#556B2F",
          timer: 800,
          showConfirmButton: false
        }).then(() => {
          router.push("/dashboard")
        })
        return
      } else {
        setError(data?.message || "Incorrect password or email. Please verify and try again.");
      }
    } catch (err) {
      console.error("Login API Network/Fetch Error:", err)
      setError("Network error. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeLogin(email, password)
  }

  const handleForgotPassword = (prefilledEmail?: string) => {
    Swal.fire({
      title: "Forgot Password",
      text: "Enter your registered email address to reset your password:",
      input: "email",
      inputValue: prefilledEmail || "",
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
            Swal.fire({
              title: "Password Updated",
              text: "Reset successful! Please login with your new password.",
              icon: "success",
              confirmButtonColor: "#556B2F"
            })
          }
        })
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 bg-white/95 dark:bg-[#151911]/95 backdrop-blur-md shadow-2xl ring-1 ring-black/5 dark:ring-white/10 max-w-4xl w-full rounded-2xl">
        <CardContent className="p-0 grid md:grid-cols-2">
          
          {/* Left side: Unified Login Form */}
          <div className="p-6 sm:p-8 animate-in slide-in-from-right-4 duration-300 max-w-md mx-auto w-full flex flex-col justify-center">
            <div className="space-y-5 flex flex-col justify-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#2d3822] flex items-center gap-2">
                  Welcome Back
                </h2>
                <p className="text-xs text-neutral-500">
                  Please sign in to your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
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
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="text-xs font-bold text-neutral-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => handleForgotPassword(email)}
                        className="text-[10px] text-[#2d3822] hover:underline font-bold cursor-pointer transition-all"
                      >
                        Forgot Password?
                      </button>
                    </div>
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
                  <p className="text-[11px] text-red-600 font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200/50">
                    ⚠️ {error}
                  </p>
                )}

                <Button type="submit" disabled={isLoading} className="w-full bg-[#2d3822] hover:bg-black text-white font-extrabold transition-all shadow-md h-10 rounded-lg cursor-pointer text-xs disabled:opacity-70">
                  {isLoading ? "Verifying..." : "Verify Login"}
                </Button>
              </form>
            </div>
          </div>

          {/* Right side background image column */}
          <div className="relative hidden bg-neutral-900 md:flex min-h-[400px] items-center justify-center">
            <img
              src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg"
              alt="Restaurant background"
              className="absolute inset-0 h-full w-full object-cover opacity-85 blur-[3px]"
            />
            <div className="absolute inset-0 bg-[#556B2F]/30 mix-blend-multiply" />
            
            <div className="relative z-10 flex items-center justify-center">
              <img src="/brand-logo.png" alt="Nirago Logo" className="h-56 w-56 sm:h-64 sm:w-64 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

