"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout, PageHeader, LoadingSpinner } from "@/components/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getAllPlaces, deletePlace } from "@/services/admin.service";
import type { Place } from "@/types/place";
import { Edit2, Trash2, Plus } from "lucide-react";

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

  return (
    <AdminLayout>
      <PageHeader
        title="Locais"
        description="Gerencie todos os locais cadastrados"
        action={
          <Link
            href="/admin/places/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Local
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : places.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center">
          <p className="text-gray-600">Nenhum local cadastrado ainda</p>
          <Link
            href="/admin/places/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Criar primeiro local
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr
                    key={place.id}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {place.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {place.city || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {place.category_id ? `ID: ${place.category_id}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {place.price_level ? `${place.price_level}$` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/places/${place.id}/edit`}
                          className="text-blue-600 transition-colors hover:text-blue-700"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(place.id)}
                          className="text-red-600 transition-colors hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
