'use client'

import Link from "next/link"
import { useState } from "react"
import TextInput from "@/app/components/TextInput"
import { supabase } from "@/lib/supabase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")

  const handleSignup = async () => {
    setError("")
    setSuccess("")

    if (!email.includes("@")) {
      setError("Shkruaj një email të vlefshëm.")
      return
    }

    if (password.length < 6) {
      setError("Fjalëkalimi duhet të ketë së paku 6 karaktere.")
      return
    }

    if (!name) {
      setError("Shkruaj emrin tënd.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      setError(error.message || "Nuk mundëm ta krijojmë llogarinë. Provo përsëri.")
    } else {
      setSuccess("Llogaria u krijua me sukses. Kontrollo email-in për konfirmim.")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-8">
        <div className="order-2 flex items-center lg:order-1">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.32em] text-white/45">
              Regjistrimi
            </p>
            <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">
              Krijo llogarinë e studios
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Fillo të krijosh përshkrime profesionale të pronave dhe ruaji në hapësirën tënde private.
            </p>

            <div className="mt-8 space-y-5">
              <TextInput
                label="Emri i plotë"
                placeholder="Emri dhe mbiemri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />

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
                placeholder="Minimumi 6 karaktere"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                hint="Përdor një fjalëkalim të sigurt dhe të lehtë për t'u mbajtur mend."
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="mt-8 w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Duke krijuar llogarinë..." : "Krijo llogari"}
            </button>

            {error && (
              <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            {success && (
              <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-white/52">
              Ke llogari?{" "}
              <Link href="/login" className="text-amber-200 transition hover:text-amber-100">
                Kyçu
              </Link>
            </p>
          </div>
        </div>

        <div className="order-1 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-stone-950/35 p-6 backdrop-blur-xl sm:p-8 lg:order-2">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
              HAPËSIRË PRIVATE
            </p>
            <h2 className="font-display mt-5 text-5xl leading-[0.95] text-white sm:text-6xl">
              Krijo përshtypje më të fortë për çdo pronë.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              Një rrjedhë më e pastër pune për agjentë, marketerë dhe ekipe që duan tekst më të shpejtë pa humbur tonin profesional.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">01</p>
              <h3 className="mt-3 text-xl text-white">Përshkruaj pronën</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Shto sipërfaqen, lokacionin, çmimin, përfundimet dhe veçoritë kryesore.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">02</p>
              <h3 className="mt-3 text-xl text-white">Gjenero tekstin prezantues</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                AI i kthen shënimet e thjeshta në përshkrim të qartë, bindës dhe profesional.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">03</p>
              <h3 className="mt-3 text-xl text-white">Ruaj dhe ripërdor draftet</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Mbaj një arkiv me përshkrime të gatshme për klientë dhe kampanja të ardhshme.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
