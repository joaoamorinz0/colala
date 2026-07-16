import {
  Beef,
  Coffee,
  GlassWater,
  Music,
  Sparkles,
  Sunset,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export type Experience = {
  id: string;
  title: string;
  category: string;
  description: string;
  address: string;
  neighborhood: string;
  distance: string;
  rating: number;
  reviewCount: number;
  price: string;
  isOpen?: boolean;
  imageUrl: string;
};

export const MOCK_EXPERIENCES: Experience[] = [
  {
    id: "1",
    title: "Café Marcolini",
    category: "Café",
    description:
      "Espaço aconchegante com cafés especiais e mesas para trabalhar.",
    address: "Rua dos Pinheiros, 248",
    neighborhood: "Pinheiros",
    distance: "0.3 km",
    rating: 4.9,
    reviewCount: 847,
    price: "$$",
    isOpen: true,
    imageUrl:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Mirante da Pauliceia",
    category: "Bar",
    description:
      "Drinks, vista da cidade e clima perfeito para o fim de tarde.",
    address: "Av. Ipiranga, 344",
    neighborhood: "Consolação",
    distance: "1.2 km",
    rating: 4.8,
    reviewCount: 1203,
    price: "$$$",
    imageUrl:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Parque das Águas",
    category: "Passeio",
    description:
      "Ótimo lugar para caminhar, fazer piquenique e ver o pôr do sol.",
    address: "Rua Verde, S/N",
    neighborhood: "Vila Madalena",
    distance: "2.1 km",
    rating: 4.7,
    reviewCount: 418,
    price: "$",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Boliche Games",
    category: "Diversão",
    description: "Boliche, jogos e encontros descontraídos com amigos.",
    address: "Rua Verde, S/N",
    neighborhood: "Moema",
    distance: "3.4 km",
    rating: 4.6,
    reviewCount: 302,
    price: "$$",
    imageUrl:
      "https://images.unsplash.com/photo-1545056453-f0359c3df6db?q=80&w=1200&auto=format&fit=crop",
  },
];

export const RECENT_SEARCHES = [
  "Cafés no Itaim",
  "Rooftop bar",
  "Brunch Pinheiros",
  "Música ao vivo",
];

export type CategoryItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const EXPERIENCE_CATEGORIES: CategoryItem[] = [
  { id: "all", label: "Todos", icon: Sparkles },
  { id: "coffee", label: "Cafés", icon: Coffee },
  { id: "restaurants", label: "Restaurantes", icon: Utensils },
  { id: "bars", label: "Bares", icon: GlassWater },
  { id: "burgers", label: "Burgers", icon: Beef },
  { id: "music", label: "Música", icon: Music },
  { id: "sunset", label: "Pôr do sol", icon: Sunset },
];
