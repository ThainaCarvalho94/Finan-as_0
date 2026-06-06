"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, type CSSProperties } from "react"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  type LucideIcon,
} from "lucide-react"
import { ResponsiveContainer, LineChart, Line } from "recharts"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

type StatVariant = "receita" | "despesa" | "saldo" | "economia"

const CONFIG: Record<
  StatVariant,
  { label: string; icon: LucideIcon; accent: string; chartColor: string }
> = {
  receita: {
    label: "Receitas",
    icon: TrendingUp,
    accent: "text-[var(--chart-2)]",
    chartColor: "var(--chart-2)",
  },
  despesa: {
    label: "Despesas",
    icon: TrendingDown,
    accent: "text-[var(--chart-3)]",
    chartColor: "var(--chart-3)",
  },
  saldo: {
    label: "Saldo",
    icon: Wallet,
    accent: "text-[var(--chart-1)]",
    chartColor: "var(--chart-1)",
  },
  economia: {
    label: "Taxa de economia",
    icon: Percent,
    accent: "text-[var(--chart-5)]",
    chartColor: "var(--chart-5)",
  },
}

function AnimatedValue({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => formatCurrency(v))

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.1,
      ease: "easeOut",
    })
    return controls.stop
  }, [value, count])

  return <motion.span>{rounded}</motion.span>
}

function MiniSparkline({
  data,
  color,
}: {
  data: number[]
  color: string
}) {
  if (data.length < 2) return null
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StatCard({
  variant,
  value,
  delta,
  index = 0,
  sparkline,
  formatValue,
}: {
  variant: StatVariant
  value: number
  delta?: number
  index?: number
  sparkline?: number[]
  formatValue?: (v: number) => string
}) {
  const config = CONFIG[variant]
  const Icon = config.icon
  const display =
    formatValue?.(value) ??
    (variant === "economia" ? `${value.toFixed(1)}%` : null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="finance-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="stat-icon-badge flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ "--stat-accent": config.chartColor } as CSSProperties}
          >
            <Icon className={cn("h-[18px] w-[18px]", config.accent)} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {config.label}
          </span>
        </div>
        {sparkline && (
          <MiniSparkline data={sparkline} color={config.chartColor} />
        )}
      </div>
      <p
        className={cn(
          "mt-4 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
          variant === "saldo" && value < 0 ? "text-destructive" : "text-card-foreground",
        )}
      >
        {display ?? <AnimatedValue value={value} />}
      </p>
      {typeof delta === "number" && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <span
            className={cn(
              "font-semibold",
              delta >= 0 ? "text-[var(--chart-2)]" : "text-[var(--chart-3)]",
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          vs. mês anterior
        </p>
      )}
    </motion.div>
  )
}
