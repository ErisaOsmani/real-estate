'use client'

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


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

    <main className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-xl w-full">

        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
          🏠 AI Real Estate Description Generator
        </h1>

        <p className="whitespace-pre-line text-gray-900 text-lg leading-relaxed">
          Generate professional property listings using AI
        </p>

        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 h-32 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Shkruaj detajet e pronës (location, size, price, features...)"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
        />

        <button
          onClick={generateDescription}
          disabled={loading}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Generating..." : "Generate Description"}
        </button>

        {error && (
          <p className="text-red-500 mt-4">
            Gabim: {error}
          </p>
        )}

        {response && (
          <div className="mt-6 bg-gray-50 border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Generated Description:</h2>
            <p className="whitespace-pre-line text-gray-700">
              {response}
            </p>
          </div>
        )}

      </div>

    </main>
  );
}
