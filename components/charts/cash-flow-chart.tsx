"use client"

import { motion } from "framer-motion"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { useCashFlowByMonth } from "@/lib/finance-store"
import { formatCurrency, monthLabel } from "@/lib/format"

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-popover-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 tabular-nums">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-medium text-popover-foreground">
            {formatCurrency(p.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

export function CashFlowChart() {
  const data = useCashFlowByMonth().map((d) => ({
    ...d,
    label: monthLabel(d.month),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="finance-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">
            Fluxo de caixa
          </h2>
          <p className="text-sm text-muted-foreground">
            Receitas, despesas e saldo mês a mês
          </p>
        </div>
      </div>
      <div className="chart-vibrant h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            barGap={4}
            barCategoryGap="18%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
            />
            <Bar
              dataKey="receita"
              name="Receitas"
              fill="var(--chart-2)"
              stroke="var(--chart-2)"
              strokeWidth={0.5}
              radius={[6, 6, 0, 0]}
              barSize={16}
              animationDuration={900}
            />
            <Bar
              dataKey="despesa"
              name="Despesas"
              fill="var(--chart-3)"
              stroke="var(--chart-3)"
              strokeWidth={0.5}
              radius={[6, 6, 0, 0]}
              barSize={16}
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke="var(--chart-1)"
              strokeWidth={3}
              dot={{
                r: 5,
                fill: "var(--chart-1)",
                stroke: "color-mix(in oklch, var(--chart-1) 40%, var(--card))",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--chart-1)",
                stroke: "color-mix(in oklch, var(--chart-1) 50%, var(--card))",
                strokeWidth: 2,
              }}
              animationDuration={1100}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
