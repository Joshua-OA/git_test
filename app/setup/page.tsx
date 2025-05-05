"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Check, ChevronRight, Hospital, User } from "lucide-react"
import { setupClinic, setupAdmin, setupTables } from "../actions/setup"

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [clinicData, setClinicData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Ghana",
    phone: "",
    email: "",
    website: "",
    logo: null as File | null,
    currency: "GHS",
    timezone: "Africa/Accra",
  })

  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  })

  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setClinicData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAdminData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setClinicData((prev) => ({ ...prev, logo: e.target.files![0] }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setClinicData((prev) => ({ ...prev, [name]: value }))
  }

  const validateClinicData = () => {
    if (!clinicData.name) return "Clinic name is required"
    if (!clinicData.address) return "Address is required"
    if (!clinicData.city) return "City is required"
    if (!clinicData.phone) return "Phone number is required"
    if (!clinicData.email) return "Email is required"
    return null
  }

  const validateAdminData = () => {
    if (!adminData.firstName) return "First name is required"
    if (!adminData.lastName) return "Last name is required"
    if (!adminData.email) return "Email is required"
    if (!adminData.password) return "Password is required"
    if (adminData.password.length < 8) return "Password must be at least 8 characters"
    if (adminData.password !== adminData.confirmPassword) return "Passwords do not match"
    return null
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      const error = validateClinicData()
      if (error) {
        setError(error)
        return
      }
    }

    setError(null)
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setError(null)
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    const adminError = validateAdminData()
    if (adminError) {
      setError(adminError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Create database tables
      const { success: tablesSuccess, error: tablesError } = await setupTables()

      if (!tablesSuccess) {
        throw new Error(tablesError || "Failed to create database tables")
      }

      // Step 2: Set up clinic information
      const formData = new FormData()
      Object.entries(clinicData).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value as string | Blob)
        }
      })

      const { success: clinicSuccess, error: clinicError } = await setupClinic(formData)

      if (!clinicSuccess) {
        throw new Error(clinicError || "Failed to set up clinic information")
      }

      // Step 3: Create admin user
      const adminFormData = new FormData()
      Object.entries(adminData).forEach(([key, value]) => {
        adminFormData.append(key, value as string)
      })

      const { success: adminSuccess, error: adminError } = await setupAdmin(adminFormData)

      if (!adminSuccess) {
        throw new Error(adminError || "Failed to create admin user")
      }

      setSuccess("Setup completed successfully! Redirecting to login page...")

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      console.error("Setup error:", err)
      setError(err.message || "An unexpected error occurred during setup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold">Luxe Clinic EHR Setup</h1>
        <p className="text-muted-foreground">Complete the setup to get started with your EHR system</p>
      </div>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentStep === 1 && "Clinic Information"}
              {currentStep === 2 && "Administrator Account"}
              {currentStep === 3 && "Review & Finish"}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
              </span>
              <span className="h-px w-4 bg-muted"></span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
              </span>
              <span className="h-px w-4 bg-muted"></span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                3
              </span>
            </div>
          </div>
          <CardDescription>
            {currentStep === 1 && "Enter your clinic's details"}
            {currentStep === 2 && "Create an administrator account"}
            {currentStep === 3 && "Review your information and complete setup"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          {success && <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">{success}</div>}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Clinic Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={clinicData.name}
                    onChange={handleClinicChange}
                    placeholder="Luxe Clinic GH"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={clinicData.email}
                    onChange={handleClinicChange}
                    placeholder="info@luxeclinic.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={clinicData.address}
                  onChange={handleClinicChange}
                  placeholder="123 Healthcare Avenue"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={clinicData.city}
                    onChange={handleClinicChange}
                    placeholder="Accra"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    name="state"
                    value={clinicData.state}
                    onChange={handleClinicChange}
                    placeholder="Greater Accra"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={clinicData.postalCode}
                    onChange={handleClinicChange}
                    placeholder="00233"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={clinicData.phone}
                    onChange={handleClinicChange}
                    placeholder="+233 20 1234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={clinicData.website}
                    onChange={handleClinicChange}
                    placeholder="https://luxeclinic.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={clinicData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">Ghana Cedis (₵)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={clinicData.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Accra">Africa/Accra (GMT+0)</SelectItem>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0/+1)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5/-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Clinic Logo</Label>
                <Input id="logo" name="logo" type="file" accept="image/*" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">Recommended size: 300x120 pixels</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={adminData.firstName}
                    onChange={handleAdminChange}
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={adminData.lastName}
                    onChange={handleAdminChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address *</Label>
                <Input
                  id="adminEmail"
                  name="email"
                  type="email"
                  value={adminData.email}
                  onChange={handleAdminChange}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={adminData.password}
                    onChange={handleAdminChange}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={adminData.confirmPassword}
                    onChange={handleAdminChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Administrator Account</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        This account will have full access to all features and settings of the EHR system. You can
                        create additional users with different roles after setup is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 text-lg font-medium">Clinic Information</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Clinic Name:</p>
                    <p>{clinicData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email:</p>
                    <p>{clinicData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone:</p>
                    <p>{clinicData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website:</p>
                    <p>{clinicData.website || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Address:</p>
                    <p>
                      {clinicData.address}, {clinicData.city}, {clinicData.state} {clinicData.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Currency:</p>
                    <p>{clinicData.currency === "GHS" ? "Ghana Cedis (₵)" : clinicData.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Timezone:</p>
                    <p>{clinicData.timezone}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 text-lg font-medium">Administrator Account</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name:</p>
                    <p>
                      {adminData.firstName} {adminData.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email:</p>
                    <p>{adminData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role:</p>
                    <p>Administrator</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Hospital className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Ready to Complete Setup</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This will create your clinic profile, administrator account, and set up the database. You'll be
                        redirected to the login page once setup is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={handlePrevStep} disabled={loading}>
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < 3 ? (
            <Button onClick={handleNextStep} disabled={loading}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Setting up..." : "Complete Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
