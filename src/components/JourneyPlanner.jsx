import LocationInput from "./shared/LocationInput.jsx";
import { Route, CalendarDays, Clock3, ShieldCheck, Loader } from "lucide-react";
import {
  services,
  localDate,
  bookingPolicy,
  calculateVehicleQuote,
  formatFare,
  swissDateTime,
} from "../config.js";
import { useState } from "react";
import Reveal from "./shared/Reveal.jsx";
import GlideSelect from "./shared/GlideSelect.jsx";
import RubberSegment from "./shared/RubberSegment.jsx";
import FolderFloat from "./shared/FolderFloat.jsx";
import BorderGlow from "./shared/BorderGlow.jsx";
import { usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete.js";
import { useDrivingDistance } from "../hooks/useDrivingDistance.js";

const bookingHours = [
  "3h",
  "4h",
  "5h",
  "6h",
  "7h",
  "8h",
  "9h",
  "10h",
];
const bookingHourOptions = bookingHours.map((hour, index) => ({
  value: hour,
  label: hour,
  tag: index === 0 ? "Minimum" : "Hourly",
}));

// Services that need an hours selector
const hourlyServices = ["Book per hour", "Wedding"];
// Services that need pickup + destination + auto distance
const kmServices = ["Book per km"];
// Fixed-rate services
const fixedServices = ["Book per day", "Outside Switzerland"];
// Services where destination is Europe-wide
const europeServices = ["Outside Switzerland"];

// ── Reusable location input with Google Places dropdown ──────────
export default function JourneyPlanner({ openBooking }) {
  const [rideType, setRideType] = useState("Book per hour");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [hours, setHours] = useState("3h");
  const [pickupPlace, setPickupPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [formError, setFormError] = useState("");
  const isHourly = hourlyServices.includes(rideType);
  const isKm = kmServices.includes(rideType);
  const isFixed = fixedServices.includes(rideType);
  const isEurope = europeServices.includes(rideType);

  const pickupPredictions = usePlacesAutocomplete(
    pickup,
    !pickupPlace,
    isEurope,
  );
  const destinationPredictions = usePlacesAutocomplete(
    destination,
    !destinationPlace,
    isEurope,
  );
  const needsDistance =
    isKm || rideType === "Book per day" || rideType === "Outside Switzerland";
  const route = useDrivingDistance(
    pickupPlace,
    destinationPlace,
    needsDistance,
  );
  const {
    distanceKm,
    durationText,
    loading: distLoading,
    error: distError,
  } = route;
  const changePickup = (value) => {
    setPickup(value);
    setPickupPlace(null);
    setFormError("");
  };
  const changeDestination = (value) => {
    setDestination(value);
    setDestinationPlace(null);
    setFormError("");
  };
  const selectPickup = (value, place) => {
    setPickup(value);
    setPickupPlace(place);
    setFormError("");
  };
  const selectDestination = (value, place) => {
    setDestination(value);
    setDestinationPlace(place);
    setFormError("");
  };
  const changeService = (service) => {
    setRideType(service);
    setFormError("");
    if (service !== "Outside Switzerland") {
      if (pickupPlace?.countryCode !== "CH") {
        setPickup("");
        setPickupPlace(null);
      }
      if (destinationPlace?.countryCode !== "CH") {
        setDestination("");
        setDestinationPlace(null);
      }
    }
  };

  const distance = distanceKm ?? "";
  // Live fare preview
  const liveQuote = calculateVehicleQuote({
    service: rideType,
    hours,
    distance,
    pickup,
    destination,
    pickupPlace,
    destinationPlace,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupPlace || (!isHourly && !destinationPlace)) {
      setFormError("Choose your locations from the dropdown suggestions.");
      return;
    }
    if (needsDistance && !distanceKm) {
      setFormError(
        distLoading
          ? "Please wait for the route calculation."
          : distError || "Choose a valid driving route.",
      );
      return;
    }
    if (liveQuote.error) {
      setFormError(liveQuote.error);
      return;
    }
    if (!date || !time || `${date}T${time}` <= swissDateTime()) {
      setFormError(
        "Choose a future pickup date and time (Switzerland local time).",
      );
      return;
    }
    openBooking({
      service: rideType,
      pickup,
      destination,
      pickupPlace,
      destinationPlace,
      date,
      time,
      hours,
      distance: String(distance),
    });
  };

  return (
    <section
      className="journey-wrap container"
      id="journey"
      aria-label="Plan your journey"
    >
      <Reveal>
        <div className="journey-box">
          <div className="journey-top">
            <span className="journey-title">Where can we take you?</span>
            <RubberSegment
              className="journey-service-segment"
              items={services}
              value={rideType}
              onChange={(value) => changeService(value)}
              trackColor="rgba(196, 202, 194, 0.46)"
              thumbColor="rgba(255, 255, 255, 0.74)"
              textColor="#7b817b"
              activeTextColor="#252c28"
              size="md"
              radius={9}
              inset={3}
              equalSlots
              stretch={100}
              squash={3}
              speed={1}
              glide={75}
              draggable
            />
            <div className="journey-mobile-services">
              <FolderFloat
                className="journey-service-folder"
                items={services}
                label={rideType}
                sublabel="Tap to choose your service"
                trigger="click"
                closeOnSelect
                physics={false}
                onSelect={changeService}
                selectedValue={rideType}
                folderColor="#202523"
                frontColor="#3c433f"
                paperColor="#f5f4ef"
                itemColor="#f5f4ef"
                itemTextColor="#202523"
                labelColor="#f5f4ef"
                width={200}
                height={112}
                tilt={0}
                restAngle={10}
                flapAngle={28}
              />
            </div>
          </div>

          <form
            className={`quick-book ${isHourly ? "quick-book-hourly" : isKm ? "quick-book-km" : "quick-book-fixed"}`}
            onSubmit={handleSubmit}
          >
            {/* ── START LOCATION (all services) ── */}
            <LocationInput
              label={isEurope ? "START LOCATION (Europe)" : "START LOCATION"}
              value={pickup}
              onChange={changePickup}
              predictions={pickupPredictions.predictions}
              loading={pickupPredictions.loading}
              error={pickupPredictions.error}
              empty={pickupPredictions.empty}
              onSelect={selectPickup}
            />

            {/* ── HOURS selector (per hour / wedding) ── */}
            {isHourly && (
              <label className="quick-hour-select">
                <span className="field-label">HOURS</span>
                <div className="field-inline">
                  <span className="field-icon">◔</span>
                  <GlideSelect
                    options={bookingHourOptions}
                    value={hours}
                    onChange={(value) => setHours(value)}
                    aria-label="Hours"
                    showTags
                    accentColor="#bd3832"
                    surfaceColor="rgba(255, 255, 255, 0.72)"
                    highlightColor="rgba(235, 237, 232, 0.96)"
                    textColor="#2a312c"
                    variant="light"
                    size="md"
                    radius={8}
                    menuWidth={150}
                    placement="bottom"
                    align="left"
                  />
                </div>
              </label>
            )}

            {/* ── DESTINATION (per km / fixed services) ── */}
            {(isKm || isFixed) && (
              <LocationInput
                label={isEurope ? "DESTINATION (Europe)" : "DESTINATION"}
                value={destination}
                onChange={changeDestination}
                predictions={destinationPredictions.predictions}
                loading={destinationPredictions.loading}
                error={destinationPredictions.error}
                empty={destinationPredictions.empty}
                onSelect={selectDestination}
              />
            )}

            {/* ── AUTO DISTANCE badge (per km) ── */}
            {needsDistance && (
              <div className="quick-distance-badge" aria-live="polite">
                {distLoading ? (
                  <span className="distance-calculating">
                    <Loader size={14} className="spin" /> Calculating distance…
                  </span>
                ) : distanceKm ? (
                  <span className="distance-result">
                    <Route size={14} /> <strong>{distanceKm} km</strong>
                    {durationText && <> · ~{durationText}</>}
                  </span>
                ) : distError ? (
                  <span className="distance-error">
                    {distError}{" "}
                    <button
                      type="button"
                      className="text-button"
                      onClick={route.retry}
                    >
                      Try again
                    </button>
                  </span>
                ) : (
                  <span className="distance-hint">
                    <Route size={14} /> Enter both locations to see distance &
                    fare
                  </span>
                )}
              </div>
            )}

            {/* ── Fixed rate badge (per day / outside CH) ── */}
            {isFixed && (
              <div className="quick-fixed-rate">
                <span className="fixed-rate-label">
                  {liveQuote.error || liveQuote.breakdown}
                </span>
              </div>
            )}

            {/* ── DATE ── */}
            <label className="quick-date">
              <CalendarDays size={18} />
              <span>
                DATE
                <input
                  aria-label="Travel date"
                  type="date"
                  required
                  min={localDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </span>
            </label>

            {/* ── TIME ── */}
            <label className="quick-date">
              <Clock3 size={18} />
              <span>
                TIME
                <input
                  aria-label="Pickup time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  step={900}
                />
              </span>
            </label>

            {/* ── Live fare estimate (non-fixed) ── */}
            {!isFixed && !liveQuote.error && (
              <div className="quick-fare-preview" aria-live="polite">
                <span>Fare:</span>
                <strong>CHF {formatFare(liveQuote.total)}</strong>
                <span className="fare-breakdown">{liveQuote.breakdown}</span>
              </div>
            )}

            <BorderGlow
              className="next-button-glow"
              edgeSensitivity={30}
              glowColor="40 80 80"
              backgroundColor="#120F17"
              borderRadius={28}
              glowRadius={40}
              glowIntensity={1}
              coneSpread={25}
              animated={false}
              colors={["#c084fc", "#f472b6", "#38bdf8"]}
            >
              <button className="button next-button" type="submit">
                NEXT
              </button>
            </BorderGlow>
            {formError && (
              <p className="form-error quick-distance-badge" role="alert">
                {formError}
              </p>
            )}
          </form>

          <p className="journey-payment-note">
            <ShieldCheck size={15} aria-hidden="true" />
            {bookingPolicy.advancePercent}% advance payment required to confirm
            your booking.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
