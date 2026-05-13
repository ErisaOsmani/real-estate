"use client"

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
      return "We could not create the account. Please try again."
    }

    if (message.toLowerCase().includes("already")) {
      return "This email is already registered."
    }

    return message
  }

  const handleSignup = async () => {
    setError("")
    setSuccess("")

    if (!email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (!name) {
      setError("Please enter your name.")
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
            profileError instanceof Error ? profileError.message : "Unknown error."

          setError(
            `The account was created, but the profile was not saved. Check the profiles table in Supabase. Detail: ${profileMessage}`
          )
          setLoading(false)
          return
        }
      }

      setSuccess("Account and profile created successfully. You can now sign in.")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-8">
        <div className="order-2 flex items-center lg:order-1">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.32em] text-white/45">
              Registration
            </p>
            <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">
              Create your account
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/58">
              Choose the role that opens the right experience: owner dashboard or home search.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                  Role
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
                          ? "Register your properties and publish them for sale or rent."
                          : "Browse, filter, and save homes that fit your needs."}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <TextInput
                label="Full name"
                placeholder="First and last name"
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
                hint="Use a secure password that is easy for you to remember."
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="mt-8 w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
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
                Sign in
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
              One entry point, two clear experiences.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              Owners publish their properties; clients browse, filter, save favorites, and use AI to make better decisions.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">01</p>
              <h3 className="mt-3 text-xl text-white">Admin/Owner</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Registers properties, chooses sale or rent, and publishes listings for clients.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">02</p>
              <h3 className="mt-3 text-xl text-white">Client/Resident</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Views active properties and sorts them by need: sale or rent.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">03</p>
              <h3 className="mt-3 text-xl text-white">Contextual AI</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Helps admins write listings and helps clients compare recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
