"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useSupabase } from "@/providers";
import {
  usePlaceReviewSummary,
  useSavePlaceReview,
  useUserPlaceReview,
} from "@/features/places/hooks/use-place-reviews";
import { StarRatingInput } from "@/components/place/star-rating-input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

// ─── Review Modal ──────────────────────────────────────────────────────────────
type ReviewSheetProps = {
  placeId: string;
  open: boolean;
  onClose: () => void;
};

function ReviewSheet({ placeId, open, onClose }: ReviewSheetProps) {
  const toast = useToast();
  const { user } = useSupabase();
  const { data: currentReview, isLoading: currentLoading } =
    useUserPlaceReview(placeId);
  const saveReviewMutation = useSavePlaceReview(placeId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Pré-carrega a avaliação atual quando o modal abre
  useEffect(() => {
    if (open) {
      setRating(currentReview?.rating ?? 0);
      setComment(currentReview?.comment ?? "");
    }
  }, [open, currentReview]);

  if (!open) return null;

  const handleSave = async () => {
    if (rating < 1) {
      toast.show("Escolha uma nota de 1 a 5 estrelas.", "error");
      return;
    }

    saveReviewMutation.mutate(
      {
        rating,
        comment: comment.trim() || null,
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

  const isSaving = saveReviewMutation.isPending;
  const isExisting = Boolean(currentReview);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Fechar avaliação"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div className="animate-in slide-in-from-bottom-4 relative w-full max-w-lg rounded-t-3xl bg-white p-6 pb-8">
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
            disabled={isSaving}
          />
        )}

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={isSaving}
          placeholder="Conte como foi sua experiência (opcional)..."
          rows={4}
          className="mt-5 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 focus:outline-none disabled:opacity-60"
        />

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 flex-1"
          >
            {isSaving ? "Salvando..." : isExisting ? "Atualizar" : "Salvar"}
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
  const [sheetOpen, setSheetOpen] = useState(false);

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

      <ReviewSheet
        placeId={placeId}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </section>
  );
}
