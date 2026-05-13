import { supabase } from "@/lib/supabase"

export type ListingTone = "Professional" | "Luxury" | "Short" | "Family"

export interface Property {
  id: string
  user_id?: string
  owner_id?: string
  title: string
  description?: string | null
  listing_type?: "sale" | "rent" | string | null
  property_type?: string | null
  city?: string | null
  neighborhood?: string | null
  price?: number | string | null
  area?: number | string | null
  bedrooms?: number | null
  bathrooms?: number | null
  status?: "draft" | "active" | "sold" | "rented" | string | null
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at?: string
}

export type InquiryStatus = "new" | "contacted" | "visit" | "closed"

export interface Inquiry {
  id: string
  property_id: string
  client_id?: string | null
  full_name: string
  email: string
  phone?: string | null
  message?: string | null
  status: InquiryStatus | string
  created_at?: string
  property?: Property | null
}

export type PropertyListingType = "sale" | "rent"
export type PropertyStatus = "draft" | "active" | "sold" | "rented"

export interface PropertyPayload {
  title: string
  description: string
  listing_type: PropertyListingType
  property_type: string
  city: string
  neighborhood: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  status: PropertyStatus
  image_url?: string | null
}

interface GeneratePropertyResponse {
  reply: string
}

export interface AdminMarketingPackage {
  title: string
  description: string
  socialPost: string
  portalShort: string
  missingFields: string[]
}

export type ClientProfile = "family" | "student" | "investor"

export interface ClientAiProsCons {
  propertyId: string
  pros: string[]
  cons: string[]
}

export interface ClientAiRecommendation {
  summary: string
  recommendedIds: string[]
  comparison: string
  prosCons: ClientAiProsCons[]
  nextStep: string
}

const isMissingColumnError = (error: { code?: string; message: string } | null, column: string) => {
  return Boolean(
    error &&
      (error.code === "42703" || error.message.toLowerCase().includes(column.toLowerCase()))
  )
}

const getMissingSchemaColumn = (error: { code?: string; message: string } | null) => {
  if (!error) {
    return ""
  }

  const missingColumnMatch = error.message.match(/'([^']+)' column/)

  if (missingColumnMatch?.[1]) {
    return missingColumnMatch[1]
  }

  return error.code === "42703" ? "updated_at" : ""
}

const removeColumn = <T extends Record<string, unknown>>(payload: T, column: string) => {
  const nextPayload = { ...payload }

  delete nextPayload[column]

  return nextPayload
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
    throw new Error(data?.error || "The AI service failed.")
  }

  return data
}

export const generateAdminMarketingPackage = async (
  property: PropertyPayload & { image_url?: string | null }
): Promise<AdminMarketingPackage> => {
  const message = [
    `Current title: ${property.title || "missing"}`,
    `Listing: ${property.listing_type === "rent" ? "for rent" : "for sale"}`,
    `Property type: ${property.property_type || "missing"}`,
    `City: ${property.city || "missing"}`,
    `Neighborhood: ${property.neighborhood || "missing"}`,
    `Price: ${property.price || "missing"} EUR`,
    `Area: ${property.area || "missing"} m2`,
    `Bedrooms: ${property.bedrooms ?? "missing"}`,
    `Bathrooms: ${property.bathrooms ?? "missing"}`,
    `Photo: ${property.image_url ? "yes" : "missing"}`,
    `Current description: ${property.description || "missing"}`,
  ].join("\n")

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "admin-marketing",
      message,
      tone: "Professional",
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error || "Marketing package generation failed.")
  }

  return {
    title: String(data?.title ?? ""),
    description: String(data?.description ?? ""),
    socialPost: String(data?.socialPost ?? ""),
    portalShort: String(data?.portalShort ?? ""),
    missingFields: Array.isArray(data?.missingFields) ? data.missingFields.map(String) : [],
  }
}

