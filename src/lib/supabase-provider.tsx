'use client'
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabaseClient'
import useCart from '../stores/cart'

type AuthContextType = { user: any | null }
export const AuthContext = createContext<AuthContextType>({ user: null })

export function SupabaseProvider({ children }:{children:ReactNode}){
  const [user, setUser] = useState<any | null>(null)
  const loadCart = useCart((s)=>s.loadFromSupabase)
  const syncCart = useCart((s)=>s.syncToSupabase)
  useEffect(()=>{
    supabase.auth.getSession().then((res: { data?: any; error?: any })=> {
      const { data } = res
      const nextUser = data.session?.user ?? null
      setUser(nextUser)
      if (nextUser?.id) loadCart(nextUser.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: any)=>{
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser?.id) {
        loadCart(nextUser.id).then(()=>syncCart(nextUser.id))
      }
    })
    return () => sub.subscription.unsubscribe()
  },[loadCart, syncCart])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}
