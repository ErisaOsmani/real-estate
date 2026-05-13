"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { isAdminUser } from "@/lib/admin"
import {
  getAdminInquiries,
  getAdminProperties,
  Inquiry,
  InquiryStatus,
  Property,
  updateInquiryStatus,
} from "@/lib/api"
import { supabase } from "@/lib/supabase"

type StatusFilter = "all" | "active" | "draft" | "sold" | "rented"

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
]

const inquiryStatusOptions: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "visit", label: "Visit scheduled" },
  { value: "closed", label: "Closed" },
]

const inquiryStatusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  visit: "Visit scheduled",
  closed: "Closed",
}

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Properties", href: "/admin/properties" },
  { label: "Inquiries", href: "/admin#inquiries" },
  { label: "Profile", href: "/admin#profile" },
]

const statusLabels: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  sold: "Sold",
  rented: "Rented",
}

const listingTypeLabels: Record<string, string> = {
  sale: "For sale",
  rent: "For rent",
}

const getOwnerId = (property: Property) => property.owner_id ?? property.user_id ?? ""

const getPropertyStatus = (property: Property) => {
  return String(property.status ?? "draft").toLowerCase()
}

const getListingType = (property: Property) => {
  return String(property.listing_type ?? "").toLowerCase()
}

const formatPrice = (property: Property) => {
  if (property.price === undefined || property.price === null || property.price === "") {
    return "No price"
  }

  const numericPrice = Number(property.price)

  if (Number.isNaN(numericPrice)) {
    return `${property.price} EUR`
  }

  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error && error.message
    ? error.message
    : "We could not load the admin data."
}

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [loadingInquiries, setLoadingInquiries] = useState(true)
  const [inquiryActionId, setInquiryActionId] = useState("")
  const [error, setError] = useState("")
  const [inquiryError, setInquiryError] = useState("")
  const [inquirySuccess, setInquirySuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const canAccessAdmin = isAdminUser(user)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      router.push("/login")
      return
    }

    if (!canAccessAdmin) {
      router.push("/properties")
    }
  }, [authLoading, canAccessAdmin, router, user])

  useEffect(() => {
    const loadProperties = async () => {
      if (!user || !canAccessAdmin) {
        setLoadingProperties(false)
        return
      }

      setLoadingProperties(true)
      setError("")

      try {
        const data = await getAdminProperties(user.id)
        setProperties(data)
      } catch (err: unknown) {
        setError(getErrorMessage(err))
      } finally {
        setLoadingProperties(false)
      }
    }

    if (!authLoading) {
      loadProperties()
    }
  }, [authLoading, canAccessAdmin, user])

  useEffect(() => {
    const loadInquiries = async () => {
      if (!user || !canAccessAdmin) {
        setLoadingInquiries(false)
        return
      }

      setLoadingInquiries(true)
      setInquiryError("")

      try {
        const data = await getAdminInquiries(user.id)
        setInquiries(data)
      } catch (err: unknown) {
        setInquiryError(getErrorMessage(err))
      } finally {
        setLoadingInquiries(false)
      }
    }

    if (!authLoading) {
      loadInquiries()
    }
  }, [authLoading, canAccessAdmin, user])

  const handleInquiryStatusChange = async (inquiryId: string, status: InquiryStatus) => {
    setInquiryActionId(inquiryId)
    setInquiryError("")
    setInquirySuccess("")

    try {
      await updateInquiryStatus({ inquiryId, status })
      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry.id === inquiryId ? { ...inquiry, status } : inquiry
        )
      )
      setInquirySuccess("Inquiry status was updated.")
    } catch (err: unknown) {
      setInquiryError(getErrorMessage(err))
    } finally {
      setInquiryActionId("")
    }
  }

  const filteredProperties = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return properties.filter((property) => {
      const haystack = [
        property.title,
        property.description,
        property.city,
        property.neighborhood,
        property.property_type,
        getOwnerId(property),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesTerm = !normalizedTerm || haystack.includes(normalizedTerm)
      const matchesStatus =
        statusFilter === "all" || getPropertyStatus(property) === statusFilter

      return matchesTerm && matchesStatus
    })
  }, [properties, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const activeCount = properties.filter((property) => getPropertyStatus(property) === "active").length
    const draftCount = properties.filter((property) => getPropertyStatus(property) === "draft").length
    const saleCount = properties.filter((property) => getListingType(property) === "sale").length
    const rentCount = properties.filter((property) => getListingType(property) === "rent").length

    return [
      { label: "Total properties", value: properties.length },
      { label: "Active properties", value: activeCount },
      { label: "For sale", value: saleCount },
      { label: "For rent", value: rentCount },
      { label: "Drafts", value: draftCount },
    ]
  }, [properties])

  if (authLoading || !user) {
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
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center">
          <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-100/70">
              Qasje e kufizuar
            </p>
            <h1 className="font-display mt-4 text-5xl text-white">
              This page is only for admins.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/62">
              Redirecting you to the client property list.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/properties")}
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Go to properties
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/login")
                }}
                className="rounded-full border border-white/12 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
              >
                Log out
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-emerald-200/80">
                ADMIN / OWNER
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Property dashboard.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
                Review your portfolio, check listing statuses, and quickly find properties that need attention.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/properties"
                className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Client view
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/login")
                }}
                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Log out
              </button>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {adminNav.map((item) => {
              const active = pathname === item.href

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-emerald-200/45 bg-emerald-200 text-slate-950"
                      : "border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.1]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.06] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                {item.label}
              </p>
              <p className="mt-3 text-4xl text-white">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_18rem]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/42 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                  Admin properties
                </p>
                <h2 className="font-display mt-2 text-4xl text-white">
                  Listing management
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_13rem] lg:w-[34rem]">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search title, city, or neighborhood..."
                  className="w-full rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-sm text-white focus:outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingProperties && (
              <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.045] p-5 text-sm text-white/55">
                Loading properties...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">
                {error}
              </div>
            )}

            {!loadingProperties && !error && filteredProperties.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-6">
                <p className="text-lg text-white">No properties match this filter.</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  When an admin adds properties in Supabase, they appear here with status, listing type, and metrics.
                </p>
              </div>
            )}

            {filteredProperties.length > 0 && (
              <div className="mt-6 grid gap-3">
                {filteredProperties.map((property) => {
                  const status = getPropertyStatus(property)
                  const listingType = getListingType(property)
                  const location = [property.city, property.neighborhood].filter(Boolean).join(", ")

                  return (
                    <article
                      key={property.id}
                      className="grid gap-4 rounded-2xl border border-white/8 bg-black/15 p-4 sm:grid-cols-[7rem_1fr] lg:grid-cols-[7rem_1fr_auto]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/8 bg-slate-950/60">
                        {property.image_url ? (
                          <Image
                            src={property.image_url}
                            alt={property.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center bg-white/[0.04] text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                            No photo
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-2 text-base font-semibold text-white">
                          {property.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/55">
                          {location || property.property_type || "No location"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                            {listingTypeLabels[listingType] ?? "No type"}
                          </span>
                          <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                            {statusLabels[status] ?? status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3 lg:min-w-[9rem] lg:justify-end">
                        <p className="text-sm font-semibold text-amber-100">
                          {formatPrice(property)}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <aside className="grid gap-4">
            <section id="inquiries" className="rounded-2xl border border-white/8 bg-white/[0.055] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Inquiries</p>
              <h3 className="mt-3 text-2xl text-white">{inquiries.length} requests</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Visit requests for your properties.
              </p>
            </section>

            <section id="profile" className="rounded-2xl border border-white/8 bg-white/[0.055] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Profile</p>
              <h3 className="mt-3 text-2xl text-white">Active admin</h3>
              <p className="mt-2 truncate text-sm text-white/55">{user.email}</p>
            </section>
          </aside>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                Inquiries
              </p>
              <h2 className="font-display mt-2 text-4xl text-white">
                Client contacts
              </h2>
            </div>
            <p className="text-sm text-white/52">{inquiries.length} total</p>
          </div>

          {loadingInquiries && (
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.045] p-5 text-sm text-white/55">
              Loading inquiries...
            </div>
          )}

          {inquiryError && (
            <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">
              {inquiryError}
            </div>
          )}

          {inquirySuccess && (
            <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">
              {inquirySuccess}
            </div>
          )}

          {!loadingInquiries && !inquiryError && inquiries.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-6">
              <p className="text-lg text-white">There are no inquiries yet.</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                When clients send visit requests, they appear here.
              </p>
            </div>
          )}

          {inquiries.length > 0 && (
            <div className="mt-6 grid gap-4">
              {inquiries.map((inquiry) => (
                <article
                  key={inquiry.id}
                  className="rounded-2xl border border-white/8 bg-slate-950/35 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_14rem] lg:items-start">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                          {inquiryStatusLabels[String(inquiry.status)] ?? inquiry.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/62">
                          {inquiry.property?.title ?? "Property"}
                        </span>
                      </div>
                      <p className="mt-3 text-lg text-white">{inquiry.full_name}</p>
                      <p className="mt-1 text-sm text-white/55">
                        {inquiry.email} {inquiry.phone ? `· ${inquiry.phone}` : ""}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/68">
                        {inquiry.message || "Visit request."}
                      </p>
                    </div>

                    <label className="grid gap-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/42">
                        Status
                      </span>
                      <select
                        value={String(inquiry.status)}
                        onChange={(event) =>
                          handleInquiryStatusChange(
                            inquiry.id,
                            event.target.value as InquiryStatus
                          )
                        }
                        disabled={inquiryActionId === inquiry.id}
                        className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none disabled:opacity-60"
                      >
                        {inquiryStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
