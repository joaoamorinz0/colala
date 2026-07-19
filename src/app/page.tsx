import Link from "next/link";
import { MainLayout } from "@/components/layout";


export default function IndexPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-4">
        {/* Título de boas-vindas do Colalá */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Colalá</h1>
          <p className="text-muted-foreground text-sm">
            Descubra cafés, restaurantes, bares e experiências.
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">
            Para entrar como administrador, acesse a página de login.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Entrar / Login
          </Link>
        </div>

        {/* Card em Destaque usando o seu componente HeroCard */}
      </div>
    </MainLayout>
  );
}