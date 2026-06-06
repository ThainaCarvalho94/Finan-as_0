"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { formatCurrency } from "@/lib/format"

const TRACK_COLOR =
  "color-mix(in oklch, var(--chart-2) var(--gauge-track-mix), var(--muted))"

export function IncomeExpenseGauge({
  receita,
  despesa,
  saldo,
}: {
  receita: number
  despesa: number
  saldo: number
}) {
  const { receitaPct, despesaPct, segments } = useMemo(() => {
    const total = receita + despesa
    if (total === 0) {
      return {
        receitaPct: 50,
        despesaPct: 50,
        segments: [
          { name: "Receitas", value: 50, color: "var(--chart-2)" },
          { name: "Despesas", value: 50, color: "var(--chart-3)" },
        ],
      }
    }
    const receitaPct = (receita / total) * 100
    const despesaPct = (despesa / total) * 100
    return {
      receitaPct,
      despesaPct,
      segments: [
        { name: "Receitas", value: receitaPct, color: "var(--chart-2)" },
        { name: "Despesas", value: despesaPct, color: "var(--chart-3)" },
      ],
    }
  }, [receita, despesa])

  const pieProps = {
    cx: "50%",
    cy: "88%",
    startAngle: 180,
    endAngle: 0,
    innerRadius: 62,
    outerRadius: 82,
    dataKey: "value" as const,
    stroke: "none",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.22 }}
      className="finance-card flex h-full flex-col"
    >
      <h2 className="text-base font-semibold text-card-foreground">
        Receitas vs Despesas
      </h2>
      <p className="mb-2 text-sm text-muted-foreground">Proporção do período</p>

      <div className="relative mx-auto w-full max-w-[220px] flex-1">
        <div className="chart-vibrant h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: 100 }]}
                {...pieProps}
                isAnimationActive={false}
              >
                <Cell fill={TRACK_COLOR} />
              </Pie>
              <Pie
                data={segments}
                {...pieProps}
                paddingAngle={3}
                cornerRadius={4}
                animationDuration={900}
              >
                {segments.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Saldo</span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: saldo >= 0 ? "var(--chart-2)" : "var(--chart-3)" }}
          >
            {formatCurrency(saldo)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-6 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="chart-legend-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--chart-2)] text-[var(--chart-2)]" />
          Receitas {receitaPct.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="chart-legend-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--chart-3)] text-[var(--chart-3)]" />
          Despesas {despesaPct.toFixed(0)}%
        </span>
      </div>
    </motion.div>
  )
}
