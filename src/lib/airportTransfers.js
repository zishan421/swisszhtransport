import { popularSwissLocations } from "./locationSuggestions.js";

export const zurichAirport = popularSwissLocations.find(
  (place) => place.place_id === "ch-zurich-airport",
);

export function airportTransferPreset(direction = "to-airport", otherPlace = null) {
  const toAirport = direction === "to-airport";
  return {
    service: "Book per km",
    airportTransfer: true,
    airportDirection: direction,
    pickup: toAirport ? otherPlace?.description || "" : zurichAirport.description,
    pickupPlace: toAirport ? otherPlace : zurichAirport,
    destination: toAirport ? zurichAirport.description : otherPlace?.description || "",
    destinationPlace: toAirport ? zurichAirport : otherPlace,
    distance: "",
  };
}
