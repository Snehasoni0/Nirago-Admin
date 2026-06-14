import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 blur-md"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg')" }}
      />
      
      {/* Subtle Dark Overlay (Reduced opacity) */}
      <div className="absolute inset-0 bg-black/25 dark:bg-black/50" />

      {/* Login Card Wrapper */}
      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
