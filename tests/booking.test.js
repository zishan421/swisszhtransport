import test from "node:test";
import assert from "node:assert/strict";
import { normalizePredictions } from "../src/lib/locationSuggestions.js";
import {
  validateJourney,
  inquiryLinks,
  localDate,
  swissDateTime,
  buildInquiry,
  calculateVehicleQuote,
} from "../src/config.js";
const now = new Date("2026-09-22T10:00:00Z");
const valid = {
  service: "Book per hour",
  hours: "6h",
  pickup: "Zurich Airport",
  destination: "Hotel & Spa Zürich",
  date: "2026-09-23",
  time: "10:00",
  passengers: "3",
  name: "Alex Example",
  notes: "LX 123, two bags",
};
test("accepts complete future journey", () =>
  assert.equal(validateJourney(valid, now), ""));
test("rejects missing pickup and matching destinations", () => {
  assert.match(validateJourney({ ...valid, pickup: "  " }, now), /pickup/);
  assert.match(
    validateJourney({ ...valid, destination: " zurich airport " }, now),
    /different/,
  );
});
test("requires valid service, name and passenger count", () => {
  assert.match(validateJourney({ ...valid, service: "Other" }, now), /service/);
  assert.match(validateJourney({ ...valid, name: " " }, now), /name/);
  assert.match(
    validateJourney({ ...valid, passengers: "0" }, now),
    /passengers/,
  );
});
test("rejects past, invalid calendar and invalid time inputs", () => {
  assert.match(
    validateJourney({ ...valid, date: "2026-09-21" }, now),
    /future/,
  );
  assert.match(
    validateJourney({ ...valid, date: "2027-02-30" }, now),
    /valid date/,
  );
  assert.match(validateJourney({ ...valid, time: "25:00" }, now), /valid date/);
});
test("uses Zurich time regardless of the visitor timezone", () => {
  assert.equal(swissDateTime(now), "2026-09-22T12:00");
  assert.equal(localDate(new Date("2026-09-22T23:30:00Z")), "2026-09-23");
  assert.equal(
    swissDateTime(new Date("2026-12-22T10:00:00Z")),
    "2026-12-22T11:00",
  );
  assert.match(
    validateJourney({ ...valid, date: "2026-09-22", time: "11:30" }, now),
    /future/,
  );
});
test("calculates different prices for hourly and per-km bookings", () => {
  const hourly = calculateVehicleQuote({
    service: "Book per hour",
    hours: "6h",
  });
  const perKm = calculateVehicleQuote({
    service: "Book per km",
    distance: "120km",
  });

  assert.equal(hourly.total, 720);
  assert.equal(perKm.total, 600);
  assert.notEqual(hourly.total, perKm.total);
});

test("WhatsApp and email include exact encoded journey and correct recipients", () => {
  const links = inquiryLinks(valid);
  const whatsapp = new URL(links.whatsapp);
  assert.equal(whatsapp.hostname, "wa.me");
  assert.equal(whatsapp.pathname, "/41789064240");
  assert.equal(whatsapp.searchParams.get("text"), buildInquiry(valid));
  assert.ok(links.email.startsWith("mailto:jamaiuddin174@yahoo.com?"));
  assert.ok(decodeURIComponent(links.email).includes("Hotel & Spa Zürich"));
});

test("all five services use the supplied rates", () => {
  for (const [data, expected] of [
    [{ service: "Book per hour", hours: 3 }, 360],
    [{ service: "Book per hour", hours: "4h" }, 480],
    [{ service: "Wedding", hours: "4h" }, 600],
    [{ service: "Book per km", distance: "12.5km" }, 62.5],
    [{ service: "Book per km", distance: 300 }, 1500],
    [{ service: "Book per day", distance: 220 }, 990],
    [{ service: "Outside Switzerland", distance: 1500 }, 1400],
  ])
    assert.equal(calculateVehicleQuote(data).total, expected);
});

