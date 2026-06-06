"use client"

import { PiggyBankCard, AddPiggyBankCard } from "@/components/piggy-bank-card"
import { useFinance } from "@/lib/finance-store"

export function PiggyBanksSection() {
  const { piggyBanks } = useFinance()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      {piggyBanks.map((piggyBank, i) => (
        <PiggyBankCard
          key={piggyBank.id}
          piggyBank={piggyBank}
          index={i}
          canDelete={piggyBanks.length > 1}
        />
      ))}
      <div className="sm:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AddPiggyBankCard index={piggyBanks.length} />
      </div>
    </div>
  )
}
