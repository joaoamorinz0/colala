import { Heart, Home, Search, User } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const MAIN_NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/profile", icon: User, label: "Profile" },
];