export const generateClientRecommendations = async ({
  query,
  profile,
  properties,
}: {
  query: string
  profile: ClientProfile
  properties: Property[]
}): Promise<ClientAiRecommendation> => {
  const propertyList = properties.slice(0, 12).map((property) => {
    return [
      `ID: ${property.id}`,
      `Titulli: ${property.title}`,
      `Listing: ${property.listing_type === "rent" ? "rent" : "sale"}`,
      `Type: ${property.property_type || "missing"}`,
      `City: ${property.city || "missing"}`,
      `Neighborhood: ${property.neighborhood || "missing"}`,
      `Price: ${property.price ?? "missing"} EUR`,
      `Area: ${property.area ?? "missing"} m2`,
      `Bedrooms: ${property.bedrooms ?? "missing"}`,
      `Bathrooms: ${property.bathrooms ?? "missing"}`,
      `Description: ${property.description || "missing"}`,
    ].join(" | ")
  })

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "client-advisor",
      message: [
        `Natural language request: ${query}`,
        `Profile: ${profile}`,
        "Available active properties:",
        propertyList.join("\n"),
      ].join("\n\n"),
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error || "AI could not suggest properties.")
  }

  return {
    summary: String(data?.summary ?? ""),
    recommendedIds: Array.isArray(data?.recommendedIds)
      ? data.recommendedIds.map(String).slice(0, 3)
      : [],
    comparison: String(data?.comparison ?? ""),
    prosCons: Array.isArray(data?.prosCons)
      ? data.prosCons.map((item: Partial<ClientAiProsCons>) => ({
          propertyId: String(item.propertyId ?? ""),
          pros: Array.isArray(item.pros) ? item.pros.map(String) : [],
          cons: Array.isArray(item.cons) ? item.cons.map(String) : [],
        }))
      : [],
    nextStep: String(data?.nextStep ?? ""),
  }
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

export const getAdminProperties = async (userId?: string): Promise<Property[]> => {
  const orderedByCreatedAt = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })

  const shouldFallbackToId =
    orderedByCreatedAt.error?.message.toLowerCase().includes("created_at") ||
    orderedByCreatedAt.error?.code === "42703"

  const { data, error } = shouldFallbackToId
    ? await supabase.from("properties").select("*").order("id", { ascending: false })
    : orderedByCreatedAt

  if (error) {
    throw new Error(error.message)
  }

  const properties = (data ?? []) as Property[]

  if (!userId) {
    return properties
  }

  const ownedProperties = properties.filter((property) => {
    const ownerId = property.owner_id ?? property.user_id

    return ownerId === userId
  })

  return ownedProperties.length > 0 ? ownedProperties : properties
}

export const getActiveProperties = async (): Promise<Property[]> => {
  const orderedByCreatedAt = await supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const shouldFallbackToId =
    orderedByCreatedAt.error?.message.toLowerCase().includes("created_at") ||
    orderedByCreatedAt.error?.code === "42703"

  const missingStatus =
    orderedByCreatedAt.error?.message.toLowerCase().includes("status") ||
    orderedByCreatedAt.error?.code === "42703"

  if (missingStatus && !shouldFallbackToId) {
    return []
  }

  const { data, error } = shouldFallbackToId
    ? await supabase.from("properties").select("*").eq("status", "active").order("id", { ascending: false })
    : orderedByCreatedAt

  if (error) {
    if (isMissingColumnError(error, "status")) {
      return []
    }

    throw new Error(error.message)
  }

  return (data ?? []) as Property[]
}

export const getActivePropertyById = async (propertyId: string): Promise<Property | null> => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    if (isMissingColumnError(error, "status")) {
      return null
    }

    throw new Error(error.message)
  }

  return (data as Property | null) ?? null
}

export const getFavoritePropertyIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("favorites")
    .select("property_id")
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((favorite) => String(favorite.property_id))
}

export const addFavorite = async ({
  userId,
  propertyId,
}: {
  userId: string
  propertyId: string
}) => {
  const { error } = await supabase.from("favorites").upsert(
    {
      user_id: userId,
      property_id: propertyId,
    },
    { onConflict: "user_id,property_id" }
  )

  if (error) {
    throw new Error(error.message)
  }
}

export const removeFavorite = async ({
  userId,
  propertyId,
}: {
  userId: string
  propertyId: string
}) => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("property_id", propertyId)

  if (error) {
    throw new Error(error.message)
  }
}

export const getFavoriteProperties = async (userId: string): Promise<Property[]> => {
  const favoriteIds = await getFavoritePropertyIds(userId)

  if (favoriteIds.length === 0) {
    return []
  }

  const activeProperties = await getActiveProperties()
  const favoriteSet = new Set(favoriteIds)

  return activeProperties.filter((property) => favoriteSet.has(property.id))
}

