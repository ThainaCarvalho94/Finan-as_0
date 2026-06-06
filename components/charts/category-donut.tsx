"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { useFinance } from "@/lib/finance-store"
import { formatCurrency } from "@/lib/format"

export function CategoryDonut() {
  const { transactions, categories } = useFinance()

  const data = useMemo(() => {
    const totals = new Map<string, number>()
    for (const t of transactions) {
      if (t.type !== "despesa") continue
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
    }
    return categories
      .filter((c) => c.type === "despesa" && totals.has(c.id))
      .map((c) => ({ name: c.name, value: totals.get(c.id) ?? 0, color: c.color }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.18 }}
      className="finance-card overflow-hidden"
    >
      <h2 className="text-base font-semibold text-card-foreground">
        Despesas por categoria
      </h2>
      <p className="mb-2 text-sm text-muted-foreground">Distribuição total</p>
      <div className="flex min-w-0 flex-col items-center gap-4">
        <div className="chart-vibrant relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                stroke="var(--card)"
                strokeWidth={2}
                animationDuration={900}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--popover)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-bold tabular-nums text-card-foreground">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
        <ul className="w-full min-w-0 space-y-2">
          {data.map((d, i) => (
            <motion.li
              key={d.name}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex min-w-0 items-center justify-between gap-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 text-card-foreground">
                <span
                  className="chart-legend-dot inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color, color: d.color }}
                />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="shrink-0 text-right tabular-nums text-muted-foreground">
                <span className="block text-xs font-medium text-card-foreground">
                  {formatCurrency(d.value)}
                </span>
                <span className="block text-[11px]">
                  {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
