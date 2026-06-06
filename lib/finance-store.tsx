"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import type { Category, PiggyBank, Transaction, TransactionType } from "@/lib/types"

type FinanceContextValue = {
  loading: boolean
  categories: Category[]
  transactions: Transaction[]
  piggyBanks: PiggyBank[]
  addPiggyBank: (data: { name: string; goal?: number }) => void
  updatePiggyBank: (
    id: string,
    data: { name?: string; goal?: number },
  ) => void
  deletePiggyBank: (id: string) => void
  depositPiggy: (id: string, amount: number) => void
  withdrawPiggy: (id: string, amount: number) => void
  addCategory: (data: Omit<Category, "id">) => void
  updateCategory: (id: string, data: Omit<Category, "id">) => void
  deleteCategory: (id: string) => void
  addTransaction: (data: Omit<Transaction, "id">) => Promise<boolean>
  updateTransaction: (
    id: string,
    data: Omit<Transaction, "id">,
  ) => Promise<boolean>
  deleteTransaction: (id: string) => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

type DbCategory = {
  id: string
  name: string
  type: TransactionType
  color: string
}

type DbTransaction = {
  id: string
  description: string
  category_id: string
  amount: number
  date: string
  tag: string
  type: TransactionType
}

type DbPiggy = {
  id: string
  name: string
  goal: number
  saved: number
  created_at: string
}

function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
  }
}

function mapTransaction(row: DbTransaction): Transaction {
  return {
    id: row.id,
    description: row.description,
    categoryId: row.category_id,
    amount: Number(row.amount),
    date: row.date,
    tag: row.tag,
    type: row.type,
  }
}

