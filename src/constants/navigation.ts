import { CalendarCheck, Compass, User, Sparkles } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const MAIN_NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/discover", icon: Compass, label: "Descobrir" },
  { href: "/experiencias", icon: Sparkles, label: "Experiências" },
  { href: "/planos", icon: CalendarCheck, label: "Planos" },
  { href: "/profile", icon: User, label: "Perfil" },
];
