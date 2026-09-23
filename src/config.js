export const business = {
  name: "Swiss ZH Transport",
  email: "jamaiuddin174@yahoo.com",
  phone: "+41 78 906 42 40",
  whatsapp: "41789064240",
};
export const services = [
  "Book per hour",
  "Book per km",
  "Book per day",
  "Outside Switzerland",
  "Wedding",
];
export const driverLanguages = ["Hindi", "English", "German", "Urdu", "Bangla"];
export const bookingRates = {
  perHour: 120,
  perDay: 990,
  weddingPerHour: 150,
  perKm: 5,
  perDayExtraKm: 4,
  insideSwitzerlandMaxKm: 220,
  outsideSwitzerlandPerDay: 1400,
  outsideSwitzerlandIncludedKm: 300,
  zurichAirportToCity: 120,
  zurichCityToAirport: 95,
  minimumBookingHours: 3,
  perDayHours: 10,
};
export const bookingPolicy = {
  advancePercent: 20,
  get balancePercent() {
    return 100 - this.advancePercent;
  },
};
export function swissDateTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}
export function localDate(date = new Date()) {
  return swissDateTime(date).slice(0, 10);
}
export function validateJourney(data, now = new Date()) {
  if (!services.includes(data.service)) return "Please choose a service.";
  if (!data.pickup?.trim() || !data.destination?.trim())
    return "Please enter your pickup and destination.";
  if (
    data.pickup.trim().toLowerCase() === data.destination.trim().toLowerCase()
  )
    return "Please choose a different destination.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date || "") ||
    !/^\d{2}:\d{2}$/.test(data.time || "")
  )
    return "Please choose a date and pickup time.";
  const pickupDate = new Date(`${data.date}T${data.time}:00Z`);
  if (
    Number.isNaN(pickupDate.getTime()) ||
    pickupDate.toISOString().slice(0, 16) !== `${data.date}T${data.time}`
  )
    return "Please choose a valid date and time.";
  if (`${data.date}T${data.time}` <= swissDateTime(now))
    return "Please select a pickup time in the future.";
  if (!["1", "2", "3", "4", "5", "6", "7", "8+"].includes(String(data.passengers)))
    return "Please select the number of passengers.";
  const effectiveName =
    data.name?.trim() ||
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  if (!effectiveName) return "Please enter your name.";
  return calculateVehicleQuote(data).error || "";
}

