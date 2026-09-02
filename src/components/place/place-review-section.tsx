"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Star, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useSupabase } from "@/providers";
import {
  useDeletePlaceReview,
  usePlaceReviewSummary,
  usePlaceReviews,
  useReviewTags,
  useSavePlaceReview,
  useUserPlaceReview,
} from "@/features/places/hooks/use-place-reviews";
import { StarRatingInput } from "@/components/place/star-rating-input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { uploadImage } from "@/services/admin.service";
import { PublicReviewCard } from "@/components/profile";
import type { ReviewTag } from "@/types/review";

// ─── Review Modal ──────────────────────────────────────────────────────────────
type ReviewSheetProps = {
  placeId: string;
  open: boolean;
  onClose: () => void;
};

function ReviewSheet({ placeId, open, onClose }: ReviewSheetProps) {
  const toast = useToast();
  const { user } = useSupabase();
  const router = useRouter();
  const { data: currentReview, isLoading: currentLoading } =
    useUserPlaceReview(placeId);
  const { data: reviewTags = [], isLoading: tagsLoading } = useReviewTags();
  const saveReviewMutation = useSavePlaceReview(placeId);
  const deleteReviewMutation = useDeletePlaceReview(placeId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<string[]>(
    [],
  );
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Pré-carrega a avaliação atual quando o modal abre
  useEffect(() => {
    if (open) {
      setRating(currentReview?.rating ?? 0);
      setComment(currentReview?.comment ?? "");
      setSelectedTagIds(currentReview?.review_tags?.map((tag) => tag.id) ?? []);
      setPhotoUrls(
        currentReview?.review_photos?.map((photo) => photo.url) ?? [],
      );
      setSelectedFiles([]);
      setSelectedFilePreviews([]);
    }
  }, [open, currentReview]);

  useEffect(() => {
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setSelectedFilePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [selectedFiles]);

  if (!open) return null;

  const handleSave = async () => {
    if (rating < 1) {
      toast.show("Escolha uma nota de 1 a 5 estrelas.", "error");
      return;
    }

    let uploadedPhotoUrls = [...photoUrls];
    if (selectedFiles.length > 0) {
      try {
        setUploadingPhotos(true);
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Supabase não configurado");
        const results = await Promise.all(
          selectedFiles.map((file) => uploadImage(client, file, "places")),
        );
        uploadedPhotoUrls = [...uploadedPhotoUrls, ...results];
      } catch (error) {
        toast.show(
          error instanceof Error
            ? error.message
            : "Não foi possível enviar as fotos.",
          "error",
        );
        return;
      } finally {
        setUploadingPhotos(false);
      }
    }

    saveReviewMutation.mutate(
      {
        rating,
        comment: comment.trim() || null,
        tagIds: selectedTagIds,
        photoUrls: uploadedPhotoUrls,
      },
      {
        onSuccess: () => {
          toast.show("Avaliação salva com sucesso!", "success");
          onClose();
        },
        onError: (error) => {
          toast.show(
            error instanceof Error
              ? error.message
              : "Não foi possível salvar a avaliação.",
            "error",
          );
        },
      },
    );
  };

  const handleDelete = () => {
    if (!currentReview) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja deletar sua avaliação?",
    );
    if (!confirmed) return;

    deleteReviewMutation.mutate(currentReview.id, {
      onSuccess: () => {
        toast.show("Avaliação deletada com sucesso!", "success");
        onClose();
        router.refresh();
      },
      onError: (error) => {
        toast.show(
          error instanceof Error
            ? error.message
            : "Não foi possível deletar a avaliação.",
          "error",
        );
      },
    });
  };

  const isSaving = saveReviewMutation.isPending;
  const isDeleting = deleteReviewMutation.isPending;
  const isBusy = isSaving || uploadingPhotos || isDeleting;
  const isExisting = Boolean(currentReview);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setSelectedFiles((current) => [...current, ...files]);
    event.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Fechar avaliação"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div className="animate-sheet-in relative w-full max-w-lg rounded-t-3xl bg-white p-6 pb-8">
        {/* Grab handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              {isExisting ? "Editar avaliação" : "Avaliar lugar"}
            </h2>
            <p className="text-sm text-gray-500">
              Sua nota ajuda outros viajantes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Rating */}
        {currentLoading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="h-9 w-56 animate-pulse rounded-full bg-gray-100" />
          </div>
        ) : (
          <StarRatingInput
            value={rating}
            onChange={setRating}
            disabled={isBusy}
          />
        )}

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={isBusy}
          placeholder="Conte como foi sua experiência (opcional)..."
          rows={4}
          className="mt-5 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 focus:outline-none disabled:opacity-60"
        />

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Tags</h3>
            {tagsLoading && (
              <span className="text-xs text-gray-400">Carregando...</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {reviewTags.map((tag) => {
              const active = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  disabled={isBusy}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all",
                    active
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {active ? (
                    <Check className="size-3.5" />
                  ) : tag.icon ? (
                    <span>{tag.icon}</span>
                  ) : null}
                  <span>{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Fotos</h3>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <ImagePlus className="size-3.5" />
              Adicionar fotos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="hidden"
                disabled={isBusy}
              />
            </label>
          </div>
          {(photoUrls.length > 0 || selectedFiles.length > 0) && (
            <div className="grid grid-cols-3 gap-2">
              {photoUrls.map((url) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Foto da avaliação"
                    className="size-full object-cover"
                  />
                </div>
              ))}
              {selectedFiles.map((file) => (
                <div
                  key={file.name + file.lastModified}
                  className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      selectedFilePreviews[selectedFiles.indexOf(file)] ?? ""
                    }
                    alt={file.name}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          {isExisting ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 border-red-200 text-red-700 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isBusy}
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isBusy}
            className="h-12 flex-1"
          >
            {isBusy ? "Salvando..." : isExisting ? "Atualizar" : "Salvar"}
          </Button>
        </div>

        {!user && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Você precisa estar logado para avaliar.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Public Section ────────────────────────────────────────────────────────────
function ReviewSummary({
  average,
  count,
}: {
  average: number | null;
  count: number;
}) {
  if (count === 0) {
    return <p className="text-sm text-gray-500">Seja o primeiro a avaliar!</p>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Star className="size-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-bold text-gray-800">
        {average?.toFixed(1)}
      </span>
      <span className="text-sm text-gray-500">
        ({count} avaliaç{count === 1 ? "ão" : "ões"})
      </span>
    </div>
  );
}

function ReviewSummarySkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-16 animate-pulse rounded-full bg-gray-100" />
      <div className="h-4 w-24 animate-pulse rounded-full bg-gray-100" />
    </div>
  );
}

export function PlaceReviewSection({ placeId }: { placeId: string }) {
  const router = useRouter();
  const { user } = useSupabase();
  const { data: summary, isLoading: summaryLoading } =
    usePlaceReviewSummary(placeId);
  const { data: currentReview } = useUserPlaceReview(placeId);
  const { data: reviews = [], isLoading: reviewsLoading } =
    usePlaceReviews(placeId);
  const [sheetOpen, setSheetOpen] = useState(false);

  const tagFrequency = useMemo(() => {
    const counts = new Map<string, { tag: ReviewTag; count: number }>();
    reviews.forEach((review) => {
      review.review_tags.forEach((tag) => {
        const existing = counts.get(tag.id);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(tag.id, { tag, count: 1 });
        }
      });
    });

    const total = reviews.length;
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ tag, count }) => ({
        tag,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }, [reviews]);

  const openReviewSheet = () => {
    if (!user) {
      router.push(
        `/login?redirectTo=${encodeURIComponent(`/place/${placeId}`)}`,
      );
      return;
    }

    setSheetOpen(true);
  };

  const hasUserReview = Boolean(currentReview);

  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-gray-900">Avaliações</h2>

      <div className="flex items-center justify-between gap-3">
        {summaryLoading || !summary ? (
          <ReviewSummarySkeleton />
        ) : (
          <ReviewSummary average={summary.average} count={summary.count} />
        )}

        <button
          id="place-review-btn"
          type="button"
          onClick={openReviewSheet}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95",
            hasUserReview
              ? "border border-amber-200 bg-amber-50 text-amber-700"
              : "bg-gray-900 text-white",
          )}
        >
          <Star className="size-3.5 fill-current" />
          {hasUserReview ? "Editar avaliação" : "Avaliar"}
        </button>
      </div>

      {/* Agregação: tags mais frequentes entre as avaliações */}
      {tagFrequency.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-900">O que dizem sobre</h3>
          <div className="flex flex-wrap gap-2">
            {tagFrequency.map(({ tag, percentage }) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
              >
                {tag.icon ? <span>{tag.icon}</span> : null}
                {percentage}% dizem que é {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista de avaliações */}
      {reviewsLoading ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <PublicReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : null}

      <ReviewSheet
        placeId={placeId}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </section>
  );
}
