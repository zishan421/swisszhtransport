import test from "node:test";
import assert from "node:assert/strict";
import { getDrivingRoute } from "../src/lib/routing.js";
import { calculateVehicleQuote } from "../src/config.js";

test("uses Maps driving distance in metres to calculate the per-km fare", async () => {
  const maps = {
    importLibrary: async () => ({
      Route: {
        computeRoutes: async (request) => {
          assert.equal(request.origin, "Zurich Airport");
          assert.equal(request.destination, "Zurich HB");
          assert.equal(request.travelMode, "DRIVING");
          return {
            routes: [{ distanceMeters: 12540, durationMillis: 900000 }],
          };
        },
      },
    }),
  };
  const route = await getDrivingRoute(maps, "Zurich Airport", "Zurich HB");
  assert.equal(route.distanceKm, 12.54);
  assert.equal(
    calculateVehicleQuote({
      service: "Book per km",
      distance: route.distanceKm,
    }).total,
    62.7,
  );
});

test("supports existing Distance Matrix API accounts", async () => {
  const maps = {
    importLibrary: async () => {
      throw new Error("Routes API unavailable");
    },
    UnitSystem: { METRIC: 0 },
    DistanceMatrixService: class {
      getDistanceMatrix(request, callback) {
        assert.deepEqual(request.origins, ["Zurich"]);
        callback(
          {
            rows: [
              {
                elements: [
                  {
                    status: "OK",
                    distance: { value: 250500 },
                    duration: { text: "3 hr" },
                  },
                ],
              },
            ],
          },
          "OK",
        );
      }
    },
  };
  assert.equal(
    (await getDrivingRoute(maps, "Zurich", "Geneva")).distanceKm,
    250.5,
  );
});

test("denied access or an unavailable route never becomes a fake distance", async () => {
  for (const status of ["REQUEST_DENIED", "ZERO_RESULTS"]) {
    const maps = {
      importLibrary: async () => {
        throw new Error("Unavailable");
      },
      UnitSystem: { METRIC: 0 },
      DistanceMatrixService: class {
        getDistanceMatrix(request, callback) {
          callback({}, status);
        }
      },
    };
    await assert.rejects(
      getDrivingRoute(maps, "Zurich", "Unknown"),
      /driving route/,
    );
  }
});
