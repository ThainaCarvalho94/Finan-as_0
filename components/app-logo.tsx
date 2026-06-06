"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, Wallet, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const APP_LOGO_STORAGE_KEY = "fluxo-auth-logo"

const SIZES = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4", overlay: "text-[9px]" },
  md: { box: "h-10 w-10", icon: "h-5 w-5", overlay: "text-[10px]" },
  lg: { box: "h-16 w-16", icon: "h-7 w-7", overlay: "text-[10px]" },
  xl: { box: "h-20 w-20", icon: "h-8 w-8", overlay: "text-[11px]" },
} as const

type AppLogoProps = {
  size?: keyof typeof SIZES
  editable?: boolean
  className?: string
}

export function AppLogo({ size = "lg", editable = true, className }: AppLogoProps) {
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const { box, icon, overlay } = SIZES[size]

  useEffect(() => {
    try {
      const stored = localStorage.getItem(APP_LOGO_STORAGE_KEY)
      if (stored) setLogoImage(stored)
    } catch {
      // ignore
    }
  }, [])

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setLogoImage(dataUrl)
      try {
        localStorage.setItem(APP_LOGO_STORAGE_KEY, dataUrl)
      } catch {
        // ignore quota errors
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  function handleLogoRemove() {
    setLogoImage(null)
    try {
      localStorage.removeItem(APP_LOGO_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const boxStyles = cn(
    "relative flex items-center justify-center overflow-hidden transition-all",
    box,
    logoImage
      ? "bg-white dark:bg-[#1a2540]"
      : "bg-white text-primary dark:bg-[#1a2540] dark:text-emerald-400",
    "rounded-full shadow-lg shadow-primary/15 ring-4 ring-white/80",
    "dark:rounded-2xl dark:shadow-[0_0_24px_rgba(16,185,129,0.25)] dark:ring-emerald-500/20",
  )

  const content = logoImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoImage} alt="Logo" className="h-full w-full object-cover" />
  ) : (
    <Wallet className={icon} />
  )

  if (!editable) {
    return (
      <div className={cn(boxStyles, className)}>
        {content}
      </div>
    )
  }

  return (
    <div className={cn("group relative", className)}>
      <button
        type="button"
        onClick={() => logoInputRef.current?.click()}
        className={cn(boxStyles, "hover:opacity-90")}
        aria-label={logoImage ? "Trocar imagem do logo" : "Inserir imagem do logo"}
      >
        {content}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 dark:rounded-2xl">
          <ImagePlus className="h-4 w-4 text-white" />
          <span className={cn("font-medium leading-none text-white", overlay)}>
            {logoImage ? "Trocar" : "Inserir imagem"}
          </span>
        </span>
      </button>
      {logoImage && (
        <button
          type="button"
          onClick={handleLogoRemove}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          aria-label="Remover imagem"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoSelect}
      />
    </div>
  )
}
