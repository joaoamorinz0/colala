"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { CONTROL_HEIGHT, LIST_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/providers";
import { updateUserPassword } from "@/services/auth.service";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const { client, user, status } = useSupabase();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(true);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (status === "not-configured") {
      setError("Supabase não configurado.");
      setCheckedAuth(true);
      return;
    }

    if (status === "ready" && !checkedAuth) {
      setCheckedAuth(true);

      // O fluxo de recovery cria uma sessão temporária ao acessar o link.
      // Sem sessão, o usuário precisa refazer o fluxo pelo login.
      if (!user) {
        setRequiresAuth(true);
        toast.show(
          "Link inválido ou expirado. Solicite um novo link de recuperação.",
          "error",
        );
      } else {
        setRequiresAuth(false);
      }
    }
  }, [status, user, checkedAuth, toast]);

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      if (!client) throw new Error("Supabase não configurado");
      await updateUserPassword(client, password);
      toast.show("Senha atualizada com sucesso", "success");
      router.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  if (status !== "ready") {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col items-center justify-center">
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-center">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-full">
              <KeyRound className="size-8" />
            </div>
            <h1 className="text-foreground mt-stack-lg text-3xl font-extrabold tracking-tight">
              Definir nova senha
            </h1>
            <p className="text-muted-foreground mt-stack-sm leading-relaxed">
              Escolha uma nova senha para a sua conta.
            </p>
          </div>

          {error ? (
            <div className="border-border bg-card rounded-card-lg mt-stack-lg p-card border text-sm shadow-sm">
              <p className="leading-relaxed text-red-600">{error}</p>
              <p className="text-muted-foreground mt-stack-sm">
                <Link
                  href="/forgot-password"
                  className="text-primary font-bold"
                >
                  Solicitar novo link de recuperação
                </Link>
              </p>
            </div>
          ) : requiresAuth ? (
            <div className="border-border bg-card rounded-card-lg mt-stack-lg p-card border text-sm shadow-sm">
              <p className="leading-relaxed">
                Para definir uma nova senha, acesse o link enviado por e-mail.
              </p>
              <p className="text-muted-foreground mt-stack-sm">
                <Link
                  href="/forgot-password"
                  className="text-primary font-bold"
                >
                  Solicitar novo link
                </Link>
              </p>
            </div>
          ) : (
            <form
              className={cn(LIST_STACK, "mt-stack-lg")}
              onSubmit={handleUpdatePassword}
            >
              <label className="space-y-stack-xs block">
                <span className="text-foreground text-sm font-semibold">
                  Nova senha
                </span>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
                  <Input
                    className={cn(
                      CONTROL_HEIGHT,
                      "bg-card rounded-control px-card pr-11 pl-11 text-base",
                    )}
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="text-muted-foreground absolute top-1/2 right-4 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </label>

              <label className="space-y-stack-xs block">
                <span className="text-foreground text-sm font-semibold">
                  Confirmar nova senha
                </span>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
                  <Input
                    className={cn(
                      CONTROL_HEIGHT,
                      "bg-card rounded-control px-card pl-11 text-base",
                    )}
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repita a nova senha"
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
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          )}

          <p className="text-muted-foreground mt-stack-lg text-center text-sm">
            <Link className="text-primary font-bold" href="/login">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
