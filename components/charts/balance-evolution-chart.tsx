"use client"

import { motion } from "framer-motion"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { useCashFlowByMonth } from "@/lib/finance-store"
import { formatCurrency, monthLabel } from "@/lib/format"

export function BalanceEvolutionChart() {
  const data = useCashFlowByMonth().map((d) => ({
    label: monthLabel(d.month),
    saldo: d.saldo,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="finance-card h-full"
    >
      <h2 className="text-base font-semibold text-card-foreground">
        Evolução do saldo
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">Tendência mensal</p>
      <div className="chart-vibrant h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--popover)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="var(--chart-2)"
              strokeWidth={2.5}
              fill="url(#gSaldo)"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
