"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AtSign, CheckCircle, MailWarning, RefreshCw } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { CONTROL_HEIGHT, LIST_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { resendEmailConfirmation } from "@/services/auth.service";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { client, user } = useSupabase();

  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user, router]);

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!client) throw new Error("Supabase não configurado");
      await resendEmailConfirmation(client, email.trim());
      setSent(true);
      toast.show("E-mail de confirmação enviado novamente", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao reenviar e-mail";
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-full">
            <MailWarning className="size-8" />
          </div>
          <h1 className="text-foreground mt-stack-lg text-3xl font-extrabold tracking-tight">
            Verifique seu e-mail
          </h1>
          <p className="text-muted-foreground mt-stack-sm leading-relaxed">
            Enviamos um link de confirmação para{" "}
            <span className="text-foreground font-semibold">
              {initialEmail || "seu e-mail"}
            </span>
            . Clique no link para ativar sua conta e poder entrar.
          </p>
        </div>

        {sent ? (
          <div className="border-border bg-card rounded-card-lg mt-stack-lg p-card border text-sm shadow-sm">
            <p className="flex items-start gap-2">
              <CheckCircle className="text-secondary mt-0.5 size-4 shrink-0" />
              Novo link enviado. Confira sua caixa de entrada (e a pasta de
              spam).
            </p>
          </div>
        ) : null}

        <form className={cn(LIST_STACK, "mt-stack-lg")} onSubmit={handleResend}>
          <label className="space-y-stack-xs block">
            <span className="text-foreground text-sm font-semibold">
              E-mail
            </span>
            <div className="relative">
              <AtSign className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
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

          <Button
            type="submit"
            className={cn(
              CONTROL_HEIGHT,
              "rounded-control w-full text-base font-bold",
            )}
            disabled={loading}
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            {loading ? "Enviando..." : "Reenviar e-mail de confirmação"}
          </Button>
        </form>

        <div className="mt-stack-lg space-y-3 text-center text-sm">
          <p className="text-muted-foreground">
            Já confirmou?{" "}
            <Link className="text-primary font-bold" href="/login">
              Fazer login
            </Link>
          </p>
          <p className="text-muted-foreground">
            Não recebeu o e-mail?{" "}
            <Link className="text-primary font-semibold" href="/login">
              Tentar entrar mesmo assim
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <PublicLayout>
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </PublicLayout>
  );
}
