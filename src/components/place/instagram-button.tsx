"use client";

import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

export type InstagramButtonProps = {
  instagram: string;
  size?: "sm" | "md";
  className?: string;
};

export function InstagramButton({
  instagram,
  size = "md",
  className,
}: InstagramButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const username = instagram.replace(/^@/, "");
    window.open(`https://instagram.com/${username}`, "_blank");
  };

  const iconSize = size === "sm" ? "size-3.5" : "size-4";
  const buttonSize = size === "sm" ? "p-1 rounded-md" : "p-1.5 rounded-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "text-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors duration-200",
        buttonSize,
        className,
      )}
      aria-label={`Abrir ${instagram} no Instagram`}
    >
      <Instagram className={iconSize} />
    </button>
  );
}
