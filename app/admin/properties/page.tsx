"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { isAdminUser } from "@/lib/admin"

export default function AdminPropertiesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const canAccessAdmin = isAdminUser(user)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, router, user])

  if (loading || !user) {
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
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-xl rounded-3xl border border-rose-300/20 bg-rose-400/10 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-100/70">
            Qasje e kufizuar
          </p>
          <h1 className="font-display mt-4 text-4xl text-white">
            Vetëm admini mund të menaxhojë prona.
          </h1>
          <Link
            href="/properties"
            className="mt-6 inline-flex rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            Shko te pronat
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
                ADMIN/PRONAR
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Menaxhimi i pronave të mia.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
                Kjo është struktura bazë për Sprintin 3-4. Këtu admini do të regjistrojë, editojë dhe publikojë prona për shitje ose qira.
              </p>
            </div>
            <Link
              href="/admin"
              className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
            >
              Dashboard admin
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            "Formular për shtim prone",
            "Tabela e pronave të adminit",
            "Publikim dhe çpublikim",
          ].map((item) => (
            <article key={item} className="rounded-2xl border border-white/8 bg-white/[0.055] p-6">
              <h2 className="text-2xl text-white">{item}</h2>
              <p className="mt-3 text-sm leading-6 text-white/58">
                Placeholder i Javës 1. Implementimi funksional vjen në sprintet e menaxhimit të pronave.
              </p>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}