test("220 km is only the Switzerland day package limit", () => {
  assert.equal(
    calculateVehicleQuote({ service: "Book per day" }).includedKm,
    220,
  );
  assert.equal(calculateVehicleQuote({ service: "Book per day" }).hours, 10);
  assert.equal(
    calculateVehicleQuote({ service: "Outside Switzerland" }).hours,
    10,
  );
  assert.equal(
    calculateVehicleQuote({ service: "Book per day", distance: 221 }).total,
    994,
  );
  assert.equal(
    calculateVehicleQuote({ service: "Book per day", distance: 221 })
      .extraDistanceKm,
    1,
  );
  assert.equal(
    calculateVehicleQuote({ service: "Book per km", distance: 221 }).total,
    1105,
  );
});

test("outside Switzerland includes 300 km and flags extra distance", () => {
  const withinLimit = calculateVehicleQuote({
    service: "Outside Switzerland",
    distance: 300,
  });
  assert.equal(withinLimit.total, 1400);
  assert.equal(withinLimit.contactRequired, false);
  assert.match(withinLimit.breakdown, /300 km included/);

  const overLimit = calculateVehicleQuote({
    service: "Outside Switzerland",
    distance: 380,
  });
  assert.equal(overLimit.total, 1400);
  assert.equal(overLimit.extraDistanceKm, 80);
  assert.equal(overLimit.contactRequired, true);
  assert.match(overLimit.breakdown, /driver confirmation/);
});

test("Zurich airport transfers use directional fixed fares", () => {
  assert.equal(
    calculateVehicleQuote({
      service: "Book per km",
      pickup: "Zurich Airport (ZRH), Switzerland",
      destination: "Zurich city, Switzerland",
      distance: 25,
    }).total,
    120,
  );
  assert.equal(
    calculateVehicleQuote({
      service: "Book per km",
      pickup: "Zurich city, Switzerland",
      destination: "Zurich Airport (ZRH), Switzerland",
      distance: 25,
    }).total,
    95,
  );
});

test("missing and invalid distances never produce a fabricated fare", () => {
  for (const distance of [
    undefined,
    "",
    0,
    -1,
    "nonsense",
    "-10km",
    Infinity,
    "12km trailing",
  ]) {
    const data = { ...valid, service: "Book per km", distance };
    assert.equal(calculateVehicleQuote(data).total, null);
    assert.match(validateJourney(data, now), /distance/);
    assert.throws(() => buildInquiry(data), /distance/);
  }
  for (const hours of [undefined, "", 0, -1, "bad", 2, "2.5h"]) {
    assert.equal(
      calculateVehicleQuote({ service: "Wedding", hours }).total,
      null,
    );
  }
});

test("hourly and wedding bookings require at least three hours", () => {
  assert.match(
    calculateVehicleQuote({ service: "Book per hour", hours: "2h" }).error,
    /at least 3 hours/,
  );
  assert.equal(
    calculateVehicleQuote({ service: "Book per hour", hours: "3h" }).total,
    360,
  );
  assert.equal(
    calculateVehicleQuote({ service: "Wedding", hours: "3h" }).total,
    450,
  );
});

test("inquiries carry the calculated fare and package terms without estimated wording", () => {
  const perKm = buildInquiry({
    ...valid,
    service: "Book per km",
    pickup: "Zurich HB",
    distance: 12.5,
  });
  assert.match(perKm, /Fare: CHF 62.5/);
  assert.doesNotMatch(perKm, /estimated/i);
  const outside = buildInquiry({ ...valid, service: "Outside Switzerland" });
  assert.match(outside, /1400 \/ day \(up to 300 km included\)/);
  const daily = buildInquiry({ ...valid, service: "Book per day" });
  assert.match(daily, /220 km inside Switzerland/);
});

test("missing autocomplete data falls back to an empty list", () => {
  assert.deepEqual(normalizePredictions(undefined), []);
  assert.deepEqual(normalizePredictions(null), []);
  assert.deepEqual(normalizePredictions(["Zurich"]), ["Zurich"]);
});