function mapPiggyBank(row: DbPiggy): PiggyBank {
  return {
    id: row.id,
    name: row.name || "Cofrinho",
    goal: Number(row.goal),
    saved: Number(row.saved),
  }
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([])

  const loadData = useCallback(async () => {
    const [catsRes, txsRes, piggyRes] = await Promise.all([
      supabase.from("categorias").select("*").order("name"),
      supabase.from("transacoes").select("*").order("date", { ascending: false }),
      supabase.from("cofrinho").select("*").order("updated_at"),
    ])

    if (catsRes.error) throw catsRes.error
    if (txsRes.error) throw txsRes.error
    if (piggyRes.error) throw piggyRes.error

    setCategories((catsRes.data as DbCategory[]).map(mapCategory))
    setTransactions((txsRes.data as DbTransaction[]).map(mapTransaction))
    setPiggyBanks((piggyRes.data as DbPiggy[]).map(mapPiggyBank))
  }, [])

  useEffect(() => {
    loadData()
      .catch(() => {
        toast.error("Falha ao carregar dados. Tente atualizar a página.")
      })
      .finally(() => setLoading(false))
  }, [loadData])

  const addPiggyBank = useCallback((data: { name: string; goal?: number }) => {
    const name = data.name.trim()
    if (!name) {
      toast.error("Informe um nome para o cofrinho.")
      return
    }
    const goal = Math.max(0, data.goal ?? 0)
    supabase
      .from("cofrinho")
      .insert({ name, goal, saved: 0 })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error) {
          console.error(error)
          toast.error("Não foi possível criar o cofrinho.")
          return
        }
        setPiggyBanks((prev) => [...prev, mapPiggyBank(row as DbPiggy)])
        toast.success("Cofrinho criado.")
      })
  }, [])

  const updatePiggyBank = useCallback(
    (id: string, data: { name?: string; goal?: number }) => {
      let previous: PiggyBank | undefined
      setPiggyBanks((prev) => {
        previous = prev.find((p) => p.id === id)
        return prev.map((p) => {
          if (p.id !== id) return p
          return {
            ...p,
            ...(data.name !== undefined ? { name: data.name.trim() || p.name } : {}),
            ...(data.goal !== undefined ? { goal: Math.max(0, data.goal) } : {}),
          }
        })
      })

      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (data.name !== undefined) payload.name = data.name.trim() || previous?.name
      if (data.goal !== undefined) payload.goal = Math.max(0, data.goal)

      supabase
        .from("cofrinho")
        .update(payload)
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            console.error(error)
            if (previous) {
              setPiggyBanks((prev) =>
                prev.map((p) => (p.id === id ? previous! : p)),
              )
            }
            toast.error("Não foi possível atualizar o cofrinho.")
            return
          }
          if (data.name !== undefined) toast.success("Nome atualizado.")
          else toast.success("Meta do cofrinho atualizada.")
        })
    },
    [],
  )

  const deletePiggyBank = useCallback((id: string) => {
    let removed: PiggyBank | undefined
    setPiggyBanks((prev) => {
      removed = prev.find((p) => p.id === id)
      return prev.filter((p) => p.id !== id)
    })
    supabase
      .from("cofrinho")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error(error)
          if (removed) {
            setPiggyBanks((prev) => [...prev, removed!])
          }
          toast.error("Não foi possível excluir o cofrinho.")
          return
        }
        toast.success("Cofrinho excluído.")
      })
  }, [])

  const depositPiggy = useCallback((id: string, amount: number) => {
    setPiggyBanks((prev) => {
      const current = prev.find((p) => p.id === id)
      if (!current) return prev
      const previousSaved = current.saved
      const next = Math.max(0, current.saved + amount)
      supabase
        .from("cofrinho")
        .update({ saved: next, updated_at: new Date().toISOString() })
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            console.error(error)
            setPiggyBanks((p) =>
              p.map((b) => (b.id === id ? { ...b, saved: previousSaved } : b)),
            )
            toast.error("Não foi possível guardar o valor.")
            return
          }
          toast.success("Valor guardado no cofrinho.")
        })
      return prev.map((p) => (p.id === id ? { ...p, saved: next } : p))
    })
  }, [])

  const withdrawPiggy = useCallback((id: string, amount: number) => {
    setPiggyBanks((prev) => {
      const current = prev.find((p) => p.id === id)
      if (!current) return prev
      const previousSaved = current.saved
      const next = Math.max(0, current.saved - amount)
      supabase
        .from("cofrinho")
        .update({ saved: next, updated_at: new Date().toISOString() })
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            console.error(error)
            setPiggyBanks((p) =>
              p.map((b) => (b.id === id ? { ...b, saved: previousSaved } : b)),
            )
            toast.error("Não foi possível resgatar o valor.")
            return
          }
          toast.success("Valor resgatado do cofrinho.")
        })
      return prev.map((p) => (p.id === id ? { ...p, saved: next } : p))
    })
  }, [])

  const addCategory = useCallback((data: Omit<Category, "id">) => {
    supabase
      .from("categorias")
      .insert(data)
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error) {
          console.error(error)
          toast.error("Não foi possível criar a categoria.")
          return
        }
        setCategories((prev) => [...prev, mapCategory(row as DbCategory)])
        toast.success("Categoria criada.")
      })
  }, [])

  const updateCategory = useCallback((id: string, data: Omit<Category, "id">) => {
    let previous: Category | undefined
    setCategories((prev) => {
      previous = prev.find((c) => c.id === id)
      return prev.map((c) => (c.id === id ? { ...data, id } : c))
    })
    supabase
      .from("categorias")
      .update(data)
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error(error)
          if (previous) {
            setCategories((prev) =>
              prev.map((c) => (c.id === id ? previous! : c)),
            )
          }
          toast.error("Não foi possível atualizar a categoria.")
          return
        }
        toast.success("Categoria atualizada.")
      })
  }, [])

  const deleteCategory = useCallback((id: string) => {
    let removed: Category | undefined
    setCategories((prev) => {
      removed = prev.find((c) => c.id === id)
      return prev.filter((c) => c.id !== id)
    })
    supabase
      .from("categorias")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error(error)
          if (removed) {
            setCategories((prev) => [...prev, removed!])
          }
          toast.error("Não foi possível excluir a categoria.")
          return
        }
        toast.success("Categoria excluída.")
      })
  }, [])

  const addTransaction = useCallback(async (data: Omit<Transaction, "id">) => {
    const payload = {
      description: data.description,
      category_id: data.categoryId,
      amount: data.amount,
      date: data.date,
      tag: data.tag,
      type: data.type,
    }
    const { data: row, error } = await supabase
      .from("transacoes")
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error(error)
      toast.error("Não foi possível adicionar a transação.")
      return false
    }

    setTransactions((prev) => [
      mapTransaction(row as DbTransaction),
      ...prev,
    ])
    toast.success("Transação adicionada.")
    return true
  }, [])

  const updateTransaction = useCallback(
    async (id: string, data: Omit<Transaction, "id">) => {
      const payload = {
        description: data.description,
        category_id: data.categoryId,
        amount: data.amount,
        date: data.date,
        tag: data.tag,
        type: data.type,
      }
      const { error } = await supabase
        .from("transacoes")
        .update(payload)
        .eq("id", id)

      if (error) {
        console.error(error)
        toast.error("Não foi possível atualizar a transação.")
        return false
      }

      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...data, id } : t)),
      )
      toast.success("Transação atualizada.")
      return true
    },
    [],
  )

  const deleteTransaction = useCallback((id: string) => {
    let removed: Transaction | undefined
    setTransactions((prev) => {
      removed = prev.find((t) => t.id === id)
      return prev.filter((t) => t.id !== id)
    })
    supabase
      .from("transacoes")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error(error)
          if (removed) {
            setTransactions((prev) => [removed!, ...prev])
          }
          toast.error("Não foi possível excluir a transação.")
          return
        }
        toast.success("Transação excluída.")
      })
  }, [])

  const value = useMemo<FinanceContextValue>(
    () => ({
      loading,
      categories,
      transactions,
      piggyBanks,
      addPiggyBank,
      updatePiggyBank,
      deletePiggyBank,
      depositPiggy,
      withdrawPiggy,
      addCategory,
      updateCategory,
      deleteCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    }),
    [
      loading,
      categories,
      transactions,
      piggyBanks,
      addPiggyBank,
      updatePiggyBank,
      deletePiggyBank,
      depositPiggy,
      withdrawPiggy,
      addCategory,
      updateCategory,
      deleteCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
    ],
  )

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance precisa estar dentro de FinanceProvider")
  return ctx
}

