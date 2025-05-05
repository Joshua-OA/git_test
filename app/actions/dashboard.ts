"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Fetch dashboard statistics based on user role
export async function getDashboardStats(role: string) {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split("T")[0]

  // Common stats object structure
  const stats = {
    appointments: { total: 0, today: 0, pending: 0, completed: 0 },
    patients: { total: 0, today: 0, waiting: 0 },
    revenue: { total: 0, today: 0, pending: 0 },
    staff: { total: 0, active: 0 },
    lab: { pending: 0, inProgress: 0, completed: 0, urgent: 0 },
    prescriptions: { new: 0, ready: 0, dispensed: 0 },
    inventory: { lowStock: 0, critical: 0 },
  }

  try {
    // Fetch total patients
    const { count: totalPatients } = await supabase.from("patients").select("*", { count: "exact", head: true })

    stats.patients.total = totalPatients || 0

    // Fetch today's new patients
    const { count: todayPatients } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`)

    stats.patients.today = todayPatients || 0

    // Fetch total appointments
    const { count: totalAppointments } = await supabase.from("appointments").select("*", { count: "exact", head: true })

    stats.appointments.total = totalAppointments || 0

    // Fetch today's appointments
    const { count: todayAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("date", today)

    stats.appointments.today = todayAppointments || 0

    // Fetch pending appointments
    const { count: pendingAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "Scheduled")

    stats.appointments.pending = pendingAppointments || 0

    // Fetch completed appointments
    const { count: completedAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "Completed")

    stats.appointments.completed = completedAppointments || 0

    // Fetch total staff
    const { count: totalStaff } = await supabase.from("users").select("*", { count: "exact", head: true })

    stats.staff.total = totalStaff || 0

    // Fetch active staff (logged in within last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { count: activeStaff } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_sign_in_at", oneDayAgo.toISOString())

    stats.staff.active = activeStaff || 0

    // Fetch lab stats
    const { count: pendingLabs } = await supabase
      .from("lab_tests")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending")

    stats.lab.pending = pendingLabs || 0

    const { count: inProgressLabs } = await supabase
      .from("lab_tests")
      .select("*", { count: "exact", head: true })
      .eq("status", "In Progress")

    stats.lab.inProgress = inProgressLabs || 0

    const { count: completedLabs } = await supabase
      .from("lab_tests")
      .select("*", { count: "exact", head: true })
      .eq("status", "Completed")

    stats.lab.completed = completedLabs || 0

    const { count: urgentLabs } = await supabase
      .from("lab_tests")
      .select("*", { count: "exact", head: true })
      .eq("priority", "Urgent")

    stats.lab.urgent = urgentLabs || 0

    // Fetch revenue stats
    const { data: totalRevenue } = await supabase.from("payments").select("amount").eq("status", "Completed")

    stats.revenue.total = totalRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    const { data: todayRevenue } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "Completed")
      .gte("created_at", `${today}T00:00:00`)

    stats.revenue.today = todayRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    const { data: pendingRevenue } = await supabase.from("payments").select("amount").eq("status", "Pending")

    stats.revenue.pending = pendingRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    // Fetch prescription stats
    const { count: newPrescriptions } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending")

    stats.prescriptions.new = newPrescriptions || 0

    const { count: readyPrescriptions } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "Ready")

    stats.prescriptions.ready = readyPrescriptions || 0

    const { count: dispensedPrescriptions } = await supabase
      .from("prescriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "Dispensed")
      .gte("updated_at", `${today}T00:00:00`)

    stats.prescriptions.dispensed = dispensedPrescriptions || 0

    // Fetch inventory stats
    const { count: lowStockItems } = await supabase
      .from("medications")
      .select("*", { count: "exact", head: true })
      .lt("stock", supabase.raw("reorder_level"))
      .gt("stock", 0)

    stats.inventory.lowStock = lowStockItems || 0

    const { count: criticalStockItems } = await supabase
      .from("medications")
      .select("*", { count: "exact", head: true })
      .eq("stock", 0)

    stats.inventory.critical = criticalStockItems || 0

    return { success: true, stats }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { success: false, error: "Failed to fetch dashboard statistics" }
  }
}

// Fetch upcoming appointments for dashboard
export async function getUpcomingAppointments(limit = 5) {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        status,
        reason,
        patients (
          id,
          first_name,
          last_name
        ),
        users (
          id,
          first_name,
          last_name
        )
      `)
      .gte("date", today)
      .eq("status", "Scheduled")
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      appointments: data.map((apt) => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        reason: apt.reason,
        patient: apt.patients ? `${apt.patients.first_name} ${apt.patients.last_name}` : "Unknown Patient",
        doctor: apt.users ? `Dr. ${apt.users.first_name} ${apt.users.last_name}` : "Unassigned",
      })),
    }
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error)
    return { success: false, error: "Failed to fetch upcoming appointments" }
  }
}

