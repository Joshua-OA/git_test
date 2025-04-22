"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface EditRecordDialogProps {
  record: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedRecord: any) => void
}

export function EditRecordDialog({ record, open, onOpenChange, onSave }: EditRecordDialogProps) {
  const [formData, setFormData] = useState({
    id: "",
    patient_name: "",
    record_date: "",
    doctor: "",
    diagnosis: "",
    type: "",
    notes: ""
  })

  useEffect(() => {
    if (record) {
      setFormData({
        id: record.id,
        patient_name: record.patient_name || "",
        record_date: record.record_date || "",
        doctor: record.doctor || "",
        diagnosis: record.diagnosis || "",
        type: record.type || "",
        notes: record.notes || ""
      })
    }
  }, [record])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Medical Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input name="patient_name" placeholder="Patient Name" value={formData.patient_name} onChange={handleInputChange} />
          <Input name="record_date" placeholder="Date" type="date" value={formData.record_date} onChange={handleInputChange} />
          <Input name="doctor" placeholder="Doctor" value={formData.doctor} onChange={handleInputChange} />
          <Input name="diagnosis" placeholder="Diagnosis" value={formData.diagnosis} onChange={handleInputChange} />
          <Input name="type" placeholder="Type" value={formData.type} onChange={handleInputChange} />
          <Textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleInputChange} />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
