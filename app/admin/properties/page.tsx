"use client"

import Image from "next/image"
import Link from "next/link"
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { isAdminUser } from "@/lib/admin"
import {
  AdminMarketingPackage,
  createProperty,
  deleteProperty,
  generateAdminMarketingPackage,
  getAdminProperties,
  Property,
  PropertyListingType,
  PropertyPayload,
  PropertyStatus,
  updateProperty,
  updatePropertyStatus,
} from "@/lib/api"

type FormState = {
  title: string
  listing_type: PropertyListingType
  property_type: string
  city: string
  neighborhood: string
  price: string
  area: string
  bedrooms: string
  bathrooms: string
  description: string
  status: PropertyStatus
  image_url: string
}

const emptyForm: FormState = {
  title: "",
  listing_type: "sale",
  property_type: "",
  city: "",
  neighborhood: "",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  description: "",
  status: "draft",
  image_url: "",
}

const propertyTypes = ["Apartment", "House", "Penthouse", "Retail", "Land", "Office"]

const statusOptions: { value: PropertyStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
]

const statusLabels: Record<PropertyStatus, string> = {
  draft: "Draft",
  active: "Active",
  sold: "Sold",
  rented: "Rented",
}

const listingTypeLabels: Record<PropertyListingType, string> = {
  sale: "For sale",
  rent: "For rent",
}

const formatDisplayText = (value?: string | null) => {
  const text = String(value ?? "").trim()

  if (!text) {
    return ""
  }

  const normalizedText = text.toLocaleLowerCase("sq-AL")

  if (normalizedText === "apartment") {
    return "Apartment"
  }

  if (normalizedText === "house") {
    return "House"
  }

  return text
    .split(" ")
    .map((word) => {
      if (!word) {
        return word
      }

      return `${word.charAt(0).toLocaleUpperCase("sq-AL")}${word.slice(1).toLocaleLowerCase("sq-AL")}`
    })
    .join(" ")
}

const formatLocation = (property: Property) => {
  return [formatDisplayText(property.city), formatDisplayText(property.neighborhood)]
    .filter(Boolean)
    .join(", ")
}

const getOwnerId = (property: Property) => property.owner_id ?? property.user_id ?? ""

const getPropertyStatus = (property: Property): PropertyStatus => {
  const status = String(property.status ?? "draft").toLowerCase()

  if (status === "active" || status === "sold" || status === "rented") {
    return status
  }

  return "draft"
}

const getListingType = (property: Property): PropertyListingType => {
  return property.listing_type === "rent" ? "rent" : "sale"
}

const toInputValue = (value: unknown) => {
  if (value === undefined || value === null) {
    return ""
  }

  return String(value)
}

const propertyToForm = (property: Property): FormState => ({
  title: property.title ?? "",
  listing_type: getListingType(property),
  property_type: property.property_type ?? "",
  city: property.city ?? "",
  neighborhood: property.neighborhood ?? "",
  price: toInputValue(property.price),
  area: toInputValue(property.area),
  bedrooms: toInputValue(property.bedrooms),
  bathrooms: toInputValue(property.bathrooms),
  description: property.description ?? "",
  status: getPropertyStatus(property),
  image_url: property.image_url ?? "",
})

const formatPrice = (property: Property) => {
  if (property.price === undefined || property.price === null || property.price === "") {
    return "No price"
  }

  const price = Number(property.price)

  if (Number.isNaN(price)) {
    return `${property.price} EUR`
  }

  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price)
}

const validateForm = (form: FormState) => {
  if (!form.title.trim()) {
    return "Enter the property title."
  }

  if (!form.property_type.trim()) {
    return "Choose or enter the property type."
  }

  if (!form.city.trim()) {
    return "Enter the city."
  }

  if (!form.price || Number(form.price) <= 0) {
    return "Price must be greater than 0."
  }

  if (!form.area || Number(form.area) <= 0) {
    return "Area must be greater than 0."
  }

  if (form.bedrooms === "" || Number(form.bedrooms) < 0) {
    return "Enter the number of bedrooms."
  }

  if (form.bathrooms === "" || Number(form.bathrooms) < 0) {
    return "Enter the number of bathrooms."
  }

  if (!form.description.trim()) {
    return "Enter the property description."
  }

  return ""
}

