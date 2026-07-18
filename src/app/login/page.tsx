import Link from "next/link";
import { Eye, Smartphone } from "lucide-react";
import { AppBrand, PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CONTROL_HEIGHT, LIST_STACK } from "@/constants/design";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-center">
        <AppBrand className="mb-section" />

        <div className={LIST_STACK}>
          <Button
            className={cn(
              CONTROL_HEIGHT,
              "border-border bg-card text-foreground hover:bg-muted rounded-control w-full border text-base font-bold shadow-none",
            )}
            variant="outline"
          >
            <span className="text-lg font-extrabold text-blue-500">G</span>
            Continuar com Google
          </Button>
          <Button
            className={cn(
              CONTROL_HEIGHT,
              "bg-foreground text-background hover:bg-foreground/90 rounded-control w-full text-base font-bold",
            )}
          >
            <Smartphone className="size-5" />
            Continuar com Apple
          </Button>
        </div>

        <div className="text-muted-foreground my-section gap-stack-md flex items-center text-sm">
          <div className="bg-border h-px flex-1" />
          <span>ou continue com e-mail</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <form className="space-y-stack-lg">
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
            />
          </label>

          <label className="space-y-stack-xs block">
            <span className="text-foreground text-sm font-semibold">Senha</span>
            <div className="relative">
              <Input
                className={cn(
                  CONTROL_HEIGHT,
                  "bg-card rounded-control px-card pr-12 text-base",
                )}
                placeholder="••••••••"
                type="password"
              />
              <Eye className="text-muted-foreground absolute top-1/2 right-4 size-5 -translate-y-1/2" />
            </div>
          </label>

          <div className="text-right">
            <Link className="text-primary text-sm font-semibold" href="/login">
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            className={cn(
              CONTROL_HEIGHT,
              "rounded-control w-full text-base font-bold",
            )}
          >
            Entrar
          </Button>
        </form>

        <p className="text-muted-foreground mt-section text-center text-sm">
          Não tem conta?{" "}
          <Link className="text-primary font-bold" href="/register">
            Criar conta
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
