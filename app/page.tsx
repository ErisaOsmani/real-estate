"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import {
  createProperty,
  deleteProperty,
  generateProperty,
  getUserProperties,
  ListingTone,
  Property,
} from "../lib/api"

const samplePrompt =
  "Penthouse modern në Prishtinë, 214 m2, 3 dhoma gjumi, 2 banjo, dritare panoramike, terasë private, kuzhinë premium, parking për 2 vetura, afër qendrës, çmimi 420,000 EUR."

const toneOptions: ListingTone[] = ["Profesional", "Luksoz", "Familjar", "I shkurtër"]

const featurePills = [
  "Përshkrim në shqip",
  "Ton i zgjedhshëm",
  "Arkiv privat i pronave",
]

const checklistItems = [
  { label: "Lokacioni", patterns: ["prishtin", "prizren", "pej", "gjakov", "gjilan", "mitrovic", "ferizaj", "qend"] },
  { label: "Sipërfaqja", patterns: ["m2", "m²", "metra", "meter"] },
  { label: "Çmimi", patterns: ["eur", "€", "cmim", "çmim"] },
  { label: "Karakteristikat", patterns: ["teras", "parking", "ballkon", "kuzhin", "dritare", "dhoma", "banjo"] },
]

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export default function Home() {
  const [input, setInput] = useState("")
  const [tone, setTone] = useState<ListingTone>("Profesional")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingPropertyId, setDeletingPropertyId] = useState("")
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [properties, setProperties] = useState<Property[]>([])

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const completedChecklist = useMemo(() => {
    const normalizedInput = input.toLowerCase()

    return checklistItems.map((item) => ({
      ...item,
      completed: item.patterns.some((pattern) => normalizedInput.includes(pattern)),
    }))
  }, [input])

  const filteredProperties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return properties
    }

    return properties.filter(
      (property) =>
        property.title.toLowerCase().includes(term) ||
        property.description.toLowerCase().includes(term)
    )
  }, [properties, searchTerm])

  const wordCount = response
    ? response.split(/\s+/).filter(Boolean).length
    : 0

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
        setError(getErrorMessage(err, "Nuk mundëm t'i ngarkojmë pronat e ruajtura."))
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
      setError("Shkruaj detajet e pronës para gjenerimit.")
      return
    }

    if (input.length > 700) {
      setError("Teksti është shumë i gjatë. Maksimumi është 700 karaktere.")
      return
    }

    setLoading(true)
    setError("")
    setResponse("")
    setSuccess("")
    setCopied(false)

    try {
      const data = await generateProperty(input.trim(), tone)
      setResponse(data.reply)
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Diçka shkoi keq. Provo përsëri.")

      if (errorMessage.includes("Failed to fetch")) {
        setError("Nuk ka lidhje me internet.")
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
      setError("Së pari gjenero përshkrimin.")
      return
    }

    if (!user?.id) {
      setError("Sesioni ka skaduar. Kyçu përsëri.")
      return
    }

    const trimmedInput = input.trim()
    const trimmedResponse = response.trim()

    const exists = properties.some(
      (property) =>
        property.title === trimmedInput && property.description === trimmedResponse
    )

    if (exists) {
      setError("Kjo pronë është ruajtur më herët.")
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
      setSuccess("Prona u ruajt me sukses në arkiv.")
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Nuk mundëm ta ruajmë pronën. Provo përsëri."))
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSavedProperty = async (propertyId: string) => {
    if (!user?.id || deletingPropertyId) {
      return
    }

    const confirmed = window.confirm("A je i sigurt që dëshiron ta fshish këtë pronë?")

    if (!confirmed) {
      return
    }

    setDeletingPropertyId(propertyId)
    setError("")
    setSuccess("")

    try {
      await deleteProperty({
        propertyId,
        userId: user.id,
      })

      setProperties((currentProperties) =>
        currentProperties.filter((property) => property.id !== propertyId)
      )
      setSuccess("Prona u fshi nga arkivi.")
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Nuk mundëm ta fshijmë pronën. Provo përsëri."))
    } finally {
      setDeletingPropertyId("")
    }
  }

  const clearWorkspace = () => {
    setInput("")
    setResponse("")
    setError("")
    setSuccess("")
    setCopied(false)
  }

  const reuseProperty = (property: Property) => {
    setInput(property.title)
    setResponse(property.description)
    setError("")
    setSuccess("Drafti u kthye në editor.")
    setCopied(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const copyDescription = async () => {
    if (!response) {
      return
    }

    await navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const exportDescription = () => {
    if (!response) {
      return
    }

    const fileContent = [
      "Real Estate AI",
      "",
      `Toni: ${tone}`,
      "",
      "Detajet e pronës:",
      input.trim(),
      "",
      "Përshkrimi i gjeneruar:",
      response.trim(),
    ].join("\n")

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `pershkrim-prone-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  if (authLoading || !user) {
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
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-amber-200/80">
                REAL ESTATE AI
              </p>
              <h1 className="font-display mt-2 text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
                Studio inteligjente për përshkrime pronash.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
                Gjenero tekst profesional në shqip, ruaje në arkiv dhe prezanto pronat me më shumë siguri.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/78">
                {user.user_metadata?.full_name || user.email}
              </div>
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

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_80px_rgba(2,6,23,0.28)] sm:p-8">
            <div className="flex flex-wrap gap-3">
              {featurePills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-amber-200/15 bg-amber-200/8 px-4 py-2 text-xs uppercase tracking-[0.22em] text-amber-100/82"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                Paneli i projektit
              </p>
              <h2 className="font-display mt-3 text-4xl leading-tight text-white sm:text-5xl">
                Nga shënime të thjeshta në tekst gati për publikim.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/62">
                Menaxho stilin e tekstit, kontrollo cilësinë e input-it dhe ruaji draftet në një arkiv të qartë.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">Draftet</p>
                <p className="mt-2 text-3xl text-white">{properties.length}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">Fjalë</p>
                <p className="mt-2 text-3xl text-white">{wordCount}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">Toni</p>
                <p className="mt-2 text-xl text-white">{tone}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/15 p-5">
              <p className="text-sm font-medium text-white">Kontrolli para gjenerimit</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {completedChecklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-white/68">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${
                        item.completed
                          ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100"
                          : "border-white/12 bg-white/[0.04] text-white/45"
                      }`}
                    >
                      {item.completed ? "✓" : "·"}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-slate-950/48 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.32)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                  Gjeneratori
                </p>
                <h2 className="font-display mt-2 text-4xl text-white">
                  Krijo përshkrimin e pronës
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60">
                {input.length}/700
              </div>
            </div>

            <div className="mt-6">
              <label className="text-xs font-medium uppercase tracking-[0.24em] text-white/55">
                Toni i tekstit
              </label>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                {toneOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setTone(option)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      tone === option
                        ? "border-amber-200/40 bg-amber-200 text-slate-950"
                        : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-3">
              <textarea
                className="h-56 w-full resize-none rounded-2xl border border-white/6 bg-transparent p-4 text-base text-white placeholder:text-white/30 focus:outline-none"
                placeholder="Shembull: banesë moderne në Prishtinë, 86 m2, 2 dhoma gjumi, ballkon, parking, afër shkollës, çmimi 145,000 EUR..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={loading || isSaving}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={() => {
                  setInput(samplePrompt)
                  setResponse("")
                  setError("")
                  setSuccess("")
                  setCopied(false)
                }}
                disabled={loading || isSaving}
                className="rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-55"
              >
                Vendos shembullin
              </button>
              <button
                onClick={clearWorkspace}
                disabled={loading || isSaving || (!input && !response)}
                className="rounded-full border border-white/12 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Pastro
              </button>
              <button
                onClick={generateDescription}
                disabled={loading || isSaving}
                className="flex-1 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? "Duke gjeneruar..." : "Gjenero përshkrimin"}
              </button>
              <button
                onClick={saveProperty}
                disabled={loading || isSaving || !response}
                className="rounded-full border border-emerald-300/25 bg-emerald-300/12 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSaving ? "Duke ruajtur..." : "Ruaj pronën"}
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
          </section>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                  Rezultati
                </p>
                <h2 className="font-display mt-2 text-4xl text-white">
                  Teksti i gjeneruar
                </h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={copyDescription}
                  disabled={!response}
                  className="rounded-full border border-white/12 bg-black/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {copied ? "U kopjua" : "Kopjo tekstin"}
                </button>
                <button
                  onClick={exportDescription}
                  disabled={!response}
                  className="rounded-full border border-amber-200/20 bg-amber-200/10 px-5 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/18 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Eksporto .txt
                </button>
              </div>
            </div>

            <div className="mt-6 min-h-[20rem] rounded-3xl border border-white/10 bg-black/20 p-5">
              {response ? (
                <p className="whitespace-pre-line text-[15px] leading-7 text-white/80">
                  {response}
                </p>
              ) : (
                <div className="flex h-full flex-col justify-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                    Ende pa rezultat
                  </p>
                  <h3 className="font-display mt-3 text-3xl text-white">
                    Përshkrimi profesional do të shfaqet këtu.
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
                    Shto detajet e pronës, zgjidh tonin dhe gjenero tekstin final.
                  </p>
                </div>
              )}
            </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/42 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                Arkivi
              </p>
              <h2 className="font-display mt-2 text-4xl text-white">
                Pronat e ruajtura
              </h2>
            </div>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Kërko në arkiv..."
              className="w-full rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none sm:max-w-xs"
            />
          </div>

          {isLoadingProperties && (
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.045] p-5 text-sm text-white/55">
              Duke ngarkuar pronat e ruajtura...
            </div>
          )}

          {!isLoadingProperties && properties.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-6">
              <p className="text-lg text-white">Ende nuk ka prona të ruajtura.</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Gjenero një përshkrim, ruaje dhe ky seksion do të mbushet me draftet e tua.
              </p>
            </div>
          )}

          {!isLoadingProperties && properties.length > 0 && filteredProperties.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-6 text-sm text-white/60">
              Nuk u gjet asnjë pronë me këtë kërkim.
            </div>
          )}

          {filteredProperties.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-100/55">
                      Draft {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => reuseProperty(item)}
                        disabled={loading || isSaving}
                        className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-200/18 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Përdor
                      </button>
                      <button
                        onClick={() => deleteSavedProperty(item.id)}
                        disabled={Boolean(deletingPropertyId)}
                        className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/18 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {deletingPropertyId === item.id ? "Duke fshirë..." : "Fshij"}
                      </button>
                    </div>
                  </div>
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
