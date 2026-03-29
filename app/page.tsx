'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Home() {

  const [input,setInput] = useState("");
  const [response,setResponse] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [properties,setProperties] = useState<any[]>([]);

  const { user } = useAuth()
  const router = useRouter()

  // 🔒 Protected Route
  useEffect(() => {
    if(!user){
      router.push("/login")
    }
  }, [user])

  // 📖 READ DATA
  useEffect(() => {
    const fetchProperties = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user?.id)

      if(data) setProperties(data)
    }

    fetchProperties()
  }, [])

  // 🤖 AI GENERATE
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

  // 💾 SAVE DATA (CREATE)
  const saveProperty = async () => {

    if(!response){
      alert("Generate description first!")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from("properties").insert([
      {
        user_id: user?.id,
        title: input,
        description: response
      }
    ])

    if(error){
      alert(error.message)
    } else {
      alert("Saved successfully!")

      // refresh list
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user?.id)

      if(data) setProperties(data)
    }
  }

  if(!user){
    return <p className="text-center mt-10 text-white">Checking authentication...</p>
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">

      <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-6 max-w-xl w-full relative border border-white/20">

        {/* LOGOUT */}
        <button
          onClick={async ()=>{
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className="absolute top-4 right-4 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition"
        >
          Logout
        </button>

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-1 text-center text-white">
          🌙 Real Estate AI
        </h1>

        <p className="text-center text-gray-300 mb-4 text-sm">
          Welcome, {user?.user_metadata?.full_name || user?.email}
        </p>

        <p className="text-gray-400 text-center mb-4">
          Generate professional property listings using AI
        </p>

        {/* INPUT */}
        <textarea
          className="w-full border border-white/20 rounded-lg p-3 h-32 text-white bg-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Shkruaj detajet e pronës (location, size, price, features...)"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
        />

        {/* GENERATE BUTTON */}
        <button
          onClick={generateDescription}
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-lg"
        >
          {loading ? "Generating..." : "Generate Description"}
        </button>

        {/* SAVE BUTTON */}
        <button
          onClick={saveProperty}
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
        >
          Save Property
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-red-400 mt-4 text-center">
            {error}
          </p>
        )}

        {/* RESPONSE */}
        {response && (
          <div className="mt-6 bg-white/10 border border-white/20 rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-2 text-white">
              ✨ Generated Description:
            </h2>
            <p className="whitespace-pre-line text-gray-300">
              {response}
            </p>
          </div>
        )}

        {/* SAVED PROPERTIES */}
        <div className="mt-6">
          <h2 className="text-white font-semibold mb-2">
            📂 Your Properties
          </h2>

          {properties.map((item)=>(
            <div key={item.id} className="bg-white/10 border border-white/20 p-3 rounded-lg mt-3">
              <h3 className="text-white font-semibold">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

      </div>

    </main>
  );
}