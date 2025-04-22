"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function PatientsPage() {
  const supabase = createClientComponentClient()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    status: "active"
  })

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    setLoading(true)
    const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })
    if (!error) setPatients(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (editingId) {
      await supabase.from("patients").update(formData).eq("id", editingId)
    } else {
      await supabase.from("patients").insert([{ ...formData }])
    }
    setIsDialogOpen(false)
    setEditingId(null)
    fetchPatients()
  }

  function handleEdit(patient: any) {
    setFormData(patient)
    setEditingId(patient.id)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    await supabase.from("patients").delete().eq("id", id)
    fetchPatients()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patients</h2>
        <Button onClick={() => { 
          setFormData({ first_name: "", last_name: "", date_of_birth: "", gender: "", phone: "", email: "", address: "", status: "active" })
          setEditingId(null)
          setIsDialogOpen(true) 
        }}>
          Add Patient
        </Button>
      </div>

      {loading ? (
        <div>Loading patients...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map(patient => (
              <TableRow key={patient.id}>
                <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.status}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(patient)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(patient.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Patient" : "Add Patient"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {["first_name", "last_name", "date_of_birth", "gender", "phone", "email", "address"].map(field => (
              <div key={field}>
                <Label>{field.replace("_", " ").toUpperCase()}</Label>
                <Input
                  value={formData[field]}
                  onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                  type={field === "date_of_birth" ? "date" : "text"}
                />
              </div>
            ))}
            <div>
              <Label>Status</Label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded p-2">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Add Patient"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
