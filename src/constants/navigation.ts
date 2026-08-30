import { CalendarCheck, Home, Search, User, Sparkles } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const MAIN_NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/home", icon: Home, label: "Início" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/experiencias", icon: Sparkles, label: "Experiências" },
  { href: "/planos", icon: CalendarCheck, label: "Planos" },
  { href: "/profile", icon: User, label: "Perfil" },
];
