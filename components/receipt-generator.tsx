"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Download } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
}

interface ReceiptGeneratorProps {
  patientName: string
  patientId: string
  attendantName: string
  products: Product[]
  clinicInfo: {
    name: string
    location: string
    phone: string
    email: string
  }
}

export function ReceiptGenerator({
  patientName,
  patientId,
  attendantName,
  products,
  clinicInfo,
}: ReceiptGeneratorProps) {
  const [receiptFormat, setReceiptFormat] = useState("standard")

  const totalAmount = products.reduce((sum, product) => sum + product.price, 0)

  const handlePrintReceipt = () => {
    const receiptWindow = window.open("", "_blank")
    if (!receiptWindow) return

    const receiptContent = generateReceiptHTML(receiptFormat)
    receiptWindow.document.write(receiptContent)
    receiptWindow.document.close()

    setTimeout(() => {
      receiptWindow.print()
    }, 500)
  }

  const generateReceiptHTML = (format: string) => {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    const receiptNumber = Math.floor(Math.random() * 10000)

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
            Receipt #: ${receiptNumber}<br>
            Date: ${date}<br>
            Time: ${time}<br>
            Patient: ${patientName}<br>
            Patient ID: ${patientId}<br>
            Attendant: ${attendantName}<br>
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
                <p><strong>Receipt #:</strong> ${receiptNumber}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
              </div>
              <div class="info-column">
                <p><strong>Patient:</strong> ${patientName}</p>
                <p><strong>Patient ID:</strong> ${patientId}</p>
                <p><strong>Attendant:</strong> ${attendantName}</p>
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Patient Information</Label>
        <div className="rounded-md border p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <span className="ml-1">{patientName}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">ID:</span>
              <span className="ml-1">{patientId}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Attendant:</span>
              <span className="ml-1">{attendantName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Services</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Price (GHS)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-right">{product.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="text-right font-bold">{totalAmount.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Save PDF
        </Button>
        <Button onClick={handlePrintReceipt}>
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
      </div>
    </div>
  )
}
