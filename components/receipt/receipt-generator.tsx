"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"

interface ReceiptItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  patientId: string
  patientName: string
  amount: number
  date: string
  status: string
  method: string
  description: string
  attendantName: string
  items?: ReceiptItem[]
}

interface ClinicDetails {
  name: string
  location: string
  phoneNumber: string
  email: string
}

interface ReceiptGeneratorProps {
  payment: Payment
  clinicDetails: ClinicDetails
  format: "standard" | "pos" | "detailed"
}

export function ReceiptGenerator({ payment, clinicDetails, format }: ReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML
    const originalContent = document.body.innerHTML

    if (printContent) {
      const printWindow = window.open("", "_blank")

      if (printWindow) {
        printWindow.document.open()
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Receipt</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  max-width: ${format === "pos" ? "80mm" : "210mm"};
                  margin: 0 auto;
                }
                .receipt-container {
                  border: ${format === "pos" ? "none" : "1px solid #ddd"};
                  padding: 20px;
                }
                .receipt-header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .receipt-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                .receipt-info {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                }
                .receipt-details {
                  margin-bottom: 20px;
                }
                .receipt-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                }
                .receipt-table th, .receipt-table td {
                  border: ${format === "pos" ? "none" : "1px solid #ddd"};
                  padding: 8px;
                  text-align: left;
                }
                .receipt-table th {
                  background-color: ${format === "pos" ? "white" : "#f2f2f2"};
                }
                .receipt-total {
                  text-align: right;
                  font-weight: bold;
                  margin-top: 20px;
                }
                .receipt-footer {
                  text-align: center;
                  margin-top: 30px;
                  font-size: 14px;
                }
                @media print {
                  body {
                    padding: 0;
                    margin: 0;
                  }
                  .receipt-container {
                    border: none;
                  }
                  .no-print {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${printContent}
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => printWindow.close()
      }
    }
  }

  const renderStandardReceipt = () => (
    <div className="space-y-6">
      <div className="receipt-header text-center">
        <h2 className="text-2xl font-bold">{clinicDetails.name}</h2>
        <p>{clinicDetails.location}</p>
        <p>{clinicDetails.phoneNumber}</p>
        <p>{clinicDetails.email}</p>
        <div className="mt-4 border-t border-b py-2">
          <h3 className="text-xl font-semibold">RECEIPT</h3>
        </div>
      </div>

      <div className="receipt-info flex justify-between">
        <div>
          <p>
            <strong>Receipt No:</strong> {payment.id}
          </p>
          <p>
            <strong>Date:</strong> {payment.date}
          </p>
          <p>
            <strong>Payment Method:</strong> {payment.method}
          </p>
        </div>
        <div>
          <p>
            <strong>Patient ID:</strong> {payment.patientId}
          </p>
          <p>
            <strong>Patient Name:</strong> {payment.patientName}
          </p>
          <p>
            <strong>Attendant:</strong> {payment.attendantName}
          </p>
        </div>
      </div>

      <div className="receipt-details">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-right">Amount (₵)</th>
            </tr>
          </thead>
          <tbody>
            {payment.items ? (
              payment.items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.description}</td>
                  <td className="border p-2 text-right">₵{item.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-2">{payment.description}</td>
                <td className="border p-2 text-right">₵{payment.amount.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="border p-2 text-right">Total</td>
              <td className="border p-2 text-right">₵{payment.amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="receipt-footer text-center text-sm">
        <p>Thank you for choosing {clinicDetails.name}!</p>
        <p>For any inquiries, please contact us at {clinicDetails.phoneNumber}</p>
      </div>
    </div>
  )

  const renderPOSReceipt = () => (
    <div className="space-y-4 text-sm font-mono" style={{ maxWidth: "300px", margin: "0 auto" }}>
      <div className="text-center">
        <h3 className="font-bold">{clinicDetails.name.toUpperCase()}</h3>
        <p>{clinicDetails.location}</p>
        <p>{clinicDetails.phoneNumber}</p>
        <p className="text-xs">{clinicDetails.email}</p>
        <div className="my-2">
          <p>--------------------------------</p>
          <p className="font-bold">RECEIPT</p>
          <p>--------------------------------</p>
        </div>
      </div>

      <div>
        <p>Receipt No: {payment.id}</p>
        <p>Date: {payment.date}</p>
        <p>Patient: {payment.patientName}</p>
        <p>Attendant: {payment.attendantName}</p>
        <p>Payment Method: {payment.method}</p>
      </div>

      <div>
        <p>--------------------------------</p>
        <p>DESCRIPTION AMOUNT(₵)</p>
        <p>--------------------------------</p>
        {payment.items ? (
          payment.items.map((item, index) => (
            <p key={index}>
              {item.description.substring(0, 18).padEnd(18)}
              {item.total.toFixed(2).padStart(10)}
            </p>
          ))
        ) : (
          <p>
            {payment.description.substring(0, 18).padEnd(18)}
            {payment.amount.toFixed(2).padStart(10)}
          </p>
        )}
        <p>--------------------------------</p>
        <p>
          {"TOTAL".padEnd(18)}
          {payment.amount.toFixed(2).padStart(10)}
        </p>
      </div>

      <div className="text-center mt-4">
        <p>Thank you for choosing us!</p>
        <p className="text-xs mt-2">Powered by Luxe Clinic</p>
      </div>
    </div>
  )

  const renderDetailedReceipt = () => (
    <div className="space-y-6">
      <div className="receipt-header flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{clinicDetails.name}</h2>
          <p>{clinicDetails.location}</p>
          <p>{clinicDetails.phoneNumber}</p>
          <p>{clinicDetails.email}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xl font-semibold">RECEIPT</h3>
        </div>
      </div>

      <div className="receipt-info flex justify-between">
        <div>
          <p>
            <strong>Receipt No:</strong> {payment.id}
          </p>
          <p>
            <strong>Date:</strong> {payment.date}
          </p>
          <p>
            <strong>Payment Method:</strong> {payment.method}
          </p>
        </div>
        <div>
          <p>
            <strong>Patient ID:</strong> {payment.patientId}
          </p>
          <p>
            <strong>Patient Name:</strong> {payment.patientName}
          </p>
          <p>
            <strong>Attendant:</strong> {payment.attendantName}
          </p>
        </div>
      </div>

      <div className="receipt-details">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-right">Quantity</th>
              <th className="border p-2 text-right">Unit Price (₵)</th>
              <th className="border p-2 text-right">Total (₵)</th>
            </tr>
          </thead>
          <tbody>
            {payment.items ? (
              payment.items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.description}</td>
                  <td className="border p-2 text-right">{item.quantity}</td>
                  <td className="border p-2 text-right">₵{item.unitPrice.toFixed(2)}</td>
                  <td className="border p-2 text-right">₵{item.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-2">{payment.description}</td>
                <td className="border p-2 text-right">1</td>
                <td className="border p-2 text-right">₵{payment.amount.toFixed(2)}</td>
                <td className="border p-2 text-right">₵{payment.amount.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="border p-2 text-right font-bold">
                Subtotal
              </td>
              <td className="border p-2 text-right">₵{payment.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border p-2 text-right font-bold">
                Tax (0%)
              </td>
              <td className="border p-2 text-right">₵0.00</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={3} className="border p-2 text-right">
                Total
              </td>
              <td className="border p-2 text-right">₵{payment.amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="receipt-footer text-center text-sm">
        <p>Thank you for choosing {clinicDetails.name}!</p>
        <p>For any inquiries, please contact us at {clinicDetails.phoneNumber}</p>
      </div>
    </div>
  )

  const renderReceiptContent = () => {
    switch (format) {
      case "standard":
        return renderStandardReceipt()
      case "pos":
        return renderPOSReceipt()
      case "detailed":
        return renderDetailedReceipt()
      default:
        return renderStandardReceipt()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={handlePrint}>Print Receipt</Button>
      </div>
      <div ref={receiptRef} className="receipt-container">
        {renderReceiptContent()}
      </div>
    </div>
  )
}
