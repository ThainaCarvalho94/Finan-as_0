"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function AuthThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/90 p-1 shadow-sm backdrop-blur-sm",
        className,
      )}
      role="group"
      aria-label="Selecionar tema"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-3.5 sm:text-sm",
          theme === "light"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={theme === "light"}
        aria-label="Modo claro"
      >
        <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden min-[380px]:inline">Modo claro</span>
        <span className="min-[380px]:hidden">Claro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-3.5 sm:text-sm",
          theme === "dark"
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={theme === "dark"}
        aria-label="Modo escuro"
      >
        <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden min-[380px]:inline">Modo escuro</span>
        <span className="min-[380px]:hidden">Escuro</span>
      </button>
    </div>
  )
}
