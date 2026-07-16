import Link from "next/link";
import { Eye, Smartphone } from "lucide-react";
import { AppBrand, PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col justify-center">
        <AppBrand className="mb-12" />

        <div className="space-y-4">
          <Button
            className="border-border bg-card text-foreground hover:bg-muted h-20 w-full rounded-3xl border text-xl font-bold shadow-none"
            variant="outline"
          >
            <span className="text-2xl font-extrabold text-blue-500">G</span>
            Continuar com Google
          </Button>
          <Button className="bg-foreground text-background hover:bg-foreground/90 h-20 w-full rounded-3xl text-xl font-bold">
            <Smartphone className="size-8" />
            Continuar com Apple
          </Button>
        </div>

        <div className="text-muted-foreground my-10 flex items-center gap-5 text-lg">
          <div className="bg-border h-px flex-1" />
          <span>ou continue com e-mail</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <form className="space-y-7">
          <label className="block space-y-3">
            <span className="text-foreground text-xl font-semibold">
              E-mail
            </span>
            <Input
              className="bg-card h-20 rounded-3xl px-7 text-xl"
              placeholder="seu@email.com"
            />
          </label>

          <label className="block space-y-3">
            <span className="text-foreground text-xl font-semibold">Senha</span>
            <div className="relative">
              <Input
                className="bg-card h-20 rounded-3xl px-7 pr-16 text-xl"
                placeholder="••••••••"
                type="password"
              />
              <Eye className="text-muted-foreground absolute top-1/2 right-6 size-7 -translate-y-1/2" />
            </div>
          </label>

          <div className="text-right">
            <Link className="text-primary text-lg font-semibold" href="/login">
              Esqueceu a senha?
            </Link>
          </div>

          <Button className="h-20 w-full rounded-3xl text-2xl font-bold">
            Entrar
          </Button>
        </form>

        <p className="text-muted-foreground mt-10 text-center text-xl">
          Não tem conta?{" "}
          <Link className="text-primary font-bold" href="/register">
            Criar conta
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
