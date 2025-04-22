"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Users,
  FlaskRoundIcon as Flask,
  Pill,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [role, setRole] = useState<string>("reception")
  const [greeting, setGreeting] = useState<string>("")

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam) {
      setRole(roleParam)
    }

    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [searchParams])

  // Dashboard components for different roles
  const DoctorDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">3 pending, 9 confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients Seen Today</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">4 more than yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lab Results Pending</CardTitle>
            <Flask className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">2 urgent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions Written</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "10:00 AM", patient: "John Smith", reason: "Follow-up" },
                { time: "11:30 AM", patient: "Sarah Johnson", reason: "Consultation" },
                { time: "1:15 PM", patient: "Michael Brown", reason: "Test Results" },
                { time: "2:45 PM", patient: "Emily Davis", reason: "Annual Check-up" },
              ].map((appointment, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-gray-500">{appointment.reason}</p>
                  </div>
                  <div className="text-sm font-medium">{appointment.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Patient Notes</CardTitle>
            <CardDescription>Latest updates from your patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  patient: "Robert Wilson",
                  note: "Prescribed antibiotics for respiratory infection. Follow-up in 7 days.",
                  time: "Today, 9:15 AM",
                },
                {
                  patient: "Jennifer Lee",
                  note: "Blood pressure elevated. Adjusted medication dosage. Monitor for 2 weeks.",
                  time: "Yesterday, 3:30 PM",
                },
                {
                  patient: "David Martinez",
                  note: "Lab results show improved kidney function. Continue current treatment plan.",
                  time: "Yesterday, 11:45 AM",
                },
              ].map((note, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{note.patient}</span>
                    <span className="text-xs text-gray-500">{note.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{note.note}</p>
                  <div className="pt-1">
                    <Link href={`/dashboard/medical-records?role=${role}`}>
                      <Button variant="link" className="h-auto p-0 text-blue-600">
                        View full record
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const NurseDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">6 waiting now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vitals Recorded</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Pending</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-500">2 high priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Patient Queue</CardTitle>
            <CardDescription>Patients waiting to be seen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Alice Thompson", time: "Waiting for 15 min", doctor: "Dr. Johnson", room: "Room 3" },
                { name: "Mark Rodriguez", time: "Waiting for 10 min", doctor: "Dr. Smith", room: "Room 1" },
                { name: "Karen Williams", time: "Waiting for 5 min", doctor: "Dr. Johnson", room: "Room 3" },
                { name: "Thomas Clark", time: "Just arrived", doctor: "Dr. Wilson", room: "Room 2" },
              ].map((patient, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500">
                      {patient.doctor} - {patient.room}
                    </p>
                  </div>
                  <div className="text-sm font-medium">{patient.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your assigned tasks for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: "Check vitals for Room 3 patients", priority: "High", status: "Pending" },
                { task: "Prepare vaccination records for school physicals", priority: "Medium", status: "In Progress" },
                { task: "Restock exam room supplies", priority: "Medium", status: "Pending" },
                { task: "Follow up with lab about delayed results", priority: "High", status: "Pending" },
              ].map((task, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{task.task}</span>
                    <span className={`text-xs ${task.priority === "High" ? "text-red-500" : "text-orange-500"}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Status: {task.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const LabDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
            <Flask className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-gray-500">4 urgent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">2 completing today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">3 more than yesterday</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Requests</CardTitle>
          <CardDescription>Pending lab test requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                patient: "James Wilson",
                test: "Complete Blood Count",
                doctor: "Dr. Johnson",
                priority: "Urgent",
                requested: "Today, 8:30 AM",
              },
              {
                patient: "Maria Garcia",
                test: "Lipid Panel",
                doctor: "Dr. Smith",
                priority: "Normal",
                requested: "Today, 9:15 AM",
              },
              {
                patient: "Robert Taylor",
                test: "Liver Function",
                doctor: "Dr. Wilson",
                priority: "Urgent",
                requested: "Today, 10:00 AM",
              },
              {
                patient: "Susan Anderson",
                test: "Thyroid Panel",
                doctor: "Dr. Johnson",
                priority: "Normal",
                requested: "Yesterday, 4:30 PM",
              },
              {
                patient: "Michael Brown",
                test: "Urinalysis",
                doctor: "Dr. Smith",
                priority: "Normal",
                requested: "Yesterday, 3:45 PM",
              },
            ].map((request, index) => (
              <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    request.priority === "Urgent" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Flask className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{request.patient}</p>
                    <span className={`text-xs ${request.priority === "Urgent" ? "text-red-500" : "text-blue-500"}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-sm">{request.test}</p>
                  <p className="text-xs text-gray-500">
                    Requested by {request.doctor} • {request.requested}
                  </p>
                </div>
                <Button size="sm">Process</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const PharmacistDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Prescriptions</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-gray-500">7 pending preparation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <Pill className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">3 notified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dispensed Today</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">5 more than yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">3 critical</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Queue</CardTitle>
          <CardDescription>Prescriptions waiting to be processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                patient: "Thomas Moore",
                medication: "Amoxicillin 500mg",
                doctor: "Dr. Johnson",
                status: "Pending",
                time: "10:15 AM",
              },
              {
                patient: "Lisa Garcia",
                medication: "Lisinopril 10mg",
                doctor: "Dr. Smith",
                status: "Preparing",
                time: "9:30 AM",
              },
              {
                patient: "William Davis",
                medication: "Metformin 1000mg",
                doctor: "Dr. Wilson",
                status: "Ready",
                time: "9:00 AM",
              },
              {
                patient: "Jennifer Lee",
                medication: "Atorvastatin 20mg",
                doctor: "Dr. Johnson",
                status: "Pending",
                time: "8:45 AM",
              },
            ].map((prescription, index) => (
              <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    prescription.status === "Ready"
                      ? "bg-green-100 text-green-700"
                      : prescription.status === "Preparing"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Pill className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{prescription.patient}</p>
                    <span
                      className={`text-xs ${
                        prescription.status === "Ready"
                          ? "text-green-500"
                          : prescription.status === "Preparing"
                            ? "text-orange-500"
                            : "text-blue-500"
                      }`}
                    >
                      {prescription.status}
                    </span>
                  </div>
                  <p className="text-sm">{prescription.medication}</p>
                  <p className="text-xs text-gray-500">
                    Prescribed by {prescription.doctor} • {prescription.time}
                  </p>
                </div>
                <Button size="sm">
                  {prescription.status === "Ready"
                    ? "Dispense"
                    : prescription.status === "Preparing"
                      ? "Mark Ready"
                      : "Prepare"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,856</div>
            <p className="text-xs text-gray-500">+156 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵24,685</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-gray-500">Across all departments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Patient throughput by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { department: "General Medicine", patients: 78, change: "+12%" },
                { department: "Pediatrics", patients: 45, change: "+8%" },
                { department: "Cardiology", patients: 32, change: "+15%" },
                { department: "Orthopedics", patients: 28, change: "-3%" },
                { department: "Dermatology", patients: 24, change: "+5%" },
              ].map((dept, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{dept.department}</p>
                  </div>
                  <div className="text-sm font-medium">{dept.patients} patients</div>
                  <div className={`text-xs ${dept.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {dept.change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>System Notifications</CardTitle>
            <CardDescription>Recent alerts and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "System Maintenance",
                  message: "Scheduled maintenance on Sunday, 2 AM - 4 AM",
                  time: "2 hours ago",
                  type: "warning",
                },
                {
                  title: "New Staff Onboarded",
                  message: "Dr. Sarah Johnson joined Cardiology department",
                  time: "Yesterday",
                  type: "info",
                },
                {
                  title: "Inventory Alert",
                  message: "5 medications below reorder threshold",
                  time: "Yesterday",
                  type: "alert",
                },
                {
                  title: "Software Update",
                  message: "EHR system updated to version 2.4.1",
                  time: "3 days ago",
                  type: "info",
                },
              ].map((notification, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        notification.type === "warning"
                          ? "bg-yellow-500"
                          : notification.type === "alert"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <span className="font-medium">{notification.title}</span>
                    <span className="ml-auto text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const ReceptionDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-gray-500">8 checked in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-gray-500">Average wait: 12 min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">₵1,245 total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "10:00 AM", patient: "John Smith", doctor: "Dr. Johnson", status: "Checked In" },
                { time: "10:30 AM", patient: "Maria Garcia", doctor: "Dr. Smith", status: "Scheduled" },
                { time: "11:00 AM", patient: "Robert Wilson", doctor: "Dr. Johnson", status: "Scheduled" },
                { time: "11:30 AM", patient: "Emily Davis", doctor: "Dr. Wilson", status: "Scheduled" },
                { time: "1:00 PM", patient: "Michael Brown", doctor: "Dr. Smith", status: "Scheduled" },
              ].map((appointment, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      appointment.status === "Checked In" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{appointment.patient}</p>
                      <span
                        className={`text-xs ${
                          appointment.status === "Checked In" ? "text-green-500" : "text-blue-500"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm">{appointment.doctor}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </div>
                  <Button size="sm" variant={appointment.status === "Checked In" ? "outline" : "default"}>
                    {appointment.status === "Checked In" ? "View" : "Check In"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common reception tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button className="h-24 flex-col gap-2" variant="outline">
                <Users className="h-5 w-5" />
                <span>Register New Patient</span>
              </Button>
              <Button className="h-24 flex-col gap-2" variant="outline">
                <Calendar className="h-5 w-5" />
                <span>Schedule Appointment</span>
              </Button>
              <Button className="h-24 flex-col gap-2" variant="outline">
                <DollarSign className="h-5 w-5" />
                <span>Process Payment</span>
              </Button>
              <Button className="h-24 flex-col gap-2" variant="outline">
                <FileText className="h-5 w-5" />
                <span>Update Patient Info</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const CashierDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-gray-500">₵2,345 total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payments Processed</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-gray-500">₵4,120 today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵1,850</div>
            <p className="text-xs text-gray-500">Current drawer amount</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Queue</CardTitle>
          <CardDescription>Payments waiting to be processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { patient: "James Wilson", amount: "₵125.00", type: "Consultation", time: "10 min ago" },
              { patient: "Maria Garcia", amount: "₵350.00", type: "Lab Tests", time: "15 min ago" },
              { patient: "Robert Taylor", amount: "₵75.00", type: "Prescription", time: "20 min ago" },
              { patient: "Susan Anderson", amount: "₵200.00", type: "X-Ray", time: "25 min ago" },
              { patient: "Michael Brown", amount: "₵180.00", type: "Consultation", time: "30 min ago" },
            ].map((payment, index) => (
              <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{payment.patient}</p>
                    <span className="font-medium">{payment.amount}</span>
                  </div>
                  <p className="text-sm">{payment.type}</p>
                  <p className="text-xs text-gray-500">Waiting since {payment.time}</p>
                </div>
                <Button size="sm">Process</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Helper function to get role name
  const getRoleName = (role: string) => {
    switch (role) {
      case "doctor":
        return "Doctor"
      case "nurse":
        return "Nurse"
      case "lab":
        return "Lab Technician"
      case "pharmacist":
        return "Pharmacist"
      case "admin":
        return "Administrator"
      case "reception":
        return "Receptionist"
      case "cashier":
        return "Cashier"
      default:
        return "Receptionist"
    }
  }

  // Render dashboard based on role
  const renderDashboard = () => {
    switch (role) {
      case "doctor":
        return <DoctorDashboard />
      case "nurse":
        return <NurseDashboard />
      case "lab":
        return <LabDashboard />
      case "pharmacist":
        return <PharmacistDashboard />
      case "admin":
        return <AdminDashboard />
      case "reception":
        return <ReceptionDashboard />
      case "cashier":
        return <CashierDashboard />
      default:
        return <ReceptionDashboard />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{greeting}!</h2>
        <p className="text-muted-foreground">
          Here's what's happening in your {getRoleName(role).toLowerCase()} dashboard at Luxe Clinic GH today.
        </p>
      </div>
      {renderDashboard()}
    </div>
  )
}
