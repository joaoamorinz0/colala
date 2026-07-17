import type { Experience } from "@/features/places/constants";
import type { Place } from "@/types/place";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop";

/**
 * Adapta um registro real da tabela `places` para o formato `Experience`
 * consumido pelos cards da UI. Campos ainda inexistentes no banco recebem
 * valores neutros até que as colunas correspondentes sejam adicionadas.
 */
export function placeToExperience(place: Place): Experience {
  return {
    id: place.id,
    title: place.name,
    category: "Lugar",
    description: place.description ?? "",
    address: place.city ?? "",
    neighborhood: place.city ?? "",
    distance: "",
    rating: 0,
    reviewCount: 0,
    price: "",
    imageUrl: FALLBACK_IMAGE,
  };
}
