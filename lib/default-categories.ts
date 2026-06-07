import type { TransactionType } from "@/lib/types"

export type DefaultCategory = {
  name: string
  type: TransactionType
  color: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Salário", type: "receita", color: "#3b82f6" },
  { name: "Alimentação", type: "despesa", color: "#f59e0b" },
  { name: "Moradia", type: "despesa", color: "#ef4444" },
]
