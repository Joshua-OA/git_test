"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, FileText, FileEdit, X } from "lucide-react"

interface Prescription {
  id: string
  patient_name: string
  date: string
  doctor: string
  medication: string
  instructions: string
  status: string
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Prescription | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("prescriptions").select("*")
    if (!error && data) setPrescriptions(data)
    setLoading(false)
  }

  const handleSave = async (updated: Prescription) => {
    if (updated.id) {
      await supabase.from("prescriptions").update(updated).eq("id", updated.id)
    } else {
      await supabase.from("prescriptions").insert([updated])
    }
    fetchPrescriptions()
    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id)
    fetchPrescriptions()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Prescriptions</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelected(null)}>New Prescription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected ? "Edit" : "New"} Prescription</DialogTitle>
            </DialogHeader>
            <PrescriptionForm
              prescription={selected}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : prescriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No prescriptions found</TableCell>
            </TableRow>
          ) : prescriptions.map((rx) => (
            <TableRow key={rx.id}>
              <TableCell>{rx.id}</TableCell>
              <TableCell>{rx.patient_name}</TableCell>
              <TableCell>{rx.date}</TableCell>
              <TableCell>{rx.doctor}</TableCell>
              <TableCell>{rx.medication}</TableCell>
              <TableCell><StatusBadge status={rx.status} /></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => { setSelected(rx); setIsDialogOpen(true) }}>
                  <FileEdit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(rx.id)}>
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function PrescriptionForm({
  prescription,
  onSave,
  onCancel,
}: {
  prescription: Prescription | null
  onSave: (data: Prescription) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Prescription>(
    prescription || { id: "", patient_name: "", date: "", doctor: "", medication: "", instructions: "", status: "Pending" }
  )

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(form)
      }}
    >
      <Input
        placeholder="Patient Name"
        value={form.patient_name}
        onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
        required
      />
      <Input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />
      <Input
        placeholder="Doctor"
        value={form.doctor}
        onChange={(e) => setForm({ ...form, doctor: e.target.value })}
        required
      />
      <Input
        placeholder="Medication"
        value={form.medication}
        onChange={(e) => setForm({ ...form, medication: e.target.value })}
        required
      />
      <Textarea
        placeholder="Instructions"
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        required
      />
      <DialogFooter className="mt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{prescription ? "Update" : "Create"}</Button>
      </DialogFooter>
    </form>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "gray"
  switch (status) {
    case "Pending": color = "yellow"; break
    case "Preparing": color = "blue"; break
    case "Ready": color = "green"; break
    case "Dispensed": color = "gray"; break
  }
  return <Badge className={`bg-${color}-100 text-${color}-800`}>{status}</Badge>
}
