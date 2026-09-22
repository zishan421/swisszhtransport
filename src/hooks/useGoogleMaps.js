/**
 * useGoogleMaps.js
 * Dynamically loads the Google Maps JavaScript API (with Places library)
 * and exposes a `loaded` flag + the global `window.google` object.
 *
 * Usage:
 *   const { loaded } = useGoogleMaps();
 */
import { useState, useEffect } from "react";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const SCRIPT_ID = "google-maps-script";

let scriptPromise = null;

function loadScript() {
  if (scriptPromise) return scriptPromise;
  if (window.google?.maps?.places) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(
    () => Boolean(window.google?.maps?.places)
  );

  useEffect(() => {
    if (loaded) return;
    loadScript()
      .then(() => setLoaded(true))
      .catch((err) => console.error("Google Maps failed to load:", err));
  }, [loaded]);

  return { loaded };
}

