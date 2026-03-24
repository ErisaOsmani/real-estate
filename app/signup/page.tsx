'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"

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
    if(!name){
      setError("Please enter your name")
      return
    }

    if(error){
      setError(error.message)
    } else {
      setSuccess("Account created successfully!")
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

      <input
        className="w-full border border-white/20 rounded-lg p-3 mb-4 text-white bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Email address"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        className="w-full border border-white/20 rounded-lg p-3 mb-4 text-white bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />
      <input
        className="w-full border border-white/20 rounded-lg p-3 mb-4 text-white bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Full name"
        onChange={(e)=>setName(e.target.value)}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-lg"
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