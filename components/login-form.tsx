"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const masterEmail = process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL || "admin@nirago.com"
    const masterPassword = process.env.NEXT_PUBLIC_MASTER_ADMIN_PASSWORD || "NiragoAdmin2026"

    if (email === masterEmail && password === masterPassword) {
      localStorage.setItem("nirago_admin_logged_in", "true")
      router.push("/dashboard")
    } else {
      setError("Invalid admin credentials. Please try again.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 bg-white/95 dark:bg-[#1c2216]/95 backdrop-blur-md shadow-2xl ring-1 ring-black/5 dark:ring-white/10 min-h-[560px]">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[560px]">
          <form onSubmit={handleSubmit} className="p-10 md:p-14 flex flex-col justify-center bg-transparent min-h-[560px]">
            <div className="space-y-7">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-[#556B2F] dark:text-[#FFFFF0]">
                  Welcome back
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Login to your Nirago Admin account
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@nirago.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/80 dark:bg-black/40 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus-visible:ring-[#556B2F] h-11 px-3"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs font-medium text-[#556B2F] dark:text-[#a3b881] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/80 dark:bg-black/40 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus-visible:ring-[#556B2F] h-11 pl-3 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer flex items-center justify-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive dark:text-red-400 font-semibold text-center -mt-2 bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full bg-[#556B2F] hover:bg-[#405223] text-[#FFFFF0] font-semibold transition-all shadow-md h-11 rounded-lg cursor-pointer">
                Login to Dashboard
              </Button>

              {/* <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-300 dark:border-neutral-700"></div>
                <span className="flex-shrink mx-4 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-medium">Or continue with</span>
                <div className="flex-grow border-t border-neutral-300 dark:border-neutral-700"></div>
              </div> */}

              {/* <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" type="button" className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-10">
                  <svg className="h-5 w-5 text-neutral-700 dark:text-neutral-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
                <Button variant="outline" type="button" className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-10">
                  <svg className="h-5 w-5 text-neutral-700 dark:text-neutral-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
                <Button variant="outline" type="button" className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 h-10">
                  <svg className="h-5 w-5 text-neutral-700 dark:text-neutral-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
              </div> */}

              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Don&apos;t have an admin account?{" "}
                <a href="#" className="font-semibold text-[#556B2F] dark:text-[#a3b881] hover:underline">
                  Contact system owner
                </a>
              </p>
            </div>
          </form>
          <div className="relative hidden bg-neutral-900 md:block">
            <img
              src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg"
              alt="Restaurant background"
              className="absolute inset-0 h-full w-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-[#556B2F]/10 mix-blend-multiply" />
          </div>
        </CardContent>
      </Card>
      <p className="px-6 text-center text-xs text-white dark:text-neutral-500">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline hover:text-white">Terms of Service</a> and{" "}
        <a href="#" className="underline hover:text-white">Privacy Policy</a>.
      </p>
    </div>
  )
}
