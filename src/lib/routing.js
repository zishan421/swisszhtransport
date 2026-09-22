// Road distance only: never substitute straight-line distance or a default fare.
export async function getDrivingRoute(maps, origin, destination) {
  try {
    const { Route } = await maps.importLibrary("routes");
    const { routes } = await Route.computeRoutes({
      origin,
      destination,
      travelMode: "DRIVING",
      fields: ["distanceMeters", "durationMillis"],
    });
    const route = routes?.[0];
    if (!Number.isFinite(route?.distanceMeters) || route.distanceMeters <= 0) {
      throw new Error("No driving route found.");
    }
    return {
      distanceKm: route.distanceMeters / 1000,
      durationText: route.durationMillis
        ? Math.ceil(route.durationMillis / 60000) + " min"
        : "",
    };
  } catch {
    // Support accounts that still have the existing Distance Matrix API enabled.
    return new Promise((resolve, reject) => {
      const service = new maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: "DRIVING",
          unitSystem: maps.UnitSystem.METRIC,
        },
        (response, status) => {
          const element = response?.rows?.[0]?.elements?.[0];
          const meters = element?.distance?.value;
          if (
            status !== "OK" ||
            element?.status !== "OK" ||
            !Number.isFinite(meters) ||
            meters <= 0
          ) {
            reject(
              new Error(
                "Could not find a driving route. Please check both addresses and try again.",
              ),
            );
            return;
          }
          resolve({
            distanceKm: meters / 1000,
            durationText: element.duration?.text || "",
          });
        },
      );
    });
  }
}