export function formatFare(total) {
  return total.toLocaleString("en-CH", { maximumFractionDigits: 2 });
}
function positiveAmount(value, unit) {
  const match = String(value ?? "")
    .trim()
    .match(
      unit === "hours"
        ? /^(\d+(?:\.\d+)?)\s*(?:h(?:rs?)?)?$/i
        : /^(\d+(?:\.\d+)?)\s*(?:km)?$/i,
    );
  const amount = match ? Number(match[1]) : NaN;
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function normalizedLocationText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function locationText(data, field) {
  const place = data[`${field}Place`];
  return normalizedLocationText(
    [
      data[field],
      place?.description,
      place?.structured_formatting?.main_text,
      place?.structured_formatting?.secondary_text,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function isZurichAirport(location) {
  return (
    /\bzrh\b/.test(location) ||
    (location.includes("zurich") &&
      (location.includes("airport") || location.includes("flughafen")))
  );
}

function isZurichCity(data, field) {
  if (isZurichAirport(locationText(data, field))) return false;
  const place = data[`${field}Place`];
  if (place?.municipality) {
    return /^(zurich|zuerich|stadt zurich)$/.test(
      normalizedLocationText(place.municipality).trim(),
    );
  }
  // Do not mistake a canton or a business name for the municipality.
  if (place?.source === "osm") return false;
  const firstPart = normalizedLocationText(place?.description || data[field])
    .split(",")[0].trim();
  return /^(zurich|zuerich)( city| hb)?$/.test(firstPart);
}

export function validateAirportTransfer(data) {
  if (!data.airportTransfer) return "";
  const pickupAirport = data.pickupPlace?.place_id === "ch-zurich-airport";
  const destinationAirport = data.destinationPlace?.place_id === "ch-zurich-airport";
  if (data.service !== "Book per km" || pickupAirport === destinationAirport) {
    return "Choose a transfer to or from Zurich Airport.";
  }
  const otherPlace = pickupAirport ? data.destinationPlace : data.pickupPlace;
  if (!otherPlace || otherPlace.countryCode !== "CH") {
    return "Choose a location in Switzerland from the suggestions.";
  }
  return "";
}

function getZurichAirportFixedFare(data) {
  const pickup = locationText(data, "pickup");
  const destination = locationText(data, "destination");
  if (isZurichAirport(pickup) && isZurichCity(data, "destination")) {
    return {
      total: bookingRates.zurichAirportToCity,
      label: "Zurich Airport to Zurich city",
      breakdown: `Fixed transfer · CHF ${bookingRates.zurichAirportToCity}`,
    };
  }
  if (isZurichCity(data, "pickup") && isZurichAirport(destination)) {
    return {
      total: bookingRates.zurichCityToAirport,
      label: "Zurich city to Zurich Airport",
      breakdown: `Fixed transfer · CHF ${bookingRates.zurichCityToAirport}`,
    };
  }
  return null;
}

export function calculateVehicleQuote(data = {}) {
  const service = data.service || services[0];
  const invalid = (error) => ({
    service,
    total: null,
    label: service,
    breakdown: "",
    error,
  });
  const airportError = validateAirportTransfer(data);
  if (airportError) return invalid(airportError);
  if (service === "Book per hour" || service === "Wedding") {
    const hours = positiveAmount(data.hours, "hours");
    if (!hours) return invalid("Please enter a valid number of hours.");
    if (hours < bookingRates.minimumBookingHours)
      return invalid(
        `Please book for at least ${bookingRates.minimumBookingHours} hours.`,
      );
    const rate =
      service === "Wedding"
        ? bookingRates.weddingPerHour
        : bookingRates.perHour;
    return {
      service,
      hours,
      total: Math.round(hours * rate * 100) / 100,
      label: (service === "Wedding" ? "Wedding - " : "") + hours + "h booking",
      breakdown: `${hours} hr × CHF ${rate}/hr`,
    };
  }
  if (service === "Book per km") {
    const distanceKm = positiveAmount(data.distance);
    if (!distanceKm) return invalid("Please enter the journey distance in km.");
    const fixedAirportFare = getZurichAirportFixedFare(data);
    if (fixedAirportFare) {
      return {
        service,
        distanceKm,
        ...fixedAirportFare,
        fixedRoute: true,
      };
    }
    return {
      service,
      distanceKm,
      total: Math.round(distanceKm * bookingRates.perKm * 100) / 100,
      label: distanceKm + " km journey",
      breakdown: `${distanceKm} km × CHF ${bookingRates.perKm}/km`,
    };
  }
  if (service === "Book per day") {
    const distanceKm = positiveAmount(data.distance);
    if (
      data.distance != null &&
      String(data.distance).trim() !== "" &&
      !distanceKm
    )
      return invalid("Please enter a valid journey distance in km.");
    const extraDistanceKm = Math.max(
      0,
      (distanceKm || 0) - bookingRates.insideSwitzerlandMaxKm,
    );
    const extraCharge = extraDistanceKm * bookingRates.perDayExtraKm;
    const total = bookingRates.perDay + extraCharge;
    return {
      service,
      hours: bookingRates.perDayHours,
      includedKm: bookingRates.insideSwitzerlandMaxKm,
      extraDistanceKm,
      extraKmRate: bookingRates.perDayExtraKm,
      total,
      label:
        "Inside Switzerland - " +
        bookingRates.perDayHours +
        " hrs, " +
        bookingRates.insideSwitzerlandMaxKm +
        " km included" +
        (extraDistanceKm ? ` + ${extraDistanceKm} extra km` : ""),
      breakdown:
        extraDistanceKm
          ? `CHF ${bookingRates.perDay} / day + ${extraDistanceKm} km × CHF ${bookingRates.perDayExtraKm}/km = CHF ${total}`
          : `CHF ${bookingRates.perDay} / day (${bookingRates.perDayHours} hrs, up to ${bookingRates.insideSwitzerlandMaxKm} km inside Switzerland)`,
    };
  }
  if (service === "Outside Switzerland") {
    const rawDistance = String(data.distance ?? "").trim();
    const distanceKm = rawDistance ? positiveAmount(rawDistance) : null;
    if (rawDistance && !distanceKm)
      return invalid("Please enter a valid journey distance in km.");
    const extraDistanceKm = Math.max(
      0,
      (distanceKm || 0) - bookingRates.outsideSwitzerlandIncludedKm,
    );
    const contactRequired = extraDistanceKm > 0;
    return {
      service,
      hours: bookingRates.perDayHours,
      distanceKm,
      includedKm: bookingRates.outsideSwitzerlandIncludedKm,
      extraDistanceKm,
      contactRequired,
      total: bookingRates.outsideSwitzerlandPerDay,
      label:
        "Outside Switzerland - " +
        bookingRates.perDayHours +
        " hrs, up to " +
        bookingRates.outsideSwitzerlandIncludedKm +
        " km/day",
      breakdown:
        contactRequired
          ? `CHF ${bookingRates.outsideSwitzerlandPerDay} / day (${bookingRates.outsideSwitzerlandIncludedKm} km included); ${extraDistanceKm} extra km requires driver confirmation and an additional charge.`
          : `CHF ${bookingRates.outsideSwitzerlandPerDay} / day (up to ${bookingRates.outsideSwitzerlandIncludedKm} km included)`,
    };
  }
  return invalid("Please choose a service.");
}
export function buildInquiry(data) {
  const quote = calculateVehicleQuote(data);
  if (quote.error) throw new Error(quote.error);
  const fullName =
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim() ||
    data.name?.trim() ||
    "";
  const extraDetails = [
    data.company ? `Company: ${data.company.trim()}` : null,
    data.email ? `Email: ${data.email.trim()}` : null,
    data.phone ? `Phone: ${data.phoneCode || "+41"} ${data.phone.trim()}` : null,
    data.luggage ? `Baggage: ${data.luggage}` : null,
    data.childSeats ? `Child seats: ${data.childSeats}` : null,
    data.flightNumber ? `Flight number: ${data.flightNumber.trim()}` : null,
    data.nameboard ? `Nameboard: ${data.nameboard.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Hello Swiss ZH Transport, I would like to request a journey.\n\nService: ${data.service}\nDriver language: ${data.driverLanguage || "English"}\nPickup: ${data.pickup.trim()}\nDestination: ${data.destination.trim()}\nDate: ${data.date}\nTime: ${data.time} (Switzerland local time)\nPassengers: ${data.passengers}\nFare: CHF ${formatFare(quote.total)} (${quote.breakdown})\nName: ${fullName}${data.notes?.trim() ? `\nNotes / flight number: ${data.notes.trim()}` : ""}${extraDetails ? `\n${extraDetails}` : ""}\n\nPlease confirm availability, the total fare and how to pay the required ${bookingPolicy.advancePercent}% advance to confirm my booking. Thank you.`;
}
export function inquiryLinks(data) {
  const body = encodeURIComponent(buildInquiry(data));
  return {
    whatsapp: `https://wa.me/${business.whatsapp}?text=${body}`,
    email: `mailto:${business.email}?subject=${encodeURIComponent("Journey inquiry — Swiss ZH Transport")}&body=${body}`,
  };
}
