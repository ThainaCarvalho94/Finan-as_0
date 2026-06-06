"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/components/theme-provider"

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card text-card-foreground border-border shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}