// Fetch recent patient notes
export async function getRecentPatientNotes(limit = 3) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("medical_records")
      .select(`
        id,
        notes,
        created_at,
        patients (
          id,
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      notes: data.map((note) => ({
        id: note.id,
        patient: note.patients ? `${note.patients.first_name} ${note.patients.last_name}` : "Unknown Patient",
        note: note.notes,
        time: new Date(note.created_at).toLocaleString(),
      })),
    }
  } catch (error) {
    console.error("Error fetching recent patient notes:", error)
    return { success: false, error: "Failed to fetch recent patient notes" }
  }
}

// Fetch waiting patients
export async function getWaitingPatients(limit = 5) {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        check_in_time,
        patients (
          id,
          first_name,
          last_name
        ),
        users (
          id,
          first_name,
          last_name
        ),
        room
      `)
      .eq("date", today)
      .eq("status", "Checked In")
      .order("check_in_time", { ascending: true })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      patients: data.map((apt) => {
        // Calculate waiting time
        const checkInTime = new Date(apt.check_in_time)
        const now = new Date()
        const waitingMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / 60000)

        return {
          id: apt.id,
          name: apt.patients ? `${apt.patients.first_name} ${apt.patients.last_name}` : "Unknown Patient",
          doctor: apt.users ? `Dr. ${apt.users.first_name} ${apt.users.last_name}` : "Unassigned",
          room: apt.room || "Unassigned",
          waitingTime:
            waitingMinutes <= 0
              ? "Just arrived"
              : waitingMinutes === 1
                ? "Waiting for 1 min"
                : `Waiting for ${waitingMinutes} mins`,
        }
      }),
    }
  } catch (error) {
    console.error("Error fetching waiting patients:", error)
    return { success: false, error: "Failed to fetch waiting patients" }
  }
}

// Fetch pending lab tests
export async function getPendingLabTests(limit = 5) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("lab_tests")
      .select(`
        id,
        test_name,
        priority,
        created_at,
        patients (
          id,
          first_name,
          last_name
        ),
        users (
          id,
          first_name,
          last_name
        )
      `)
      .eq("status", "Pending")
      .order("priority", { ascending: false }) // Urgent first
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      tests: data.map((test) => {
        // Format requested time
        const requestTime = new Date(test.created_at)
        const now = new Date()
        const diffHours = Math.floor((now.getTime() - requestTime.getTime()) / 3600000)

        let requestedTime
        if (diffHours < 24) {
          requestedTime = `Today, ${requestTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        } else if (diffHours < 48) {
          requestedTime = `Yesterday, ${requestTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        } else {
          requestedTime = requestTime.toLocaleDateString()
        }

        return {
          id: test.id,
          patient: test.patients ? `${test.patients.first_name} ${test.patients.last_name}` : "Unknown Patient",
          test: test.test_name,
          doctor: test.users ? `Dr. ${test.users.first_name} ${test.users.last_name}` : "Unassigned",
          priority: test.priority,
          requested: requestedTime,
        }
      }),
    }
  } catch (error) {
    console.error("Error fetching pending lab tests:", error)
    return { success: false, error: "Failed to fetch pending lab tests" }
  }
}