const getPropertiesByIds = async (propertyIds: string[]): Promise<Property[]> => {
  if (propertyIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .in("id", propertyIds)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Property[]
}

const attachPropertiesToInquiries = async (inquiries: Inquiry[]) => {
  const propertyIds = Array.from(new Set(inquiries.map((inquiry) => inquiry.property_id)))
  const properties = await getPropertiesByIds(propertyIds)
  const propertyMap = new Map(properties.map((property) => [property.id, property]))

  return inquiries.map((inquiry) => ({
    ...inquiry,
    property: propertyMap.get(inquiry.property_id) ?? null,
  }))
}

export const createInquiry = async ({
  propertyId,
  clientId,
  fullName,
  email,
  phone,
  message,
}: {
  propertyId: string
  clientId: string
  fullName: string
  email: string
  phone: string
  message: string
}) => {
  const { error } = await supabase.from("inquiries").insert([
    {
      property_id: propertyId,
      client_id: clientId,
      full_name: fullName,
      email,
      phone,
      message,
      status: "new",
    },
  ])

  if (error) {
    throw new Error(error.message)
  }
}

export const getClientInquiries = async (clientId: string): Promise<Inquiry[]> => {
  const orderedByCreatedAt = await supabase
    .from("inquiries")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  const shouldFallbackToId =
    orderedByCreatedAt.error?.message.toLowerCase().includes("created_at") ||
    orderedByCreatedAt.error?.code === "42703"

  const { data, error } = shouldFallbackToId
    ? await supabase.from("inquiries").select("*").eq("client_id", clientId).order("id", { ascending: false })
    : orderedByCreatedAt

  if (error) {
    throw new Error(error.message)
  }

  return attachPropertiesToInquiries((data ?? []) as Inquiry[])
}

export const getAdminInquiries = async (adminId: string): Promise<Inquiry[]> => {
  const properties = await getAdminProperties(adminId)
  const propertyIds = properties.map((property) => property.id)

  if (propertyIds.length === 0) {
    return []
  }

  const orderedByCreatedAt = await supabase
    .from("inquiries")
    .select("*")
    .in("property_id", propertyIds)
    .order("created_at", { ascending: false })

  const shouldFallbackToId =
    orderedByCreatedAt.error?.message.toLowerCase().includes("created_at") ||
    orderedByCreatedAt.error?.code === "42703"

  const { data, error } = shouldFallbackToId
    ? await supabase.from("inquiries").select("*").in("property_id", propertyIds).order("id", { ascending: false })
    : orderedByCreatedAt

  if (error) {
    throw new Error(error.message)
  }

  const propertyMap = new Map(properties.map((property) => [property.id, property]))

  return ((data ?? []) as Inquiry[]).map((inquiry) => ({
    ...inquiry,
    property: propertyMap.get(inquiry.property_id) ?? null,
  }))
}

export const updateInquiryStatus = async ({
  inquiryId,
  status,
}: {
  inquiryId: string
  status: InquiryStatus
}) => {
  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId)

  if (error) {
    throw new Error(error.message)
  }
}

export const createProperty = async ({
  userId,
  property,
}: {
  userId: string
  property: PropertyPayload
}) => {
  let insertPayload: Record<string, unknown> = {
    owner_id: userId,
    ...property,
  }
  let insertWithOwnerId = await supabase.from("properties").insert([insertPayload])

  while (insertWithOwnerId.error) {
    const missingColumn = getMissingSchemaColumn(insertWithOwnerId.error)

    if (!missingColumn || missingColumn === "owner_id") {
      break
    }

    insertPayload = removeColumn(insertPayload, missingColumn)
    insertWithOwnerId = await supabase.from("properties").insert([insertPayload])
  }

  if (!insertWithOwnerId.error) {
    return
  }

  if (!isMissingColumnError(insertWithOwnerId.error, "owner_id")) {
    throw new Error(insertWithOwnerId.error.message)
  }

  let userIdPayload: Record<string, unknown> = {
    user_id: userId,
    ...property,
  }
  let insertWithUserId = await supabase.from("properties").insert([userIdPayload])

  while (insertWithUserId.error) {
    const missingColumn = getMissingSchemaColumn(insertWithUserId.error)

    if (!missingColumn) {
      break
    }

    userIdPayload = removeColumn(userIdPayload, missingColumn)
    insertWithUserId = await supabase.from("properties").insert([userIdPayload])
  }

  if (insertWithUserId.error) {
    throw new Error(insertWithUserId.error.message)
  }
}

