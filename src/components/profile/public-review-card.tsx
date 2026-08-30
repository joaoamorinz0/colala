import Link from "next/link";
import { Star, User } from "lucide-react";
import { CARD_SURFACE, MEDIA_COVER } from "@/constants/design";
import type { PlaceReviewCardData, PublicReview } from "@/types/review";

/**
 * Card de uma avaliação pública: local + nota + comentário.
 * O nome/local linkam para a página do place; a foto é o cover do place.
 */
export function PublicReviewCard({
  review,
}: {
  review: PublicReview | PlaceReviewCardData;
}) {
  const createdAt = new Date(review.created_at);
  const formattedDate = createdAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const place = review.place;
  const tags = review.review_tags ?? [];
  const photos = review.review_photos ?? [];
  const authorUsername =
    "author" in review && review.author?.username
      ? review.author.username
      : null;
  const authorAvatarUrl =
    "author" in review ? (review.author?.avatar_url ?? null) : null;

  return (
    <article className={CARD_SURFACE}>
      <div className="p-card flex items-start gap-3">
        <div className="bg-muted size-12 shrink-0 overflow-hidden rounded-full">
          {authorAvatarUrl ? (
            <Link href={`/place/${review.place_id}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={authorAvatarUrl}
                alt={authorUsername ? `@${authorUsername}` : "Avatar do autor"}
                className={MEDIA_COVER}
              />
            </Link>
          ) : (
            <Link
              href={`/place/${review.place_id}`}
              className="bg-primary/10 text-primary flex size-full items-center justify-center"
            >
              <User className="text-muted-foreground size-5" />
            </Link>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {authorUsername ? `@${authorUsername}` : "Review"}
            </span>
          </div>
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

      {tags.length > 0 && (
        <div className="px-card flex flex-wrap gap-2 pb-3">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-100"
            >
              {tag.icon ? <span>{tag.icon}</span> : null}
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="px-card pb-card grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((photo) => (
            <div
              key={photo.id}
              className="aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Foto da avaliação de ${place?.name ?? "local"}`}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
