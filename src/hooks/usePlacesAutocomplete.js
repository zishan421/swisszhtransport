import { useState, useEffect, useRef } from "react";
import { searchLocations } from "../lib/openMaps.js";
import { getSuggestedLocations } from "../lib/locationSuggestions.js";

/**
 * usePlacesAutocomplete.js
 * Provides instant suggestions from curated lists + live Photon/OpenStreetMap search.
 * When in Europe mode, suggestions include European countries, major cities and airports across Europe.
 *
 * @param {string}  value      – current text input
 * @param {boolean} enabled    – whether autocomplete is active
 * @param {boolean} europeMode – true for Outside Switzerland (all Europe), false for Switzerland
 */
export function usePlacesAutocomplete(value = "", enabled = true, europeMode = false) {
  const [state, setState] = useState(() => ({
    predictions: enabled ? getSuggestedLocations(value, europeMode) : [],
    loading: false,
    error: "",
    empty: false,
  }));

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setState({
        predictions: [],
        loading: false,
        error: "",
        empty: false,
      });
      return;
    }

    const trimmed = (value || "").trim();

    // If query is short (0 or 1 char), show default suggested locations immediately
    if (trimmed.length < 2) {
      const suggestions = getSuggestedLocations(trimmed, europeMode);
      setState({
        predictions: suggestions,
        loading: false,
        error: "",
        empty: false,
      });
      return;
    }

    // Immediately filter from local suggestions so user gets instant feedback
    const localMatches = getSuggestedLocations(trimmed, europeMode);
    setState((prev) => ({
      ...prev,
      predictions: localMatches.length > 0 ? localMatches : prev.predictions,
      loading: true,
      error: "",
      empty: false,
    }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const controller = new AbortController();

    timeoutRef.current = setTimeout(async () => {
      try {
        const liveResults = await searchLocations(trimmed, {
          europeMode,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        // Merge local matches with live results (preserving unique items)
        const combined = [];
        const seen = new Set();

        for (const item of [...localMatches, ...liveResults]) {
          const desc = item.description?.toLowerCase();
          if (desc && !seen.has(desc)) {
            seen.add(desc);
            combined.push(item);
          }
        }

        setState({
          predictions: combined.slice(0, 8),
          loading: false,
          error: "",
          empty: combined.length === 0,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        // If live search fails (rate limit/network), fall back gracefully to local matches
        setState({
          predictions: localMatches,
          loading: false,
          error: localMatches.length > 0 ? "" : "Unable to load suggestions. Try typing your destination.",
          empty: localMatches.length === 0,
        });
      }
    }, 200);

    return () => {
      controller.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, enabled, europeMode]);

  return state;
}
