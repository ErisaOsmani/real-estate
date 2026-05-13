"use client"

import Link from "next/link"
import Image from "next/image"
import { FormEvent, use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { createInquiry, getActivePropertyById, Property, PropertyListingType } from "@/lib/api"
import { getUserRole } from "@/lib/roles"

const listingTypeLabels: Record<PropertyListingType, string> = {
  sale: "For sale",
  rent: "For rent",
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

export default function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [property, setProperty] = useState<Property | null>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [error, setError] = useState("")
  const [inquiryError, setInquiryError] = useState("")
  const [inquirySuccess, setInquirySuccess] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("I would like to schedule a visit for this property.")
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
    if (!user) {
      return
    }

    setEmail(user.email ?? "")
    setFullName(String(user.user_metadata?.full_name ?? ""))
  }, [user])

  useEffect(() => {
    const loadProperty = async () => {
      if (!user || userRole === "admin") {
        setLoadingProperty(false)
        return
      }

      setLoadingProperty(true)
      setError("")

      try {
        const data = await getActivePropertyById(id)
        setProperty(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not load the property details.")
      } finally {
        setLoadingProperty(false)
      }
    }

    if (!loading) {
      loadProperty()
    }
  }, [id, loading, user, userRole])

  const handleInquirySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user || !property) {
      return
    }

    if (!fullName.trim()) {
      setInquiryError("Enter your full name.")
      setInquirySuccess("")
      return
    }

    if (!email.includes("@")) {
      setInquiryError("Enter a valid email address.")
      setInquirySuccess("")
      return
    }

    if (!message.trim()) {
      setInquiryError("Write a message or visit request.")
      setInquirySuccess("")
      return
    }

    setSubmittingInquiry(true)
    setInquiryError("")
    setInquirySuccess("")

    try {
      await createInquiry({
        propertyId: property.id,
        clientId: user.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      })
      setInquirySuccess("Your request was sent successfully. The owner will see it under inquiries.")
      setMessage("I would like to schedule a visit for this property.")
      setPhone("")
    } catch (err) {
      setInquiryError(err instanceof Error ? err.message : "Sending the inquiry failed.")
    } finally {
      setSubmittingInquiry(false)
    }
  }

  if (loading || !user || userRole === "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/80">
          Opening property details...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Link href="/properties" className="text-sm text-amber-100 transition hover:text-amber-200">
          Back to properties
        </Link>

        {loadingProperty && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-sm text-white/62">
            Loading property...
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-sm text-rose-100">
            {error}
          </section>
        )}

        {!loadingProperty && !error && !property && (
          <section className="rounded-3xl border border-dashed border-white/12 bg-white/[0.035] p-8">
            <p className="text-2xl text-white">This property is not active or does not exist.</p>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Clients only see properties published with active status.
            </p>
          </section>
        )}

        {property && (
          <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[22rem] bg-slate-950/60">
                {property.image_url ? (
                  <Image
                    src={property.image_url}
                    alt={property.title}
                    fill
                    unoptimized
                    className="h-full min-h-[22rem] w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full min-h-[22rem] place-items-center bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(16,185,129,0.12),rgba(15,23,42,0.9))]">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                      Property photo
                    </p>
                  </div>
                )}
                <span className="absolute left-5 top-5 rounded-full border border-slate-950/20 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-950">
                  {listingTypeLabels[getListingType(property)]}
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
                  Property details
                </p>
                <h1 className="font-display mt-3 text-4xl leading-none text-white sm:text-5xl">
                  {property.title}
                </h1>
                <p className="mt-4 text-3xl text-amber-100">{formatPrice(property)}</p>
                <p className="mt-3 text-sm text-white/55">
                  {[property.city, property.neighborhood].filter(Boolean).join(", ") || "Location is not set"}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {[
                    { label: "Type", value: property.property_type || "Property" },
                    { label: "Area", value: `${property.area ?? "-"} m2` },
                    { label: "Bedrooms", value: property.bedrooms ?? "-" },
                    { label: "Bathrooms", value: property.bathrooms ?? "-" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/38">{item.label}</p>
                      <p className="mt-2 text-lg text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                Description
              </p>
              <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-white/68">
                {property.description || "Description has not been set yet."}
              </p>
            </div>

            <div className="border-t border-white/10 p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-200/75">
                    Contact and visit
                  </p>
                  <h2 className="font-display mt-3 text-4xl text-white">
                    Send an inquiry for this property.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/58">
                    The request is saved under inquiries, and the admin/owner can update its status after contacting you.
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                        Name
                      </span>
                      <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                        placeholder="Full name"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                        Email
                      </span>
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                        placeholder="email@example.com"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                      Phone
                    </span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                      placeholder="+383..."
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                      Message
                    </span>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={4}
                      className="resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35"
                      placeholder="I would like to schedule a visit..."
                    />
                  </label>

                  {inquiryError && (
                    <p className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                      {inquiryError}
                    </p>
                  )}

                  {inquirySuccess && (
                    <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                      {inquirySuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingInquiry ? "Sending..." : "Send visit request"}
                  </button>
                </form>
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  )
}
