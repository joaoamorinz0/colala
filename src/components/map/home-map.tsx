"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  getVersion,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PlaceSheet } from "@/components/map/place-sheet";
import { usePlacesInBbox } from "@/features/places";
import type { MapBounds } from "@/services/map";
import type { PlaceMapItem } from "@/types/place";

// Contorna o bug do bundler do Next.js que não resolve `new Worker(new URL(...))`
// dentro de node_modules/maplibre-gl: aponta o worker direto pro CDN do unpkg,
// na mesma versão do package.json. No v6 não existe `maplibregl.version` —
// `getVersion()` expõe a versão instalada em runtime.
if (typeof window !== "undefined") {
  setWorkerUrl(
    `https://unpkg.com/maplibre-gl@${getVersion()}/dist/maplibre-gl-csp-worker.js`,
  );
}

/** OpenStreetMap raster tiles — sem chave de API, com atribuição. */
const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const DEFAULT_CENTER: [number, number] = [-51.9253, -14.235]; // Brasil
const DEFAULT_ZOOM = 4;
const MAP_LIMIT = 200; // mesmo default do p_limit da RPC

const PIN_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

export function HomeMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceMapItem | null>(null);

  const { data: places = [], isFetching } = usePlacesInBbox({ bounds });

  // Cria o mapa uma única vez.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const map = new MapLibreMap({
      container,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-left");

    const syncBounds = () => {
      const mapBounds = map.getBounds();
      setBounds({
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest(),
      });
    };

    map.on("load", syncBounds);
    map.on("moveend", syncBounds);

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sincroniza os markers com os locais retornados.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const element = document.createElement("button");
      element.type = "button";
      element.setAttribute("aria-label", place.name);
      element.className =
        "flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-card transition-transform hover:scale-110";
      element.innerHTML = PIN_ICON_SVG;
      element.addEventListener("click", () => setSelectedPlace(place));

      const marker = new Marker({ element })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [places]);

  const totalCount = places[0]?.total_count ?? 0;
  const hasMorePlaces = totalCount > MAP_LIMIT;
  const showEmptyState = Boolean(bounds) && !isFetching && places.length === 0;

  return (
    <div className="bg-muted relative size-full overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Loading discreto — não bloqueia o mapa */}
      {isFetching ? (
        <div className="bg-card/95 text-foreground shadow-card absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur">
          Buscando locais...
        </div>
      ) : null}

      {/* Aviso de limite atingido */}
      {hasMorePlaces ? (
        <div className="bg-card/95 text-foreground shadow-card absolute top-12 left-1/2 z-10 w-max -translate-x-1/2 rounded-full px-3 py-1.5 text-center text-xs font-semibold backdrop-blur">
          Muitos locais aqui — dê zoom para refinar
        </div>
      ) : null}

      {/* Estado vazio */}
      {showEmptyState ? (
        <div className="bg-card/95 text-foreground shadow-card absolute top-12 left-1/2 z-10 w-max -translate-x-1/2 rounded-full px-3 py-1.5 text-center text-xs font-semibold backdrop-blur">
          Nenhum local encontrado nesta área
        </div>
      ) : null}

      {/* Bottom sheet com o local selecionado */}
      {selectedPlace ? (
        <PlaceSheet
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      ) : null}
    </div>
  );
}
