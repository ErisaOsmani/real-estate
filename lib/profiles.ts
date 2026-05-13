import type { User } from "@supabase/supabase-js"
import { normalizeRole, UserRole, getUserRole } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  full_name: string
  role: UserRole
  phone?: string | null
  created_at?: string
}

export const createUserProfile = async ({
  userId,
  fullName,
  role,
}: {
  userId: string
  fullName: string
  role: UserRole
}) => {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      role,
    },
    { onConflict: "id" }
  )

  if (error) {
    throw new Error(error.message)
  }
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, created_at")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  return {
    ...data,
    role: normalizeRole(data.role),
  }
}

export const resolveUserRole = async (user: User | null): Promise<UserRole> => {
  if (!user) {
    return "client"
  }

  try {
    const profile = await getUserProfile(user.id)

    if (profile?.role) {
      return profile.role
    }
  } catch {
    return getUserRole(user)
  }

  return getUserRole(user)
}

export const getDashboardPathByRole = (role: UserRole) => {
  return role === "admin" ? "/admin" : "/properties"
}
