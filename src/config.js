export const business = {
  name: "Swiss ZH Transport",
  email: "jamaluddin174@yahoo.com",
  phone: "+41 78 906 42 40",
  whatsapp: "41789064240",
};
export const services = ["Airport Services", "Limousine", "Taxi"];
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
  if (!["1", "2", "3", "4", "5", "6", "7", "8+"].includes(data.passengers))
    return "Please select the number of passengers.";
  if (!data.name?.trim()) return "Please enter your name.";
  return "";
}
export function buildInquiry(data) {
  return `Hello Swiss ZH Transport, I would like to request a journey.\n\nService: ${data.service}\nPickup: ${data.pickup.trim()}\nDestination: ${data.destination.trim()}\nDate: ${data.date}\nTime: ${data.time} (Switzerland local time)\nPassengers: ${data.passengers}\nName: ${data.name.trim()}${data.notes?.trim() ? `\nNotes / flight number: ${data.notes.trim()}` : ""}\n\nPlease confirm availability, the total fare and how to pay the required ${bookingPolicy.advancePercent}% advance to confirm my booking. Thank you.`;
}
export function inquiryLinks(data) {
  const body = encodeURIComponent(buildInquiry(data));
  return {
    whatsapp: `https://wa.me/${business.whatsapp}?text=${body}`,
    email: `mailto:${business.email}?subject=${encodeURIComponent("Journey inquiry — Swiss ZH Transport")}&body=${body}`,
  };
}
