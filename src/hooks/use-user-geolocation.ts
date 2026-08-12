"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/lib/distance";

type GeoState =
  | { status: "idle" | "loading" | "denied" }
  | { status: "granted"; coordinates: Coordinates }
  | { status: "error"; message: string };

const DEFAULT_TIMEOUT_MS = 10000;
const MAX_AGE_MS = 5 * 60 * 1000;

export function useUserGeolocation(): GeoState {
  const [geoState, setGeoState] = useState<GeoState>({ status: "idle" });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoState({
        status: "error",
        message: "Geolocalização não disponível neste dispositivo.",
      });
      return;
    }

    setGeoState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState({
          status: "granted",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED || error.code === 1) {
          setGeoState({ status: "denied" });
          return;
        }

        setGeoState({
          status: "error",
          message:
            error.message || "Não foi possível obter sua localização agora.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: DEFAULT_TIMEOUT_MS,
        maximumAge: MAX_AGE_MS,
      },
    );
  }, []);

  return geoState;
}