const buildPayload = (form: FormState): PropertyPayload => ({
  title: form.title.trim(),
  listing_type: form.listing_type,
  property_type: form.property_type.trim(),
  city: form.city.trim(),
  neighborhood: form.neighborhood.trim(),
  price: Number(form.price),
  area: Number(form.area),
  bedrooms: Number(form.bedrooms),
  bathrooms: Number(form.bathrooms),
  description: form.description.trim(),
  status: form.status,
  image_url: form.image_url.trim() || null,
})

const getLocalMissingFields = (form: FormState) => {
  const missingFields: string[] = []

  if (!form.price || Number(form.price) <= 0) {
    missingFields.push("price")
  }

  if (!form.city.trim() && !form.neighborhood.trim()) {
    missingFields.push("location")
  }

  if (!form.area || Number(form.area) <= 0) {
    missingFields.push("area")
  }

  if (form.bedrooms === "" || Number(form.bedrooms) <= 0) {
    missingFields.push("bedrooms")
  }

  if (!form.image_url.trim()) {
    missingFields.push("photo")
  }

  return missingFields
}

const buildMarketingInput = (form: FormState): PropertyPayload & { image_url?: string | null } => ({
  title: form.title.trim(),
  listing_type: form.listing_type,
  property_type: form.property_type.trim(),
  city: form.city.trim(),
  neighborhood: form.neighborhood.trim(),
  price: Number(form.price) || 0,
  area: Number(form.area) || 0,
  bedrooms: Number(form.bedrooms) || 0,
  bathrooms: Number(form.bathrooms) || 0,
  description: form.description.trim(),
  status: form.status,
  image_url: form.image_url.trim() || null,
})

const buildMarketingText = (marketingPackage: AdminMarketingPackage, form: FormState) => {
  return [
    "REAL ESTATE AI - Paketa Marketing",
    "",
    `Titulli: ${marketingPackage.title}`,
    "",
    "Description:",
    marketingPackage.description,
    "",
    "Instagram/Facebook:",
    marketingPackage.socialPost,
    "",
    "Short portal version:",
    marketingPackage.portalShort,
    "",
    "Missing-fields check:",
    marketingPackage.missingFields.length ? marketingPackage.missingFields.join(", ") : "No key missing fields.",
    "",
    "Base data:",
    `Listing: ${form.listing_type === "rent" ? "For rent" : "For sale"}`,
    `Type: ${form.property_type || "-"}`,
    `Location: ${[form.city, form.neighborhood].filter(Boolean).join(", ") || "-"}`,
    `Price: ${form.price || "-"} EUR`,
    `Area: ${form.area || "-"} m2`,
    `Bedrooms: ${form.bedrooms || "-"}`,
    `Bathrooms: ${form.bathrooms || "-"}`,
    `Photo: ${form.image_url ? "yes" : "missing"}`,
  ].join("\n")
}

