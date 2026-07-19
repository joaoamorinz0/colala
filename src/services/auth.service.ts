import type { createSupabaseBrowserClient } from '@/lib/supabase';

type SupabaseBrowserClient = NonNullable<ReturnType<typeof createSupabaseBrowserClient>>;

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
    throw new Error(error.message);
  }

  return data;
}

export async function signInWithGoogle(
  client: SupabaseBrowserClient,
  redirectTo: string,
) {
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      scopes: 'email profile openid',
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return;
}

export async function signUpWithEmail(
  client: SupabaseBrowserClient,
  email: string,
  password: string,
  redirectTo: string,
) {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut(client: SupabaseBrowserClient) {
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
