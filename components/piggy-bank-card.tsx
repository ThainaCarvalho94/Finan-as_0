"use client"

import { useEffect, useState } from "react"
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion"
import { PiggyBank, Plus, Minus, Target, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useFinance } from "@/lib/finance-store"
import { formatCurrency } from "@/lib/format"
import type { PiggyBank as PiggyBankType } from "@/lib/types"

function AnimatedCurrency({ value }: { value: number }) {
  const count = useMotionValue(0)
  const text = useTransform(count, (v) => formatCurrency(v))
  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: "easeOut" })
    return controls.stop
  }, [value, count])
  return <motion.span>{text}</motion.span>
}

function ProgressRing({
  progress,
  goal,
  onEditGoal,
}: {
  progress: number
  goal: number
  onEditGoal?: () => void
}) {
  const size = 180
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, progress))
  const needsGoal = goal <= 0

  const inner = (
    <>
      <PiggyBank className="mb-1 h-6 w-6 text-[var(--chart-4)]" />
      {needsGoal ? (
        <span className="text-center text-sm font-semibold text-[var(--chart-4)]">
          Definir meta
        </span>
      ) : (
        <motion.span
          key={Math.round(clamped * 100)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl font-bold tabular-nums text-card-foreground"
        >
          {Math.round(clamped * 100)}%
        </motion.span>
      )}
      <span className="text-xs text-muted-foreground">
        {needsGoal ? "toque para começar" : "da meta"}
      </span>
    </>
  )

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="color-mix(in oklch, var(--chart-4) 22%, transparent)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--chart-4)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      {onEditGoal ? (
        <button
          type="button"
          onClick={onEditGoal}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full touch-manipulation transition-colors hover:bg-[color-mix(in_oklch,var(--chart-4)_8%,transparent)] active:bg-[color-mix(in_oklch,var(--chart-4)_12%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-4)]"
          aria-label={needsGoal ? "Definir meta do cofrinho" : "Editar meta do cofrinho"}
        >
          {inner}
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {inner}
        </div>
      )}
    </div>
  )
}

type PiggyBankCardProps = {
  piggyBank: PiggyBankType
  index?: number
  canDelete?: boolean
  autoOpenGoal?: boolean
  onAutoOpenGoalHandled?: () => void
}

