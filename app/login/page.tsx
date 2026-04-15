'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import TextInput from "@/app/components/TextInput"

export default function Login(){

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)

  const handleLogin = async () => {

    if(!email || !password){
      setError("Please fill all fields")
      return
    }

    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if(error){
      setError(error.message || "Unable to sign in. Please try again.")
    } else {
      router.push("/")
    }

    setLoading(false)
  }

  return (
  <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">

    <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-white/20">

      <h1 className="text-3xl font-bold text-center text-white mb-2">
        🌙 Welcome Back
      </h1>

      <p className="text-center text-gray-300 mb-6">
        Login to your account to continue
      </p>

      <TextInput
        placeholder="Email address"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        disabled={loading}
      />

      <TextInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && (
        <p className="text-red-400 mt-4 text-center">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-gray-400 mt-4">
        Don’t have an account?{" "}
        <a href="/signup" className="text-purple-400 hover:underline">
          Sign up
        </a>
      </p>

    </div>

  </main>
)
}