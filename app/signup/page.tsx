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
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!name) {
      setError("Please enter your name")
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
      setError(error.message || "Could not create account. Please try again.")
    } else {
      setSuccess("Account created successfully! Check your email to confirm.")
    }

    setLoading(false)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-amber-300/14 blur-3xl" />
        <div className="absolute right-[-10%] top-24 h-96 w-96 rounded-full bg-fuchsia-300/10 blur-3xl" />
        <div className="absolute bottom-[-8%] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-8">
        <div className="order-2 flex items-center lg:order-1">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.32em] text-white/45">
              Signup
            </p>
            <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">
              Create your studio account
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Start building elegant, conversion-focused property copy with your own saved workspace.
            </p>

            <div className="mt-8 space-y-5">
              <TextInput
                label="Full name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />

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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                hint="Use a password you can remember easily and keep secure."
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="mt-8 w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
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
              Already have an account?{" "}
              <Link href="/login" className="text-amber-200 transition hover:text-amber-100">
                Login
              </Link>
            </p>
          </div>
        </div>

        <div className="order-1 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-stone-950/35 p-6 backdrop-blur-xl sm:p-8 lg:order-2">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
              PRIVATE WORKSPACE
            </p>
            <h2 className="font-display mt-5 text-5xl leading-[0.95] text-white sm:text-6xl">
              Build a sharper first impression for every listing.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              Join a cleaner workflow for agents, marketers, and real estate teams who want faster output without losing a premium tone.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">01</p>
              <h3 className="mt-3 text-xl text-white">Describe the property</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Add the essentials like size, location, pricing, finishes, and standout amenities.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">02</p>
              <h3 className="mt-3 text-xl text-white">Generate the sales narrative</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Let AI turn rough notes into persuasive copy that sounds deliberate and polished.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">03</p>
              <h3 className="mt-3 text-xl text-white">Save and reuse your best work</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Keep a growing archive of descriptions ready for future campaigns and clients.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