// Fetch pending prescriptions
export async function getPendingPrescriptions(limit = 5) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        id,
        medication,
        status,
        created_at,
        patients (
          id,
          first_name,
          last_name
        ),
        users (
          id,
          first_name,
          last_name
        )
      `)
      .in("status", ["Pending", "Preparing", "Ready"])
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      prescriptions: data.map((prescription) => {
        // Format time
        const prescriptionTime = new Date(prescription.created_at)
        const formattedTime = prescriptionTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        return {
          id: prescription.id,
          patient: prescription.patients
            ? `${prescription.patients.first_name} ${prescription.patients.last_name}`
            : "Unknown Patient",
          medication: prescription.medication,
          doctor: prescription.users
            ? `Dr. ${prescription.users.first_name} ${prescription.users.last_name}`
            : "Unassigned",
          status: prescription.status,
          time: formattedTime,
        }
      }),
    }
  } catch (error) {
    console.error("Error fetching pending prescriptions:", error)
    return { success: false, error: "Failed to fetch pending prescriptions" }
  }
}

// Fetch pending payments
export async function getPendingPayments(limit = 5) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        payment_type,
        created_at,
        patients (
          id,
          first_name,
          last_name
        )
      `)
      .eq("status", "Pending")
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      payments: data.map((payment) => {
        // Calculate waiting time
        const paymentTime = new Date(payment.created_at)
        const now = new Date()
        const waitingMinutes = Math.floor((now.getTime() - paymentTime.getTime()) / 60000)

        return {
          id: payment.id,
          patient: payment.patients
            ? `${payment.patients.first_name} ${payment.patients.last_name}`
            : "Unknown Patient",
          amount: payment.amount,
          type: payment.payment_type,
          time:
            waitingMinutes <= 0
              ? "Just now"
              : waitingMinutes === 1
                ? "1 min ago"
                : waitingMinutes < 60
                  ? `${waitingMinutes} min ago`
                  : `${Math.floor(waitingMinutes / 60)} hour(s) ago`,
        }
      }),
    }
  } catch (error) {
    console.error("Error fetching pending payments:", error)
    return { success: false, error: "Failed to fetch pending payments" }
  }
}

// Fetch department performance
export async function getDepartmentPerformance() {
  const supabase = createServerSupabaseClient()
  const today = new Date()
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        department,
        created_at
      `)
      .gte("created_at", lastMonth.toISOString())
      .eq("status", "Completed")

    if (error) throw error

    // Group by department and count
    const departments: Record<string, { current: number; previous: number }> = {}

    // Split the month in half to compare current and previous periods
    const midMonth = new Date(today)
    midMonth.setDate(midMonth.getDate() - 15)

    data.forEach((appointment) => {
      const dept = appointment.department || "General"
      const appointmentDate = new Date(appointment.created_at)

      if (!departments[dept]) {
        departments[dept] = { current: 0, previous: 0 }
      }

      if (appointmentDate >= midMonth) {
        departments[dept].current++
      } else {
        departments[dept].previous++
      }
    })

    // Calculate percentage change
    const performance = Object.entries(departments).map(([department, counts]) => {
      const percentChange =
        counts.previous === 0
          ? "+100%" // If previous was 0, show as 100% increase
          : `${counts.current > counts.previous ? "+" : ""}${Math.round(((counts.current - counts.previous) / counts.previous) * 100)}%`

      return {
        department,
        patients: counts.current,
        change: percentChange,
      }
    })

    // Sort by patient count descending
    performance.sort((a, b) => b.patients - a.patients)

    return { success: true, performance }
  } catch (error) {
    console.error("Error fetching department performance:", error)
    return { success: false, error: "Failed to fetch department performance" }
  }
}
