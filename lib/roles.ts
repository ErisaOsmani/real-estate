import type { User } from "@supabase/supabase-js"

export type UserRole = "admin" | "client"

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin/Pronar",
  client: "Klient/Banor",
}

export const getUserRole = (user: User | null): UserRole => {
  if (!user) {
    return "client"
  }

  const appRole = String(user.app_metadata?.role ?? "").toLowerCase()
  const profileRole = String(user.user_metadata?.role ?? "").toLowerCase()
  const email = user.email?.toLowerCase() ?? ""

  if (
    appRole === "admin" ||
    appRole === "owner" ||
    profileRole === "admin" ||
    profileRole === "owner" ||
    email.startsWith("admin@")
  ) {
    return "admin"
  }

  return "client"
}

export const getDashboardPath = (user: User | null) => {
  return getUserRole(user) === "admin" ? "/admin" : "/properties"
}

export const isAdminRole = (user: User | null) => getUserRole(user) === "admin"
