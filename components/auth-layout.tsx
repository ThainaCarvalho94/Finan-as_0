"use client"

import type { ReactNode } from "react"
import { BarChart3, Shield, Zap } from "lucide-react"
import { AppLogo } from "@/components/app-logo"
import { AuthThemeSwitch } from "@/components/auth-theme-switch"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    icon: Shield,
    title: "Seguro",
    description: "Seus dados protegidos com criptografia.",
    lightIconBg: "bg-blue-100 text-blue-600",
    darkIconBg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: BarChart3,
    title: "Organizado",
    description: "Visualize e controle tudo em um só lugar.",
    lightIconBg: "bg-emerald-100 text-emerald-600",
    darkIconBg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: Zap,
    title: "Inteligente",
    description: "Relatórios e insights para melhores decisões.",
    lightIconBg: "bg-violet-100 text-violet-600",
    darkIconBg: "bg-violet-500/10 text-violet-400",
  },
] as const

type AuthLayoutProps = {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="auth-page relative min-h-[100dvh] overflow-x-hidden bg-background">
      <div className="auth-page-bg pointer-events-none absolute inset-0" aria-hidden />

      <div className="auth-mobile-topbar sticky top-0 z-20 flex justify-center px-4 py-3 sm:absolute sm:justify-end sm:bg-transparent sm:px-6 sm:py-0 sm:pt-4">
        <AuthThemeSwitch />
      </div>

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-lg flex-col px-4 pb-6 pt-2 sm:min-h-screen sm:pb-10 sm:pt-20",
          className,
        )}
      >
        <header className="mb-5 flex flex-col items-center text-center sm:mb-8">
          <AppLogo size="lg" className="mb-4 sm:hidden" />
          <AppLogo size="xl" className="mb-5 hidden sm:block" />
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            <span className="text-[#1e3a8a] dark:text-white">Gestão </span>
            <span className="text-[#1e3a8a] dark:bg-gradient-to-r dark:from-emerald-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
              Financeira
            </span>
          </h1>
          <p className="mt-1.5 whitespace-nowrap text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-base">
            Controle suas finanças com{" "}
            <span className="font-semibold text-primary dark:text-emerald-400">
              segurança
            </span>{" "}
            e{" "}
            <span className="font-semibold text-[#2563eb] dark:text-blue-400">
              praticidade
            </span>
          </p>
        </header>

        {/* Mobile: cards horizontais */}
        <section className="auth-features-mobile mb-5 sm:hidden">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FEATURES.map(({ icon: Icon, title, description, lightIconBg, darkIconBg }) => (
              <div
                key={title}
                className="min-w-[148px] shrink-0 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm"
              >
                <div
                  className={cn(
                    "mb-2 flex h-9 w-9 items-center justify-center rounded-xl",
                    lightIconBg,
                    darkIconBg,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Desktop/tablet: grid */}
        <section className="mb-8 hidden grid-cols-3 gap-4 sm:grid">
          {FEATURES.map(({ icon: Icon, title, description, lightIconBg, darkIconBg }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "mb-2 flex h-11 w-11 items-center justify-center rounded-xl",
                  lightIconBg,
                  darkIconBg,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </section>

        {children}

        <footer className="mt-6 flex flex-col items-center gap-2.5 text-center sm:mt-8 sm:gap-3">
          <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 sm:text-xs">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Seus dados estão 100% protegidos</span>
          </div>
          <p className="text-[10px] text-muted-foreground/80 sm:text-[11px]">
            © 2025 Gestão Financeira. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  )
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function AuthDivider() {
  return (
    <div className="relative my-4 sm:my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">ou</span>
      </div>
    </div>
  )
}
