'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { createProperty, generateProperty, getUserProperties, Property } from "../lib/api"

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
    return <p className="text-center mt-10 text-white">Checking authentication...</p>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-6 max-w-xl w-full relative border border-white/20">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className="absolute top-4 right-4 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition"
        >
          Logout
        </button>

        <h1 className="text-3xl font-bold mb-1 text-center text-white">
          Real Estate AI
        </h1>

        <p className="text-center text-gray-300 mb-4 text-sm">
          Welcome, {user.user_metadata?.full_name || user.email}
        </p>

        <p className="text-gray-400 text-center mb-4">
          Generate professional property listings using AI
        </p>

        <textarea
          className="w-full border border-white/20 rounded-lg p-3 h-32 text-white bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Write property details (location, size, price...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || isSaving}
        />

        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>Include location, size, price and key highlights.</span>
          <span>{input.length}/500</span>
        </div>

        <button
          onClick={generateDescription}
          disabled={loading || isSaving}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Description"}
        </button>

        <button
          onClick={saveProperty}
          disabled={loading || isSaving || !response}
          className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Property"}
        </button>

        {error && (
          <p className="text-red-400 mt-4 text-center" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-400 mt-2 text-center" role="status">
            {success}
          </p>
        )}

        {response && (
          <div className="mt-6 bg-white/10 border border-white/20 rounded-lg p-4">
            <h2 className="font-semibold mb-2 text-white">
              Generated Description
            </h2>
            <p className="text-gray-300 whitespace-pre-line">
              {response}
            </p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-white font-semibold mb-2">
            Your Properties
          </h2>

          {isLoadingProperties && (
            <p className="text-gray-400 text-sm">
              Loading your saved properties...
            </p>
          )}

          {!isLoadingProperties && properties.length === 0 && (
            <p className="text-gray-400 text-sm">
              No properties saved yet. Generate a description and save your first listing.
            </p>
          )}

          {properties.map((item) => (
            <div key={item.id} className="bg-white/10 p-3 rounded-lg mt-3">
              <h3 className="text-white font-semibold">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
