"use server"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  // For demo purposes, we'll allow any email/password combination
  // that matches our demo emails
  const role = getRoleFromEmail(email)

  // Return success with role for client-side storage and redirection
  return {
    success: true,
    role,
  }
}

// Helper function to determine role from email (for demo purposes)
function getRoleFromEmail(email: string): string {
  if (email.includes("doctor")) return "doctor"
  if (email.includes("nurse")) return "nurse"
  if (email.includes("lab")) return "lab"
  if (email.includes("pharmacy")) return "pharmacist"
  if (email.includes("admin")) return "admin"
  if (email.includes("reception")) return "reception"
  if (email.includes("cashier")) return "cashier"
  return "reception" // Default role
}
