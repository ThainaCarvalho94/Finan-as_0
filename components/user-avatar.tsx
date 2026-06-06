"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ImagePlus, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const userAvatarStorageKey = (userId: string) =>
  `fluxo-user-avatar-${userId}`

const AVATAR_CHANGE_EVENT = "fluxo-user-avatar-change"

function readStoredAvatar(userId: string) {
  try {
    return localStorage.getItem(userAvatarStorageKey(userId))
  } catch {
    return null
  }
}

function notifyAvatarChange(userId: string) {
  window.dispatchEvent(
    new CustomEvent(AVATAR_CHANGE_EVENT, { detail: { userId } }),
  )
}

export function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const SIZES = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4", text: "text-[10px]", overlay: "text-[8px]" },
  md: { box: "h-10 w-10", icon: "h-5 w-5", text: "text-xs", overlay: "text-[9px]" },
  lg: { box: "h-14 w-14", icon: "h-7 w-7", text: "text-sm", overlay: "text-[10px]" },
  xl: { box: "h-16 w-16", icon: "h-8 w-8", text: "text-base", overlay: "text-[10px]" },
} as const

type UserAvatarProps = {
  userId: string
  fullName: string
  size?: keyof typeof SIZES
  editable?: boolean
  className?: string
  variant?: "default" | "sidebar"
}

export function UserAvatar({
  userId,
  fullName,
  size = "md",
  editable = false,
  className,
  variant = "default",
}: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { box, icon, text, overlay } = SIZES[size]
  const initials = userInitials(fullName || "Usuário")

  useEffect(() => {
    setAvatarUrl(readStoredAvatar(userId))
  }, [userId])

  useEffect(() => {
    function handleChange(e: Event) {
      const detail = (e as CustomEvent<{ userId: string }>).detail
      if (detail?.userId === userId) {
        setAvatarUrl(readStoredAvatar(userId))
      }
    }
    window.addEventListener(AVATAR_CHANGE_EVENT, handleChange)
    return () => window.removeEventListener(AVATAR_CHANGE_EVENT, handleChange)
  }, [userId])

  const persistAvatar = useCallback(
    (url: string | null) => {
      setAvatarUrl(url)
      try {
        const key = userAvatarStorageKey(userId)
        if (url) localStorage.setItem(key, url)
        else localStorage.removeItem(key)
      } catch {
        // ignore quota errors
      }
      notifyAvatarChange(userId)
    },
    [userId],
  )

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => persistAvatar(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const bgClass =
    variant === "sidebar"
      ? "bg-sidebar-primary text-sidebar-primary-foreground"
      : "bg-primary text-primary-foreground"

  const content = avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
  ) : (
  <span className={cn("font-bold", text)}>{initials}</span>
  )

  const shellClass = cn(
    "flex items-center justify-center overflow-hidden rounded-full",
    bgClass,
    variant === "sidebar" && "sidebar-avatar",
    box,
    className,
  )

  if (!editable) {
    return <div className={shellClass}>{content}</div>
  }

  return (
    <div className={cn("group relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative transition-opacity hover:opacity-90",
          shellClass,
        )}
        aria-label={avatarUrl ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
      >
        {content}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <ImagePlus className={icon} />
          <span className={cn("font-medium leading-none", overlay)}>
            {avatarUrl ? "Trocar" : "Foto"}
          </span>
        </span>
      </button>
      {avatarUrl && (
        <button
          type="button"
          onClick={() => persistAvatar(null)}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          aria-label="Remover foto"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  )
}

export function UserAvatarPlaceholder({
  size = "lg",
  className,
}: {
  size?: keyof typeof SIZES
  className?: string
}) {
  const { box, icon } = SIZES[size]
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary text-primary-foreground",
        box,
        className,
      )}
    >
      <User className={icon} />
    </div>
  )
}
