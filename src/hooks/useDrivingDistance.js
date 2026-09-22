import { useEffect, useState } from "react";
import { getRoadDistance } from "../lib/openMaps.js";

export function useDrivingDistance(origin, destination, enabled = true) {
  const [result, setResult] = useState({});
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([
    origin?.coordinates,
    destination?.coordinates,
    enabled,
    attempt,
  ]);
  const ready = Boolean(
    enabled && origin?.coordinates && destination?.coordinates,
  );
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    setResult({ key, loading: true });
    getRoadDistance(origin, destination, { signal: controller.signal })
      .then((route) => {
        if (!controller.signal.aborted) setResult({ key, ...route });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error:
              error.name === "TimeoutError"
                ? "Route lookup timed out. Please try again."
                : error.message,
          });
      });
    return () => controller.abort();
  }, [key, ready, origin, destination]);
  const current = ready && result.key === key;
  return {
    distanceKm: current ? (result.distanceKm ?? null) : null,
    durationText: current ? result.durationText || "" : "",
    routePoints: current ? result.routePoints || [] : [],
    loading: Boolean(ready && (!current || result.loading)),
    error: current ? result.error || "" : "",
    retry: () => setAttempt((value) => value + 1),
  };
}
