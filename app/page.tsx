"use client"

import { Loader2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AuthScreen } from "@/components/auth-screen"
import { useAuth } from "@/lib/auth-store"
import { FinanceProvider } from "@/lib/finance-store"

export default function Page() {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <FinanceProvider>
      <AppShell />
    </FinanceProvider>
  )
}
