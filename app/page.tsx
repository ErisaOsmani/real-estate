'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { createProperty, generateProperty, getUserProperties, Property } from "../lib/api"

const featurePills = [
  "AI-tailored listing copy",
  "Faster client-ready drafts",
  "One-click property archive",
]

const workflowSteps = [
  {
    label: "01",
    title: "Add the raw property details",
    description: "Drop in location, pricing, size, style, and the details you want buyers to feel.",
  },
  {
    label: "02",
    title: "Generate a polished sales narrative",
    description: "The assistant turns fragmented notes into clean, premium listing language.",
  },
  {
    label: "03",
    title: "Save your strongest version",
    description: "Keep a private library of ready-to-use descriptions for your next campaign.",
  },
]

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export default function Home() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [properties, setProperties] = useState<Property[]>([])

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, router, user])

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.id) {
        setProperties([])
        setIsLoadingProperties(false)
        return
      }

      setIsLoadingProperties(true)

      try {
        const data = await getUserProperties(user.id)
        setProperties(data)
      } catch (err: unknown) {
        setError(getErrorMessage(err, "We could not load your saved properties."))
      } finally {
        setIsLoadingProperties(false)
      }
    }

    if (!authLoading) {
      fetchProperties()
    }
  }, [authLoading, user])

  const generateDescription = async () => {
    if (loading || isSaving) {
      return
    }

    if (!input.trim()) {
      setError("Please enter property details")
      return
    }

    if (input.length > 500) {
      setError("Input is too long (max 500 characters)")
      return
    }

    setLoading(true)
    setError("")
    setResponse("")
    setSuccess("")

    try {
      const data = await generateProperty(input.trim())
      setResponse(data.reply)
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Something went wrong. Try again.")

      if (errorMessage.includes("Failed to fetch")) {
        setError("No internet connection")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveProperty = async () => {
    if (isSaving || loading) {
      return
    }

    if (!response) {
      setError("Please generate description first")
      return
    }

    if (!user?.id) {
      setError("Your session has expired. Please log in again.")
      return
    }

    const trimmedInput = input.trim()
    const trimmedResponse = response.trim()

    const exists = properties.some(
      (property) =>
        property.title === trimmedInput && property.description === trimmedResponse
    )

    if (exists) {
      setError("This property is already saved")
      return
    }

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      await createProperty({
        userId: user.id,
        title: trimmedInput,
        description: trimmedResponse,
      })

      const updatedProperties = await getUserProperties(user.id)
      setProperties(updatedProperties)
      setSuccess("Property saved successfully and added to your list.")
    } catch (err: unknown) {
      setError(getErrorMessage(err, "We could not save this property. Please try again."))
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm tracking-[0.24em] text-white/80 uppercase">
          Checking authentication...
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-12 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="absolute right-[-6%] top-40 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-amber-200/80">
                ESTATE STUDIO AI
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Listings that feel curated, not generated.
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/80">
                Welcome back, {user.user_metadata?.full_name || user.email}
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/login")
                }}
                className="rounded-full border border-white/15 bg-white/8 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/16"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-stone-950/40 p-6 shadow-[0_25px_90px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-wrap gap-3">
              {featurePills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-amber-200/15 bg-amber-200/8 px-4 py-2 text-xs uppercase tracking-[0.24em] text-amber-100/80"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-8 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/45">
                Your copywriting lounge
              </p>
              <h2 className="font-display mt-3 text-5xl leading-[0.95] text-white sm:text-6xl">
                Turn rough notes into luxury-grade property storytelling.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/68">
                Built for agents and studios who want cleaner presentation, faster publishing, and copy that sounds intentional from the first draft.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Output</p>
                <p className="mt-3 text-3xl text-white">Premium</p>
                <p className="mt-2 text-sm text-white/55">Sharper listing tone for portals, brochures, and campaigns.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Workflow</p>
                <p className="mt-3 text-3xl text-white">Fast</p>
                <p className="mt-2 text-sm text-white/55">From messy inputs to usable copy in a few seconds.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Library</p>
                <p className="mt-3 text-3xl text-white">{properties.length}</p>
                <p className="mt-2 text-sm text-white/55">Saved property drafts available in your private archive.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.32em] text-white/45">
              Workflow
            </p>
            <div className="mt-6 space-y-5">
              {workflowSteps.map((step) => (
                <div key={step.label} className="rounded-[1.5rem] border border-white/8 bg-black/15 p-5">
                  <div className="flex items-center gap-4">
                    <span className="font-display text-4xl text-amber-200">{step.label}</span>
                    <h3 className="text-lg font-medium text-white">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/60">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 backdrop-blur-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                  Generator
                </p>
                <h2 className="font-display mt-2 text-4xl text-white">
                  Craft your next listing
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/60">
                {input.length}/500
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-3">
              <textarea
                className="h-56 w-full resize-none rounded-[1.25rem] border border-white/6 bg-transparent p-4 text-base text-white placeholder:text-white/30 focus:outline-none"
                placeholder="Example: Duplex penthouse in Prishtina, 214m2, floor-to-ceiling windows, private terrace, premium kitchen, parking for 2 cars, asking price 420,000 EUR..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || isSaving}
              />
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
              <p>Include location, size, price, atmosphere, standout finishes, and target buyer appeal.</p>
              <p>{response ? "Draft generated and ready to review." : "No draft generated yet."}</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={generateDescription}
                disabled={loading || isSaving}
                className="flex-1 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? "Generating..." : "Generate Description"}
              </button>

              <button
                onClick={saveProperty}
                disabled={loading || isSaving || !response}
                className="flex-1 rounded-full border border-emerald-300/25 bg-emerald-300/12 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSaving ? "Saving..." : "Save Property"}
              </button>
            </div>

            {error && (
              <p
                className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
                role="alert"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
                role="status"
              >
                {success}
              </p>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                  Generated copy
                </p>
                <h2 className="font-display mt-2 text-4xl text-white">
                  Presentation-ready output
                </h2>
              </div>
              <div className="hidden rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/50 sm:block">
                AI writing room
              </div>
            </div>

            <div className="mt-6 min-h-[22rem] rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
              {response ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-100/65">
                    Generated Description
                  </p>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-white/78">
                    {response}
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                      Awaiting your prompt
                    </p>
                    <h3 className="font-display mt-3 text-3xl text-white">
                      Your polished listing will appear here.
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
                      Once you generate a draft, this panel becomes your clean review space for listing copy before saving it to the archive.
                    </p>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-white/45">
                    Tip: lead with the facts, then add mood, materials, amenities, and the ideal buyer profile.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-stone-950/35 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                Saved archive
              </p>
              <h2 className="font-display mt-2 text-4xl text-white">
                Your property library
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/55">
              Keep your best drafts in one place so you can revisit, refine, and reuse them across campaigns.
            </p>
          </div>

          {isLoadingProperties && (
            <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.045] p-5 text-sm text-white/55">
              Loading your saved properties...
            </div>
          )}

          {!isLoadingProperties && properties.length === 0 && (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] p-6">
              <p className="text-lg text-white">No saved properties yet.</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Generate a polished description, save it, and this space will turn into your own curated listing archive.
              </p>
            </div>
          )}

          {properties.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-[1.5rem] border border-white/8 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-100/55">
                    Draft {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 line-clamp-2 text-xl text-white">{item.title}</h3>
                  <p className="mt-4 line-clamp-6 text-sm leading-6 text-white/60">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
