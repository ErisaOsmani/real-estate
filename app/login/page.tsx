'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import TextInput from "@/app/components/TextInput"
import { getDashboardPathByRole, resolveUserRole } from "@/lib/profiles"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const getAuthErrorMessage = (message?: string) => {
    if (!message) {
      return "Nuk mund të kyçesh. Provo përsëri."
    }

    const normalizedMessage = message.toLowerCase()

    if (normalizedMessage.includes("invalid login")) {
      return "Email-i ose fjalëkalimi nuk është i saktë."
    }

    if (normalizedMessage.includes("email not confirmed")) {
      return "Email-i nuk është konfirmuar ende."
    }

    return message
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Plotëso të gjitha fushat.")
      return
    }

    setError("")
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(getAuthErrorMessage(error.message))
    } else {
      const role = await resolveUserRole(data.user)
      router.push(getDashboardPathByRole(role))
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
        <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-stone-950/35 p-6 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
              REAL ESTATE AI
            </p>
            <h1 className="font-display mt-5 text-5xl leading-[0.95] text-white sm:text-6xl">
              Mirë se u ktheve në Real Estate AI.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              Admini menaxhon shpalljet e pronave, ndërsa klienti kërkon banesë për shitje ose qira.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Shpejtësi</p>
              <p className="mt-3 text-2xl text-white">Dy role</p>
              <p className="mt-2 text-sm text-white/55">Admin/Pronar dhe Klient/Banor me rrugë të ndara.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Cilësi</p>
              <p className="mt-3 text-2xl text-white">Marketplace</p>
              <p className="mt-2 text-sm text-white/55">Prona për shitje dhe qira në një vend.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Arkiv</p>
              <p className="mt-3 text-2xl text-white">AI sipas rolit</p>
              <p className="mt-2 text-sm text-white/55">Admini krijon shpallje, klienti merr sugjerime.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.32em] text-white/45">
              Kyçja
            </p>
            <h2 className="font-display mt-3 text-4xl text-white sm:text-5xl">
              Hyr në llogarinë tënde
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Pas kyçjes, admini shkon te paneli i pronarit, klienti te lista e pronave.
            </p>

            <div className="mt-8 space-y-5">
              <TextInput
                label="Email"
                type="email"
                placeholder="emri@agjencia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />

              <TextInput
                label="Fjalëkalimi"
                type="password"
                placeholder="Shkruaj fjalëkalimin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-8 w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Duke u kyçur..." : "Kyçu"}
            </button>

            {error && (
              <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-white/52">
              Nuk ke llogari?{" "}
              <Link href="/signup" className="text-amber-200 transition hover:text-amber-100">
                Regjistrohu
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
