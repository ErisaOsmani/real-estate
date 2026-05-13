"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getUserRole } from "@/lib/roles"

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const userRole = getUserRole(user)

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
    }
  }, [loading, router, user, userRole])

  if (loading || !user || userRole === "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/80">
          Duke kontrolluar kyçjen...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Link href="/properties" className="text-sm text-amber-100 transition hover:text-amber-200">
          Kthehu te pronat
        </Link>

        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
            Favoritët
          </p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">
            Pronat e ruajtura nga klienti.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
            Kjo faqe është struktura bazë për Sprintin 7. Këtu klienti do të shohë pronat që i ruan si favorite.
          </p>

          <div className="mt-8 rounded-2xl border border-dashed border-white/12 bg-black/20 p-6">
            <p className="text-lg text-white">Ende nuk ka favorite.</p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Pas lidhjes me Supabase, klienti do të mund të ruajë dhe heqë prona nga kjo listë.
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}
