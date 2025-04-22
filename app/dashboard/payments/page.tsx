"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function PaymentsPage() {
  const supabase = createClientComponentClient()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({
    patient_name: "",
    amount: "",
    method: "",
    status: "paid",
    payment_date: ""
  })

  useEffect(() => { fetchPayments() }, [])

  async function fetchPayments() {
    setLoading(true)
    const { data, error } = await supabase.from("payments").select("*").order("payment_date", { ascending: false })
    if (!error) setPayments(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (editingId) {
      await supabase.from("payments").update(formData).eq("id", editingId)
    } else {
      await supabase.from("payments").insert([{ ...formData }])
    }
    setIsDialogOpen(false)
    setEditingId(null)
    fetchPayments()
  }

  function handleEdit(payment: any) {
    setFormData(payment)
    setEditingId(payment.id)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    await supabase.from("payments").delete().eq("id", id)
    fetchPayments()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payments</h2>
        <Button onClick={() => { 
          setFormData({ patient_name: "", amount: "", method: "", status: "paid", payment_date: "" })
          setEditingId(null)
          setIsDialogOpen(true) 
        }}>
          Add Payment
        </Button>
      </div>

      {loading ? (
        <div>Loading payments...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{payment.patient_name}</TableCell>
                <TableCell>₵ {payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>{payment.payment_date}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(payment)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(payment.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Payment" : "Add Payment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {["patient_name", "amount", "method", "payment_date"].map(field => (
              <div key={field}>
                <Label>{field.replace("_", " ").toUpperCase()}</Label>
                <Input
                  value={formData[field]}
                  onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                  type={field === "payment_date" ? "date" : "text"}
                />
              </div>
            ))}
            <div>
              <Label>Status</Label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded p-2">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Add Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
