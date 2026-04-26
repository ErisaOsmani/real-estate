'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import TextInput from "@/app/components/TextInput"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields")
      return
    }

    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message || "Unable to sign in. Please try again.")
    } else {
      router.push("/")
    }

    setLoading(false)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-12 h-72 w-72 rounded-full bg-amber-300/14 blur-3xl" />
        <div className="absolute right-[-10%] top-24 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="absolute bottom-[-8%] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
        <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-stone-950/35 p-6 backdrop-blur-xl sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
              ESTATE STUDIO AI
            </p>
            <h1 className="font-display mt-5 text-5xl leading-[0.95] text-white sm:text-6xl">
              Welcome back to your listing studio.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              Sign in to generate polished real estate descriptions, manage saved drafts, and keep your brand presentation consistent.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Speed</p>
              <p className="mt-3 text-2xl text-white">Fast copy</p>
              <p className="mt-2 text-sm text-white/55">Move from raw details to client-ready text in moments.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Quality</p>
              <p className="mt-3 text-2xl text-white">Refined tone</p>
              <p className="mt-2 text-sm text-white/55">Writeups designed to feel curated and premium.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Archive</p>
              <p className="mt-3 text-2xl text-white">Saved drafts</p>
              <p className="mt-2 text-sm text-white/55">Keep your strongest property descriptions close at hand.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.32em] text-white/45">
              Login
            </p>
            <h2 className="font-display mt-3 text-4xl text-white sm:text-5xl">
              Access your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Continue where you left off and open your private property workspace.
            </p>

            <div className="mt-8 space-y-5">
              <TextInput
                label="Email"
                type="email"
                placeholder="name@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />

              <TextInput
                label="Password"
                type="password"
                placeholder="Enter your password"
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
              {loading ? "Logging in..." : "Login"}
            </button>

            {error && (
              <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-white/52">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-amber-200 transition hover:text-amber-100">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
