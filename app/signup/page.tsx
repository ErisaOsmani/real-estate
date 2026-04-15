'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import TextInput from "@/app/components/TextInput"

export default function Signup(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [success,setSuccess] = useState("")
  const [loading,setLoading] = useState(false)
  const [name,setName] = useState("")

  const handleSignup = async () => {

    setError("")
    setSuccess("")

    if(!email.includes("@")){
      setError("Please enter a valid email address")
      return
    }

    if(password.length < 6){
      setError("Password must be at least 6 characters")
      return
    }

    if(!name){
      setError("Please enter your name")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    })

    if(error){
      setError(error.message || "Could not create account. Please try again.")
    } else {
      setSuccess("Account created successfully! Check your email to confirm.")
    }

    setLoading(false)
  }

  return (
  <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">

    <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-white/20">

      <h1 className="text-3xl font-bold text-center text-white mb-2">
        ✨ Create Account
      </h1>

      <p className="text-center text-gray-300 mb-6">
        Sign up to start generating AI property descriptions
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
      <TextInput
        placeholder="Full name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      {error && (
        <p className="text-red-400 mt-4 text-center">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-400 mt-4 text-center">
          {success}
        </p>
      )}

      <p className="text-center text-sm text-gray-400 mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-purple-400 hover:underline">
          Login
        </a>
      </p>

    </div>

  </main>
)
}