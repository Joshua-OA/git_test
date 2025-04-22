"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  MoreHorizontal,
  Search,
  User,
  FilePlus2,
  FlaskRoundIcon as Flask,
  Check,
  X,
  Play,
} from "lucide-react"

// Sample lab tests data
const labTests = [
  {
    id: "LAB001",
    patientId: "P001",
    patientName: "John Smith",
    date: "2023-07-15",
    doctor: "Dr. Johnson",
    testName: "Complete Blood Count",
    status: "Completed",
    priority: "Normal",
  },
  {
    id: "LAB002",
    patientId: "P002",
    patientName: "Maria Garcia",
    date: "2023-07-02",
    doctor: "Dr. Smith",
    testName: "Lipid Panel",
    status: "Pending",
    priority: "Normal",
  },
  {
    id: "LAB003",
    patientId: "P003",
    patientName: "Robert Johnson",
    date: "2023-05-20",
    doctor: "Dr. Wilson",
    testName: "Comprehensive Metabolic Panel",
    status: "In Progress",
    priority: "Urgent",
  },
  {
    id: "LAB004",
    patientId: "P004",
    patientName: "Emily Davis",
    date: "2023-07-10",
    doctor: "Dr. Johnson",
    testName: "Thyroid Function",
    status: "Completed",
    priority: "Normal",
  },
  {
    id: "LAB005",
    patientId: "P001",
    patientName: "John Smith",
    date: "2023-06-15",
    doctor: "Dr. Johnson",
    testName: "Urinalysis",
    status: "Pending",
    priority: "Urgent",
  },
]

