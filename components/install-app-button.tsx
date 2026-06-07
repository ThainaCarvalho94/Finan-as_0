"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Share, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    if (isStandaloneMode()) {
      setIsInstalled(true)
      return
    }

    setIsIos(isIosDevice())

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => setIsInstalled(true))

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (isIos) {
      setShowIosGuide(true)
      return
    }

    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") setIsInstalled(true)
    setDeferredPrompt(null)
  }, [deferredPrompt, isIos])

  const canInstall = !isInstalled && (Boolean(deferredPrompt) || isIos)

  if (!canInstall) return null

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" />
            Instalar aplicativo
          </CardTitle>
          <CardDescription>
            Adicione o Gestão Financeira à tela inicial do seu celular para acesso
            rápido, como um app nativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleInstall} className="w-full sm:w-auto">
            <Download />
            Instalar Aplicativo
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showIosGuide} onOpenChange={setShowIosGuide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar no iPhone</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para adicionar o app à tela inicial:
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Share className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Toque no botão <strong className="text-foreground">Compartilhar</strong>{" "}
                na barra inferior do Safari.
              </span>
            </li>
            <li>
              Role para baixo e selecione{" "}
              <strong className="text-foreground">Adicionar à Tela de Início</strong>.
            </li>
            <li>
              Confirme tocando em{" "}
              <strong className="text-foreground">Adicionar</strong>.
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  )
}
