"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { signInWithEmail, signInWithGoogle } from "@/services/auth.service";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.35 11.1H12v2.8h5.05c-.22 1.2-1.05 2.2-2.24 2.86v2.38h3.62c2.12-1.95 3.34-4.82 3.34-8.48 0-.58-.05-1.14-.14-1.68z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.43 0 4.47-.8 5.96-2.17l-3.62-2.38c-.99.66-2.25 1.05-3.82 1.05-2.94 0-5.43-1.99-6.32-4.67H1.96v2.93C3.46 19.87 7.47 22 12 22z"
        fill="#34A853"
      />
      <path
        d="M5.68 13.83a7.2 7.2 0 0 1 0-3.66V7.24H1.96a10.99 10.99 0 0 0 0 9.52l3.72-2.93z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.6c1.32 0 2.5.45 3.43 1.34l2.57-2.57C16.44 2.12 14.4 1.2 12 1.2 7.47 1.2 3.46 3.33 1.96 7.24l3.72 2.93C6.57 6.59 9.06 4.6 12 4.6z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { client, user } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = searchParams.get("redirectTo") ?? "/home";

  useEffect(() => {
    if (user) {
      router.replace(redirectTo as never);
    }
  }, [user, router, redirectTo]);

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!client) throw new Error("Supabase não configurado");
      await signInWithEmail(client, email, password);
      router.replace(redirectTo as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!client) throw new Error("Supabase não configurado");
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
      await signInWithGoogle(client, callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no login com Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col space-y-5 bg-[#fbf8f4] px-6 pt-10 pb-8">
      {/* Espaço reservado para a ilustração (unDraw/Storyset, cores #d97757 / #7a9e7e) */}
      <div className="mx-auto flex w-full max-w-[220px] flex-1 items-center justify-center" />

      <div className="mt-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#2b2621]">
          Bem-vindo de volta
        </h1>
        <p className="mt-1.5 text-sm text-[#8a8078]">
          Entre para descobrir lugares recomendados por pessoas, não por
          algoritmo.
        </p>
      </div>

      <form onSubmit={handleEmailSignIn} className="mt-8 space-y-3.5">
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#a89e94]" />
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-13 w-full rounded-full border border-[#e8e1d8] bg-white pr-4 pl-11 text-sm text-[#2b2621] placeholder:text-[#a89e94] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/25 focus:outline-none"
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#a89e94]" />
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-13 w-full rounded-full border border-[#e8e1d8] bg-white pr-11 pl-11 text-sm text-[#2b2621] placeholder:text-[#a89e94] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/25 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            tabIndex={-1}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[#a89e94]"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-13 w-full rounded-full bg-[#d97757] text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(217,119,87,0.55)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[#a89e94]">
        <div className="h-px flex-1 bg-[#e8e1d8]" />
        ou
        <div className="h-px flex-1 bg-[#e8e1d8]" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={cn(
            "flex h-13 w-full items-center justify-center gap-2.5 rounded-full border border-[#e8e1d8] bg-white text-sm font-semibold text-[#2b2621]",
            "transition-transform active:scale-[0.98] disabled:opacity-60",
          )}
        >
          <GoogleIcon />
          Continuar com Google
        </button>
      </div>

      <p className="mt-7 text-center text-sm text-[#8a8078]">
        Não tem conta?{" "}
        <Link href="/register" className="font-bold text-[#d97757]">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export function LoginView() {
  return (
    <PublicLayout>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </PublicLayout>
  );
}
