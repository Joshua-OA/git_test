"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function PharmacyPage() {
  const supabase = createClientComponentClient()
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    dosage: "",
    form: "",
    stock: 0,
    reorder_level: 0,
    expiry_date: "",
    price: 0
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMedications()
  }, [])

  async function fetchMedications() {
    setLoading(true)
    const { data, error } = await supabase.from("medications").select("*").order("created_at", { ascending: false })
    if (!error) setMedications(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (editingId) {
      await supabase.from("medications").update(formData).eq("id", editingId)
    } else {
      await supabase.from("medications").insert([formData])
    }
    setIsDialogOpen(false)
    setEditingId(null)
    fetchMedications()
  }

  function handleEdit(med: any) {
    setFormData(med)
    setEditingId(med.id)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    await supabase.from("medications").delete().eq("id", id)
    fetchMedications()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pharmacy Inventory</h2>
        <Button onClick={() => { setFormData({ name: "", category: "", dosage: "", form: "", stock: 0, reorder_level: 0, expiry_date: "", price: 0 }); setEditingId(null); setIsDialogOpen(true) }}>
          Add Medication
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map(med => (
              <TableRow key={med.id}>
                <TableCell>{med.name}</TableCell>
                <TableCell>{med.category}</TableCell>
                <TableCell>{med.stock}</TableCell>
                <TableCell>
                  {med.stock <= 0 ? <Badge variant="destructive">Out of Stock</Badge> :
                   med.stock < med.reorder_level ? <Badge className="bg-yellow-100 text-yellow-800">Low</Badge> :
                   <Badge className="bg-green-100 text-green-800">In Stock</Badge>}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(med)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(med.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Medication" : "Add Medication"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {["name", "category", "dosage", "price", "stock", "reorder_level", "expiry_date"].map((field) => (
              <div key={field}>
                <Label>{field.replace("_", " ").toUpperCase()}</Label>
                <Input
                  value={formData[field]}
                  type={field === "price" || field === "stock" || field === "reorder_level" ? "number" : "text"}
                  onChange={e => setFormData({ ...formData, [field]: field === "price" || field === "stock" || field === "reorder_level" ? parseFloat(e.target.value) : e.target.value })}
                />
              </div>
            ))}
            <div>
              <Label>Form</Label>
              <Select value={formData.form} onValueChange={(value) => setFormData({ ...formData, form: value })}>
                <SelectTrigger><SelectValue placeholder="Select form" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Capsule">Capsule</SelectItem>
                  <SelectItem value="Liquid">Liquid</SelectItem>
                  <SelectItem value="Injection">Injection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Add Medication"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
