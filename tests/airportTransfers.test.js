import test from "node:test";
import assert from "node:assert/strict";
import { airportTransferPreset, zurichAirport } from "../src/lib/airportTransfers.js";
import { calculateVehicleQuote, validateAirportTransfer } from "../src/config.js";
import { photonLocations } from "../src/lib/openMaps.js";

function location(municipality, name = "Hotel") {
  return photonLocations({ features: [{
    properties: { name, city: municipality, state: "Zürich", country: "Switzerland", countrycode: "CH", osm_id: municipality },
    geometry: { coordinates: [8.54, 47.37] },
  }] })[0];
}

test("city addresses use the directional airport fares regardless of street name", () => {
  const address = location("Zürich", "Bahnhofstrasse 10");
  assert.equal(address.municipality, "Zürich");
  for (const [direction, expected] of [["to-airport", 95], ["from-airport", 120]]) {
    const data = { ...airportTransferPreset(direction, address), distance: 17.5 };
    assert.equal(validateAirportTransfer(data), "");
    assert.equal(calculateVehicleQuote(data).total, expected);
    assert.equal(calculateVehicleQuote(data).fixedRoute, true);
  }
});

test("locations outside Zurich city use CHF 5/km even in canton Zurich", () => {
  for (const city of ["Winterthur", "Kloten", "Opfikon", "Uster", "Lucerne"]) {
    for (const direction of ["to-airport", "from-airport"]) {
      const data = { ...airportTransferPreset(direction, location(city, "Zurich business hotel")), distance: 32.4 };
      assert.equal(calculateVehicleQuote(data).total, 162, city);
      assert.equal(calculateVehicleQuote(data).fixedRoute, undefined);
    }
  }
});

test("airport bookings require exactly one Zurich Airport endpoint and a Swiss destination", () => {
  const data = airportTransferPreset("from-airport", location("Zürich"));
  assert.match(validateAirportTransfer({ ...data, destinationPlace: zurichAirport }), /Zurich Airport/);
  assert.match(validateAirportTransfer({ ...data, pickupPlace: location("Bern") }), /Zurich Airport/);
  assert.match(validateAirportTransfer({ ...data, destinationPlace: { ...data.destinationPlace, countryCode: "DE" } }), /Switzerland/);
  assert.match(validateAirportTransfer({ ...data, service: "Book per hour" }), /Zurich Airport/);
});

test("changing airport direction preserves the other location and resets the distance", () => {
  const city = location("Zürich");
  const toAirport = airportTransferPreset("to-airport", city);
  const fromAirport = airportTransferPreset("from-airport", toAirport.pickupPlace);
  assert.equal(fromAirport.pickupPlace, zurichAirport);
  assert.equal(fromAirport.destinationPlace, city);
  assert.equal(fromAirport.distance, "");
  assert.equal(calculateVehicleQuote(fromAirport).total, null);
});
