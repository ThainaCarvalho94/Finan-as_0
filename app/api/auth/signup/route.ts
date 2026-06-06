import { NextResponse } from "next/server"
import { mapAuthError } from "@/lib/auth-errors"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

type SignUpBody = {
  email?: string
  password?: string
  fullName?: string
}

export async function POST(request: Request) {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return NextResponse.json(
      { error: "Cadastro temporariamente indisponível. Tente novamente mais tarde." },
      { status: 503 },
    )
  }

  let body: SignUpBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const fullName = body.fullName?.trim()

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 },
    )
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error) {
    return NextResponse.json({ error: mapAuthError(error.message) }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
