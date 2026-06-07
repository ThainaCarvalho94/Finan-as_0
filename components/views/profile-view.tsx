"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Loader2, LogOut, Mail, User } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InstallAppButton } from "@/components/install-app-button"

export function ProfileView() {
  const { profile, updateProfile, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.fullName ?? "")
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (profile) setFullName(profile.fullName)
  }, [profile])

  if (!profile) return null

  const createdAt = format(new Date(profile.createdAt), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const ok = await updateProfile(fullName)
    setSaving(false)
    if (ok) setEditing(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Meu perfil</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualize e edite suas informações pessoais
        </p>
      </div>

      <Card>
        <CardHeader>
          <UserAvatar
            userId={profile.id}
            fullName={profile.fullName}
            size="xl"
            editable
          />
          <CardTitle className="mt-4">
            {profile.fullName || "Usuário"}
          </CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome completo</Label>
                <Input
                  id="profile-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFullName(profile.fullName)
                    setEditing(false)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Editar nome
            </Button>
          )}

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">E-mail</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">
                  {profile.fullName || "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Membro desde</p>
                <p className="font-medium">{createdAt}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InstallAppButton />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessão</CardTitle>
          <CardDescription>
            Encerre sua sessão neste dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <>
                <Loader2 className="animate-spin" />
                Saindo...
              </>
            ) : (
              <>
                <LogOut />
                Sair da conta
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
