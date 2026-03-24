'use client'

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"


export default function Home() {

  const [input,setInput] = useState("");
  const [response,setResponse] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if(!user){
      router.push("/login")
    }
  }, [user])

  const generateDescription = async () => {

    if(!input.trim()) return;

    setLoading(true);
    setError("");
    setResponse("");

    try {

      const res = await fetch("/api/chat",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({message: input})
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.error || "Server error");
      }

      setResponse(data.reply);

    } catch(err:any){
      setError(err.message);
    }

    setLoading(false);
  };

  if(!user){
  return <p className="text-center mt-10">Checking authentication...</p>
}

  return (

  <main className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">

    <div className="bg-white shadow-xl rounded-2xl p-6 max-w-xl w-full relative">

      {/* LOGOUT BUTTON */}
      <button
        onClick={async ()=>{
          await supabase.auth.signOut()
          router.push("/login")
        }}
        className="absolute top-4 right-4 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
      >
        Logout
      </button>

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-1 text-center text-gray-900">
        🏠 Real Estate AI
      </h1>

      <p className="text-center text-gray-500 mb-4 text-sm">
        Welcome, {user?.email}
      </p>

      <p className="text-gray-700 text-center mb-4">
        Generate professional property listings using AI
      </p>

      {/* INPUT */}
      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 h-32 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Shkruaj detajet e pronës (location, size, price, features...)"
        value={input}
        onChange={(e)=>setInput(e.target.value)}
      />

      {/* BUTTON */}
      <button
        onClick={generateDescription}
        disabled={loading}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? "Generating..." : "Generate Description"}
      </button>

      {/* ERROR */}
      {error && (
        <p className="text-red-500 mt-4 text-center">
          {error}
        </p>
      )}

      {/* RESPONSE */}
      {response && (
        <div className="mt-6 bg-gray-50 border rounded-lg p-4">
          <h2 className="font-semibold mb-2 text-gray-900">
            Generated Description:
          </h2>
          <p className="whitespace-pre-line text-gray-700">
            {response}
          </p>
        </div>
      )}

    </div>

  </main>
);
}
