"use client"

import { useState } from "react"
import { Search, Plus, Filter, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample appointment data
const appointmentsData = [
  {
    id: "1",
    patientName: "John Doe",
    patientId: "P-001",
    date: "2023-06-15",
    time: "09:00 AM",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Scheduled",
    reason: "Annual checkup",
    notes: "Patient has history of hypertension",
    createdAt: new Date(2023, 5, 10, 14, 30).toISOString(),
    completedAt: null,
  },
  {
    id: "2",
    patientName: "Emma Wilson",
    patientId: "P-042",
    date: "2023-06-15",
    time: "10:30 AM",
    doctor: "Dr. Michael Chen",
    department: "Cardiology",
    status: "Completed",
    reason: "Follow-up after surgery",
    notes: "Patient recovering well from bypass surgery",
    createdAt: new Date(2023, 5, 12, 9, 15).toISOString(),
    completedAt: new Date(2023, 5, 15, 11, 0).toISOString(),
  },
  {
    id: "3",
    patientName: "Robert Brown",
    patientId: "P-108",
    date: "2023-06-15",
    time: "01:15 PM",
    doctor: "Dr. Lisa Wong",
    department: "Orthopedics",
    status: "Cancelled",
    reason: "Knee pain assessment",
    notes: "Patient called to reschedule",
    createdAt: new Date(2023, 5, 13, 16, 45).toISOString(),
    completedAt: null,
  },
  {
    id: "4",
    patientName: "Sophia Martinez",
    patientId: "P-056",
    date: "2023-06-16",
    time: "11:00 AM",
    doctor: "Dr. James Wilson",
    department: "Neurology",
    status: "Scheduled",
    reason: "Headache consultation",
    notes: "First-time patient",
    createdAt: new Date(2023, 5, 14, 10, 30).toISOString(),
    completedAt: null,
  },
  {
    id: "5",
    patientName: "William Taylor",
    patientId: "P-023",
    date: "2023-06-16",
    time: "02:45 PM",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Scheduled",
    reason: "Flu symptoms",
    notes: "Patient requested late afternoon appointment",
    createdAt: new Date(2023, 5, 14, 13, 20).toISOString(),
    completedAt: null,
  },
  {
    id: "6",
    patientName: "Olivia Garcia",
    patientId: "P-077",
    date: "2023-06-17",
    time: "09:30 AM",
    doctor: "Dr. Michael Chen",
    department: "Cardiology",
    status: "Scheduled",
    reason: "Blood pressure check",
    notes: "Monthly follow-up",
    createdAt: new Date(2023, 5, 15, 9, 0).toISOString(),
    completedAt: null,
  },
  {
    id: "7",
    patientName: "James Johnson",
    patientId: "P-091",
    date: "2023-06-17",
    time: "03:00 PM",
    doctor: "Dr. Lisa Wong",
    department: "Orthopedics",
    status: "Scheduled",
    reason: "Back pain evaluation",
    notes: "Patient reports worsening symptoms",
    createdAt: new Date(2023, 5, 15, 14, 15).toISOString(),
    completedAt: null,
  },
  {
    id: "8",
    patientName: "Ava Thompson",
    patientId: "P-112",
    date: "2023-06-18",
    time: "10:00 AM",
    doctor: "Dr. James Wilson",
    department: "Neurology",
    status: "Scheduled",
    reason: "Seizure follow-up",
    notes: "Bring previous test results",
    createdAt: new Date(2023, 5, 16, 11, 45).toISOString(),
    completedAt: null,
  },
]

// Sample doctors data
const doctorsData = [
  { id: "1", name: "Dr. Sarah Johnson", department: "General Medicine" },
  { id: "2", name: "Dr. Michael Chen", department: "Cardiology" },
  { id: "3", name: "Dr. Lisa Wong", department: "Orthopedics" },
  { id: "4", name: "Dr. James Wilson", department: "Neurology" },
  { id: "5", name: "Dr. Emily Davis", department: "Pediatrics" },
  { id: "6", name: "Dr. Robert Miller", department: "Dermatology" },
]

// Sample products/services for receipts
const productsData = [
  { id: "1", name: "Consultation - General", price: 150.0 },
  { id: "2", name: "Consultation - Specialist", price: 250.0 },
  { id: "3", name: "Blood Test - Basic", price: 80.0 },
  { id: "4", name: "Blood Test - Comprehensive", price: 180.0 },
  { id: "5", name: "X-Ray", price: 200.0 },
  { id: "6", name: "Ultrasound", price: 250.0 },
  { id: "7", name: "ECG", price: 120.0 },
  { id: "8", name: "Vaccination - Basic", price: 50.0 },
]

// Clinic information
const clinicInfo = {
  name: "Luxe Clinic",
  location: "123 Healthcare Avenue, Accra, Ghana",
  phone: "+233 20 1234 5678",
  email: "info@luxeclinic.com",
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [receiptFormat, setReceiptFormat] = useState("standard")
  const [activeTab, setActiveTab] = useState("all")
  const [newNote, setNewNote] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])

  // Filter appointments based on search term and active tab
  const filteredAppointments = appointmentsData.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "scheduled") return matchesSearch && appointment.status === "Scheduled"
    if (activeTab === "completed") return matchesSearch && appointment.status === "Completed"
    if (activeTab === "cancelled") return matchesSearch && appointment.status === "Cancelled"

    return matchesSearch
  })

  // Check if appointment can be edited (not from previous sessions and not completed more than 30 minutes ago)
  const canEditAppointment = (appointment: any) => {
    if (appointment.status === "Cancelled") return false

    if (appointment.completedAt) {
      const completedTime = new Date(appointment.completedAt)
      const thirtyMinutesAfterCompletion = new Date(completedTime.getTime() + 30 * 60000)
      return new Date() < thirtyMinutesAfterCompletion
    }

    return true
  }

  // Check if appointment can only have notes added (completed more than 30 minutes ago)
  const canOnlyAddNotes = (appointment: any) => {
    if (!appointment.completedAt) return false

    const completedTime = new Date(appointment.completedAt)
    const thirtyMinutesAfterCompletion = new Date(completedTime.getTime() + 30 * 60000)
    return new Date() >= thirtyMinutesAfterCompletion
  }

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsEditDialogOpen(true)
  }

  const handleAddNote = (appointment: any) => {
    setSelectedAppointment(appointment)
    setNewNote("")
    setIsAddNoteDialogOpen(true)
  }

  const handleDelete = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDeleteDialogOpen(true)
  }

  const handleGenerateReceipt = (appointment: any) => {
    setSelectedAppointment(appointment)
    // Default selected products based on department
    let defaultProducts = []
    if (appointment.department === "General Medicine") {
      defaultProducts = [productsData[0]]
    } else {
      defaultProducts = [productsData[1]]
    }
    setSelectedProducts(defaultProducts)
    setIsReceiptDialogOpen(true)
  }

  const handlePrintReceipt = () => {
    const receiptWindow = window.open("", "_blank")
    if (!receiptWindow) return

    const receiptContent = generateReceiptHTML(selectedAppointment, selectedProducts, receiptFormat)
    receiptWindow.document.write(receiptContent)
    receiptWindow.document.close()

    setTimeout(() => {
      receiptWindow.print()
    }, 500)
  }

  const generateReceiptHTML = (appointment: any, products: any[], format: string) => {
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0)
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()

    if (format === "pos") {
      // POS receipt format (narrow)
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 80mm;
              margin: 0;
              padding: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 5px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
            }
            .total {
              font-weight: bold;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <b>${clinicInfo.name}</b><br>
            ${clinicInfo.location}<br>
            ${clinicInfo.phone}<br>
          </div>
          <div class="divider"></div>
          <div>
            Receipt #: ${Math.floor(Math.random() * 10000)}<br>
            Date: ${date}<br>
            Time: ${time}<br>
            Patient: ${appointment.patientName}<br>
            Patient ID: ${appointment.patientId}<br>
            Attendant: ${appointment.doctor}<br>
          </div>
          <div class="divider"></div>
          <div>
            ${products
              .map(
                (product) => `
              <div class="item">
                <span>${product.name}</span>
                <span>GHS ${product.price.toFixed(2)}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          <div class="divider"></div>
          <div class="total">
            <div class="item">
              <span>TOTAL</span>
              <span>GHS ${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="footer">
            Thank you for choosing ${clinicInfo.name}!<br>
            Get well soon.
          </div>
        </body>
        </html>
      `
    } else {
      // Standard receipt format (A4/Letter)
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ccc;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-column {
              width: 48%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .total {
              text-align: right;
              font-weight: bold;
              font-size: 18px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
            }
            @media print {
              body {
                padding: 0;
              }
              .receipt {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>${clinicInfo.name}</h2>
              <p>${clinicInfo.location}<br>${clinicInfo.phone}<br>${clinicInfo.email}</p>
              <h3>RECEIPT</h3>
            </div>
            
            <div class="info">
              <div class="info-column">
                <p><strong>Receipt #:</strong> ${Math.floor(Math.random() * 10000)}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
              </div>
              <div class="info-column">
                <p><strong>Patient:</strong> ${appointment.patientName}</p>
                <p><strong>Patient ID:</strong> ${appointment.patientId}</p>
                <p><strong>Attendant:</strong> ${appointment.doctor}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (GHS)</th>
                </tr>
              </thead>
              <tbody>
                ${products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="total">
              Total: GHS ${totalAmount.toFixed(2)}
            </div>
            
            <div class="footer">
              <p>Thank you for choosing ${clinicInfo.name}!</p>
              <p>Get well soon.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case "Completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{appointment.date}</div>
                        <div className="text-sm text-muted-foreground">{appointment.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>{appointment.department}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <span className="sr-only">Open menu</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          {canEditAppointment(appointment) && (
                            <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                              Edit Appointment
                            </DropdownMenuItem>
                          )}

                          {canOnlyAddNotes(appointment) && (
                            <DropdownMenuItem onClick={() => handleAddNote(appointment)}>Add Note</DropdownMenuItem>
                          )}

                          {appointment.status === "Completed" && (
                            <DropdownMenuItem onClick={() => handleGenerateReceipt(appointment)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Generate Receipt
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          {appointment.status === "Scheduled" && (
                            <DropdownMenuItem onClick={() => handleDelete(appointment)}>
                              Cancel Appointment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Appointment</DialogTitle>
            <DialogDescription>Add additional information to this appointment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter additional information..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddNoteDialogOpen(false)}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Receipt</DialogTitle>
            <DialogDescription>Select services and generate a receipt for this appointment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Patient Information</Label>
              <div className="rounded-md border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="ml-1">{selectedAppointment?.patientName}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">ID:</span>
                    <span className="ml-1">{selectedAppointment?.patientId}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Doctor:</span>
                    <span className="ml-1">{selectedAppointment?.doctor}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Department:</span>
                    <span className="ml-1">{selectedAppointment?.department}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Services</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Price (GHS)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.some((p) => p.id === product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product])
                            } else {
                              setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <Label>
                Total Amount: GHS {selectedProducts.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-format">Receipt Format</Label>
              <Select value={receiptFormat} onValueChange={setReceiptFormat}>
                <SelectTrigger id="receipt-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (A4)</SelectItem>
                  <SelectItem value="pos">POS (80mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Appointment Dialog would go here */}
      {/* Delete Appointment Dialog would go here */}
    </div>
  )
}
