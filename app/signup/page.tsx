'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Signup(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [success,setSuccess] = useState("")
  const [loading,setLoading] = useState(false)

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
      password
    })

    if(error){
      setError(error.message)
    } else {
      setSuccess("Account created successfully!")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Sign up to start generating AI property descriptions
        </p>

        <input
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email address"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {error && (
          <p className="text-red-500 mt-4 text-center">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 mt-4 text-center">
            {success}
          </p>
        )}

      </div>

    </main>
  )
}