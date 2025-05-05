"use client"

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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  getDashboardStats,
  getUpcomingAppointments,
  getRecentPatientNotes,
  getWaitingPatients,
  getPendingLabTests,
  getPendingPrescriptions,
  getPendingPayments,
  getDepartmentPerformance,
} from "../actions/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [role, setRole] = useState<string>("reception")
  const [greeting, setGreeting] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [recentNotes, setRecentNotes] = useState<any[]>([])
  const [waitingPatients, setWaitingPatients] = useState<any[]>([])
  const [pendingLabTests, setPendingLabTests] = useState<any[]>([])
  const [pendingPrescriptions, setPendingPrescriptions] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [departmentPerformance, setDepartmentPerformance] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get role from Supabase auth
    const fetchUserRole = async () => {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // First check user metadata for role
          const userRole = user.user_metadata?.role

          if (userRole) {
            setRole(userRole)
          } else {
            // If not in metadata, check the users table
            const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

            if (userData?.role) {
              setRole(userData.role)
            }
          }

          // Fetch dashboard data based on role
          await fetchDashboardData(userRole || userData?.role || "reception")
        }
      } catch (err) {
        console.error("Error fetching user role:", err)
        setError("Failed to load dashboard data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    fetchUserRole()
  }, [supabase])

  const fetchDashboardData = async (userRole: string) => {
    try {
      // Fetch common stats for all roles
      const { success, stats: dashboardStats, error: statsError } = await getDashboardStats(userRole)

      if (!success) {
        throw new Error(statsError || "Failed to fetch dashboard statistics")
      }

      setStats(dashboardStats)

      // Fetch role-specific data
      switch (userRole) {
        case "doctor":
          const { success: aptSuccess, appointments, error: aptError } = await getUpcomingAppointments(4)
          const { success: notesSuccess, notes, error: notesError } = await getRecentPatientNotes(3)

          if (aptSuccess) setUpcomingAppointments(appointments)
          if (notesSuccess) setRecentNotes(notes)
          break

        case "nurse":
          const { success: patientsSuccess, patients, error: patientsError } = await getWaitingPatients(4)

          if (patientsSuccess) setWaitingPatients(patients)
          break

        case "lab":
          const { success: labSuccess, tests, error: labError } = await getPendingLabTests(5)

          if (labSuccess) setPendingLabTests(tests)
          break

        case "pharmacist":
          const { success: rxSuccess, prescriptions, error: rxError } = await getPendingPrescriptions(4)

          if (rxSuccess) setPendingPrescriptions(prescriptions)
          break

        case "admin":
          const { success: deptSuccess, performance, error: deptError } = await getDepartmentPerformance()

          if (deptSuccess) setDepartmentPerformance(performance)
          break

        case "reception":
          const { success: recAptSuccess, appointments: recAppointments } = await getUpcomingAppointments(5)

          if (recAptSuccess) setUpcomingAppointments(recAppointments)
          break

        case "cashier":
          const { success: paySuccess, payments, error: payError } = await getPendingPayments(5)

          if (paySuccess) setPendingPayments(payments)
          break
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data. Please refresh the page.")
    }
  }

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
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.appointments?.today || 0}</div>
                <p className="text-xs text-gray-500">
                  {stats.appointments?.pending || 0} pending, {stats.appointments?.completed || 0} completed
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients Seen Today</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.appointments?.completed || 0}</div>
                <p className="text-xs text-gray-500">&nbsp;</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lab Results Pending</CardTitle>
            <Flask className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.lab?.pending || 0}</div>
                <p className="text-xs text-gray-500">{stats.lab?.urgent || 0} urgent</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions Written</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.prescriptions?.new || 0}</div>
                <p className="text-xs text-gray-500">Today</p>
              </>
            )}
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
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
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
            ) : (
              <div className="py-8 text-center text-gray-500">No upcoming appointments</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Patient Notes</CardTitle>
            <CardDescription>Latest updates from your patients</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map((note, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{note.patient}</span>
                      <span className="text-xs text-gray-500">{note.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{note.note}</p>
                    <div className="pt-1">
                      <Link href={`/dashboard/medical-records?patient=${note.id}`}>
                        <Button variant="link" className="h-auto p-0 text-blue-600">
                          View full record
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">No recent patient notes</div>
            )}
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
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.appointments?.today || 0}</div>
                <p className="text-xs text-gray-500">{stats.patients?.waiting || 0} waiting now</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vitals Recorded</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.appointments?.completed || 0}</div>
                <p className="text-xs text-gray-500">Today</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Pending</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.appointments?.pending || 0}</div>
                <p className="text-xs text-gray-500">{stats.lab?.urgent || 0} high priority</p>
              </>
            )}
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
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : waitingPatients.length > 0 ? (
              <div className="space-y-4">
                {waitingPatients.map((patient, index) => (
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
                    <div className="text-sm font-medium">{patient.waitingTime}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">No patients waiting</div>
            )}
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
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.lab?.pending || 0}</div>
                <p className="text-xs text-gray-500">{stats.lab?.urgent || 0} urgent</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.lab?.inProgress || 0}</div>
                <p className="text-xs text-gray-500">&nbsp;</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.lab?.completed || 0}</div>
                <p className="text-xs text-gray-500">&nbsp;</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Requests</CardTitle>
          <CardDescription>Pending lab test requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pendingLabTests.length > 0 ? (
            <div className="space-y-4">
              {pendingLabTests.map((request, index) => (
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
          ) : (
            <div className="py-8 text-center text-gray-500">No pending lab tests</div>
          )}
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
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.prescriptions?.new || 0}</div>
                <p className="text-xs text-gray-500">&nbsp;</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <Pill className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.prescriptions?.ready || 0}</div>
                <p className="text-xs text-gray-500">&nbsp;</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dispensed Today</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.prescriptions?.dispensed || 0}</div>
                <p className="text-xs text-gray-500">&nbsp;</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.inventory?.lowStock || 0}</div>
                <p className="text-xs text-gray-500">{stats.inventory?.critical || 0} critical</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Queue</CardTitle>
          <CardDescription>Prescriptions waiting to be processed</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pendingPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {pendingPrescriptions.map((prescription, index) => (
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
          ) : (
            <div className="py-8 text-center text-gray-500">No pending prescriptions</div>
          )}
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
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.patients?.total || 0}</div>
                <p className="text-xs text-gray-500">+{stats.patients?.today || 0} this month</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">₵{stats.revenue?.total?.toLocaleString() || 0}</div>
                <p className="text-xs text-gray-500">₵{stats.revenue?.today?.toLocaleString() || 0} today</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.appointments?.total || 0}</div>
                <p className="text-xs text-gray-500">{stats.appointments?.today || 0} today</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.staff?.active || 0}</div>
                <p className="text-xs text-gray-500">of {stats.staff?.total || 0} total staff</p>
              </>
            )}
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
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : departmentPerformance.length > 0 ? (
              <div className="space-y-4">
                {departmentPerformance.map((dept, index) => (
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
            ) : (
              <div className="py-8 text-center text-gray-500">No department data available</div>
            )}
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
                  message: `${stats.inventory?.lowStock || 0} medications below reorder threshold`,
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
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.appointments?.today || 0}</div>
                <p className="text-xs text-gray-500">{stats.patients?.waiting || 0} checked in</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waiting Patients</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.patients?.waiting || 0}</div>
                <p className="text-xs text-gray-500">&nbsp;</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.patients?.today || 0}</div>
                <p className="text-xs text-gray-500">Today</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.revenue?.pending || 0}</div>
                <p className="text-xs text-gray-500">₵{stats.revenue?.pending?.toLocaleString() || 0} total</p>
              </>
            )}
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
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        appointment.status === "Checked In"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
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
                          {appointment.status || "Scheduled"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{appointment.doctor}</p>
                      <p className="text-xs text-gray-500">{appointment.time}</p>
                    </div>
                    <Button size="sm" variant={appointment.status === "Checked In" ? "outline" : "default"}>
                      {appointment.status === "Checked In" ? "View" : "Check In"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">No appointments scheduled for today</div>
            )}
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
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.revenue?.pending || 0}</div>
                <p className="text-xs text-gray-500">₵{stats.revenue?.pending?.toLocaleString() || 0} total</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payments Processed</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.revenue?.today || 0}</div>
                <p className="text-xs text-gray-500">₵{stats.revenue?.today?.toLocaleString() || 0} today</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">₵{(stats.revenue?.today || 0) * 0.6}</div>
                <p className="text-xs text-gray-500">Current drawer amount</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Queue</CardTitle>
          <CardDescription>Payments waiting to be processed</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pendingPayments.length > 0 ? (
            <div className="space-y-4">
              {pendingPayments.map((payment, index) => (
                <div key={index} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{payment.patient}</p>
                      <span className="font-medium">₵{payment.amount}</span>
                    </div>
                    <p className="text-sm">{payment.type}</p>
                    <p className="text-xs text-gray-500">Waiting since {payment.time}</p>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No pending payments</div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Helper function to get role name
  const getRoleName = (role: string): string => {
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

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Error Loading Dashboard</h2>
          <p className="text-red-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
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
