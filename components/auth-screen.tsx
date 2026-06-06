"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
} from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { AuthInputField } from "@/components/auth-input-field"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth()
  const { theme } = useTheme()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [forgotMode, setForgotMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await signIn(loginEmail.trim(), loginPassword)
    setSubmitting(false)
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const ok = await resetPassword(forgotEmail.trim())
    setSubmitting(false)
    if (ok) setEmailSent(true)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (registerPassword.length < 6) return
    setSubmitting(true)
    const ok = await signUp(
      registerEmail.trim(),
      registerPassword,
      registerName.trim(),
    )
    setSubmitting(false)
    if (ok) setTab("login")
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="auth-card p-3 sm:p-6 md:p-8"
      >
        {forgotMode ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setForgotMode(false)
                setEmailSent(false)
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para entrar
            </button>

            {emailSent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Verifique seu e-mail</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enviamos um link de recuperação para{" "}
                    <span className="font-medium text-foreground">
                      {forgotEmail}
                    </span>
                    . Clique no link para redefinir sua senha.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setForgotMode(false)
                    setEmailSent(false)
                    setLoginEmail(forgotEmail)
                  }}
                >
                  Voltar para entrar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Esqueceu a senha?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Informe seu e-mail e enviaremos um link para redefinir sua
                    senha.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">E-mail</Label>
                  <AuthInputField
                    id="forgot-email"
                    icon={Mail}
                    type="email"
                    variant="email"
                    placeholder="seu@email.com"
                    value={forgotEmail}
                    onChange={setForgotEmail}
                    required
                    autoComplete="email"
                  />
                </div>
                <Button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>
            )}
          </div>
        ) : (
          <>
            <div className="mb-2 text-left sm:mb-6">
              <h2 className="text-sm font-bold tracking-tight sm:text-xl">
                {tab === "login" ? "Bem-vindo de volta! 👋" : "Crie sua conta ✨"}
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-sm">
                {tab === "login"
                  ? "Entre na sua conta para continuar"
                  : "Cadastre-se para começar a gerenciar suas finanças"}
              </p>
            </div>

            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "login" | "register")}
            >
              <TabsList
                variant={theme === "dark" ? "line" : "default"}
                className="auth-tab-list"
              >
                <TabsTrigger value="login" className="auth-tab-trigger">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="auth-tab-trigger">
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-2 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="login-email" className="text-xs sm:text-sm">E-mail</Label>
                    <AuthInputField
                      id="login-email"
                      icon={Mail}
                      type="email"
                      variant="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={setLoginEmail}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="login-password" className="text-xs sm:text-sm">Senha</Label>
                    <AuthInputField
                      id="login-password"
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      variant="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={setLoginPassword}
                      required
                      autoComplete="current-password"
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((v) => !v)}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginEmail)
                          setForgotMode(true)
                          setEmailSent(false)
                        }}
                        className="text-xs font-medium text-primary hover:underline dark:text-emerald-400"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-2 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="register-name" className="text-xs sm:text-sm">Nome completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      autoComplete="name"
                      className="h-10 bg-accent/40 sm:h-11 dark:bg-input/30"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="register-email" className="text-xs sm:text-sm">E-mail</Label>
                    <AuthInputField
                      id="register-email"
                      icon={Mail}
                      type="email"
                      variant="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={setRegisterEmail}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="register-password" className="text-xs sm:text-sm">Senha</Label>
                    <AuthInputField
                      id="register-password"
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      variant="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerPassword}
                      onChange={setRegisterPassword}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((v) => !v)}
                    />
                    {registerPassword.length > 0 && registerPassword.length < 6 && (
                      <p className="text-xs text-destructive">
                        A senha deve ter pelo menos 6 caracteres.
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={submitting || registerPassword.length < 6}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Criar conta
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </motion.div>
    </AuthLayout>
  )
}
