/**
 * useDistanceMatrix.js
 * Calculates driving distance (km) between two place descriptions
 * using Google Distance Matrix API.
 *
 * Returns { distanceKm, durationText, loading, error }
 * distanceKm is null until both addresses are provided and result arrives.
 */
import { useState, useEffect } from "react";

export function useDistanceMatrix(origin, destination, mapsLoaded) {
  const [distanceKm, setDistanceKm] = useState(null);
  const [durationText, setDurationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const orig = origin?.trim();
    const dest = destination?.trim();

    if (!mapsLoaded || !orig || !dest || orig === dest) {
      setDistanceKm(null);
      setDurationText("");
      setError("");
      return;
    }

    if (!window.google?.maps?.DistanceMatrixService) {
      setError("Google Maps not ready.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [orig],
        destinations: [dest],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (cancelled) return;
        setLoading(false);

        if (status !== "OK") {
          setError("Could not calculate distance.");
          setDistanceKm(null);
          return;
        }

        const element = response?.rows?.[0]?.elements?.[0];
        if (!element || element.status !== "OK") {
          setError("No route found between these locations.");
          setDistanceKm(null);
          return;
        }

        const meters = element.distance?.value ?? 0;
        const km = Math.ceil(meters / 1000);
        setDistanceKm(km);
        setDurationText(element.duration?.text ?? "");
      }
    );

    return () => {
      cancelled = true;
    };
  }, [origin, destination, mapsLoaded]);

  return { distanceKm, durationText, loading, error };
}