export function PiggyBankCard({
  piggyBank,
  index = 0,
  canDelete = true,
  autoOpenGoal = false,
  onAutoOpenGoalHandled,
}: PiggyBankCardProps) {
  const { updatePiggyBank, deletePiggyBank, depositPiggy, withdrawPiggy } =
    useFinance()
  const remaining = Math.max(0, piggyBank.goal - piggyBank.saved)
  const progress = piggyBank.goal > 0 ? piggyBank.saved / piggyBank.goal : 0
  const reached = remaining === 0 && piggyBank.goal > 0

  const [nameOpen, setNameOpen] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveMode, setMoveMode] = useState<"deposit" | "withdraw">("deposit")
  const [nameInput, setNameInput] = useState(piggyBank.name)
  const [goalInput, setGoalInput] = useState(String(piggyBank.goal))
  const [amountInput, setAmountInput] = useState("")

  const openMove = (mode: "deposit" | "withdraw") => {
    setMoveMode(mode)
    setAmountInput("")
    setMoveOpen(true)
  }

  const openGoal = () => {
    setGoalInput(String(piggyBank.goal))
    setGoalOpen(true)
  }

  useEffect(() => {
    if (!autoOpenGoal) return
    setGoalInput(String(piggyBank.goal))
    setGoalOpen(true)
    onAutoOpenGoalHandled?.()
  }, [autoOpenGoal, onAutoOpenGoalHandled, piggyBank.goal])

  const confirmName = () => {
    const name = nameInput.trim()
    if (!name) {
      toast.error("Informe um nome para o cofrinho.")
      return
    }
    updatePiggyBank(piggyBank.id, { name })
    setNameOpen(false)
  }

  const confirmGoal = () => {
    const v = Number(goalInput.replace(",", "."))
    if (Number.isNaN(v) || v < 0) {
      toast.error("Informe um valor válido para a meta.")
      return
    }
    updatePiggyBank(piggyBank.id, { goal: v })
    setGoalOpen(false)
  }

  const confirmMove = () => {
    const v = Number(amountInput.replace(",", "."))
    if (Number.isNaN(v) || v <= 0) {
      toast.error("Informe um valor maior que zero.")
      return
    }
    if (moveMode === "deposit") depositPiggy(piggyBank.id, v)
    else withdrawPiggy(piggyBank.id, v)
    setMoveOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--chart-4)_15%,transparent)]">
            <PiggyBank className="h-[18px] w-[18px] text-[var(--chart-4)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-semibold text-card-foreground">
                {piggyBank.name}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground"
                onClick={() => {
                  setNameInput(piggyBank.name)
                  setNameOpen(true)
                }}
                aria-label="Renomear cofrinho"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Meta de poupança</p>
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto sm:gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 gap-1.5 rounded-xl sm:h-8 sm:flex-none"
            onClick={openGoal}
          >
            <Target className="h-3.5 w-3.5" />
            {piggyBank.goal > 0 ? "Meta" : "Definir meta"}
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => deletePiggyBank(piggyBank.id)}
              aria-label="Excluir cofrinho"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
        <ProgressRing progress={progress} goal={piggyBank.goal} onEditGoal={openGoal} />

        <div className="flex-1 space-y-3 self-stretch">
          <div className="rounded-xl bg-[color-mix(in_oklch,var(--chart-4)_10%,transparent)] p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Guardado
            </p>
            <p className="text-xl font-bold tabular-nums text-[var(--chart-4)]">
              <AnimatedCurrency value={piggyBank.saved} />
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openGoal}
              className="rounded-xl bg-secondary p-3 text-left transition-colors hover:bg-[color-mix(in_oklch,var(--chart-4)_12%,var(--secondary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-4)]"
              aria-label="Editar meta do cofrinho"
            >
              <p className="text-xs font-medium text-muted-foreground">Meta</p>
              <p className="text-sm font-semibold tabular-nums text-card-foreground">
                {piggyBank.goal > 0
                  ? formatCurrency(piggyBank.goal)
                  : "Definir meta"}
              </p>
            </button>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {reached ? "Status" : "Falta"}
              </p>
              <p
                className="text-sm font-semibold tabular-nums"
                style={{
                  color: reached ? "var(--chart-2)" : "var(--chart-3)",
                }}
              >
                {reached ? "Concluída!" : formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          variant="cta"
          className="h-9 gap-1.5 rounded-xl"
          onClick={() => openMove("deposit")}
        >
          <Plus className="h-4 w-4" />
          Guardar
        </Button>
        <Button
          variant="outline"
          className="gap-1.5"
          onClick={() => openMove("withdraw")}
          disabled={piggyBank.saved <= 0}
        >
          <Minus className="h-4 w-4" />
          Resgatar
        </Button>
      </div>

      <Dialog open={nameOpen} onOpenChange={setNameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Renomear cofrinho</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="piggy-name">Nome</Label>
            <Input
              id="piggy-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: Viagem, Carro novo..."
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNameOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmName} variant="cta" className="h-9 rounded-xl px-4">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Definir meta — {piggyBank.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="piggy-goal">Quanto você quer guardar?</Label>
            <Input
              id="piggy-goal"
              inputMode="decimal"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="0,00"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmGoal} variant="cta" className="h-9 rounded-xl px-4">
              Salvar meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {moveMode === "deposit"
                ? `Guardar em ${piggyBank.name}`
                : `Resgatar de ${piggyBank.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="piggy-amount">Valor</Label>
            <Input
              id="piggy-amount"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0,00"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmMove}
              variant={moveMode === "deposit" ? "cta" : "outline"}
              className="h-9 rounded-xl px-4"
            >
              {moveMode === "deposit" ? "Guardar" : "Resgatar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export function AddPiggyBankCard({ index = 0 }: { index?: number }) {
  const { addPiggyBank } = useFinance()
  const [open, setOpen] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [goalInput, setGoalInput] = useState("")

  const confirm = () => {
    const name = nameInput.trim()
    if (!name) {
      toast.error("Informe um nome para o cofrinho.")
      return
    }
    const goal = goalInput ? Number(goalInput.replace(",", ".")) : 0
    if (goalInput && (Number.isNaN(goal) || goal < 0)) {
      toast.error("Informe um valor válido para a meta.")
      return
    }
    addPiggyBank({ name, goal })
    setNameInput("")
    setGoalInput("")
    setOpen(false)
  }

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-[var(--sidebar-primary)] hover:bg-[color-mix(in_oklch,var(--sidebar-primary)_8%,transparent)] hover:text-[var(--sidebar-primary)]"
      >
        <Plus className="h-5 w-5" />
        Novo cofrinho
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo cofrinho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-piggy-name">Nome</Label>
              <Input
                id="new-piggy-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: Viagem, Reserva de emergência..."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-piggy-goal">Meta (opcional)</Label>
              <Input
                id="new-piggy-goal"
                inputMode="decimal"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirm} variant="cta" className="h-9 rounded-xl px-4">
              Criar cofrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
