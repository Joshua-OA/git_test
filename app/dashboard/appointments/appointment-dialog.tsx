"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import { updateCalendarEvent } from "@/app/actions/calendar"

interface AppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  appointment?: any
  onSuccess: () => void
}

export function AppointmentDialog({ isOpen, onClose, appointment, onSuccess }: AppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    department: "",
    date: "",
    time: "",
    reason: "",
    notes: "",
    status: "Scheduled",
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id || "",
        doctor_id: appointment.doctor_id || "",
        department: appointment.department || "",
        date: appointment.date || "",
        time: appointment.time || "",
        reason: appointment.reason || "",
        notes: appointment.notes || "",
        status: appointment.status || "Scheduled",
      })
    } else {
      // Set default date to today and time to next hour
      const today = new Date()
      const dateStr = today.toISOString().split("T")[0]

      // Set time to next hour
      today.setHours(today.getHours() + 1)
      today.setMinutes(0)
      today.setSeconds(0)
      const timeStr = today.toTimeString().split(" ")[0].substring(0, 5)

      setFormData({
        patient_id: "",
        doctor_id: "",
        department: "",
        date: dateStr,
        time: timeStr,
        reason: "",
        notes: "",
        status: "Scheduled",
      })
    }
  }, [appointment, isOpen])

  const fetchData = async () => {
    try {
      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("id, first_name, last_name, patient_id")
        .order("last_name", { ascending: true })

      if (patientsError) throw patientsError
      setPatients(patientsData || [])

      // Fetch doctors (users with role 'doctor')
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .eq("role", "doctor")
        .order("last_name", { ascending: true })

      if (doctorsError) throw doctorsError
      setDoctors(doctorsData || [])

      // Fetch departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from("departments")
        .select("name")
        .order("name", { ascending: true })

      if (departmentsError) throw departmentsError

      // If no departments exist yet, use default ones
      if (!departmentsData || departmentsData.length === 0) {
        setDepartments([
          { name: "General Medicine" },
          { name: "Cardiology" },
          { name: "Orthopedics" },
          { name: "Neurology" },
          { name: "Pediatrics" },
          { name: "Dermatology" },
        ])
      } else {
        setDepartments(departmentsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.patient_id || !formData.doctor_id || !formData.department || !formData.date || !formData.time) {
        throw new Error("Please fill in all required fields")
      }

      // Generate a unique appointment code
      const appointmentCode = `APT-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      if (appointment) {
        // Update existing appointment
        const { error } = await supabase
          .from("appointments")
          .update({
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id,
            department: formData.department,
            date: formData.date,
            time: formData.time,
            reason: formData.reason,
            notes: formData.notes,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", appointment.id)

        if (error) throw error

        // Update calendar event if it exists
        if (appointment.calendar_event_id) {
          await updateCalendarEvent(appointment.id)
        }

        toast({
          title: "Success",
          description: "Appointment updated successfully",
        })
      } else {
        // Create new appointment
        const { data, error } = await supabase
          .from("appointments")
          .insert({
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id,
            department: formData.department,
            date: formData.date,
            time: formData.time,
            reason: formData.reason,
            notes: formData.notes,
            status: formData.status,
            appointment_code: appointmentCode,
          })
          .select()

        if (error) throw error

        toast({
          title: "Success",
          description: "Appointment created successfully",
        })
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error saving appointment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save appointment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit Appointment" : "New Appointment"}</DialogTitle>
          <DialogDescription>
            {appointment ? "Update the appointment details below." : "Fill in the details to create a new appointment."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id" className="required">
                  Patient
                </Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => handleSelectChange("patient_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} ({patient.patient_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_id" className="required">
                  Doctor
                </Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => handleSelectChange("doctor_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="required">
                Department
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange("department", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="required">
                  Date
                </Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="required">
                  Time
                </Label>
                <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="required">
                Reason for Visit
              </Label>
              <Input
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Brief description of the reason for visit"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </div>

            {appointment && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : appointment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
