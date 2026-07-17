"use client";

import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

export type InstagramButtonProps = {
  instagram: string;
  size?: "sm" | "md";
  className?: string;
};

export function InstagramButton({ instagram, size = "md", className }: InstagramButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const username = instagram.replace(/^@/, "");
    window.open(`https://instagram.com/${username}`, "_blank");
  };

  const sizeClasses = size === "sm" ? "size-3.5 sm:size-4" : "size-5";
  const buttonClasses = size === "sm" ? "p-1 rounded" : "p-1.5 rounded-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all duration-200",
        buttonClasses,
        className,
      )}
      aria-label={`Visit ${instagram} on Instagram`}
    >
      <Instagram className={sizeClasses} />
    </button>
  );
}
