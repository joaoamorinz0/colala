"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { AdminLayout, LoadingSpinner, PageHeader } from "@/components/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { reviewSchema } from "@/lib/validators/admin";
import {
  createReview,
  deleteReview,
  getAllReviews,
  updateReview,
} from "@/services/admin.service";
import { getAllPlaces } from "@/services/admin.service";
import type { Place } from "@/types/place";
import type { Review } from "@/types/review";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";

const EMPTY_FORM = { place_id: "", user_id: "", rating: "5", comment: "" };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Supabase não configurado");
        const [reviewsData, placesData] = await Promise.all([
          getAllReviews(client),
          getAllPlaces(client),
        ]);
        setReviews(reviewsData);
        setPlaces(placesData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar avaliações",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const placeLabelById = useMemo(() => {
    return new Map(places.map((place) => [place.id, place.name]));
  }, [places]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowNewForm(false);
  };

  const handleSave = async () => {
    const parsed = reviewSchema.safeParse({
      ...form,
      rating: Number(form.rating),
    });
    if (!parsed.success) {
      toast.show(
        parsed.error.issues[0]?.message ?? "Avaliação inválida",
        "error",
      );
      return;
    }

    try {
      setSaving(true);
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");

      const payload = {
        ...parsed.data,
        comment: parsed.data.comment || null,
      };

      if (editingId) {
        const updated = await updateReview(client, editingId, payload);
        setReviews((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
        toast.show("Avaliação atualizada com sucesso.", "success");
      } else {
        const created = await createReview(client, payload);
        setReviews((prev) => [created, ...prev]);
        toast.show("Avaliação criada com sucesso.", "success");
      }

      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar avaliação";
      toast.show(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setShowNewForm(true);
    setForm({
      place_id: review.place_id,
      user_id: review.user_id,
      rating: String(review.rating),
      comment: review.comment || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta avaliação?")) return;
    try {
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Supabase não configurado");
      await deleteReview(client, id);
      setReviews((prev) => prev.filter((item) => item.id !== id));
      toast.show("Avaliação removida com sucesso.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao deletar avaliação";
      toast.show(message, "error");
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Avaliações"
        description="Gerencie reviews dos locais"
        action={
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            <Plus size={20} />
            Nova Avaliação
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {showNewForm && (
            <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select
                  value={form.place_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, place_id: e.target.value }))
                  }
                  className="border-input bg-background text-foreground rounded-lg border px-4 py-2"
                >
                  <option value="">Selecione o local</option>
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </select>
                <input
                  value={form.user_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, user_id: e.target.value }))
                  }
                  placeholder="UUID do usuário"
                  className="border-input bg-background text-foreground rounded-lg border px-4 py-2"
                />
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rating: e.target.value }))
                  }
                  className="border-input bg-background text-foreground rounded-lg border px-4 py-2"
                />
                <input
                  value={form.comment}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Comentário"
                  className="border-input bg-background text-foreground rounded-lg border px-4 py-2"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 disabled:opacity-50"
                >
                  <Check size={18} />
                  {editingId ? "Salvar" : "Criar"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
            <table className="w-full">
              <thead className="bg-muted border-border border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Nota
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Comentário
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-border border-b">
                    <td className="px-6 py-4 text-sm">
                      {review.place?.name ??
                        placeLabelById.get(review.place_id) ??
                        "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">{review.user_id}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {review.rating}
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-sm">
                      {review.comment || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(review)}
                          className="text-primary"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                          className="text-destructive"
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
