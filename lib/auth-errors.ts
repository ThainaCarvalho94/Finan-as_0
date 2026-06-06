export function mapAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (
    lower.includes("already been registered") ||
    lower.includes("already exists") ||
    lower.includes("user already registered")
  ) {
    return "Este e-mail já está cadastrado. Tente entrar."
  }

  if (lower.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente."
  }

  if (lower.includes("valid email") || lower.includes("invalid email")) {
    return "Informe um e-mail válido."
  }

  if (lower.includes("password")) {
    return "A senha deve ter pelo menos 6 caracteres."
  }

  return "Não foi possível criar a conta. Tente novamente."
}