export const updateProperty = async ({
  propertyId,
  userId,
  property,
}: {
  propertyId: string
  userId: string
  property: PropertyPayload
}) => {
  const buildUpdatePayload = (includeUpdatedAt: boolean): Record<string, unknown> => {
    return includeUpdatedAt
      ? {
          ...property,
          updated_at: new Date().toISOString(),
        }
      : { ...property }
  }

  const updateWithFallback = async (ownerColumn: "owner_id" | "user_id") => {
    let updatePayload: Record<string, unknown> = buildUpdatePayload(true)
    let result = await supabase
      .from("properties")
      .update(updatePayload)
      .eq("id", propertyId)
      .eq(ownerColumn, userId)

    while (result.error) {
      const missingColumn = getMissingSchemaColumn(result.error)

      if (!missingColumn || missingColumn === ownerColumn) {
        break
      }

      updatePayload = removeColumn(updatePayload, missingColumn)
      result = await supabase
        .from("properties")
        .update(updatePayload)
        .eq("id", propertyId)
        .eq(ownerColumn, userId)
    }

    return result
  }

  const updateWithColumn = async (
    ownerColumn: "owner_id" | "user_id",
    includeUpdatedAt: boolean
  ) => {
    return supabase
      .from("properties")
      .update(buildUpdatePayload(includeUpdatedAt))
      .eq("id", propertyId)
      .eq(ownerColumn, userId)
  }

  const updateWithOwnerId = await updateWithFallback("owner_id")

  if (!updateWithOwnerId.error) {
    return
  }

  if (!isMissingColumnError(updateWithOwnerId.error, "owner_id")) {
    throw new Error(updateWithOwnerId.error.message)
  }

  let updateWithUserId = await updateWithFallback("user_id")

  if (isMissingColumnError(updateWithUserId.error, "updated_at")) {
    updateWithUserId = await updateWithColumn("user_id", false)
  }

  if (updateWithUserId.error) {
    throw new Error(updateWithUserId.error.message)
  }
}

export const updatePropertyStatus = async ({
  propertyId,
  userId,
  status,
}: {
  propertyId: string
  userId: string
  status: PropertyStatus
}) => {
  const buildUpdatePayload = (includeUpdatedAt: boolean): Record<string, unknown> => {
    return includeUpdatedAt
      ? {
          status,
          updated_at: new Date().toISOString(),
        }
      : { status }
  }

  const updateWithFallback = async (ownerColumn: "owner_id" | "user_id") => {
    let updatePayload: Record<string, unknown> = buildUpdatePayload(true)
    let result = await supabase
      .from("properties")
      .update(updatePayload)
      .eq("id", propertyId)
      .eq(ownerColumn, userId)

    while (result.error) {
      const missingColumn = getMissingSchemaColumn(result.error)

      if (!missingColumn || missingColumn === ownerColumn) {
        break
      }

      updatePayload = removeColumn(updatePayload, missingColumn)
      result = await supabase
        .from("properties")
        .update(updatePayload)
        .eq("id", propertyId)
        .eq(ownerColumn, userId)
    }

    return result
  }

  const updateWithColumn = async (
    ownerColumn: "owner_id" | "user_id",
    includeUpdatedAt: boolean
  ) => {
    return supabase
      .from("properties")
      .update(buildUpdatePayload(includeUpdatedAt))
      .eq("id", propertyId)
      .eq(ownerColumn, userId)
  }

  const updateWithOwnerId = await updateWithFallback("owner_id")

  if (!updateWithOwnerId.error) {
    return
  }

  if (!isMissingColumnError(updateWithOwnerId.error, "owner_id")) {
    throw new Error(updateWithOwnerId.error.message)
  }

  let updateWithUserId = await updateWithColumn("user_id", true)

  if (isMissingColumnError(updateWithUserId.error, "updated_at")) {
    updateWithUserId = await updateWithColumn("user_id", false)
  }

  if (updateWithUserId.error) {
    throw new Error(updateWithUserId.error.message)
  }
}

export const deleteProperty = async ({
  propertyId,
  userId,
}: {
  propertyId: string
  userId: string
}) => {
  const deleteWithOwnerId = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("owner_id", userId)

  if (!deleteWithOwnerId.error) {
    return
  }

  if (!deleteWithOwnerId.error.message.toLowerCase().includes("owner_id")) {
    throw new Error(deleteWithOwnerId.error.message)
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }
}
