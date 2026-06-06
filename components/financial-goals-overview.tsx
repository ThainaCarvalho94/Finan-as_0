"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Laptop, Plane, Vault } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PiggyBanksSection } from "@/components/piggy-banks-section"
import { useFinance } from "@/lib/finance-store"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const GOAL_STYLES: { Icon: LucideIcon; color: string }[] = [
  { Icon: Vault, color: "var(--chart-2)" },
  { Icon: Plane, color: "var(--chart-1)" },
  { Icon: Laptop, color: "var(--chart-5)" },
]

function GoalItem({
  name,
  saved,
  goal,
  index,
}: {
  name: string
  saved: number
  goal: number
  index: number
}) {
  const { Icon, color } = GOAL_STYLES[index % GOAL_STYLES.length]
  const progress = goal > 0 ? Math.min(1, saved / goal) : 0
  const pct = Math.round(progress * 100)

  return (
    <div className="min-w-0 flex-1 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} var(--accent-ring-mix), transparent)`,
            color,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-card-foreground">
            {name}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatCurrency(saved)} / {formatCurrency(goal)}
          </p>
        </div>
        <span
          className="shrink-0 text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export function FinancialGoalsOverview() {
  const { piggyBanks } = useFinance()
  const [expanded, setExpanded] = useState(false)
  const preview = piggyBanks.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="finance-card"
    >
      <div className="mb-5 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-card-foreground">
          Metas financeiras
        </h2>
        {piggyBanks.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {expanded ? "Ver menos" : "Ver todas"}
          </button>
        )}
      </div>

      {preview.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma meta cadastrada. Crie um cofrinho para acompanhar seus objetivos.
        </p>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-6",
            preview.length > 1 && "lg:flex-row lg:gap-8",
          )}
        >
          {preview.map((goal, i) => (
            <GoalItem
              key={goal.id}
              name={goal.name}
              saved={goal.saved}
              goal={goal.goal}
              index={i}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-6 border-t border-border pt-6">
              <PiggyBanksSection />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