export default function LabTestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTest, setSelectedTest] = useState<(typeof labTests)[0] | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)

  // Filter lab tests based on search term and status
  const filteredTests = labTests.filter((test) => {
    const matchesSearch =
      test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.doctor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || test.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleViewTest = (test: (typeof labTests)[0]) => {
    setSelectedTest(test)
    setIsViewDialogOpen(true)
  }

  const handleAddResult = (test: (typeof labTests)[0]) => {
    setSelectedTest(test)
    setIsResultDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case "Normal":
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lab Tests</h2>
          <p className="text-muted-foreground">Manage laboratory tests and results</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <FilePlus2 className="h-4 w-4" />
              New Test Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Lab Test Request</DialogTitle>
              <DialogDescription>Enter the details for the new laboratory test request.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Input id="patient" placeholder="Search for a patient..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Requesting Doctor</Label>
                  <Input id="doctor" placeholder="Doctor's name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-type">Test Type</Label>
                <Select>
                  <SelectTrigger id="test-type">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbc">Complete Blood Count</SelectItem>
                    <SelectItem value="lipid">Lipid Panel</SelectItem>
                    <SelectItem value="cmp">Comprehensive Metabolic Panel</SelectItem>
                    <SelectItem value="thyroid">Thyroid Function</SelectItem>
                    <SelectItem value="urinalysis">Urinalysis</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="normal">
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea id="notes" placeholder="Relevant clinical information..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Lab Tests</CardTitle>
          <CardDescription>View and manage all laboratory tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full items-center gap-2 md:w-auto">
              <Label htmlFor="status-filter" className="whitespace-nowrap">
                Status:
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Doctor</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No lab tests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>{test.patientName}</TableCell>
                      <TableCell className="hidden md:table-cell">{test.date}</TableCell>
                      <TableCell className="hidden md:table-cell">{test.doctor}</TableCell>
                      <TableCell>{test.testName}</TableCell>
                      <TableCell>{getPriorityBadge(test.priority)}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTest(test)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {test.status === "Completed" && (
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Results
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {test.status === "Pending" && (
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Start Test
                              </DropdownMenuItem>
                            )}
                            {test.status === "In Progress" && (
                              <DropdownMenuItem onClick={() => handleAddResult(test)}>
                                <Check className="mr-2 h-4 w-4" />
                                Add Results
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              View Patient
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <X className="mr-2 h-4 w-4" />
                              Cancel Test
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTests.length} of {labTests.length} lab tests
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* View Test Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lab Test Details</DialogTitle>
            <DialogDescription>
              {selectedTest?.id} - {selectedTest?.patientName}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Patient</h4>
                  <p>{selectedTest.patientName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Patient ID</h4>
                  <p>{selectedTest.patientId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{selectedTest.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
                  <p>{selectedTest.doctor}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>{getStatusBadge(selectedTest.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                  <p>{getPriorityBadge(selectedTest.priority)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Test Name</h4>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Flask className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{selectedTest.testName}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Clinical Notes</h4>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-gray-500">
                    {selectedTest.id === "LAB001"
                      ? "Patient is on lisinopril for hypertension. Check for electrolyte imbalances."
                      : selectedTest.id === "LAB003"
                        ? "Patient has history of diabetes. Fasting for 12 hours before test."
                        : "No additional clinical notes."}
                  </p>
                </div>
              </div>
              {selectedTest.status === "Completed" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Results</h4>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm">
                      {selectedTest.id === "LAB001"
                        ? "WBC: 7.2 x10^9/L (Normal)\nRBC: 4.8 x10^12/L (Normal)\nHemoglobin: 14.2 g/dL (Normal)\nHematocrit: 42% (Normal)\nPlatelets: 250 x10^9/L (Normal)"
                        : selectedTest.id === "LAB004"
                          ? "TSH: 2.5 mIU/L (Normal)\nFree T4: 1.2 ng/dL (Normal)\nFree T3: 3.1 pg/mL (Normal)"
                          : "No results available."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedTest?.status === "Pending" && <Button>Start Test</Button>}
            {selectedTest?.status === "In Progress" && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  setIsResultDialogOpen(true)
                }}
              >
                Add Results
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Results Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Test Results</DialogTitle>
            <DialogDescription>Enter the results for {selectedTest?.testName}</DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Patient</h4>
                  <p>{selectedTest.patientName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Test ID</h4>
                  <p>{selectedTest.id}</p>
                </div>
              </div>

              {selectedTest.testName === "Complete Blood Count" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wbc">WBC (x10^9/L)</Label>
                      <Input id="wbc" placeholder="4.5-11.0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rbc">RBC (x10^12/L)</Label>
                      <Input id="rbc" placeholder="4.5-5.5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                      <Input id="hemoglobin" placeholder="13.5-17.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hematocrit">Hematocrit (%)</Label>
                      <Input id="hematocrit" placeholder="41-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platelets">Platelets (x10^9/L)</Label>
                      <Input id="platelets" placeholder="150-450" />
                    </div>
                  </div>
                </div>
              )}

              {selectedTest.testName === "Lipid Panel" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-cholesterol">Total Cholesterol (mg/dL)</Label>
                      <Input id="total-cholesterol" placeholder="125-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hdl">HDL (mg/dL)</Label>
                      <Input id="hdl" placeholder="40-60" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ldl">LDL (mg/dL)</Label>
                      <Input id="ldl" placeholder="<100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="triglycerides">Triglycerides (mg/dL)</Label>
                      <Input id="triglycerides" placeholder="<150" />
                    </div>
                  </div>
                </div>
              )}

              {selectedTest.testName === "Comprehensive Metabolic Panel" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="glucose">Glucose (mg/dL)</Label>
                      <Input id="glucose" placeholder="70-99" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bun">BUN (mg/dL)</Label>
                      <Input id="bun" placeholder="7-20" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creatinine">Creatinine (mg/dL)</Label>
                      <Input id="creatinine" placeholder="0.6-1.2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sodium">Sodium (mmol/L)</Label>
                      <Input id="sodium" placeholder="135-145" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="potassium">Potassium (mmol/L)</Label>
                      <Input id="potassium" placeholder="3.5-5.0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chloride">Chloride (mmol/L)</Label>
                      <Input id="chloride" placeholder="98-107" />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes & Interpretation</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any notes or interpretation of results..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Save Results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
