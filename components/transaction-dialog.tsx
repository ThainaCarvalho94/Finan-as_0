"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useFinance } from "@/lib/finance-store"
import type { Transaction, TransactionType } from "@/lib/types"
import { cn } from "@/lib/utils"

const today = () => new Date().toISOString().slice(0, 10)

export function TransactionDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: Transaction | null
}) {
  const { categories, addTransaction, updateTransaction } = useFinance()
  const [type, setType] = useState<TransactionType>("despesa")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(today())
  const [tag, setTag] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type)
        setDescription(editing.description)
        setCategoryId(editing.categoryId)
        setAmount(String(editing.amount))
        setDate(editing.date)
        setTag(editing.tag)
      } else {
        setType("despesa")
        setDescription("")
        setCategoryId(null)
        setAmount("")
        setDate(today())
        setTag("")
      }
    }
  }, [open, editing])

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedAmount = Number(amount)
    const payload = {
      description: description.trim(),
      categoryId: categoryId ?? "",
      amount: parsedAmount,
      date,
      tag: tag.trim(),
      type,
    }

    if (!payload.description) {
      toast.error("Informe a descrição.")
      return
    }
    if (!payload.categoryId) {
      toast.error("Selecione uma categoria.")
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Informe um valor maior que zero.")
      return
    }

    setSaving(true)
    const ok = editing
      ? await updateTransaction(editing.id, payload)
      : await addTransaction(payload)
    setSaving(false)

    if (!ok) return

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar transação" : "Nova transação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["receita", "despesa"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setCategoryId(null)
                }}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors",
                  type === t
                    ? t === "receita"
                      ? "border-transparent bg-[var(--chart-2)] text-white"
                      : "border-transparent bg-[var(--chart-3)] text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Descrição</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Supermercado do mês"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => setCategoryId(value)}
              modal={false}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex.: fixo, essencial, lazer"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="cta"
              className="h-9 rounded-xl px-4"
              disabled={saving}
            >
              {saving ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
