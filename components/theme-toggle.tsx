"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function ThemeToggle({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
        compact
          ? "justify-center p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          : "w-full px-3 py-2.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        className,
      )}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
      {!compact && <span>{isDark ? "Modo claro" : "Modo escuro"}</span>}
    </button>
  )
}
