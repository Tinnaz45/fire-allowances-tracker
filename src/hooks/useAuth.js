import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    let unsubscribe

    import('../lib/supabase').then(({ supabase }) => {
      if (!supabase) {
        setLoading(false)
        return
      }

      supabase.auth.getSession().then(({ data }) => {
        const s = data?.session ?? null
        setSession(s)
        if (s) fetchProfile(supabase, s.user.id)
        else setLoading(false)
      })

      const { data } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s ?? null)
        if (s) fetchProfile(supabase, s.user.id)
        else { setProfile(null); setLoading(false) }
      })

      unsubscribe = data?.subscription?.unsubscribe
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  async function fetchProfile(supabase, userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function updateProfile(updates) {
    const { supabase } = await import('../lib/supabase')
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  async function signIn(email, password) {
    const { supabase } = await import('../lib/supabase')
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp(email, password) {
    const { supabase } = await import('../lib/supabase')
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signUp({ email, password })
  }

  async function resetPassword(email) {
    const { supabase } = await import('../lib/supabase')
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.resetPasswordForEmail(email)
  }

  async function signOut() {
    const { supabase } = await import('../lib/supabase')
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, updateProfile, fetchProfile, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
