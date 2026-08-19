"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

export type FilterSheetState = {
  workFriendly: boolean;
  petFriendly: boolean;
  wifi: boolean;
  acceptsBookClub: boolean;
  activeCategoryId: string | null;
  activeSubcategoryId: string | null;
};

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  onApply: (state: FilterSheetState) => void;
  initial: FilterSheetState;
  categories: Category[];
};

export function FilterSheet({
  open,
  onClose,
  onApply,
  initial,
  categories,
}: FilterSheetProps) {
  const [local, setLocal] = useState<FilterSheetState>(initial);

  // Sincroniza o estado local com as props externas quando o modal abre.
  useEffect(() => {
    if (open) {
      setLocal(initial);
    }
  }, [open, initial]);

  const mainCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories],
  );

  const subcategories = useMemo(
    () =>
      local.activeCategoryId
        ? categories.filter((c) => c.parent_id === local.activeCategoryId)
        : [],
    [categories, local.activeCategoryId],
  );

  const toggleAttribute = (
    field: keyof Pick<
      FilterSheetState,
      "workFriendly" | "petFriendly" | "wifi" | "acceptsBookClub"
    >,
  ) => {
    setLocal((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setLocal((prev) => ({
      ...prev,
      activeCategoryId: categoryId,
      activeSubcategoryId: null,
    }));
  };

  const handleSubcategoryClick = (subId: string | null) => {
    setLocal((prev) => ({
      ...prev,
      activeSubcategoryId: subId,
    }));
  };

  const handleClear = () => {
    setLocal({
      workFriendly: false,
      petFriendly: false,
      wifi: false,
      acceptsBookClub: false,
      activeCategoryId: null,
      activeSubcategoryId: null,
    });
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-[#fbf8f4] shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-extrabold tracking-tight">
              Filtros
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Categories */}
          <section className="mb-6">
            <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Categoria
            </h3>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Todas"
                active={local.activeCategoryId === null}
                onClick={() => handleCategoryClick(null)}
              />
              {mainCategories.map((cat) => (
                <FilterChip
                  key={String(cat.id)}
                  label={cat.name}
                  icon={cat.icon ?? undefined}
                  active={local.activeCategoryId === String(cat.id)}
                  onClick={() =>
                    handleCategoryClick(
                      local.activeCategoryId === String(cat.id)
                        ? null
                        : String(cat.id),
                    )
                  }
                />
              ))}
            </div>
          </section>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <section className="mb-6">
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Subcategoria
              </h3>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="Todas"
                  active={local.activeSubcategoryId === null}
                  onClick={() => handleSubcategoryClick(null)}
                />
                {subcategories.map((sub) => (
                  <FilterChip
                    key={String(sub.id)}
                    label={sub.name}
                    icon={sub.icon ?? undefined}
                    active={local.activeSubcategoryId === String(sub.id)}
                    onClick={() =>
                      handleSubcategoryClick(
                        local.activeSubcategoryId === String(sub.id)
                          ? null
                          : String(sub.id),
                      )
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Attribute toggles */}
          <section className="mb-6">
            <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Atributos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <FilterToggle
                label="💻 Work friendly"
                active={local.workFriendly}
                onClick={() => toggleAttribute("workFriendly")}
              />
              <FilterToggle
                label="🐾 Pet friendly"
                active={local.petFriendly}
                onClick={() => toggleAttribute("petFriendly")}
              />
              <FilterToggle
                label="📶 Wi-Fi"
                active={local.wifi}
                onClick={() => toggleAttribute("wifi")}
              />
              <FilterToggle
                label="📚 Clube do livro"
                active={local.acceptsBookClub}
                onClick={() => toggleAttribute("acceptsBookClub")}
              />
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Limpar filtros
            </Button>
            <Button type="button" onClick={handleApply} className="flex-1">
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors",
        active
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border bg-card text-card-foreground hover:bg-muted",
      )}
    >
      {icon ? <span>{icon}</span> : null}
      {label}
    </button>
  );
}

function FilterToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border bg-card text-card-foreground hover:bg-muted",
      )}
    >
      <span className="text-base">{label.split(" ")[0]}</span>
      <span>{label.split(" ").slice(1).join(" ")}</span>
    </button>
  );
}
