"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { CONTROL_HEIGHT, LIST_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { resetPasswordForEmail } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const { client } = useSupabase();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!client) throw new Error("Supabase não configurado");
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/update-password")}`;
      await resetPasswordForEmail(client, email.trim(), callbackUrl);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-center">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/login"
            className="hover:bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar ao login
          </Link>

          <div className="mt-stack-lg text-center">
            <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-full">
              <KeyRound className="size-8" />
            </div>
            <h1 className="text-foreground mt-stack-lg text-3xl font-extrabold tracking-tight">
              Esqueci minha senha
            </h1>
            <p className="text-muted-foreground mt-stack-sm leading-relaxed">
              Informe seu e-mail e enviaremos um link para você definir uma nova
              senha.
            </p>
          </div>

          {sent ? (
            <div className="border-border bg-card rounded-card-lg mt-stack-lg p-card border text-sm shadow-sm">
              <p className="leading-relaxed">
                Se existir uma conta cadastrada com{" "}
                <span className="text-foreground font-semibold">{email}</span>,
                você receberá um link de recuperação em instantes. Confira sua
                caixa de entrada (e a pasta de spam).
              </p>
              <p className="text-muted-foreground mt-stack-sm text-xs">
                O link expira em alguns minutos.
              </p>
            </div>
          ) : (
            <form
              className={cn(LIST_STACK, "mt-stack-lg")}
              onSubmit={handleReset}
            >
              <label className="space-y-stack-xs block">
                <span className="text-foreground text-sm font-semibold">
                  E-mail
                </span>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
                  <Input
                    className={cn(
                      CONTROL_HEIGHT,
                      "bg-card rounded-control px-card pl-11 text-base",
                    )}
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </label>

              {error && (
                <p className="rounded-control bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
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
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}

          <p className="text-muted-foreground mt-stack-lg text-center text-sm">
            Lembrou a senha?{" "}
            <Link className="text-primary font-bold" href="/login">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