export default function AdminPropertiesPage() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [properties, setProperties] = useState<Property[]>([])
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [actionId, setActionId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [marketingPackage, setMarketingPackage] = useState<AdminMarketingPackage | null>(null)

  const { user, loading } = useAuth()
  const router = useRouter()
  const canAccessAdmin = isAdminUser(user)

  const loadProperties = useCallback(async () => {
    if (!user) {
      return
    }

    setLoadingProperties(true)
    setError("")

    try {
      const data = await getAdminProperties(user.id)
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not load the properties.")
    } finally {
      setLoadingProperties(false)
    }
  }, [user])

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      router.push("/login")
      return
    }

    if (!canAccessAdmin) {
      router.push("/properties")
      return
    }

    loadProperties()
  }, [canAccessAdmin, loadProperties, loading, router, user])

  const filteredProperties = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return properties.filter((property) => {
      if (!normalizedTerm) {
        return true
      }

      return [
        property.title,
        property.city,
        property.neighborhood,
        property.property_type,
        property.description,
        getOwnerId(property),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedTerm)
    })
  }, [properties, searchTerm])

  const updateFormField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.")
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image_url: String(reader.result ?? ""),
      }))
      setError("")
    }

    reader.onerror = () => {
      setError("The photo could not be read. Try another photo.")
    }

    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingProperty(null)
    setMarketingPackage(null)
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user) {
      return
    }

    const validationMessage = validateForm(form)

    if (validationMessage) {
      setError(validationMessage)
      setSuccess("")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const payload = buildPayload(form)

      if (editingProperty) {
        await updateProperty({
          propertyId: editingProperty.id,
          userId: user.id,
          property: payload,
        })
        setSuccess("Property updated successfully.")
      } else {
        await createProperty({
          userId: user.id,
          property: payload,
        })
        setSuccess("Property created successfully.")
      }

      setForm(emptyForm)
      setEditingProperty(null)
      setMarketingPackage(null)
      await loadProperties()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving the property failed.")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setForm(propertyToForm(property))
    setMarketingPackage(null)
    setError("")
    setSuccess("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleImproveWithAi = async () => {
    setAiLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await generateAdminMarketingPackage(buildMarketingInput(form))
      const missingFields = Array.from(
        new Set([...getLocalMissingFields(form), ...result.missingFields])
      )

      setMarketingPackage({
        ...result,
        missingFields,
      })
      setSuccess("AI created the marketing package. Review it and apply it when it is ready.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed.")
    } finally {
      setAiLoading(false)
    }
  }

  const handleApplyAiToForm = () => {
    if (!marketingPackage) {
      return
    }

    setForm((current) => ({
      ...current,
      title: marketingPackage.title,
      description: marketingPackage.description,
    }))
    setSuccess("The AI title and description were applied to the form.")
  }

  const handleSaveAiToProperty = async () => {
    if (!user || !editingProperty || !marketingPackage) {
      setError("Choose a property with Edit before saving the AI result.")
      return
    }

    const nextForm = {
      ...form,
      title: marketingPackage.title,
      description: marketingPackage.description,
    }
    const validationMessage = validateForm(nextForm)

    if (validationMessage) {
      setError(validationMessage)
      setSuccess("")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await updateProperty({
        propertyId: editingProperty.id,
        userId: user.id,
        property: buildPayload(nextForm),
      })
      setForm(nextForm)
      setSuccess("The final AI result was saved to the property.")
      await loadProperties()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving the AI result failed.")
    } finally {
      setSaving(false)
    }
  }

  const handleExportMarketingPackage = () => {
    if (!marketingPackage) {
      return
    }

    const blob = new Blob([buildMarketingText(marketingPackage, form)], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `${(marketingPackage.title || "paketa-marketing")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (property: Property) => {
    if (!user) {
      return
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${property.title}"?`)

    if (!confirmed) {
      return
    }

    setActionId(property.id)
    setError("")
    setSuccess("")

    try {
      await deleteProperty({ propertyId: property.id, userId: user.id })
      setSuccess("Property deleted successfully.")
      if (editingProperty?.id === property.id) {
        resetForm()
      }
      await loadProperties()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deleting the property failed.")
    } finally {
      setActionId("")
    }
  }

  const handleStatusToggle = async (property: Property) => {
    if (!user) {
      return
    }

    const nextStatus: PropertyStatus = getPropertyStatus(property) === "active" ? "draft" : "active"

    setActionId(property.id)
    setError("")
    setSuccess("")

    try {
      await updatePropertyStatus({
        propertyId: property.id,
        userId: user.id,
        status: nextStatus,
      })
      setSuccess(nextStatus === "active" ? "Property was published." : "Property was moved back to draft.")
      await loadProperties()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Changing the status failed.")
    } finally {
      setActionId("")
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/80">
          Checking admin access...
        </div>
      </main>
    )
  }

  if (!canAccessAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-xl rounded-3xl border border-rose-300/20 bg-rose-400/10 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-100/70">
            Qasje e kufizuar
          </p>
          <h1 className="font-display mt-4 text-4xl text-white">
            Only admins can manage properties.
          </h1>
          <Link
            href="/properties"
            className="mt-6 inline-flex rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            Go to properties
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-emerald-200/80">
                ADMIN / OWNER
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Property registration and management.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
                Add real properties, edit details, change status, and publish only listings that are ready.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Admin dashboard
              </Link>
              <Link
                href="/properties"
                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Client view
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <form
            onSubmit={handleSubmit}
            className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.065] p-5 sm:p-6 [&_input]:min-w-0 [&_select]:min-w-0 [&_textarea]:min-w-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  {editingProperty ? "Editing" : "Add property"}
                </p>
                <h2 className="mt-2 text-3xl text-white">
                  {editingProperty ? "Update property" : "New property"}
                </h2>
              </div>
              {editingProperty && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Title</span>
                <input
                  value={form.title}
                  onChange={(event) => updateFormField("title", event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                  placeholder="Modern apartment in Prishtina"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Listing</span>
                  <select
                    value={form.listing_type}
                    onChange={(event) => updateFormField("listing_type", event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="sale">For sale</option>
                    <option value="rent">For rent</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => updateFormField("status", event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Property type</span>
                <input
                  value={form.property_type}
                  onChange={(event) => updateFormField("property_type", event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                  placeholder="Choose or enter the type"
                  list="property-types"
                />
                <datalist id="property-types">
                  {propertyTypes.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">City</span>
                  <input
                    value={form.city}
                    onChange={(event) => updateFormField("city", event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="Prishtina"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Neighborhood</span>
                  <input
                    value={form.neighborhood}
                    onChange={(event) => updateFormField("neighborhood", event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="Bregu i Diellit"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Price</span>
                  <input
                    value={form.price}
                    onChange={(event) => updateFormField("price", event.target.value)}
                    type="number"
                    min="0"
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="120000"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Area</span>
                  <input
                    value={form.area}
                    onChange={(event) => updateFormField("area", event.target.value)}
                    type="number"
                    min="0"
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="86"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Bedrooms</span>
                  <input
                    value={form.bedrooms}
                    onChange={(event) => updateFormField("bedrooms", event.target.value)}
                    type="number"
                    min="0"
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="3"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Bathrooms</span>
                  <input
                    value={form.bathrooms}
                    onChange={(event) => updateFormField("bathrooms", event.target.value)}
                    type="number"
                    min="0"
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="1"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateFormField("description", event.target.value)}
                  rows={5}
                  className="resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35"
                  placeholder="Describe the location, condition, orientation, and advantages..."
                />
              </label>

              <section className="grid min-w-0 gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="grid min-w-0 gap-3">
                  <label className="grid min-w-0 gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">Photo</span>
                    <input
                      value={form.image_url}
                      onChange={(event) => updateFormField("image_url", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                      placeholder="Photo URL or upload from device"
                    />
                  </label>
                  <label className="relative inline-flex min-h-11 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.11] sm:w-fit">
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </label>
                </div>

                {form.image_url ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                    <Image
                      src={form.image_url}
                      alt="Property photo preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid aspect-[16/10] place-items-center rounded-2xl border border-dashed border-white/12 bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-white/38">
                    No photo
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/60">
                      AI for admin
                    </p>
                    <h3 className="mt-2 text-xl text-white">Listing package</h3>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      Generates a title, description, social post, portal version, and missing-fields check.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleImproveWithAi}
                    disabled={aiLoading}
                    className="w-full shrink-0 rounded-full bg-emerald-200 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {aiLoading ? "Generating..." : "Improve with AI"}
                  </button>
                </div>

                {marketingPackage && (
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/42">Professional title</p>
                      <p className="mt-2 text-lg text-white">{marketingPackage.title}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/42">Description</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/72">
                        {marketingPackage.description}
                      </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/42">Instagram/Facebook</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/72">
                          {marketingPackage.socialPost}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/42">Portal</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/72">
                          {marketingPackage.portalShort}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-amber-100/65">Missing-fields check</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {marketingPackage.missingFields.length > 0 ? (
                          marketingPackage.missingFields.map((field) => (
                            <span
                              key={field}
                              className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs text-amber-100"
                            >
                              {field}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-white/65">No key missing fields.</span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={handleApplyAiToForm}
                        className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.11]"
                      >
                        Apply to form
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAiToProperty}
                        disabled={!editingProperty || saving}
                        className="rounded-full border border-emerald-300/20 bg-emerald-300/12 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save to property
                      </button>
                      <button
                        type="button"
                        onClick={handleExportMarketingPackage}
                        className="rounded-full border border-amber-300/20 bg-amber-300/12 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-300/20"
                      >
                        Export .txt
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {error && (
              <p className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            {success && (
              <p className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingProperty ? "Save changes" : "Create property"}
            </button>
          </form>

          <section className="rounded-3xl border border-white/10 bg-slate-950/42 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                  My properties
                </p>
                <h2 className="font-display mt-2 text-4xl text-white">
                  Management list
                </h2>
              </div>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search property..."
                className="w-full rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none lg:max-w-xs"
              />
            </div>

            {loadingProperties && (
              <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.045] p-5 text-sm text-white/55">
                Loading properties...
              </div>
            )}

            {!loadingProperties && filteredProperties.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-6">
                <p className="text-lg text-white">No properties yet.</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Fill out the form and save the first property for the demo.
                </p>
              </div>
            )}

            {filteredProperties.length > 0 && (
              <div className="mt-6 grid gap-4">
                {filteredProperties.map((property) => {
                  const status = getPropertyStatus(property)
                  const listingType = getListingType(property)
                  const location = formatLocation(property)
                  const propertyType = formatDisplayText(property.property_type) || "Property"
                  const busy = actionId === property.id

                  return (
                    <article
                      key={property.id}
                      className="rounded-2xl border border-white/8 bg-white/[0.055] p-4 transition hover:bg-white/[0.075]"
                    >
                      <div className="grid gap-4 xl:grid-cols-[9rem_minmax(0,1fr)_12rem] xl:items-start">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/8 bg-slate-950/60">
                          {property.image_url ? (
                            <Image
                              src={property.image_url}
                              alt={property.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center bg-white/[0.04] text-[0.65rem] uppercase tracking-[0.2em] text-white/35">
                              No photo
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 [&>p:nth-of-type(4)]:hidden">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                              {listingTypeLabels[listingType]}
                            </span>
                            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                              {statusLabels[status]}
                            </span>
                          </div>
                          <h3 className="mt-3 line-clamp-2 text-2xl leading-tight text-white">{property.title}</h3>
                          <p className="mt-2 text-sm text-white/55">
                            {location || "Pa lokacion"} · {propertyType}
                          </p>
                          <p className="mt-3 text-xl font-semibold text-amber-100">
                            {formatPrice(property)}
                          </p>
                          <div className="mt-4 grid gap-2 text-sm text-white/64 sm:grid-cols-3">
                            <span className="rounded-xl border border-white/8 bg-slate-950/35 px-3 py-2">
                              {property.area ?? "-"} m2
                            </span>
                            <span className="rounded-xl border border-white/8 bg-slate-950/35 px-3 py-2">
                              {property.bedrooms ?? "-"} dhoma
                            </span>
                            <span className="rounded-xl border border-white/8 bg-slate-950/35 px-3 py-2">
                              {property.bathrooms ?? "-"} banjo
                            </span>
                          </div>
                          <p className="hidden">
                            {location || "Pa lokacion"} · {property.property_type || "Pa tip"} · {formatPrice(property)}
                          </p>
                          <p className="mt-2 text-sm text-white/55">
                            {property.area ?? "-"} m2 · {property.bedrooms ?? "-"} dhoma · {property.bathrooms ?? "-"} banjo
                          </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(property)}
                            disabled={busy}
                            className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.11] disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(property)}
                            disabled={busy}
                            className="rounded-full border border-emerald-300/20 bg-emerald-300/12 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/20 disabled:opacity-60"
                          >
                            {status === "active" ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(property)}
                            disabled={busy}
                            className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-400/18 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}
