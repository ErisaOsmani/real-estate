'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Session, User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
}

const AuthContext = createContext<AuthContextType>({ user: null })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Funksion async për të marrë session-in aktual
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    getSession()

    // Listen për ndryshimet e autentifikimit
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener?.subscription.unsubscribe() 
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)