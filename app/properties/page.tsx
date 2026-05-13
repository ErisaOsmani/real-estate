"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type ListingType = "Të gjitha" | "Shitje" | "Qira"

const listingTypes: ListingType[] = ["Të gjitha", "Shitje", "Qira"]

const demoProperties = [
  {
    id: "penthouse-prishtine",
    title: "Penthouse modern në Prishtinë",
    city: "Prishtinë",
    type: "Penthouse",
    listingType: "Shitje",
    price: 420000,
    priceLabel: "420,000 EUR",
    area: 214,
    rooms: 3,
  },
  {
    id: "banese-qira-prishtine",
    title: "Banesë familjare afër qendrës",
    city: "Prishtinë",
    type: "Banesë",
    listingType: "Qira",
    price: 650,
    priceLabel: "650 EUR / muaj",
    area: 92,
    rooms: 2,
  },
  {
    id: "shtepi-prizren",
    title: "Shtëpi me oborr në Prizren",
    city: "Prizren",
    type: "Shtëpi",
    listingType: "Shitje",
    price: 185000,
    priceLabel: "185,000 EUR",
    area: 168,
    rooms: 4,
  },
]

export default function PropertiesPage() {
  const [listingType, setListingType] = useState<ListingType>("Të gjitha")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProperties = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return demoProperties.filter((property) => {
      const matchesType =
        listingType === "Të gjitha" || property.listingType === listingType
      const matchesTerm =
        !normalizedTerm ||
        property.title.toLowerCase().includes(normalizedTerm) ||
        property.city.toLowerCase().includes(normalizedTerm) ||
        property.type.toLowerCase().includes(normalizedTerm)

      return matchesType && matchesTerm
    })
  }, [listingType, searchTerm])

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-amber-200/80">
                KLIENT/BANOR
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Gjej pronën për shitje ose qira.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
                Kjo është struktura fillestare e UI-së së klientit. Në sprintet e ardhshme do të lidhet me Supabase dhe AI për kërkim më të zgjuar.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/favorites"
                className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Favoritët
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Kyçu
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                Kërko
              </label>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Qytet, tip prone ose titull..."
                className="mt-3 w-full rounded-full border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {listingTypes.map((option) => (
                <button
                  key={option}
                  onClick={() => setListingType(option)}
                  className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    listingType === option
                      ? "border-amber-200/40 bg-amber-300 text-slate-950"
                      : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.055]"
            >
              <div className="grid aspect-[4/3] place-items-center bg-slate-950/60">
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                  Foto prone
                </p>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/45">{property.city}</p>
                    <h2 className="mt-2 text-2xl text-white">{property.title}</h2>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                    {property.listingType}
                  </span>
                </div>
                <p className="mt-4 text-2xl text-amber-100">{property.priceLabel}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/58">
                  <span>{property.area} m2</span>
                  <span>{property.rooms} dhoma</span>
                  <span>{property.type}</span>
                </div>
                <Link
                  href={`/properties/${property.id}`}
                  className="mt-5 inline-flex rounded-full border border-white/12 bg-white/[0.06] px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                >
                  Shiko detajet
                </Link>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}
