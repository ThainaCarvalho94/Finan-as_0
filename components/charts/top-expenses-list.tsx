"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useFinance } from "@/lib/finance-store"
import { formatCurrency } from "@/lib/format"

export function TopExpensesList({ monthKey }: { monthKey?: string }) {
  const { transactions, categories } = useFinance()

  const data = useMemo(() => {
    const totals = new Map<string, number>()
    for (const t of transactions) {
      if (t.type !== "despesa") continue
      if (monthKey) {
        const key = t.date.slice(0, 7)
        if (key !== monthKey) continue
      }
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
    }
    const items = categories
      .filter((c) => c.type === "despesa" && totals.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        value: totals.get(c.id) ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
    const max = items[0]?.value ?? 1
    return items.map((item) => ({ ...item, pct: (item.value / max) * 100 }))
  }, [transactions, categories, monthKey])

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.24 }}
      className="h-full rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold text-card-foreground">Top despesas</h2>
      <p className="mb-4 text-sm text-muted-foreground">Maiores categorias</p>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma despesa registrada.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((d, i) => (
            <motion.li
              key={d.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 + i * 0.04 }}
            >
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-card-foreground">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.name}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(d.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                />
              </div>
              <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}% do total
              </p>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
