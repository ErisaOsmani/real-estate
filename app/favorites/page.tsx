"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  getClientInquiries,
  getFavoriteProperties,
  Inquiry,
  Property,
  PropertyListingType,
  removeFavorite,
} from "@/lib/api"
import { getUserRole } from "@/lib/roles"

const listingTypeLabels: Record<PropertyListingType, string> = {
  sale: "For sale",
  rent: "For rent",
}

const inquiryStatusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  visit: "Visit scheduled",
  closed: "Closed",
}

const getListingType = (property: Property): PropertyListingType => {
  return property.listing_type === "rent" ? "rent" : "sale"
}

const formatPrice = (property: Property) => {
  if (property.price === undefined || property.price === null || property.price === "") {
    return "Price on request"
  }

  const price = Number(property.price)

  if (Number.isNaN(price)) {
    return `${property.price} EUR`
  }

  const suffix = getListingType(property) === "rent" ? " / muaj" : ""

  return `${new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price)}${suffix}`
}

export default function FavoritesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [actionId, setActionId] = useState("")
  const [error, setError] = useState("")
  const { user, loading } = useAuth()
  const router = useRouter()
  const userRole = getUserRole(user)

  const loadFavorites = useCallback(async () => {
    if (!user) {
      return
    }

    setLoadingFavorites(true)
    setError("")

    try {
      const [favoriteData, inquiryData] = await Promise.all([
        getFavoriteProperties(user.id),
        getClientInquiries(user.id),
      ])
      setProperties(favoriteData)
      setInquiries(inquiryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not load favorites.")
    } finally {
      setLoadingFavorites(false)
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

    if (userRole === "admin") {
      router.push("/admin")
      return
    }

    loadFavorites()
  }, [loadFavorites, loading, router, user, userRole])

  const handleRemove = async (propertyId: string) => {
    if (!user) {
      return
    }

    setActionId(propertyId)
    setError("")

    try {
      await removeFavorite({ userId: user.id, propertyId })
      setProperties((current) => current.filter((property) => property.id !== propertyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not remove the favorite.")
    } finally {
      setActionId("")
    }
  }

  if (loading || !user || userRole === "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/80">
          Checking sign-in...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="border-b border-white/10 pb-6">
          <Link href="/properties" className="text-sm text-amber-100 transition hover:text-amber-200">
            Back to properties
          </Link>
          <p className="mt-6 text-xs uppercase tracking-[0.32em] text-amber-200/80">
            Favorites
          </p>
          <h1 className="font-display mt-3 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
            Your saved properties.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
            Only active properties saved from the client list appear here.
          </p>
        </header>

        {loadingFavorites && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-sm text-white/62">
            Loading favorites...
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-sm text-rose-100">
            {error}
          </section>
        )}

        {!loadingFavorites && !error && properties.length === 0 && (
          <section className="rounded-3xl border border-dashed border-white/12 bg-white/[0.035] p-8">
            <p className="text-2xl text-white">You have no saved properties yet.</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              Open the property list and click `Save` on properties you like.
            </p>
          </section>
        )}

        {properties.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => {
              const listingType = getListingType(property)
              const location = [property.city, property.neighborhood].filter(Boolean).join(", ")

              return (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.055]"
                >
                  <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-slate-950/60">
                    {property.image_url ? (
                      <Image
                        src={property.image_url}
                        alt={property.title}
                        fill
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(16,185,129,0.12),rgba(15,23,42,0.9))]">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                          Property photo
                        </p>
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full border border-slate-950/20 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-950">
                      {listingTypeLabels[listingType]}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-white/45">{location || "Location is not set"}</p>
                    <h2 className="mt-2 line-clamp-2 text-2xl text-white">{property.title}</h2>
                    <p className="mt-4 text-2xl text-amber-100">{formatPrice(property)}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/58">
                      <span>{property.area ?? "-"} m2</span>
                      <span>{property.bedrooms ?? "-"} bedrooms</span>
                      <span>{property.property_type || "Property"}</span>
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="inline-flex justify-center rounded-full border border-white/12 bg-white/[0.06] px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(property.id)}
                        disabled={actionId === property.id}
                        className="rounded-full border border-rose-300/20 bg-rose-400/10 px-5 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/18 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">
            My inquiries
          </p>
          <h2 className="font-display mt-2 text-4xl text-white">
            Visit requests
          </h2>

          {!loadingFavorites && inquiries.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-6">
              <p className="text-lg text-white">You have not sent any inquiries yet.</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Open a property detail page and send a visit request.
              </p>
            </div>
          )}

          {inquiries.length > 0 && (
            <div className="mt-6 grid gap-3">
              {inquiries.map((inquiry) => (
                <article
                  key={inquiry.id}
                  className="rounded-2xl border border-white/8 bg-slate-950/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg text-white">
                        {inquiry.property?.title ?? "Property"}
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        {[inquiry.property?.city, inquiry.property?.neighborhood].filter(Boolean).join(", ") || "Location is not set"}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        {inquiry.message || "Visit request."}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                      {inquiryStatusLabels[String(inquiry.status)] ?? inquiry.status}
                    </span>
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
