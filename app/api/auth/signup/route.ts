import { NextResponse } from "next/server"
import { mapAuthError } from "@/lib/auth-errors"
import { DEFAULT_CATEGORIES } from "@/lib/default-categories"
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

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error) {
    return NextResponse.json({ error: mapAuthError(error.message) }, { status: 400 })
  }

  if (data.user) {
    const userId = data.user.id
    const { error: seedError } = await admin.rpc("seed_default_categories", {
      p_user_id: userId,
    })

    if (seedError) {
      const { count } = await admin
        .from("categorias")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      if (!count) {
        await admin.from("categorias").insert(
          DEFAULT_CATEGORIES.map((category) => ({
            ...category,
            user_id: userId,
          })),
        )
      }
    }
  }

  return NextResponse.json({ ok: true })
}
