import type { User } from "@supabase/supabase-js"
import { isAdminRole } from "@/lib/roles"

const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export const isAdminUser = (user: User | null) => {
  if (!user?.email) {
    return false
  }

  const email = user.email.toLowerCase()

  return isAdminRole(user) || adminEmails.includes(email)
}
