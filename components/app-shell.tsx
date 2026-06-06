"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  User,
  LogOut,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { UserAvatar } from "@/components/user-avatar"
import { useCashFlowByMonth } from "@/lib/finance-store"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DashboardView } from "@/components/views/dashboard-view"
import { TransactionsView } from "@/components/views/transactions-view"
import { CategoriesView } from "@/components/views/categories-view"
import { ProfileView } from "@/components/views/profile-view"

type View = "dashboard" | "transactions" | "categories" | "profile"

const NAV: { id: View; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Início", icon: LayoutDashboard },
  { id: "transactions", label: "Transações", shortLabel: "Lançar", icon: ArrowLeftRight },
  { id: "categories", label: "Categorias", shortLabel: "Categorias", icon: Tags },
  { id: "profile", label: "Perfil", shortLabel: "Perfil", icon: User },
]

export function AppShell() {
  const { profile, signOut } = useAuth()
  const [view, setView] = useState<View>("dashboard")
  const flow = useCashFlowByMonth()
  const current = flow[flow.length - 1]

  const currentNav = useMemo(
    () => NAV.find((item) => item.id === view) ?? NAV[0],
    [view],
  )

  const monthSummary = useMemo(() => {
    if (!current) return null
    const saldo = current.saldo
    const inProfit = saldo >= 0
    return {
      saldo,
      message: inProfit
        ? "Você está no lucro! Continue assim 🚀"
        : "Atenção ao saldo deste mês",
    }
  }, [current])

  return (
    <div className="app-shell min-h-screen bg-background lg:flex">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-sidebar p-5 lg:flex">
        {profile && (
          <div className="mb-8 flex items-center gap-3 px-2">
            <UserAvatar
              userId={profile.id}
              fullName={profile.fullName}
              size="md"
              editable
              variant="sidebar"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-sidebar-foreground">
                {profile.fullName || "Usuário"}
              </p>
              <p className="text-xs text-sidebar-foreground/55">Controle financeiro</p>
            </div>
          </div>
        )}
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="nav-active-glow absolute inset-0 rounded-xl bg-sidebar-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className="relative h-[18px] w-[18px]" />
                <span className="relative">{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-sidebar-border pt-4">
          {monthSummary && (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
                <TrendingUp className="h-3.5 w-3.5 text-sidebar-primary" />
                Resumo do mês
              </div>
              <p className="text-xs leading-relaxed text-sidebar-foreground/80">
                {monthSummary.message}
              </p>
            </div>
          )}
          {profile && (
            <button
              type="button"
              onClick={() => setView("profile")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
            >
              <UserAvatar
                userId={profile.id}
                fullName={profile.fullName}
                size="md"
                variant="sidebar"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {profile.fullName || "Usuário"}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/55">
                  {profile.email}
                </p>
              </div>
            </button>
          )}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => signOut()}
            >
              <LogOut />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:min-h-0">
        {/* Mobile header */}
        <header className="mobile-app-header sticky top-0 z-30 border-b border-sidebar-border bg-sidebar lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            {profile && (
              <button
                type="button"
                onClick={() => setView("profile")}
                className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary"
                aria-label="Abrir perfil"
              >
                <UserAvatar
                  userId={profile.id}
                  fullName={profile.fullName}
                  size="sm"
                  variant="sidebar"
                />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/50">
                Gestão Financeira
              </p>
              <p className="truncate text-base font-semibold text-sidebar-foreground">
                {currentNav.label}
              </p>
            </div>
            <ThemeToggle compact className="shrink-0 text-sidebar-foreground/70" />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => signOut()}
              aria-label="Sair da conta"
              className="shrink-0 text-sidebar-foreground/70 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="mobile-app-main flex-1 bg-background px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {view === "dashboard" && <DashboardView />}
              {view === "transactions" && <TransactionsView />}
              {view === "categories" && <CategoriesView />}
              {view === "profile" && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-md lg:hidden"
          aria-label="Navegação principal"
        >
          <div className="grid grid-cols-4 gap-1 px-2 pt-2">
            {NAV.map((item) => {
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={cn(
                    "mobile-nav-item flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors",
                    active
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/55 hover:text-sidebar-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                      active && "bg-sidebar-primary/15",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="max-w-full truncate text-[10px] font-medium leading-none">
                    {item.shortLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
