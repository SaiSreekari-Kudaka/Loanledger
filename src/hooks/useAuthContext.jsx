import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    if (!userId) {
      setProfile(null)
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        setProfile(null)
        return null
      }

      console.log('Profile loaded:', data)

      setProfile(data)
      return data
    } catch (error) {
      console.error('Unexpected profile fetch error:', error)
      setProfile(null)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    async function initialiseAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Session error:', error)
        }

        const currentUser = session?.user ?? null

        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth initialisation error:', error)
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialiseAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null

      if (!mounted) return

      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }

      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email, password, fullName, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role || 'user',
        },
      },
    })

    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (!error) {
      setUser(null)
      setProfile(null)
    }

    return { error }
  }

  async function deleteAccount() {
    const { error } = await supabase.rpc('delete_user')

    if (!error) {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    }

    return { error }
  }

  async function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        deleteAccount,
        resetPassword,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}