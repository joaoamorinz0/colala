import type { Metadata } from "next";
import { DiscoverClient } from "@/components/discover";

export const metadata: Metadata = {
  title: "Descobrir",
  description: "Descubra o melhor perto de você no Colalá.",
};

export default function DiscoverPage() {
  return <DiscoverClient />;
}
