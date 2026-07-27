"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout, PageHeader, LoadingSpinner } from "@/components/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  getAllPlaces,
  deletePlace,
  updatePlace,
} from "@/services/admin.service";
import type { Place, PlaceStatus } from "@/types/place";
import { Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<PlaceStatus, { label: string; className: string }> =
  {
    published: {
      label: "Publicado",
      className: "bg-emerald-100 text-emerald-700",
    },
    pending: { label: "Pendente", className: "bg-amber-100 text-amber-700" },
    rejected: { label: "Rejeitado", className: "bg-red-100 text-red-700" },
  };

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Supabase não configurado");

        const data = await getAllPlaces(client);
        setPlaces(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar locais",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este local?")) return;

    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      await deletePlace(client, id);
      setPlaces(places.filter((place) => place.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar local");
    }
  };

  const handleStatusChange = async (id: string, status: PlaceStatus) => {
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      await updatePlace(client, id, { status });
      setPlaces(places.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao alterar status");
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Locais"
        description="Gerencie todos os locais cadastrados"
        action={
          <Link
            href="/admin/places/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            <Plus size={20} />
            Novo Local
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : places.length === 0 ? (
        <div className="border-border bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">Nenhum local cadastrado ainda</p>
          <Link
            href="/admin/places/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-block rounded-lg px-6 py-2 font-medium transition-colors"
          >
            Criar primeiro local
          </Link>
        </div>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-border border-b">
                <tr>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Nome
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Cidade
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="text-foreground px-6 py-3 text-left text-sm font-semibold">
                    Preço
                  </th>
                  <th className="text-foreground px-6 py-3 text-right text-sm font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => {
                  const statusKey = (place.status ??
                    "published") as PlaceStatus;
                  const statusCfg = STATUS_CONFIG[statusKey];

                  return (
                    <tr
                      key={place.id}
                      className="border-border hover:bg-muted/50 border-b transition-colors"
                    >
                      <td className="text-foreground px-6 py-4 text-sm font-medium">
                        {place.name}
                      </td>
                      <td className="text-muted-foreground px-6 py-4 text-sm">
                        {place.city || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              statusCfg.className,
                            )}
                          >
                            {statusCfg.label}
                          </span>
                          <div className="flex gap-0.5">
                            {(
                              [
                                "published",
                                "pending",
                                "rejected",
                              ] as PlaceStatus[]
                            ).map((s) => {
                              if (s === statusKey) return null;
                              const icons = {
                                published: <Check className="size-3.5" />,
                                pending: (
                                  <span className="text-[10px]">⏳</span>
                                ),
                                rejected: <X className="size-3.5" />,
                              };
                              return (
                                <button
                                  key={s}
                                  onClick={() =>
                                    handleStatusChange(place.id, s)
                                  }
                                  className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
                                  title={`Alterar para ${STATUS_CONFIG[s].label}`}
                                >
                                  {icons[s]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="text-muted-foreground px-6 py-4 text-sm">
                        {place.price_level ? `${place.price_level}$` : "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/places/${place.id}/edit`}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(place.id)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
