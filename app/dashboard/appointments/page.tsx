"use client"

import { useState, useEffect } from "react"
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
import { CalendarIntegration } from "@/components/calendar-integration"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/app/actions/calendar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
// Update the imports to include the AppointmentDialog
import { AppointmentDialog } from "./appointment-dialog"

export default function AppointmentsPage() {
  // Add the following state variables to the component
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false)
  const [receiptFormat, setReceiptFormat] = useState("standard")
  const [activeTab, setActiveTab] = useState("all")
  const [newNote, setNewNote] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAppointments()
  }, [activeTab])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("appointments")
        .select(`
          id,
          date,
          time,
          status,
          reason,
          notes,
          calendar_event_id,
          calendar_event_link,
          created_at,
          completed_at,
          patients (id, first_name, last_name, patient_id),
          users (id, first_name, last_name),
          department
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true })

      // Apply status filter based on active tab
      if (activeTab !== "all") {
        query = query.eq("status", activeTab.charAt(0).toUpperCase() + activeTab.slice(1))
      }

      const { data, error } = await query

      if (error) throw error

      setAppointments(data || [])
    } catch (err: any) {
      console.error("Error fetching appointments:", err)
      setError(err.message || "Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = `${appointment.patients?.first_name} ${appointment.patients?.last_name}`.toLowerCase()
    const doctorName = `${appointment.users?.first_name} ${appointment.users?.last_name}`.toLowerCase()

    return (
      patientName.includes(searchTerm.toLowerCase()) ||
      doctorName.includes(searchTerm.toLowerCase()) ||
      appointment.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Check if appointment can be edited (not from previous sessions and not completed more than 30 minutes ago)
  const canEditAppointment = (appointment: any) => {
    if (appointment.status === "Cancelled") return false

    if (appointment.completed_at) {
      const completedTime = new Date(appointment.completed_at)
      const thirtyMinutesAfterCompletion = new Date(completedTime.getTime() + 30 * 60000)
      return new Date() < thirtyMinutesAfterCompletion
    }

    return true
  }

  // Check if appointment can only have notes added (completed more than 30 minutes ago)
  const canOnlyAddNotes = (appointment: any) => {
    if (!appointment.completed_at) return false

    const completedTime = new Date(appointment.completed_at)
    const thirtyMinutesAfterCompletion = new Date(completedTime.getTime() + 30 * 60000)
    return new Date() >= thirtyMinutesAfterCompletion
  }

  // Update the handleEdit function
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
      defaultProducts = [{ id: "1", name: "Consultation - General", price: 150.0 }]
    } else {
      defaultProducts = [{ id: "2", name: "Consultation - Specialist", price: 250.0 }]
    }
    setSelectedProducts(defaultProducts)
    setIsReceiptDialogOpen(true)
  }

  const handleSyncCalendar = async (appointment: any) => {
    setSelectedAppointment(appointment)

    try {
      const { success, eventId, eventLink, error } = appointment.calendar_event_id
        ? await updateCalendarEvent(appointment.id)
        : await createCalendarEvent(appointment.id)

      if (!success) {
        throw new Error(error || "Failed to sync with Google Calendar")
      }

      toast({
        title: "Calendar Synced",
        description: appointment.calendar_event_id
          ? "Appointment updated in Google Calendar"
          : "Appointment added to Google Calendar",
      })

      // Refresh appointments to show updated calendar status
      fetchAppointments()
    } catch (err: any) {
      console.error("Calendar sync error:", err)
      toast({
        title: "Calendar Sync Failed",
        description: err.message || "Failed to sync with Google Calendar",
        variant: "destructive",
      })
    }
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    try {
      // Update appointment status in database
      const { error } = await supabase
        .from("appointments")
        .update({ status: "Cancelled" })
        .eq("id", selectedAppointment.id)

      if (error) throw error

      // If there's a calendar event, delete it
      if (selectedAppointment.calendar_event_id) {
        await deleteCalendarEvent(selectedAppointment.id)
      }

      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled successfully",
      })

      setIsDeleteDialogOpen(false)
      fetchAppointments()
    } catch (err: any) {
      console.error("Error cancelling appointment:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const handleAddNoteSubmit = async () => {
    if (!selectedAppointment || !newNote.trim()) return

    try {
      // Get existing notes
      const existingNotes = selectedAppointment.notes || ""
      const timestamp = new Date().toLocaleString()
      const formattedNote = `[${timestamp}] ${newNote}\n\n${existingNotes}`

      // Update appointment notes in database
      const { error } = await supabase
        .from("appointments")
        .update({ notes: formattedNote })
        .eq("id", selectedAppointment.id)

      if (error) throw error

      toast({
        title: "Note Added",
        description: "The note has been added to the appointment",
      })

      setIsAddNoteDialogOpen(false)
      fetchAppointments()
    } catch (err: any) {
      console.error("Error adding note:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to add note",
        variant: "destructive",
      })
    }
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
    const patientName = `${appointment.patients?.first_name} ${appointment.patients?.last_name}`
    const patientId = appointment.patients?.patient_id || "N/A"
    const doctorName = `Dr. ${appointment.users?.first_name} ${appointment.users?.last_name}`

    // Clinic information
    const clinicInfo = {
      name: "Luxe Clinic",
      location: "123 Healthcare Avenue, Accra, Ghana",
      phone: "+233 20 1234 5678",
      email: "info@luxeclinic.com",
    }

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
            Patient: ${patientName}<br>
            Patient ID: ${patientId}<br>
            Attendant: ${doctorName}<br>
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
                <p><strong>Patient:</strong> ${patientName}</p>
                <p><strong>Patient ID:</strong> ${patientId}</p>
                <p><strong>Attendant:</strong> ${doctorName}</p>
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        Loading appointments...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredAppointments.length === 0 ? (
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
                            <div className="font-medium">
                              {appointment.patients?.first_name} {appointment.patients?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">{appointment.patients?.patient_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{appointment.date}</div>
                            <div className="text-sm text-muted-foreground">{appointment.time}</div>
                            {appointment.calendar_event_id && (
                              <div className="text-xs text-blue-500">
                                <a
                                  href={appointment.calendar_event_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-3 h-3"
                                  >
                                    <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Calendar
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          Dr. {appointment.users?.first_name} {appointment.users?.last_name}
                        </TableCell>
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

                              {appointment.status === "Scheduled" && (
                                <DropdownMenuItem onClick={() => handleSyncCalendar(appointment)}>
                                  {appointment.calendar_event_id ? "Update in Calendar" : "Add to Calendar"}
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
        </div>

        <div>
          <CalendarIntegration />
        </div>
      </div>

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
            <Button onClick={handleAddNoteSubmit}>Add Note</Button>
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
                    <span className="ml-1">
                      {selectedAppointment?.patients?.first_name} {selectedAppointment?.patients?.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">ID:</span>
                    <span className="ml-1">{selectedAppointment?.patients?.patient_id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Doctor:</span>
                    <span className="ml-1">
                      Dr. {selectedAppointment?.users?.first_name} {selectedAppointment?.users?.last_name}
                    </span>
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
                  {[
                    { id: "1", name: "Consultation - General", price: 150.0 },
                    { id: "2", name: "Consultation - Specialist", price: 250.0 },
                    { id: "3", name: "Blood Test - Basic", price: 80.0 },
                    { id: "4", name: "Blood Test - Comprehensive", price: 180.0 },
                    { id: "5", name: "X-Ray", price: 200.0 },
                    { id: "6", name: "Ultrasound", price: 250.0 },
                    { id: "7", name: "ECG", price: 120.0 },
                    { id: "8", name: "Vaccination - Basic", price: 50.0 },
                  ].map((product) => (
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

      {/* Delete Appointment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedAppointment && (
              <div className="rounded-md bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Patient:</span>
                    <span className="ml-1">
                      {selectedAppointment.patients?.first_name} {selectedAppointment.patients?.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date:</span>
                    <span className="ml-1">{selectedAppointment.date}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Time:</span>
                    <span className="ml-1">{selectedAppointment.time}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Doctor:</span>
                    <span className="ml-1">
                      Dr. {selectedAppointment.users?.first_name} {selectedAppointment.users?.last_name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Yes, Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Appointment Dialog */}
      <AppointmentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={fetchAppointments}
      />

      <AppointmentDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  )
}
