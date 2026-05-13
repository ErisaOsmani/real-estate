"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  addFavorite,
  ClientAiRecommendation,
  ClientProfile,
  generateClientRecommendations,
  getActiveProperties,
  getFavoritePropertyIds,
  Property,
  PropertyListingType,
  removeFavorite,
} from "@/lib/api"
import { getUserRole } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

type ListingTypeFilter = "all" | "sale" | "rent"
type SortOption = "newest" | "price_low" | "price_high" | "area_high"

const listingTypes: { value: ListingTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sale", label: "For sale" },
  { value: "rent", label: "For rent" },
]

const listingTypeLabels: Record<PropertyListingType, string> = {
  sale: "For sale",
  rent: "For rent",
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Lowest price" },
  { value: "price_high", label: "Highest price" },
  { value: "area_high", label: "Largest area" },
]

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [favoriteActionId, setFavoriteActionId] = useState("")
  const [error, setError] = useState("")
  const [listingType, setListingType] = useState<ListingTypeFilter>("all")
  const [cityFilter, setCityFilter] = useState("")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minBedrooms, setMinBedrooms] = useState("")
  const [minArea, setMinArea] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [searchTerm, setSearchTerm] = useState("")
  const [draftListingType, setDraftListingType] = useState<ListingTypeFilter>("all")
  const [draftCityFilter, setDraftCityFilter] = useState("")
  const [draftPropertyTypeFilter, setDraftPropertyTypeFilter] = useState("")
  const [draftMinPrice, setDraftMinPrice] = useState("")
  const [draftMaxPrice, setDraftMaxPrice] = useState("")
  const [draftMinBedrooms, setDraftMinBedrooms] = useState("")
  const [draftMinArea, setDraftMinArea] = useState("")
  const [draftSortBy, setDraftSortBy] = useState<SortOption>("newest")
  const [draftSearchTerm, setDraftSearchTerm] = useState("")
  const [aiQuery, setAiQuery] = useState("I want an apartment for rent in Prishtina up to 500 EUR")
  const [aiProfile, setAiProfile] = useState<ClientProfile>("family")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<ClientAiRecommendation | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const userRole = getUserRole(user)

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      router.replace("/login")
      return
    }

    if (userRole === "admin") {
      router.replace("/admin")
    }
  }, [loading, router, user, userRole])

  useEffect(() => {
    const loadProperties = async () => {
      if (!user || userRole === "admin") {
        setLoadingProperties(false)
        return
      }

      setLoadingProperties(true)
      setError("")

      try {
        const [propertyData, favoriteData] = await Promise.all([
          getActiveProperties(),
          getFavoritePropertyIds(user.id),
        ])
        setProperties(propertyData)
        setFavoriteIds(favoriteData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not load the properties.")
      } finally {
        setLoadingProperties(false)
      }
    }

    if (!loading) {
      loadProperties()
    }
  }, [loading, user, userRole])

  const filteredProperties = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()
    const normalizedCity = cityFilter.trim().toLowerCase()
    const normalizedType = propertyTypeFilter.trim().toLowerCase()
    const minPriceNumber = Number(minPrice)
    const maxPriceNumber = Number(maxPrice)
    const minBedroomsNumber = Number(minBedrooms)
    const minAreaNumber = Number(minArea)

    return [...properties]
      .filter((property) => {
        const propertyListingType = getListingType(property)
        const price = Number(property.price)
        const area = Number(property.area)
        const bedrooms = Number(property.bedrooms)
        const searchableText = [
          property.title,
          property.city,
          property.neighborhood,
          property.property_type,
          property.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        const matchesListingType =
          listingType === "all" || propertyListingType === listingType
        const matchesTerm = !normalizedTerm || searchableText.includes(normalizedTerm)
        const matchesCity =
          !normalizedCity || String(property.city ?? "").toLowerCase().includes(normalizedCity)
        const matchesPropertyType =
          !normalizedType ||
          String(property.property_type ?? "").toLowerCase().includes(normalizedType)
        const matchesMinPrice =
          !minPrice || (!Number.isNaN(price) && price >= minPriceNumber)
        const matchesMaxPrice =
          !maxPrice || (!Number.isNaN(price) && price <= maxPriceNumber)
        const matchesBedrooms =
          !minBedrooms || (!Number.isNaN(bedrooms) && bedrooms >= minBedroomsNumber)
        const matchesArea = !minArea || (!Number.isNaN(area) && area >= minAreaNumber)

        return (
          matchesListingType &&
          matchesTerm &&
          matchesCity &&
          matchesPropertyType &&
          matchesMinPrice &&
          matchesMaxPrice &&
          matchesBedrooms &&
          matchesArea
        )
      })
      .sort((first, second) => {
        const firstPrice = Number(first.price) || 0
        const secondPrice = Number(second.price) || 0
        const firstArea = Number(first.area) || 0
        const secondArea = Number(second.area) || 0
        const firstDate = new Date(first.created_at ?? "").getTime() || 0
        const secondDate = new Date(second.created_at ?? "").getTime() || 0

        if (sortBy === "price_low") {
          return firstPrice - secondPrice
        }

        if (sortBy === "price_high") {
          return secondPrice - firstPrice
        }

        if (sortBy === "area_high") {
          return secondArea - firstArea
        }

        return secondDate - firstDate
      })
  }, [
    cityFilter,
    listingType,
    maxPrice,
    minArea,
    minBedrooms,
    minPrice,
    properties,
    propertyTypeFilter,
    searchTerm,
    sortBy,
  ])

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      return
    }

    setFavoriteActionId(propertyId)
    setError("")

    try {
      if (favoriteSet.has(propertyId)) {
        await removeFavorite({ userId: user.id, propertyId })
        setFavoriteIds((current) => current.filter((id) => id !== propertyId))
      } else {
        await addFavorite({ userId: user.id, propertyId })
        setFavoriteIds((current) => [...current, propertyId])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not update the favorite.")
    } finally {
      setFavoriteActionId("")
    }
  }

  const resetFilters = () => {
    setListingType("all")
    setCityFilter("")
    setPropertyTypeFilter("")
    setMinPrice("")
    setMaxPrice("")
    setMinBedrooms("")
    setMinArea("")
    setSortBy("newest")
    setSearchTerm("")
    setDraftListingType("all")
    setDraftCityFilter("")
    setDraftPropertyTypeFilter("")
    setDraftMinPrice("")
    setDraftMaxPrice("")
    setDraftMinBedrooms("")
    setDraftMinArea("")
    setDraftSortBy("newest")
    setDraftSearchTerm("")
  }

  const applySearchFilters = () => {
    setListingType(draftListingType)
    setCityFilter(draftCityFilter)
    setPropertyTypeFilter(draftPropertyTypeFilter)
    setMinPrice(draftMinPrice)
    setMaxPrice(draftMaxPrice)
    setMinBedrooms(draftMinBedrooms)
    setMinArea(draftMinArea)
    setSortBy(draftSortBy)
    setSearchTerm(draftSearchTerm)
  }

  const recommendedProperties = useMemo(() => {
    if (!aiResult) {
      return []
    }

    const propertyMap = new Map(properties.map((property) => [property.id, property]))

    return aiResult.recommendedIds
      .map((propertyId) => propertyMap.get(propertyId))
      .filter((property): property is Property => Boolean(property))
  }, [aiResult, properties])

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      setError("Write your AI request, for example: apartment for rent in Prishtina up to 500 EUR.")
      return
    }

    if (properties.length === 0) {
      setError("There are no active properties for AI to analyze.")
      return
    }

    setAiLoading(true)
    setAiResult(null)
    setError("")

    try {
      const result = await generateClientRecommendations({
        query: aiQuery,
        profile: aiProfile,
        properties: filteredProperties.length > 0 ? filteredProperties : properties,
      })
      setAiResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI could not provide a recommendation.")
    } finally {
      setAiLoading(false)
    }
  }

  if (loading || !user || userRole === "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/80">
          Opening client area...
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
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-amber-200/80">
                CLIENT / RESIDENT
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Active properties for sale and rent.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
                Browse listings published by owners and agencies. Search by city, neighborhood, type, or title.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/favorites"
                className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Favorites
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
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="grid gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                Search properties
              </span>
              <input
                value={draftSearchTerm}
                onChange={(event) => setDraftSearchTerm(event.target.value)}
                placeholder="City, neighborhood, property type, or title..."
                className="w-full rounded-full border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {listingTypes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraftListingType(option.value)}
                  className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    draftListingType === option.value
                      ? "border-amber-200/40 bg-amber-300 text-slate-950"
                      : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input
              value={draftCityFilter}
              onChange={(event) => setDraftCityFilter(event.target.value)}
              placeholder="City"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <input
              value={draftPropertyTypeFilter}
              onChange={(event) => setDraftPropertyTypeFilter(event.target.value)}
              placeholder="Property type"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <input
              value={draftMinPrice}
              onChange={(event) => setDraftMinPrice(event.target.value)}
              type="number"
              min="0"
              placeholder="Min price"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <input
              value={draftMaxPrice}
              onChange={(event) => setDraftMaxPrice(event.target.value)}
              type="number"
              min="0"
              placeholder="Max price"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <input
              value={draftMinBedrooms}
              onChange={(event) => setDraftMinBedrooms(event.target.value)}
              type="number"
              min="0"
              placeholder="Bedrooms"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <input
              value={draftMinArea}
              onChange={(event) => setDraftMinArea(event.target.value)}
              type="number"
              min="0"
              placeholder="Min area"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <select
              value={draftSortBy}
              onChange={(event) => setDraftSortBy(event.target.value as SortOption)}
              className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={applySearchFilters}
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Search
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/[0.1]"
              >
                Clear filters
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm text-white/55">
            Showing {filteredProperties.length} of {properties.length} active properties.
          </p>
        </section>

        <section className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_16rem] lg:items-end">
            <label className="grid gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-100/65">
                AI search for clients
              </span>
              <textarea
                value={aiQuery}
                onChange={(event) => setAiQuery(event.target.value)}
                rows={3}
                placeholder="I want an apartment for rent in Prishtina up to 500 EUR..."
                className="resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm leading-6 text-white placeholder:text-white/35 focus:outline-none"
              />
            </label>

            <div className="grid gap-3">
              <select
                value={aiProfile}
                onChange={(event) => setAiProfile(event.target.value as ClientProfile)}
                className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none"
              >
                <option value="family">Family</option>
                <option value="student">Student</option>
                <option value="investor">Investor</option>
              </select>
              <button
                type="button"
                onClick={handleAiSearch}
                disabled={aiLoading}
                className="rounded-full bg-emerald-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiLoading ? "Analyzing..." : "Ask AI"}
              </button>
            </div>
          </div>

          {aiResult && (
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">Answer</p>
                <p className="mt-3 text-sm leading-7 text-white/72">{aiResult.summary}</p>
              </div>

              {recommendedProperties.length > 0 && (
                <div className="grid gap-3 md:grid-cols-3">
                  {recommendedProperties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:bg-white/[0.09]"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/60">Suggestion</p>
                      <h3 className="mt-2 line-clamp-2 text-lg text-white">{property.title}</h3>
                      <p className="mt-2 text-sm text-amber-100">{formatPrice(property)}</p>
                      <p className="mt-1 text-sm text-white/50">
                        {[property.city, property.neighborhood].filter(Boolean).join(", ") || "No location"}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">Comparison</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/72">
                  {aiResult.comparison}
                </p>
              </div>

              {aiResult.prosCons.length > 0 && (
                <div className="grid gap-3 lg:grid-cols-3">
                  {aiResult.prosCons.map((item) => {
                    const property = properties.find((candidate) => candidate.id === item.propertyId)

                    return (
                      <div
                        key={item.propertyId}
                        className="rounded-2xl border border-white/10 bg-slate-950/45 p-5"
                      >
                        <p className="text-sm font-semibold text-white">
                          {property?.title ?? "Suggested property"}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-100/60">
                          Pros
                        </p>
                        <ul className="mt-2 space-y-1 text-sm leading-6 text-white/68">
                          {item.pros.map((pro) => (
                            <li key={pro}>{pro}</li>
                          ))}
                        </ul>
                        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-amber-100/60">
                          Cons
                        </p>
                        <ul className="mt-2 space-y-1 text-sm leading-6 text-white/68">
                          {item.cons.map((con) => (
                            <li key={con}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-amber-100/65">Next step</p>
                <p className="mt-3 text-sm leading-7 text-white/72">{aiResult.nextStep}</p>
              </div>
            </div>
          )}
        </section>

        {loadingProperties && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-sm text-white/62">
            Loading active properties...
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-sm text-rose-100">
            {error}
          </section>
        )}

        {!loadingProperties && !error && filteredProperties.length === 0 && (
          <section className="rounded-3xl border border-dashed border-white/12 bg-white/[0.035] p-8">
            <p className="text-2xl text-white">There are no active properties right now.</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              When an admin publishes properties with `active` status, they appear here for clients. Try changing the search or filters.
            </p>
          </section>
        )}

        {filteredProperties.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => {
              const propertyListingType = getListingType(property)
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
                      {listingTypeLabels[propertyListingType]}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-white/45">{location || property.city || "Location is not set"}</p>
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
                        onClick={() => toggleFavorite(property.id)}
                        disabled={favoriteActionId === property.id}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          favoriteSet.has(property.id)
                            ? "border-amber-200/35 bg-amber-300 text-slate-950"
                            : "border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/18"
                        }`}
                      >
                        {favoriteSet.has(property.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </section>
    </main>
  )
}
