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

function FeatureItem({
  icon: Icon,
  title,
  description,
  lightIconBg,
  darkIconBg,
}: (typeof FEATURES)[number]) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div
        className={cn(
          "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:mb-2 sm:h-11 sm:w-11",
          lightIconBg,
          darkIconBg,
        )}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <h3 className="text-[11px] font-semibold text-foreground sm:text-sm">{title}</h3>
      <p className="mt-0.5 px-0.5 text-[9px] leading-tight text-muted-foreground sm:mt-1 sm:px-0 sm:text-xs sm:leading-snug">
        {description}
      </p>
    </div>
  )
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="auth-page relative flex h-[100dvh] flex-col overflow-hidden bg-background">
      <div className="auth-page-bg pointer-events-none absolute inset-0" aria-hidden />

      <div className="auth-topbar absolute right-0 top-0 z-20 flex justify-end px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-6 sm:pt-4">
        <AuthThemeSwitch />
      </div>

      <div
        className={cn(
          "auth-shell relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:min-h-screen sm:max-h-none sm:overflow-visible sm:pb-10 sm:pt-20",
          className,
        )}
      >
        <header className="auth-header mb-2.5 flex shrink-0 flex-col items-center text-center sm:mb-8">
          <AppLogo size="lg" className="mb-4 sm:hidden" />
          <AppLogo size="xl" className="mb-5 hidden sm:block" />
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            <span className="text-[#1e3a8a] dark:text-white">Gestão </span>
            <span className="text-[#1e3a8a] dark:bg-gradient-to-r dark:from-emerald-400 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
              Financeira
            </span>
          </h1>
          <p className="mx-auto mt-1 max-w-[20rem] text-xs leading-snug text-muted-foreground sm:mt-2 sm:max-w-none sm:text-base">
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

        <section className="auth-features mb-2.5 grid shrink-0 grid-cols-3 gap-1.5 sm:mb-8 sm:gap-4">
          {FEATURES.map((feature) => (
            <FeatureItem key={feature.title} {...feature} />
          ))}
        </section>

        <div className="auth-card-wrap min-h-0 shrink-0">{children}</div>

        <footer className="auth-footer mt-2.5 shrink-0 pb-1 text-center sm:mt-8 sm:pb-0">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 sm:gap-2 sm:text-xs">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Seus dados estão 100% protegidos</span>
          </div>
          <p className="mt-1 hidden text-[11px] text-muted-foreground/80 sm:block">
            © 2025 Gestão Financeira. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  )
}
