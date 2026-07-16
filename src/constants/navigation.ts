import { Heart, Home, Search, User } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const MAIN_NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/home", icon: Home, label: "Início" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/favorites", icon: Heart, label: "Favoritos" },
  { href: "/profile", icon: User, label: "Perfil" },
];
