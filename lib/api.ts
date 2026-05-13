import { supabase } from "@/lib/supabase"

export type ListingTone = "Profesional" | "Luksoz" | "I shkurtër" | "Familjar"

export interface Property {
  id: string
  user_id: string
  title: string
  description: string
  created_at?: string
}

interface GeneratePropertyResponse {
  reply: string
}

export const generateProperty = async (
  input: string,
  tone: ListingTone
): Promise<GeneratePropertyResponse> => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: input, tone }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error || "Shërbimi AI dështoi.")
  }

  return data
}

export const getUserProperties = async (userId: string): Promise<Property[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export const getAdminProperties = async (): Promise<Property[]> => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("id", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export const createProperty = async ({
  userId,
  title,
  description,
}: {
  userId: string
  title: string
  description: string
}) => {
  const { error } = await supabase.from("properties").insert([
    {
      user_id: userId,
      title,
      description,
    },
  ])

  if (error) {
    throw new Error(error.message)
  }
}

export const deleteProperty = async ({
  propertyId,
  userId,
}: {
  propertyId: string
  userId: string
}) => {
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }
}
