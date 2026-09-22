import test from "node:test";
import assert from "node:assert/strict";
import {
  photonLocations,
  searchLocations,
  getRoadDistance,
} from "../src/lib/openMaps.js";
import { calculateVehicleQuote } from "../src/config.js";

const place = (id, countrycode, coordinates, name) => ({
  properties: {
    osm_id: id,
    osm_type: "N",
    countrycode,
    name,
    country: countrycode,
  },
  geometry: { coordinates },
});

test("map suggestions preserve exact coordinates and Switzerland/Europe coverage", () => {
  const data = {
    features: [
      place(1, "CH", [8.54, 47.37], "Zurich"),
      place(2, "FR", [2.35, 48.85], "Paris"),
      place(3, "IT", [9.19, 45.46], "Milan"),
      place(4, "GB", [-0.12, 51.5], "London"),
      place(5, "US", [-74, 40], "New York"),
    ],
  };
  const swiss = photonLocations(data);
  assert.deepEqual(
    swiss.map((p) => p.countryCode),
    ["CH"],
  );
  assert.deepEqual(swiss[0].coordinates, [8.54, 47.37]);
  assert.deepEqual(
    photonLocations(data, true).map((p) => p.countryCode),
    ["CH", "FR", "IT", "GB"],
  );
  assert.equal(
    photonLocations({ features: [place(6, "CH", [NaN, 300], "Invalid")] })
      .length,
    0,
  );
});

test("European search is not restricted to Switzerland", async () => {
  await searchLocations("Milan test", {
    europeMode: true,
    fetcher: async (url) => {
      assert.equal(url.searchParams.get("q"), "Milan test");
      assert.equal(url.searchParams.has("countrycode"), false);
      assert.equal(url.searchParams.has("lat"), false);
      assert.equal(url.searchParams.get("bbox"), "-32,27,70,82");
      return { ok: true, json: async () => ({ features: [] }) };
    },
  });
});

test("keyless road routing feeds the real route distance into the fare", async () => {
  const origin = { coordinates: [8.55, 47.46] };
  const destination = { coordinates: [8.54, 47.37] };
  const route = await getRoadDistance(origin, destination, {
    fetcher: async (url) => {
      assert.match(url.pathname, /driving\/8.55,47.46;8.54,47.37/);
      return {
        ok: true,
        json: async () => ({
          code: "Ok",
          routes: [{ distance: 13542, duration: 950 }],
        }),
      };
    },
  });
  assert.equal(route.distanceKm, 13.542);
  assert.equal(
    calculateVehicleQuote({
      service: "Book per km",
      distance: route.distanceKm,
    }).total,
    67.71,
  );
});

test("unselected or identical locations cannot generate a route or fare", async () => {
  const fetcher = () => {
    throw new Error("Should not request a route");
  };
  await assert.rejects(getRoadDistance(null, null, { fetcher }), /suggestions/);
  await assert.rejects(
    getRoadDistance(
      { coordinates: [8, 47] },
      { coordinates: [8, 47] },
      { fetcher },
    ),
    /different/,
  );
});

test("unreachable destinations never fall back to a fabricated distance", async () => {
  await assert.rejects(
    getRoadDistance(
      { coordinates: [8, 47] },
      { coordinates: [9, 48] },
      {
        fetcher: async () => ({
          ok: true,
          json: async () => ({ code: "NoRoute" }),
        }),
      },
    ),
    /No driving route/,
  );
});
