"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function AuthThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 rounded-full border border-border/70 bg-card/90 p-0.5 shadow-sm backdrop-blur-sm sm:gap-1 sm:p-1",
        className,
      )}
      role="group"
      aria-label="Selecionar tema"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-sm",
          theme === "light"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={theme === "light"}
        aria-label="Modo claro"
      >
        <Sun className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
        <span className="sm:hidden">Claro</span>
        <span className="hidden sm:inline">Modo claro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-sm",
          theme === "dark"
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={theme === "dark"}
        aria-label="Modo escuro"
      >
        <Moon className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
        <span className="sm:hidden">Escuro</span>
        <span className="hidden sm:inline">Modo escuro</span>
      </button>
    </div>
  )
}
