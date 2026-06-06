"use client"

import type { LucideIcon } from "lucide-react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AuthInputFieldProps = {
  id: string
  icon: LucideIcon
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoComplete?: string
  minLength?: number
  variant?: "email" | "password" | "default"
  showPasswordToggle?: boolean
  showPassword?: boolean
  onTogglePassword?: () => void
  className?: string
}

export function AuthInputField({
  id,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  minLength,
  variant = "default",
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  className,
}: AuthInputFieldProps) {
  return (
    <div
      className={cn(
        "auth-input-field flex h-10 w-full items-center overflow-hidden rounded-xl border border-input shadow-none sm:h-11",
        variant === "email" && "bg-[#eff6ff] dark:bg-input/30",
        variant === "password" && "bg-[#f8fafc] dark:bg-input/30",
        variant === "default" && "bg-accent/40 dark:bg-input/30",
        className,
      )}
    >
      <div
        className="flex h-full shrink-0 items-center justify-center pl-3.5 pr-2"
        aria-hidden
      >
        <Icon className="h-[18px] w-[18px] text-[#3b82f6] dark:text-emerald-400" />
      </div>

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 pr-2 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
      />

      {showPasswordToggle && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="flex h-full shrink-0 items-center px-3.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      )}
    </div>
  )
}
