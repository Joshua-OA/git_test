"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Building,
  Calendar,
  Ruler,
  FileText,
  Pill,
  FlaskRoundIcon as Flask,
  Link,
  ShieldCheck,
  PaintBucket,
  Save,
  Upload,
  Clock,
  Check,
  X,
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("user")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  const handleSave = () => {
    setSaveStatus("saving")
    // Simulate API call
    setTimeout(() => {
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="user" className="flex flex-col items-center py-2 px-4 h-auto">
            <User className="h-4 w-4 mb-1" />
            <span className="text-xs">User</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex flex-col items-center py-2 px-4 h-auto">
            <ShieldCheck className="h-4 w-4 mb-1" />
            <span className="text-xs">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex flex-col items-center py-2 px-4 h-auto">
            <Building className="h-4 w-4 mb-1" />
            <span className="text-xs">Practice</span>
          </TabsTrigger>
          <TabsTrigger value="datetime" className="flex flex-col items-center py-2 px-4 h-auto">
            <Calendar className="h-4 w-4 mb-1" />
            <span className="text-xs">Date & Time</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex flex-col items-center py-2 px-4 h-auto">
            <Ruler className="h-4 w-4 mb-1" />
            <span className="text-xs">Units</span>
          </TabsTrigger>
          <TabsTrigger value="clinical" className="flex flex-col items-center py-2 px-4 h-auto">
            <FileText className="h-4 w-4 mb-1" />
            <span className="text-xs">Clinical</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex flex-col items-center py-2 px-4 h-auto">
            <Link className="h-4 w-4 mb-1" />
            <span className="text-xs">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col items-center py-2 px-4 h-auto">
            <PaintBucket className="h-4 w-4 mb-1" />
            <span className="text-xs">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* User Profile Settings */}
        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Manage your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Dr. Sarah Johnson" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="sarah.johnson@luxeclinic.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+233 20 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Doctor" disabled />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="two-factor" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : saveStatus === "success" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Role-Based Access Settings */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Configuration</CardTitle>
              <CardDescription>Configure permissions for different user roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Doctor</h3>
                      <p className="text-sm text-muted-foreground">Medical staff with full clinical access</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Permissions
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Badge className="justify-center">View Patient Records</Badge>
                    <Badge className="justify-center">Edit Patient Records</Badge>
                    <Badge className="justify-center">Prescribe Medications</Badge>
                    <Badge className="justify-center">Order Lab Tests</Badge>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Nurse</h3>
                      <p className="text-sm text-muted-foreground">Clinical support staff</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Permissions
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Badge className="justify-center">View Patient Records</Badge>
                    <Badge className="justify-center">Record Vitals</Badge>
                    <Badge className="justify-center">Update Patient Notes</Badge>
                    <Badge variant="outline" className="justify-center">
                      Limited Prescribing
                    </Badge>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Receptionist</h3>
                      <p className="text-sm text-muted-foreground">Front desk administrative staff</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Permissions
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Badge className="justify-center">Schedule Appointments</Badge>
                    <Badge className="justify-center">Register Patients</Badge>
                    <Badge variant="outline" className="justify-center">
                      Limited Record Access
                    </Badge>
                    <Badge variant="outline" className="justify-center">
                      No Clinical Access
                    </Badge>
                  </div>
                </div>

                <Button className="w-full">Add New Role</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Information Settings */}
        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Information</CardTitle>
              <CardDescription>Manage your clinic's details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="practice-name">Practice Name</Label>
                <Input id="practice-name" defaultValue="Luxe Clinic GH" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practice-email">Email Address</Label>
                  <Input id="practice-email" type="email" defaultValue="info@luxeclinic.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practice-phone">Phone Number</Label>
                  <Input id="practice-phone" defaultValue="+233 20 1234 5678" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice-address">Address</Label>
                <Textarea id="practice-address" defaultValue="123 Healthcare Avenue, Accra, Ghana" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practice-city">City</Label>
                  <Input id="practice-city" defaultValue="Accra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practice-region">Region</Label>
                  <Input id="practice-region" defaultValue="Greater Accra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="practice-postal">Postal Code</Label>
                  <Input id="practice-postal" defaultValue="00233" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice-logo">Practice Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-md border flex items-center justify-center bg-muted">Logo</div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Logo
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice-hours">Business Hours</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Monday - Friday</div>
                    <div className="col-span-2">8:00 AM - 6:00 PM</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Saturday</div>
                    <div className="col-span-2">9:00 AM - 2:00 PM</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Sunday</div>
                    <div className="col-span-2">Closed</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <Clock className="mr-2 h-4 w-4" />
                  Edit Business Hours
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : saveStatus === "success" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Date & Time Format Settings */}
        <TabsContent value="datetime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Date & Time Format Configuration</CardTitle>
              <CardDescription>Configure how dates and times are displayed throughout the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="dd/mm/yyyy">
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (31/12/2023)</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (12/31/2023)</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2023-12-31)</SelectItem>
                    <SelectItem value="dd-mmm-yyyy">DD-MMM-YYYY (31-Dec-2023)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select defaultValue="24h">
                  <SelectTrigger id="time-format">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                    <SelectItem value="24h">24-hour (14:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="africa/accra">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="africa/accra">Africa/Accra (GMT+0)</SelectItem>
                    <SelectItem value="africa/lagos">Africa/Lagos (GMT+1)</SelectItem>
                    <SelectItem value="europe/london">Europe/London (GMT+0/+1)</SelectItem>
                    <SelectItem value="america/new_york">America/New_York (GMT-5/-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="week-start">First Day of Week</Label>
                <Select defaultValue="monday">
                  <SelectTrigger id="week-start">
                    <SelectValue placeholder="Select first day of week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-timezone" className="text-base">
                      Automatic Timezone Detection
                    </Label>
                    <p className="text-sm text-muted-foreground">Detect timezone based on user's device</p>
                  </div>
                  <Switch id="auto-timezone" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : saveStatus === "success" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Units of Measurement Settings */}
        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Units of Measurement Settings</CardTitle>
              <CardDescription>Configure measurement units used throughout the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight-unit">Weight</Label>
                <Select defaultValue="kg">
                  <SelectTrigger id="weight-unit">
                    <SelectValue placeholder="Select weight unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lb">Pounds (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height-unit">Height</Label>
                <Select defaultValue="cm">
                  <SelectTrigger id="height-unit">
                    <SelectValue placeholder="Select height unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="ft-in">Feet & Inches (ft/in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature-unit">Temperature</Label>
                <Select defaultValue="celsius">
                  <SelectTrigger id="temperature-unit">
                    <SelectValue placeholder="Select temperature unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood-pressure-unit">Blood Pressure</Label>
                <Select defaultValue="mmhg">
                  <SelectTrigger id="blood-pressure-unit">
                    <SelectValue placeholder="Select blood pressure unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mmhg">mmHg</SelectItem>
                    <SelectItem value="kpa">kPa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood-glucose-unit">Blood Glucose</Label>
                <Select defaultValue="mmol/l">
                  <SelectTrigger id="blood-glucose-unit">
                    <SelectValue placeholder="Select blood glucose unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mmol/l">mmol/L</SelectItem>
                    <SelectItem value="mg/dl">mg/dL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-convert" className="text-base">
                      Automatic Unit Conversion
                    </Label>
                    <p className="text-sm text-muted-foreground">Show values in both selected and alternative units</p>
                  </div>
                  <Switch id="auto-convert" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : saveStatus === "success" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Clinical Settings */}
        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Settings</CardTitle>
              <CardDescription>Configure clinical templates, medication lists, and medical codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Clinical Templates</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">General Consultation</h4>
                        <p className="text-sm text-muted-foreground">Standard template for general consultations</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Diabetes Follow-up</h4>
                        <p className="text-sm text-muted-foreground">Template for diabetes management follow-ups</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Prenatal Visit</h4>
                        <p className="text-sm text-muted-foreground">Template for prenatal check-ups</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medication Lists</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Common Medications</h4>
                        <p className="text-sm text-muted-foreground">Frequently prescribed medications</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Antibiotics</h4>
                        <p className="text-sm text-muted-foreground">Common antibiotic medications</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Controlled Substances</h4>
                        <p className="text-sm text-muted-foreground">
                          Restricted medications requiring special handling
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
                <Button>
                  <Pill className="mr-2 h-4 w-4" />
                  Create New Medication List
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical Codes</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">ICD-10 Codes</h4>
                        <p className="text-sm text-muted-foreground">International Classification of Diseases</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">CPT Codes</h4>
                        <p className="text-sm text-muted-foreground">Current Procedural Terminology</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Custom Codes</h4>
                        <p className="text-sm text-muted-foreground">Organization-specific codes</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Import Code Set
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : saveStatus === "success" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Configure lab, imaging, and third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lab Integrations</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                          <Flask className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">LabCorp</h4>
                          <p className="text-sm text-muted-foreground">Lab test ordering and results</p>
                        </div>
                      </div>
                      <Badge variant="outline">Not Connected</Badge>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                          <Flask className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Quest Diagnostics</h4>
                          <p className="text-sm text-muted-foreground">Lab test ordering and results</p>
                        </div>
                      </div>
                      <Badge variant="outline">Not Connected</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Imaging Integrations</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">PACS System</h4>
                          <p className="text-sm text-muted-foreground">Picture archiving and communication system</p>
                        </div>
                      </div>
                      <Badge variant="outline">Not Connected</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Third-Party Integrations</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Ghana Health Service</h4>
                          <p className="text-sm text-muted-foreground">National health reporting system</p>
                        </div>
                      </div>
                      <Badge variant="outline">Not Connected</Badge>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Insurance Verification</h4>
                          <p className="text-sm text-muted-foreground">Insurance eligibility and claims</p>
                        </div>
                      </div>
                      <Badge variant="outline">Not Connected</Badge>
                    </div>
                  </div>
                </div>
                <Button>
                  <Link className="mr-2 h-4 w-4" />
                  Add New Integration
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : saveStatus === "success" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 cursor-pointer bg-white">
                    <div className="h-20 bg-white border-b mb-2"></div>
                    <div className="text-center font-medium">Light</div>
                  </div>
                  <div className="border rounded-md p-4 cursor-pointer bg-gray-900 text-white">
                    <div className="h-20 bg-gray-900 border-b border-gray-700 mb-2"></div>
                    <div className="text-center font-medium">Dark</div>
                  </div>
                  <div className="border rounded-md p-4 cursor-pointer">
                    <div className="h-20 bg-gradient-to-b from-white to-gray-900 mb-2"></div>
                    <div className="text-center font-medium">System</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Branding</h3>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input id="primary-color" type="color" defaultValue="#7c3aed" className="w-16 h-10" />
                    <Input defaultValue="#7c3aed" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input id="secondary-color" type="color" defaultValue="#e879f9" className="w-16 h-10" />
                    <Input defaultValue="#e879f9" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input id="accent-color" type="color" defaultValue="#22c55e" className="w-16 h-10" />
                    <Input defaultValue="#22c55e" className="flex-1" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Custom Fields</h3>
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Patient Insurance ID</h4>
                        <p className="text-sm text-muted-foreground">Custom field for patient records</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Referring Physician</h4>
                        <p className="text-sm text-muted-foreground">Custom field for appointments</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
                <Button>
                  <PaintBucket className="mr-2 h-4 w-4" />
                  Add Custom Field
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>
                {saveStatus === "saving" ? (
                  <>Saving...</>
                ) : saveStatus === "success" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : saveStatus === "error" ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