export function useCashFlowByMonth() {
  const { transactions } = useFinance()
  return useMemo(() => {
    const map = new Map<
      string,
      { key: string; year: number; month: number; receita: number; despesa: number }
    >()
    for (const t of transactions) {
      const [y, m] = t.date.split("-").map(Number)
      const key = `${y}-${String(m).padStart(2, "0")}`
      if (!map.has(key)) {
        map.set(key, { key, year: y, month: m - 1, receita: 0, despesa: 0 })
      }
      const entry = map.get(key)!
      if (t.type === "receita") entry.receita += t.amount
      else entry.despesa += t.amount
    }
    return Array.from(map.values())
      .sort((a, b) =>
        a.year === b.year ? a.month - b.month : a.year - b.year,
      )
      .map((e) => ({ ...e, saldo: e.receita - e.despesa }))
  }, [transactions])
}

export function useTotals(type?: TransactionType) {
  const { transactions } = useFinance()
  return useMemo(() => {
    const receita = transactions
      .filter((t) => t.type === "receita")
      .reduce((s, t) => s + t.amount, 0)
    const despesa = transactions
      .filter((t) => t.type === "despesa")
      .reduce((s, t) => s + t.amount, 0)
    return { receita, despesa, saldo: receita - despesa }
  }, [transactions, type])
}
