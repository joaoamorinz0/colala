import Link from "next/link";
import { Star } from "lucide-react";
import { CARD_SURFACE, MEDIA_COVER } from "@/constants/design";
import type { PublicReview } from "@/types/review";

/**
 * Card de uma avaliação pública: local + nota + comentário.
 * O nome/local linkam para a página do place; a foto é o cover do place.
 */
export function PublicReviewCard({ review }: { review: PublicReview }) {
  const createdAt = new Date(review.created_at);
  const formattedDate = createdAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const place = review.place;

  return (
    <article className={CARD_SURFACE}>
      <div className="p-card flex items-start gap-3">
        <Link
          href={`/place/${review.place_id}`}
          className="bg-muted size-12 shrink-0 overflow-hidden rounded-md"
        >
          {place?.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={place.cover_image}
              alt={place.name}
              className={MEDIA_COVER}
            />
          ) : (
            <div className="bg-primary/10 text-primary flex size-full items-center justify-center text-sm font-bold">
              {place?.name?.[0] ?? "?"}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-800">
              {review.rating.toFixed(1)}
            </span>
          </div>
          <Link href={`/place/${review.place_id}`} className="mt-1 block">
            <span className="text-card-foreground line-clamp-1 text-sm font-bold">
              {place?.name ?? "Local"}
            </span>
          </Link>
          <p className="text-muted-foreground text-xs">{formattedDate}</p>
        </div>
      </div>

      {review.comment ? (
        <p className="text-card-foreground border-border px-card pb-card border-t pt-3 text-sm leading-relaxed">
          {review.comment}
        </p>
      ) : null}
    </article>
  );
}
