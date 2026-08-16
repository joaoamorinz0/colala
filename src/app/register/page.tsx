"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppBrand, PublicLayout } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { CONTROL_HEIGHT, LIST_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { signUpWithEmail } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const { client, user } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/profile");
    }
  }, [user, router]);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!acceptedTerms) {
      setError("Você precisa aceitar os Termos de Uso para criar a conta.");
      return;
    }

    setLoading(true);

    try {
      if (!client) throw new Error("Supabase não configurado");
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/profile")}`;
      const { sessionNeeded } = await signUpWithEmail(
        client,
        email.trim(),
        password,
        callbackUrl,
      );

      if (sessionNeeded) {
        // Fluxo com confirmação de e-mail ativa: leva o usuário à tela
        // "verifique seu e-mail" em vez de criar sessão automaticamente.
        router.replace(
          `/verify-email?email=${encodeURIComponent(email.trim())}`,
        );
        return;
      }

      setMessage("Cadastro realizado!");
      setTimeout(() => router.replace("/profile"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-center">
        <AppBrand className="mb-section" />

        <form className="space-y-stack-lg" onSubmit={handleRegister}>
          <h1 className="text-3xl font-bold">Criar conta</h1>
          <p className="text-muted-foreground">
            Crie sua conta para aproveitar todos os recursos.
          </p>

          <div className={LIST_STACK}>
            <label className="space-y-stack-xs block">
              <span className="text-foreground text-sm font-semibold">
                E-mail
              </span>
              <Input
                className={cn(
                  CONTROL_HEIGHT,
                  "bg-card rounded-control px-card text-base",
                )}
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
              />
            </label>

            <label className="space-y-stack-xs block">
              <span className="text-foreground text-sm font-semibold">
                Senha
              </span>
              <Input
                className={cn(
                  CONTROL_HEIGHT,
                  "bg-card rounded-control px-card text-base",
                )}
                placeholder="Mínimo de 6 caracteres"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </label>

            <label className="space-y-stack-xs block">
              <span className="text-foreground text-sm font-semibold">
                Confirmar senha
              </span>
              <Input
                className={cn(
                  CONTROL_HEIGHT,
                  "bg-card rounded-control px-card text-base",
                )}
                placeholder="Repita a senha"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
              />
            </label>
          </div>

          {/* Aceite dos Termos de Uso */}
          <label className="flex items-start gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#d97757]"
              aria-required="true"
            />
            <span>
              Li e concordo com os{" "}
              <Link
                href="/terms"
                className="text-primary font-semibold underline"
              >
                Termos de Uso
              </Link>{" "}
              e tive acesso à{" "}
              <Link
                href="/privacy"
                className="text-primary font-semibold underline"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="rounded-control bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-control bg-green-50 px-4 py-2 text-sm text-green-700">
              {message}
            </p>
          )}

          <Button
            type="submit"
            className={cn(
              CONTROL_HEIGHT,
              "rounded-control w-full text-base font-bold",
            )}
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-muted-foreground mt-section text-center text-sm">
            Já tem conta?{" "}
            <Link className="text-primary font-bold" href="/login">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </PublicLayout>
  );
}
