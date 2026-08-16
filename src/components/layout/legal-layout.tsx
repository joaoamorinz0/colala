import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { cn } from "@/lib/utils";

/*
 * AVISO INTERNO (não exibido na interface pública):
 * Este conteúdo foi gerado automaticamente como ponto de partida e deve
 * passar por revisão jurídica antes de ser considerado definitivo ou
 * juridicamente válido.
 */

export type LegalLayoutProps = {
  title: string;
  updatedAt?: string;
  children: ReactNode;
};

/**
 * Layout mobile-first para páginas legais (Termos e Privacidade).
 * Largura confortável de leitura, tipografia do projeto e consistente
 * com o restante do Colalá.
 */
export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  return (
    <PublicLayout>
      <div className="flex min-h-dvh flex-col">
        <Link
          href="/"
          className="hover:bg-muted text-muted-foreground inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="size-4" />
          Início
        </Link>

        <article className="mt-stack-md max-w-app">
          <header>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
              {title}
            </h1>
            {updatedAt ? (
              <p className="text-muted-foreground mt-stack-xs text-sm">
                Última atualização: {updatedAt}
              </p>
            ) : null}
          </header>

          <div
            className={cn(
              "text-foreground mt-stack-lg space-y-stack-lg [&>section]:space-y-stack-sm text-[15px] leading-relaxed",
            )}
          >
            {children}
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}
