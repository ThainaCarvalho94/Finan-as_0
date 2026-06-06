"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useFinance } from "@/lib/finance-store"
import type { Category, TransactionType } from "@/lib/types"
import { cn } from "@/lib/utils"

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
  "#64748b",
]

function CategoryDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: Category | null
}) {
  const { addCategory, updateCategory } = useFinance()
  const [name, setName] = useState("")
  const [type, setType] = useState<TransactionType>("despesa")
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name)
        setType(editing.type)
        setColor(editing.color)
      } else {
        setName("")
        setType("despesa")
        setColor(COLORS[0])
      }
    }
  }, [open, editing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Informe o nome da categoria.")
      return
    }
    const payload = { name: name.trim(), type, color }
    if (editing) updateCategory(editing.id, payload)
    else addCategory(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["receita", "despesa"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
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
            <Label htmlFor="cat-name">Nome</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Educação"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-transform",
                    color === c
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="cta" className="h-9 rounded-xl px-4">
              {editing ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CategoryColumn({
  title,
  type,
  onEdit,
}: {
  title: string
  type: TransactionType
  onEdit: (c: Category) => void
}) {
  const { categories, transactions, deleteCategory } = useFinance()
  const list = categories.filter((c) => c.type === type)

  const count = (id: string) =>
    transactions.filter((t) => t.categoryId === id).length

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor:
              type === "receita"
                ? "var(--chart-2)"
                : "var(--chart-3)",
          }}
        />
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">({list.length})</span>
      </div>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {list.map((c) => (
            <motion.li
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: `color-mix(in oklch, ${c.color} 18%, transparent)`,
                  color: c.color,
                }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {c.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {count(c.id)} transações
                </p>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onEdit(c)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Editar categoria"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Excluir categoria"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {list.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria.
          </li>
        )}
      </ul>
    </div>
  )
}

export function CategoriesView() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (c: Category) => {
    setEditing(c)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Categorias
          </h1>
          <p className="text-muted-foreground">
            Organize suas receitas e despesas por categoria
          </p>
        </div>
        <Button onClick={openNew} variant="cta" size="cta">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Plus className="h-4 w-4" />
          </span>
          Nova categoria
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <CategoryColumn title="Receitas" type="receita" onEdit={openEdit} />
        <CategoryColumn title="Despesas" type="despesa" onEdit={openEdit} />
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  )
}
