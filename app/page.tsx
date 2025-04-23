"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { signIn } from "./actions/auth"

export default function Home() {
  const router = useRouter()
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginErrors({})

    try {
      // Create FormData object for server action
      const formData = new FormData()
      formData.append("email", loginData.email)
      formData.append("password", loginData.password)

      // Call server action
      const result = await signIn(formData)

      if (result.success) {
        // Store role in localStorage
        localStorage.setItem("user_role", result.role)

        // Navigate to dashboard with role
        router.push(`/dashboard?role=${result.role}`)
      } else {
        setLoginErrors({ general: result.error || "Invalid credentials" })
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginErrors({ general: "An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = () => {
    // In a real app, this would send a password reset email
    setResetSuccess(true)
    setTimeout(() => {
      setIsResetDialogOpen(false)
      setResetSuccess(false)
      setResetEmail("")
    }, 3000)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/images/luxe-clinic-logo.png"
          alt="Luxe Clinic GH Logo"
          width={300}
          height={120}
          priority
          className="mb-4"
        />
      </div>

      <Card className="w-full max-w-md">
        <form onSubmit={handleLoginSubmit}>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the EHR system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginErrors.general && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{loginErrors.general}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
              {loginErrors.email && <p className="text-sm text-red-500">{loginErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0 text-xs" type="button">
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {resetSuccess ? (
                        <div className="rounded-md bg-green-50 p-4 text-green-800">
                          Password reset link sent! Please check your email.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="name@example.com"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      {!resetSuccess && (
                        <>
                          <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleResetPassword}>Send Reset Link</Button>
                        </>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {loginErrors.password && <p className="text-sm text-red-500">{loginErrors.password}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-500">
              For demo purposes, use these emails with any password:
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>doctor@example.com</div>
              <div>nurse@example.com</div>
              <div>lab@example.com</div>
              <div>pharmacy@example.com</div>
              <div>admin@example.com</div>
              <div>reception@example.com</div>
              <div>cashier@example.com</div>
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">Admin: evansadenku@gmail.com / Syncmaster@79</p>
          </CardFooter>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Luxe Clinic GH. All rights reserved.
      </p>
    </div>
  )
}
