export type TransactionType = "receita" | "despesa"

export type Category = {
  id: string
  name: string
  type: TransactionType
  color: string
}

export type Transaction = {
  id: string
  description: string
  categoryId: string
  amount: number
  date: string // ISO yyyy-mm-dd
  tag: string
  type: TransactionType
}

export type PiggyBank = {
  id: string
  name: string
  goal: number
  saved: number
}
