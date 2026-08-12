import { AuthLayout } from "@/components/layout";
import { SECTION_STACK } from "@/constants/design";
import { PlannedPlaces } from "@/features/places";

export default function PlanosPage() {
  return (
    <AuthLayout>
      <div className={SECTION_STACK}>
        <header>
          <h1 className="text-foreground text-[2rem] font-extrabold tracking-tight">
            Planos
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Lugares que você quer visitar
          </p>
        </header>

        <section className="space-y-stack-md">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            Sua lista de planos
          </h2>
          <PlannedPlaces />
        </section>
      </div>
    </AuthLayout>
  );
}
