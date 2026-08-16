import type { createSupabaseBrowserClient } from "@/lib/supabase";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

/**
 * Traduz mensagens de erro comuns do Supabase Auth para pt-BR,
 * mantendo a mensagem original como fallback.
 */
function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada (incluindo spam).";
  }
  if (normalized.includes("user already registered")) {
    return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
  }
  if (normalized.includes("password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (normalized.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  }
  if (normalized.includes("for security purposes")) {
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  }
  if (normalized.includes("unable to validate email")) {
    return "E-mail inválido. Verifique e tente novamente.";
  }

  return message;
}

export type SignUpResult = {
  /** true quando o Supabase exige confirmação de e-mail (nenhuma sessão criada). */
  sessionNeeded: boolean;
};

export async function signInWithEmail(
  client: SupabaseBrowserClient,
  email: string,
  password: string,
) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }

  return data;
}

export async function signInWithGoogle(
  client: SupabaseBrowserClient,
  redirectTo: string,
) {
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      scopes: "email profile openid",
    },
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

/**
 * Cria a conta por e-mail/senha.
 *
 * Trata o caso de e-mail já cadastrado: o Supabase retorna sucesso com
 * `identities` vazio quando o e-mail já pertence a uma conta existente.
 */
export async function signUpWithEmail(
  client: SupabaseBrowserClient,
  email: string,
  password: string,
  redirectTo: string,
): Promise<SignUpResult> {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }

  const hasIdentities = (data.user?.identities?.length ?? 0) > 0;

  if (data.user && !hasIdentities) {
    throw new Error(
      "Este e-mail já está cadastrado. Faça login ou recupere sua senha.",
    );
  }

  return {
    sessionNeeded: data.session === null,
  };
}

/** Reenvia o e-mail de confirmação de cadastro. */
export async function resendEmailConfirmation(
  client: SupabaseBrowserClient,
  email: string,
) {
  const { error } = await client.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

/** Envia o e-mail de recuperação de senha. */
export async function resetPasswordForEmail(
  client: SupabaseBrowserClient,
  email: string,
  redirectTo: string,
) {
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

/** Define uma nova senha para o usuário da sessão atual. */
export async function updateUserPassword(
  client: SupabaseBrowserClient,
  newPassword: string,
) {
  const { error } = await client.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

/**
 * Exclui a conta do usuário autenticado e todos os dados associados.
 * Depende da função RPC `public.delete_account` (ver
 * supabase/migrations/20260816_account_deletion.sql), que remove perfil,
 * favoritos, "quero ir", interesses, avaliações, imagens do Storage e o
 * registro em auth.users.
 */
export async function deleteAccount(client: SupabaseBrowserClient) {
  const { error } = await client.rpc("delete_account");

  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}

export async function signOut(client: SupabaseBrowserClient) {
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(translateAuthError(error.message));
  }
}
