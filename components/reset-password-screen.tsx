"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { AppLogo } from "@/components/app-logo"
import { useAuth } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"

export function ResetPasswordScreen() {
  const router = useRouter()
  const { updatePassword, signOut } = useAuth()
  const [ready, setReady] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let resolved = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          resolved = true
          setReady(true)
          setInvalid(false)
        }
      },
    )

    async function init() {
      const code = new URLSearchParams(window.location.search).get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setInvalid(true)
          return
        }
        resolved = true
        setReady(true)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        resolved = true
        setReady(true)
        return
      }

      const hash = window.location.hash
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        return
      }

      if (!resolved) setInvalid(true)
    }

    init()

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) return
    if (password !== confirmPassword) return

    setSubmitting(true)
    const ok = await updatePassword(password)
    setSubmitting(false)

    if (ok) {
      await signOut()
      router.push("/")
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <AppLogo size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Nova senha
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Defina uma nova senha para sua conta
            </p>
          </div>
        </div>

        <Card className="shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>
              Escolha uma senha segura com pelo menos 6 caracteres
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invalid ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Link inválido ou expirado. Solicite um novo link de
                  recuperação.
                </p>
                <Button onClick={() => router.push("/")}>
                  Voltar para entrar
                </Button>
              </div>
            ) : !ready ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar senha</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  {confirmPassword.length > 0 &&
                    password !== confirmPassword && (
                      <p className="text-xs text-destructive">
                        As senhas não coincidem.
                      </p>
                    )}
                </div>
                <Button
                  type="submit"
                  className="h-10 w-full"
                  disabled={
                    submitting ||
                    password.length < 6 ||
                    password !== confirmPassword
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Redefinir senha"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
