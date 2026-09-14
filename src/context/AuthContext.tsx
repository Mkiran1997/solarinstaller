import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  /** Accepts an email OR a username. Resolves username -> email via the
   * `login_lookup_email` RPC (see supabase/schema.sql) before signing in. */
  signInWithIdentifier: (identifier: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Generic on purpose: whether the identifier doesn't exist or the password is
// wrong, the caller sees the same message. Prevents using this form to probe
// which usernames/emails exist in the system.
const GENERIC_LOGIN_ERROR = 'Invalid email/username or password.'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signInWithIdentifier(identifier: string, password: string) {
    const trimmed = identifier.trim()
    if (!trimmed || !password) {
      return { error: GENERIC_LOGIN_ERROR }
    }

    let email = trimmed
    if (!trimmed.includes('@')) {
      const { data, error } = await supabase.rpc('login_lookup_email', {
        p_username: trimmed,
      })
      if (error || !data) {
        return { error: GENERIC_LOGIN_ERROR }
      }
      email = data as string
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: GENERIC_LOGIN_ERROR }
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithIdentifier,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
