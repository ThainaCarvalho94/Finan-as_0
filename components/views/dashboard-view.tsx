"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { StatCard } from "@/components/stat-card"
import { CashFlowChart } from "@/components/charts/cash-flow-chart"
import { CategoryDonut } from "@/components/charts/category-donut"
import { BalanceEvolutionChart } from "@/components/charts/balance-evolution-chart"
import { IncomeExpenseGauge } from "@/components/charts/income-expense-gauge"
import { TopExpensesList } from "@/components/charts/top-expenses-list"
import { QuickSummary } from "@/components/quick-summary"
import { FinancialGoalsOverview } from "@/components/financial-goals-overview"
import { useTotals, useCashFlowByMonth, useFinance } from "@/lib/finance-store"
import { formatCurrency, formatDate } from "@/lib/format"

function savingsRate(receita: number, despesa: number) {
  if (receita <= 0) return 0
  return ((receita - despesa) / receita) * 100
}

export function DashboardView() {
  const totals = useTotals()
  const flow = useCashFlowByMonth()
  const { transactions, categories } = useFinance()

  const current = useMemo(() => flow[flow.length - 1], [flow])

  const previous = useMemo(() => {
    if (!current) return undefined
    const idx = flow.findIndex((m) => m.key === current.key)
    return idx > 0 ? flow[idx - 1] : undefined
  }, [flow, current])

  const deltaPct = (cur?: number, prev?: number) => {
    if (!prev || !cur) return undefined
    return ((cur - prev) / prev) * 100
  }

  const receita = current?.receita ?? totals.receita
  const despesa = current?.despesa ?? totals.despesa
  const saldo = current?.saldo ?? totals.saldo
  const economia = savingsRate(receita, despesa)
  const prevEconomia = previous
    ? savingsRate(previous.receita, previous.despesa)
    : undefined

  const sparkReceita = flow.map((m) => m.receita)
  const sparkDespesa = flow.map((m) => m.despesa)
  const sparkSaldo = flow.map((m) => m.saldo)
  const sparkEconomia = flow.map((m) => savingsRate(m.receita, m.despesa))

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—"
  const catColor = (id: string) =>
    categories.find((c) => c.id === id)?.color ?? "#999"

  const recent = useMemo(() => transactions.slice(0, 6), [transactions])

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground text-balance sm:text-2xl">
          Dashboard financeiro
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Visão geral da sua vida financeira · todo o histórico
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          variant="receita"
          value={receita}
          delta={deltaPct(current?.receita, previous?.receita)}
          sparkline={sparkReceita}
          index={0}
        />
        <StatCard
          variant="despesa"
          value={despesa}
          delta={deltaPct(current?.despesa, previous?.despesa)}
          sparkline={sparkDespesa}
          index={1}
        />
        <StatCard
          variant="saldo"
          value={saldo}
          delta={deltaPct(current?.saldo, previous?.saldo)}
          sparkline={sparkSaldo}
          index={2}
        />
        <StatCard
          variant="economia"
          value={economia}
          delta={
            prevEconomia !== undefined
              ? economia - prevEconomia
              : undefined
          }
          sparkline={sparkEconomia}
          index={3}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-4">
          <CategoryDonut />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BalanceEvolutionChart />
        <IncomeExpenseGauge
          receita={receita}
          despesa={despesa}
          saldo={saldo}
        />
        <TopExpensesList />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="finance-card"
      >
        <h2 className="mb-4 text-base font-semibold text-card-foreground">
          Transações recentes
        </h2>
        <ul className="divide-y divide-border">
          {recent.length === 0 ? (
            <li className="py-4 text-sm text-muted-foreground">
              Nenhuma transação neste período.
            </li>
          ) : (
            recent.map((t, i) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-3 py-3"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${catColor(t.categoryId)} var(--category-tint-mix), transparent)`,
                    color: catColor(t.categoryId),
                  }}
                >
                  {catName(t.categoryId).slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {t.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {catName(t.categoryId)} · {formatDate(t.date)}
                  </p>
                </div>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{
                    color:
                      t.type === "receita"
                        ? "var(--chart-2)"
                        : "var(--chart-3)",
                  }}
                >
                  {t.type === "receita" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </span>
              </motion.li>
            ))
          )}
        </ul>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <FinancialGoalsOverview />
        </div>
        <div className="lg:col-span-4">
          <QuickSummary />
        </div>
      </div>
    </div>
  )
}
