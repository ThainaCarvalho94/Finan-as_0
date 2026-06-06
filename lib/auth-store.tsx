"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export type UserProfile = {
  id: string
  email: string
  fullName: string
  createdAt: string
}

type AuthContextValue = {
  loading: boolean
  user: User | null
  profile: UserProfile | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>
  signOut: () => Promise<void>
  updateProfile: (fullName: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (user.user_metadata?.full_name as string) ?? "",
    createdAt: user.created_at,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
      )
      return false
    }
    toast.success("Bem-vindo de volta!")
    return true
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      })
      if (error) {
        toast.error(error.message)
        return false
      }
      toast.success("Conta criada com sucesso!")
      return true
    },
    [],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Não foi possível sair da conta.")
      return
    }
    toast.success("Você saiu da sua conta.")
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error("Não foi possível enviar o e-mail de recuperação.")
      return false
    }
    toast.success("Enviamos um link de recuperação para o seu e-mail.")
    return true
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error("Não foi possível redefinir a senha.")
      return false
    }
    toast.success("Senha redefinida com sucesso!")
    return true
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) {
      toast.error("Não foi possível entrar com Google.")
      return false
    }
    return true
  }, [])

  const updateProfile = useCallback(async (fullName: string) => {
    const trimmed = fullName.trim()
    if (!trimmed) {
      toast.error("Informe um nome válido.")
      return false
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    })

    if (error) {
      toast.error("Não foi possível atualizar o perfil.")
      return false
    }

    if (data.user) setUser(data.user)
    toast.success("Perfil atualizado.")
    return true
  }, [])

  const profile = useMemo(() => (user ? mapProfile(user) : null), [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      profile,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetPassword,
      updatePassword,
      signInWithGoogle,
    }),
    [
      loading,
      user,
      profile,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetPassword,
      updatePassword,
      signInWithGoogle,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider")
  return ctx
}
