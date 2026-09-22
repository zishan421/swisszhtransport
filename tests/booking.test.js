import test from "node:test";
import assert from "node:assert/strict";
import {
  validateJourney,
  inquiryLinks,
  localDate,
  swissDateTime,
  buildInquiry,
} from "../src/config.js";
const now = new Date("2026-09-22T10:00:00Z");
const valid = {
  service: "Airport Services",
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
test("WhatsApp and email include exact encoded journey and correct recipients", () => {
  const links = inquiryLinks(valid);
  const whatsapp = new URL(links.whatsapp);
  assert.equal(whatsapp.hostname, "wa.me");
  assert.equal(whatsapp.pathname, "/41789064240");
  assert.equal(whatsapp.searchParams.get("text"), buildInquiry(valid));
  assert.ok(links.email.startsWith("mailto:jamaluddin174@yahoo.com?"));
  assert.ok(decodeURIComponent(links.email).includes("Hotel & Spa Zürich"));
});
