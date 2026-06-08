"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PiggyBank } from "lucide-react"
import { AddPiggyBankCard } from "@/components/piggy-bank-card"
import { PiggyBanksSection } from "@/components/piggy-banks-section"
import { useFinance } from "@/lib/finance-store"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const GOAL_COLOR = "var(--chart-4)"

function GoalItem({
  id,
  name,
  saved,
  goal,
  onEdit,
}: {
  id: string
  name: string
  saved: number
  goal: number
  onEdit: (id: string) => void
}) {
  const progress = goal > 0 ? Math.min(1, saved / goal) : 0
  const pct = Math.round(progress * 100)
  const needsGoal = goal <= 0

  return (
    <button
      type="button"
      onClick={() => onEdit(id)}
      className="min-w-0 flex-1 space-y-3 rounded-xl text-left touch-manipulation transition-colors hover:bg-[color-mix(in_oklch,var(--chart-4)_6%,transparent)] active:bg-[color-mix(in_oklch,var(--chart-4)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-4)]"
      aria-label={needsGoal ? `Definir meta de ${name}` : `Editar meta de ${name}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklch, ${GOAL_COLOR} var(--accent-ring-mix), transparent)`,
            color: GOAL_COLOR,
          }}
        >
          <PiggyBank className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-card-foreground">
            {name}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {needsGoal
              ? `${formatCurrency(saved)} · meta não definida`
              : `${formatCurrency(saved)} / ${formatCurrency(goal)}`}
          </p>
        </div>
        <span
          className="shrink-0 text-sm font-bold tabular-nums"
          style={{ color: GOAL_COLOR }}
        >
          {needsGoal ? "Definir" : `${pct}%`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: GOAL_COLOR }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </button>
  )
}

function GoalsManagement({
  editGoalId,
  onEditGoalHandled,
}: {
  editGoalId: string | null
  onEditGoalHandled: () => void
}) {
  const { piggyBanks } = useFinance()

  if (piggyBanks.length > 0) {
    return (
      <PiggyBanksSection
        editGoalId={editGoalId}
        onEditGoalHandled={onEditGoalHandled}
      />
    )
  }

  return <AddPiggyBankCard />
}

export function FinancialGoalsOverview() {
  const { piggyBanks } = useFinance()
  const needsSetup = piggyBanks.some((p) => p.goal <= 0)
  const [expanded, setExpanded] = useState(needsSetup)
  const [editGoalId, setEditGoalId] = useState<string | null>(null)
  const preview = piggyBanks.slice(0, 3)

  useEffect(() => {
    if (piggyBanks.length === 0 || needsSetup) {
      setExpanded(true)
    }
  }, [piggyBanks.length, needsSetup])

  const handleEditGoal = (id: string) => {
    setEditGoalId(id)
    setExpanded(true)
  }

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
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="hidden text-sm font-medium text-primary transition-colors hover:text-primary/80 md:inline"
        >
          {expanded ? "Ver menos" : piggyBanks.length > 0 ? "Gerenciar" : "Criar meta"}
        </button>
      </div>

      {/* Mobile: cards de edição sempre visíveis */}
      <div className="md:hidden">
        <GoalsManagement
          editGoalId={editGoalId}
          onEditGoalHandled={() => setEditGoalId(null)}
        />
      </div>

      {/* Desktop: resumo + seção expansível */}
      <div className="hidden md:block">
        {preview.length === 0 && !expanded ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma meta cadastrada. Crie um cofrinho para acompanhar seus objetivos.
          </p>
        ) : preview.length > 0 ? (
          <div
            className={cn(
              "flex flex-col gap-6",
              preview.length > 1 && "lg:flex-row lg:gap-8",
            )}
          >
            {preview.map((goal) => (
              <GoalItem
                key={goal.id}
                id={goal.id}
                name={goal.name}
                saved={goal.saved}
                goal={goal.goal}
                onEdit={handleEditGoal}
              />
            ))}
          </div>
        ) : null}

        {expanded && (
          <div className="mt-6 border-t border-border pt-6">
            <GoalsManagement
              editGoalId={editGoalId}
              onEditGoalHandled={() => setEditGoalId(null)}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
