export type Category = "cafe" | "restaurante" | "bar" | "passeio" | "show";

export type Experience = {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl: string;
  rating: number; // Ex: 4.8
  address: string;
  priceRange: "cheap" | "medium" | "expensive"; // $, $$, $$$
};
