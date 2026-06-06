"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TransactionDialog } from "@/components/transaction-dialog"
import { useFinance } from "@/lib/finance-store"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Transaction } from "@/lib/types"

export function TransactionsView() {
  const { transactions, categories, deleteTransaction } = useFinance()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [query, setQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("todos")

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—"
  const catColor = (id: string) =>
    categories.find((c) => c.id === id)?.color ?? "#999"

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (filterType === "todos" ? true : t.type === filterType))
      .filter((t) => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (
          t.description.toLowerCase().includes(q) ||
          t.tag.toLowerCase().includes(q) ||
          catName(t.categoryId).toLowerCase().includes(q)
        )
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, filterType, query, categories])

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (t: Transaction) => {
    setEditing(t)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Transações
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre e gerencie suas receitas e despesas
          </p>
        </div>
        <Button
          onClick={openNew}
          variant="cta"
          size="cta"
          className="w-full sm:w-auto"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Plus className="h-4 w-4" />
          </span>
          Nova transação
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar transações..."
            className="h-11 pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-11 w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header desktop */}
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <span>Descrição</span>
          <span>Categoria</span>
          <span>Tag</span>
          <span>Data</span>
          <span className="text-right">Valor</span>
          <span className="w-16 text-center">Ações</span>
        </div>
        <ul>
          <AnimatePresence initial={false}>
            {filtered.map((t) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2 border-b border-border px-4 py-4 text-sm last:border-0 sm:px-5 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4 md:py-3"
              >
                <div className="flex items-start justify-between gap-3 md:contents">
                  <span className="min-w-0 font-medium text-card-foreground md:col-start-1">
                    {t.description}
                  </span>
                  <span
                    className="shrink-0 text-right font-semibold tabular-nums md:col-start-5"
                    style={{
                      color:
                        t.type === "receita"
                          ? "var(--chart-2)"
                          : "var(--chart-3)",
                    }}
                  >
                    {t.type === "receita" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground md:col-start-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: catColor(t.categoryId) }}
                  />
                  <span className="truncate">{catName(t.categoryId)}</span>
                </span>
                <span className="hidden md:col-start-3 md:block">
                  {t.tag ? (
                    <Badge variant="secondary" className="font-normal">
                      {t.tag}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </span>
                <span className="hidden text-muted-foreground md:col-start-4 md:block">
                  {formatDate(t.date)}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:hidden">
                  <span>{formatDate(t.date)}</span>
                  {t.tag ? (
                    <Badge variant="secondary" className="font-normal">
                      {t.tag}
                    </Badge>
                  ) : null}
                </div>
                <span className="flex justify-end gap-1 md:col-start-6 md:w-16 md:justify-center">
                  <button
                    onClick={() => openEdit(t)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma transação encontrada.
          </p>
        )}
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  )
}
