'use client'

import Link from "next/link"
import { useState } from "react"
import TextInput from "@/app/components/TextInput"
import { createUserProfile } from "@/lib/profiles"
import { roleLabels, UserRole } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole>("client")

  const getAuthErrorMessage = (message?: string) => {
    if (!message) {
      return "Nuk mundëm ta krijojmë llogarinë. Provo përsëri."
    }

    if (message.toLowerCase().includes("already")) {
      return "Ky email është i regjistruar më herët."
    }

    return message
  }

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
        },
      },
    })

    if (error) {
      setError(getAuthErrorMessage(error.message))
    } else {
      if (data.user?.id) {
        try {
          await createUserProfile({
            userId: data.user.id,
            fullName: name,
            role,
          })
        } catch (profileError) {
          const profileMessage =
            profileError instanceof Error ? profileError.message : "Gabim i panjohur."

          setError(
            `Llogaria u krijua, por profili nuk u ruajt. Kontrollo tabelën profiles në Supabase. Detaj: ${profileMessage}`
          )
          setLoading(false)
          return
        }
      }

      setSuccess("Llogaria dhe profili u krijuan me sukses. Tani mund të kyçesh.")
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
              Krijo llogarinë tënde
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Zgjidh rolin që të hapet eksperienca e duhur: panel pronari ose kërkim banese.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                  Roli
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["client", "admin"] as UserRole[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      disabled={loading}
                      className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        role === option
                          ? "border-amber-200/45 bg-amber-200 text-slate-950"
                          : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{roleLabels[option]}</span>
                      <span className={`mt-2 block text-xs leading-5 ${role === option ? "text-slate-700" : "text-white/52"}`}>
                        {option === "admin"
                          ? "Regjistro pronat e tua dhe shpalli për shitje ose qira."
                          : "Shfleto, filtro dhe ruaj banesat që të përshtaten."}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

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
              Një hyrje, dy eksperienca të qarta.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              Admini shpall pronat e veta; klienti i shfleton, i filtron dhe më vonë merr ndihmë nga AI për zgjedhjen më të mirë.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">01</p>
              <h3 className="mt-3 text-xl text-white">Admin/Pronar</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Regjistron prona, zgjedh shitje/qira dhe i publikon për klientët.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">02</p>
              <h3 className="mt-3 text-xl text-white">Klient/Banor</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Sheh pronat aktive dhe i sorton sipas nevojës: shitje ose qira.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">03</p>
              <h3 className="mt-3 text-xl text-white">AI me kontekst</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Adminit i ndihmon me shpallje; klientit i ndihmon me rekomandime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
