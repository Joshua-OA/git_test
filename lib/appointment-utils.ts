/**
 * Utility functions for appointment management
 */

/**
 * Checks if an appointment can be fully edited
 * @param appointmentDate The date of the appointment
 * @returns Boolean indicating if the appointment can be fully edited
 */
export function canEditAppointment(appointmentDate: string | Date): boolean {
  const appointmentTime = new Date(appointmentDate).getTime()
  const currentTime = new Date().getTime()

  // Convert 30 minutes to milliseconds (30 * 60 * 1000)
  const thirtyMinutesInMs = 30 * 60 * 1000

  // Check if the appointment is in the future or less than 30 minutes in the past
  return appointmentTime > currentTime || currentTime - appointmentTime < thirtyMinutesInMs
}

/**
 * Checks if an appointment is from a previous session
 * @param appointmentDate The date of the appointment
 * @returns Boolean indicating if the appointment is from a previous session
 */
export function isPreviousSession(appointmentDate: string | Date): boolean {
  const appointmentTime = new Date(appointmentDate).getTime()
  const currentTime = new Date().getTime()

  // If appointment time is before current time, it's a previous session
  return appointmentTime < currentTime
}

/**
 * Determines the edit mode for an appointment
 * @param appointmentDate The date of the appointment
 * @returns The edit mode: 'full', 'add-only', or 'view-only'
 */
export function getAppointmentEditMode(appointmentDate: string | Date): "full" | "add-only" | "view-only" {
  const appointmentTime = new Date(appointmentDate).getTime()
  const currentTime = new Date().getTime()

  // Convert 30 minutes to milliseconds
  const thirtyMinutesInMs = 30 * 60 * 1000

  // If appointment is in the future, allow full editing
  if (appointmentTime > currentTime) {
    return "full"
  }

  // If appointment is less than 30 minutes in the past, allow full editing
  if (currentTime - appointmentTime < thirtyMinutesInMs) {
    return "full"
  }

  // If appointment is more than 30 minutes in the past, allow adding info only
  return "add-only"
}
