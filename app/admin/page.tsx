"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { isAdminUser } from "@/lib/admin"
import { getAdminProperties, Property } from "@/lib/api"
import { supabase } from "@/lib/supabase"

type AdminStatus = "Të gjitha" | "Aktive" | "Draft" | "E rezervuar"

const statusOptions: AdminStatus[] = ["Të gjitha", "Aktive", "Draft", "E rezervuar"]

const getStatus = (index: number): Exclude<AdminStatus, "Të gjitha"> => {
  const statuses: Exclude<AdminStatus, "Të gjitha">[] = ["Aktive", "Draft", "E rezervuar"]

  return statuses[index % statuses.length]
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error && error.message
    ? error.message
    : "Nuk mundëm t'i ngarkojmë të dhënat e adminit."
}

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdminStatus>("Të gjitha")

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const canAccessAdmin = isAdminUser(user)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, router, user])

  useEffect(() => {
    const loadProperties = async () => {
      if (!canAccessAdmin) {
        setLoadingProperties(false)
        return
      }

      setLoadingProperties(true)
      setError("")

      try {
        const data = await getAdminProperties()
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
  }, [authLoading, canAccessAdmin])

  const tableRows = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return properties
      .map((property, index) => ({
        ...property,
        status: getStatus(index),
      }))
      .filter((property) => {
        const matchesTerm =
          !normalizedTerm ||
          property.title.toLowerCase().includes(normalizedTerm) ||
          property.description.toLowerCase().includes(normalizedTerm) ||
          property.user_id.toLowerCase().includes(normalizedTerm)

        const matchesStatus =
          statusFilter === "Të gjitha" || property.status === statusFilter

        return matchesTerm && matchesStatus
      })
  }, [properties, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const activeCount = properties.filter((_, index) => getStatus(index) === "Aktive").length
    const draftCount = properties.filter((_, index) => getStatus(index) === "Draft").length
    const uniqueUsers = new Set(properties.map((property) => property.user_id)).size
    const averageWords = properties.length
      ? Math.round(
          properties.reduce((total, property) => {
            return total + property.description.split(/\s+/).filter(Boolean).length
          }, 0) / properties.length
        )
      : 0

    return [
      { label: "Listime totale", value: properties.length },
      { label: "Agjentë aktivë", value: uniqueUsers },
      { label: "Aktive", value: activeCount },
      { label: "Drafte", value: draftCount },
      { label: "Mes. fjalë", value: averageWords },
    ]
  }, [properties])

  if (authLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/80">
          Duke kontrolluar adminin...
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
              Kjo faqe është vetëm për admin.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/62">
              Për demo, përdor një email që fillon me `admin@`, shto `role: admin`
              në metadata të përdoruesit, ose vendos `NEXT_PUBLIC_ADMIN_EMAILS`
              në `.env.local`.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/")}
                className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Kthehu te projekti
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/login")
                }}
                className="rounded-full border border-white/12 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
              >
                Çkyçu
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-emerald-200/80">
                ADMIN PANEL
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Kontrolli i platformës Real Estate AI.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
                Shiko statistikat globale, monitoro listimet dhe filtro pronat e ruajtura nga agjentët.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => router.push("/admin/properties")}
                className="rounded-full border border-emerald-300/20 bg-emerald-300/12 px-5 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/20"
              >
                Pronat e mia
              </button>
              <button
                onClick={() => router.push("/properties")}
                className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Pamja klientit
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/login")
                }}
                className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                Çkyçu
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.06] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                {item.label}
              </p>
              <p className="mt-3 text-4xl text-white">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/42 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                Menaxhimi
              </p>
              <h2 className="font-display mt-2 text-4xl text-white">
                Listimet në platformë
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_14rem] lg:w-[36rem]">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Kërko pronë, tekst ose user id..."
                className="w-full rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as AdminStatus)}
                className="rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-sm text-white focus:outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingProperties && (
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.045] p-5 text-sm text-white/55">
              Duke ngarkuar listimet...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">
              {error}
            </div>
          )}

          {!loadingProperties && !error && tableRows.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-6">
              <p className="text-lg text-white">Nuk ka listime për këtë filtër.</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Nëse Supabase RLS lejon vetëm pronat e përdoruesit aktual, admini do të shohë vetëm ato derisa të shtohet policy ose backend admin endpoint.
              </p>
            </div>
          )}

          {tableRows.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/8">
                  <thead className="bg-white/[0.04]">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-[0.22em] text-white/45">
                        Prona
                      </th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-[0.22em] text-white/45">
                        Statusi
                      </th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-[0.22em] text-white/45">
                        Agjenti
                      </th>
                      <th className="px-4 py-4 text-left text-xs uppercase tracking-[0.22em] text-white/45">
                        Fjalë
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 bg-black/15">
                    {tableRows.map((property) => (
                      <tr key={property.id} className="align-top">
                        <td className="max-w-xl px-4 py-4">
                          <p className="line-clamp-2 text-sm font-medium text-white">
                            {property.title}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
                            {property.description}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                            {property.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="max-w-[14rem] truncate text-sm text-white/65">
                            {property.user_id}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-white/65">
                          {property.description.split(/\s+/).filter(Boolean).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
