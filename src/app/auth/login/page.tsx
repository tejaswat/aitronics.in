'use client'
import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    // Avoid useSearchParams hook during prerender; read from window.location instead in client effect.
    const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const modeParam = sp.get('mode')
    if (modeParam === 'signup') setMode('signup')
  },[])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const action =
      mode === 'login'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })
    const { error } = await action

    if (error) {
      setError(error.message)
    } else {
      router.push('/profile')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <div className="tab-row">
        <button className={mode === 'login' ? 'button primary' : 'button ghost'} onClick={()=>setMode('login')}>Login</button>
        <button className={mode === 'signup' ? 'button primary' : 'button ghost'} onClick={()=>setMode('signup')}>Sign up</button>
      </div>
      <h2>{mode === 'login' ? 'Login' : 'Create account'}</h2>
      <form onSubmit={onSubmit} className="auth-form">
        <label>Email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} /></label>
        {error && <div role="alert" className="muted">{error}</div>}
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? 'Working…' : mode === 'login' ? 'Login' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}
