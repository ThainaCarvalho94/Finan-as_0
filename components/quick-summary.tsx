"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeftRight,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useFinance } from "@/lib/finance-store"
import { formatCurrency } from "@/lib/format"

const ITEM_STYLES: { Icon: LucideIcon; color: string }[] = [
  { Icon: TrendingUp, color: "var(--chart-2)" },
  { Icon: TrendingDown, color: "var(--chart-3)" },
  { Icon: ArrowLeftRight, color: "var(--chart-1)" },
  { Icon: Receipt, color: "var(--chart-5)" },
]

const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

function currentMonthKey() {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  return `${now.getFullYear()}-${m}`
}

export function QuickSummary() {
  const { transactions, categories } = useFinance()
  const monthKey = currentMonthKey()

  const stats = useMemo(() => {
    const filtered = transactions.filter((t) => t.date.startsWith(monthKey))

    const receitasByDay = new Map<string, number>()
    let maiorDespesa = { label: "—", amount: 0 }

    for (const t of filtered) {
      if (t.type === "receita") {
        receitasByDay.set(t.date, (receitasByDay.get(t.date) ?? 0) + t.amount)
      }
      if (t.type === "despesa" && t.amount > maiorDespesa.amount) {
        const cat = categories.find((c) => c.id === t.categoryId)?.name
        maiorDespesa = {
          label: cat || t.description,
          amount: t.amount,
        }
      }
    }

    let melhorDia = { date: "—", amount: 0 }
    for (const [date, amount] of receitasByDay) {
      if (amount > melhorDia.amount) melhorDia = { date, amount }
    }

    const [, m, d] = melhorDia.date.split("-").map(Number)
    const melhorDiaLabel =
      melhorDia.date !== "—"
        ? `${d} ${MONTHS_SHORT[m - 1]}`
        : "—"

    const totalAmount = filtered.reduce((s, t) => s + t.amount, 0)
    const ticketMedio = filtered.length > 0 ? totalAmount / filtered.length : 0

    return [
      {
        label: "Melhor dia",
        value: melhorDiaLabel,
        sub:
          melhorDia.amount > 0 ? formatCurrency(melhorDia.amount) : "—",
      },
      {
        label: "Maior despesa",
        value: maiorDespesa.amount > 0 ? maiorDespesa.label : "—",
        sub:
          maiorDespesa.amount > 0 ? formatCurrency(maiorDespesa.amount) : "—",
      },
      {
        label: "Transações",
        value: String(filtered.length),
        sub: "Este mês",
      },
      {
        label: "Ticket médio",
        value: filtered.length > 0 ? formatCurrency(ticketMedio) : "—",
        sub: "Este mês",
      },
    ]
  }, [transactions, categories, monthKey])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.32 }}
      className="finance-card h-full"
    >
      <h2 className="mb-5 text-base font-semibold text-card-foreground">
        Resumo rápido
      </h2>
      <div className="space-y-4">
        {stats.map((s, i) => {
          const { Icon, color } = ITEM_STYLES[i]
          return (
            <div key={s.label} className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in oklch, ${color} var(--accent-ring-mix), transparent)`,
                  color,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="truncate text-sm font-bold text-card-foreground">
                  {s.value}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {s.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
