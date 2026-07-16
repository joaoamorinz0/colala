import { Heart, Star } from "lucide-react";
import type { Experience } from "@/features/places";
import { cn } from "@/lib/utils";

export type FavoritePlaceRowProps = {
  experience: Experience;
  className?: string;
};

export function FavoritePlaceRow({
  experience,
  className,
}: FavoritePlaceRowProps) {
  return (
    <article className={cn("flex gap-5", className)}>
      <div
        className="bg-muted h-36 w-40 shrink-0 rounded-2xl"
        style={{
          backgroundImage: `url(${experience.imageUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="min-w-0 flex-1 py-2">
        <p className="text-muted-foreground text-base">
          {experience.category === "Café" ? "☕" : "🌇"} {experience.category}
        </p>
        <h2 className="text-foreground mt-2 line-clamp-1 text-2xl font-bold">
          {experience.title}
        </h2>
        <p className="text-muted-foreground mt-1 text-lg">
          {experience.neighborhood} · {experience.distance}
        </p>
        <div className="mt-3 flex items-center gap-2 text-lg font-bold">
          <Star className="size-5 fill-yellow-300 text-yellow-300" />
          {experience.rating}
          <span className="text-muted-foreground font-medium">
            ({experience.reviewCount})
          </span>
          <span className="text-muted-foreground ml-2">{experience.price}</span>
        </div>
      </div>
      <button className="text-primary pt-6" type="button">
        <Heart className="size-8" />
      </button>
    </article>
  );
}
