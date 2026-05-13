"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getDashboardPath } from "@/lib/roles"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }

    router.replace(user ? getDashboardPath(user) : "/properties")
  }, [loading, router, user])

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/80">
        Duke hapur Real Estate AI...
      </div>
    </main>
  )
}
