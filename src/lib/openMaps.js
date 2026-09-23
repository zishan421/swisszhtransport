const searchEndpoint =
  import.meta.env?.VITE_LOCATION_SEARCH_URL || "https://photon.komoot.io/api/";
const routeEndpoint =
  import.meta.env?.VITE_ROUTING_URL ||
  "https://router.project-osrm.org/route/v1/driving/";
const searches = new Map();
const routes = new Map();
let nextRouteRequest = 0;
const europeCountries = new Set(
  "AL AD AM AT AZ BY BE BA BG HR CY CZ DK EE FI FR GE DE GR HU IS IE IT KZ XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH TR UA GB VA AX FO GI GG IM JE SJ".split(
    " ",
  ),
);

function remember(cache, key, value) {
  if (cache.size >= 60) cache.delete(cache.keys().next().value);
  cache.set(key, { value, expires: Date.now() + 5 * 60 * 1000 });
}
function cached(cache, key) {
  const entry = cache.get(key);
  return entry?.expires > Date.now() ? entry.value : undefined;
}
async function json(url, signal, fetcher) {
  const response = await fetcher(url, {
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(12000)])
      : AbortSignal.timeout(12000),
  });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "Map search is busy. Please try again in a moment."
        : "Map service is unavailable. Please try again.",
    );
  return response.json();
}

export function validCoordinates(coordinates) {
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every(Number.isFinite) &&
    Math.abs(coordinates[0]) <= 180 &&
    Math.abs(coordinates[1]) <= 90
  );
}

export function getCurrentLocationPlace({
  timeout = 12000,
  maximumAge = 60000,
} = {}) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.reject(new Error("Location tracking is not available in this browser."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const longitude = Number(coords.longitude.toFixed(6));
        const latitude = Number(coords.latitude.toFixed(6));
        resolve({
          place_id: `current-${longitude}-${latitude}`,
          description: `Current location (${latitude}, ${longitude})`,
          coordinates: [longitude, latitude],
          countryCode: "",
          source: "geolocation",
          structured_formatting: {
            main_text: "Current location",
            secondary_text: `${latitude}, ${longitude}`,
          },
        });
      },
      (error) => {
        const message =
          error.code === 1
            ? "Please allow location access to use your current position."
            : "We could not read your current location. Try again or search for a pickup place.";
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout, maximumAge },
    );
  });
}

export function photonLocations(data, europeMode = false) {
  const unique = new Map();
  for (const feature of data.features || []) {
    const p = feature.properties || {};
    const coordinates = feature.geometry?.coordinates;
    const countryCode = p.countrycode?.toUpperCase();
    if (
      !validCoordinates(coordinates) ||
      (europeMode ? !europeCountries.has(countryCode) : countryCode !== "CH")
    )
      continue;
    const street = [p.street, p.housenumber].filter(Boolean).join(" ");
    const main = p.name || street || p.city;
    if (!main) continue;
    const parts = [
      ...new Set(
        [
          main,
          street,
          p.postcode,
          p.city || p.town || p.village,
          p.state,
          p.country,
        ].filter(Boolean),
      ),
    ];
    const description = parts.join(", ");
    const id = `${p.osm_type || "place"}-${p.osm_id || coordinates.join(",")}`;
    if (unique.has(description)) continue;
    unique.set(description, {
      place_id: id,
      description,
      coordinates,
      countryCode: p.countrycode?.toUpperCase(),
      municipality: p.city || p.town || p.village || "",
      source: "osm",
      structured_formatting: {
        main_text: main,
        secondary_text: parts.slice(1).join(", "),
      },
    });
  }
  return [...unique.values()].slice(0, 6);
}

export async function searchLocations(
  query,
  { europeMode = false, signal, fetcher = fetch } = {},
) {
  const input = query.trim();
  if (input.length < 2) return [];
  const key = JSON.stringify([input.toLowerCase(), europeMode]);
  const hit = cached(searches, key);
  if (hit) return hit;
  const url = new URL(searchEndpoint);
  url.search = new URLSearchParams({
    q: input,
    limit: "8",
    lang: "en",
    ...(!europeMode ? { lon: "8.54", lat: "47.37" } : {}),
    bbox: europeMode ? "-32,27,70,82" : "5.95,45.8,10.5,47.9",
    ...(!europeMode ? { countrycode: "CH" } : {}),
  }).toString();
  const locations = photonLocations(
    await json(url, signal, fetcher),
    europeMode,
  );
  remember(searches, key, locations);
  return locations;
}

export async function getRoadDistance(
  origin,
  destination,
  { signal, fetcher = fetch } = {},
) {
  if (
    !validCoordinates(origin?.coordinates) ||
    !validCoordinates(destination?.coordinates)
  ) {
    throw new Error("Choose both locations from the search suggestions.");
  }
  const coordinates = `${origin.coordinates.join(",")};${destination.coordinates.join(",")}`;
  if (origin.coordinates.join(",") === destination.coordinates.join(","))
    throw new Error("Please choose a different destination.");
  const hit = cached(routes, coordinates);
  if (hit) return hit;
  // Keep this browser's route requests below the public service's one-per-second limit.
  const wait = Math.max(0, nextRouteRequest - Date.now());
  nextRouteRequest = Date.now() + wait + 1100;
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  signal?.throwIfAborted();
  const url = new URL(
    coordinates,
    routeEndpoint.endsWith("/") ? routeEndpoint : routeEndpoint + "/",
  );
  url.search =
    "overview=full&geometries=geojson&alternatives=false&steps=false&radiuses=1000;1000";
  const data = await json(url, signal, fetcher);
  const route = data.routes?.[0];
  if (
    data.code !== "Ok" ||
    !Number.isFinite(route?.distance) ||
    route.distance <= 0
  ) {
    throw new Error(
      "No driving route was found. Please choose nearby road-accessible locations.",
    );
  }
  const geojsonCoords = Array.isArray(route.geometry?.coordinates)
    ? route.geometry.coordinates
    : [];
  const routePoints = geojsonCoords.map(([lon, lat]) => [lat, lon]);
  const result = {
    distanceKm: Math.round(route.distance) / 1000,
    durationText: Number.isFinite(route.duration)
      ? `${Math.ceil(route.duration / 60)} min`
      : "",
    routePoints,
    source: "OpenStreetMap / OSRM",
  };
  remember(routes, coordinates, result);
  return result;
}
