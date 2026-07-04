import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

export type NavigationItem = {
  href: Route;
  icon?: LucideIcon;
  label: string;
};
