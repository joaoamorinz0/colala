import { MainLayout } from "@/components/layout";
// Importamos o HeroCard que está aberto no seu VS Code
import { HeroCard } from "@/components/cards/hero-card";

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

        {/* Card em Destaque usando o seu componente HeroCard */}
        <HeroCard
          title="Café Estrela"
          description="O melhor café artesanal da cidade com cookies quentinhos feitos na hora."
          // Passamos uma imagem dentro do parâmetro media
          media={
            <img
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
              alt="Café Estrela"
              className="h-full w-full object-cover"
            />
          }
          // Passamos um botão dentro do parâmetro action
          action={
            <button className="bg-primary text-primary-foreground w-full rounded-md px-4 py-2 text-sm font-medium hover:opacity-90">
              Ver mais detalhes
            </button>
          }
        />
      </div>
    </MainLayout>
  );
}
