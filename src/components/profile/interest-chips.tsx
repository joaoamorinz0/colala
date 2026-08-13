import { cn } from "@/lib/utils";
import type { ProfileInterest } from "@/types/profile-interest";

export type InterestChipsProps = {
  interests: ProfileInterest[];
  className?: string;
};

/**
 * Seção "Você curte" com chips de categoria.
 * Retorna null quando a lista está vazia (seção não deve aparecer vazia).
 */
export function InterestChips({ interests, className }: InterestChipsProps) {
  if (interests.length === 0) {
    return null;
  }

  return (
    <section className={cn(className)}>
      <h2 className="text-foreground text-lg font-bold tracking-tight">
        Você curte
      </h2>
      <ul className="mt-stack-sm flex flex-wrap gap-2">
        {interests.map((interest) => {
          const category = interest.category;

          if (!category) {
            return null;
          }

          return (
            <li
              key={interest.category_id}
              className="bg-muted text-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium"
            >
              {category.icon ? (
                <span aria-hidden="true" className="text-base leading-none">
                  {category.icon}
                </span>
              ) : null}
              {category.name}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
