"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function MedicalRecordsPage() {
  const supabase = createClientComponentClient()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({
    patient_name: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    record_date: ""
  })

  useEffect(() => { fetchRecords() }, [])

  async function fetchRecords() {
    setLoading(true)
    const { data, error } = await supabase.from("medical_records").select("*").order("record_date", { ascending: false })
    if (!error) setRecords(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (editingId) {
      await supabase.from("medical_records").update(formData).eq("id", editingId)
    } else {
      await supabase.from("medical_records").insert([{ ...formData }])
    }
    setIsDialogOpen(false)
    setEditingId(null)
    fetchRecords()
  }

  function handleEdit(record: any) {
    setFormData(record)
    setEditingId(record.id)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    await supabase.from("medical_records").delete().eq("id", id)
    fetchRecords()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medical Records</h2>
        <Button onClick={() => {
          setFormData({ patient_name: "", diagnosis: "", treatment: "", notes: "", record_date: "" })
          setEditingId(null)
          setIsDialogOpen(true)
        }}>
          Add Record
        </Button>
      </div>

      {loading ? (
        <div>Loading records...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map(record => (
              <TableRow key={record.id}>
                <TableCell>{record.patient_name}</TableCell>
                <TableCell>{record.diagnosis}</TableCell>
                <TableCell>{record.treatment}</TableCell>
                <TableCell>{record.record_date}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(record)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Record" : "Add Medical Record"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {["patient_name", "diagnosis", "treatment", "notes", "record_date"].map(field => (
              <div key={field}>
                <Label>{field.replace("_", " ").toUpperCase()}</Label>
                <Input
                  value={formData[field]}
                  onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                  type={field === "record_date" ? "date" : "text"}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
