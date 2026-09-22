import {
  X,
  MessageCircle,
  ArrowUpRight,
  Mail,
  ArrowRight,
  Route,
  User,
  Building2,
  Phone,
  Users,
  Luggage,
  Baby,
  Plane,
  SquarePen,
  Minus,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import {
  services,
  validateJourney,
  inquiryLinks,
  localDate,
  bookingPolicy,
  calculateVehicleQuote,
  formatFare,
} from "../config.js";
import { useRef, useState, useEffect } from "react";
import Label from "./shared/Label.jsx";
import AdvanceNotice from "./AdvanceNotice.jsx";
import { useDrivingDistance } from "../hooks/useDrivingDistance.js";
import { usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete.js";
import LocationInput from "./shared/LocationInput.jsx";
import RouteMap from "./shared/RouteMap.jsx";
import Brand from "./shared/Brand.jsx";
import {
  countryCodes,
  findCountryCodeByDialCode,
  findCountryCodeByIso,
} from "../lib/countryCodes.js";

export default function BookingDialog({ open, onClose, initial }) {
  const ref = useRef(null);
  const [data, setData] = useState({
    service: services[0],
    pickup: "",
    destination: "",
    date: "",
    time: "10:00",
    hours: "3h",
    distance: "",
    pickupPlace: null,
    destinationPlace: null,
    // Passenger specs
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    phoneCode: "+41",
    phoneCountry: "CH",
    passengers: "1",
    luggage: "0",
    childSeats: "0",
    flightNumber: "",
    nameboard: "",
    notes: "",
  });

  // Steps: 'vehicles' | 'passengers' | 'payment' | 'finish'
  const [step, setStep] = useState("vehicles");
  const [vehicleSelected, setVehicleSelected] = useState(false);
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [error, setError] = useState("");
  const selectedPhoneCountry = findCountryCodeByIso(data.phoneCountry);

  const isEurope = data.service === "Outside Switzerland";

  const pickupPredictions = usePlacesAutocomplete(
    data.pickup,
    open && !data.pickupPlace,
    isEurope,
  );
  const destinationPredictions = usePlacesAutocomplete(
    data.destination,
    open && !data.destinationPlace,
    isEurope,
  );

  const route = useDrivingDistance(
    data.pickupPlace,
    data.destinationPlace,
    open && Boolean(data.pickupPlace && data.destinationPlace),
  );

  const bookingData = {
    ...data,
    distance: String(route.distanceKm ?? data.distance ?? ""),
    name: [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || data.name || "",
  };

  const quote = calculateVehicleQuote(bookingData);

  useEffect(() => {
    if (!open) {
      ref.current?.close();
      return;
    }
    const merged = {
      service: services[0],
      pickup: "",
      destination: "",
      date: "",
      time: "10:00",
      hours: "3h",
      distance: "",
      pickupPlace: null,
      destinationPlace: null,
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      phoneCode: "+41",
      phoneCountry: "CH",
      passengers: "1",
      luggage: "0",
      childSeats: "0",
      flightNumber: "",
      nameboard: "",
      notes: "",
      ...initial,
    };
    const phoneCountry = merged.phoneCountry
      ? findCountryCodeByIso(merged.phoneCountry)
      : findCountryCodeByDialCode(merged.phoneCode);
    merged.phoneCountry = phoneCountry.iso;
    merged.phoneCode = phoneCountry.code;
    setData((prev) => ({ ...prev, ...merged }));
    setError("");
    setVehicleSelected(false);
    setPhoneCountryOpen(false);
    setPaymentMethod("cash");
    // If coming from JourneyPlanner with locations selected, begin at vehicles step
    if (merged.pickupPlace && !calculateVehicleQuote(merged).error) {
      setStep("vehicles");
    } else {
      setStep("plan");
    }
    ref.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, initial]);

  const update = (e) => {
    const { name, value } = e.target;
    if (name === "phoneCountry") {
      const phoneCountry = findCountryCodeByIso(value);
      setData((prev) => ({
        ...prev,
        phoneCountry: phoneCountry.iso,
        phoneCode: phoneCountry.code,
      }));
      setError("");
      setPhoneCountryOpen(false);
      return;
    }
    setData((prev) => ({
      ...prev,
      [name]: value,
      ...(["pickup", "destination"].includes(name)
        ? { distance: "", [name + "Place"]: null }
        : {}),
      ...(name === "service" && value !== "Outside Switzerland"
        ? {
            ...(prev.pickupPlace?.countryCode !== "CH"
              ? { pickup: "", pickupPlace: null }
              : {}),
            ...(prev.destinationPlace?.countryCode !== "CH"
              ? { destination: "", destinationPlace: null }
              : {}),
          }
        : {}),
    }));
    setError("");
  };

  const choosePhoneCountry = (iso) => {
    const phoneCountry = findCountryCodeByIso(iso);
    setData((prev) => ({
      ...prev,
      phoneCountry: phoneCountry.iso,
      phoneCode: phoneCountry.code,
    }));
    setError("");
    setPhoneCountryOpen(false);
  };

  const incrementOption = (field, max = 7) => {
    setData((prev) => {
      const cur = parseInt(prev[field] || "0", 10);
      return { ...prev, [field]: String(Math.min(max, cur + 1)) };
    });
  };

  const decrementOption = (field, min = 0) => {
    setData((prev) => {
      const cur = parseInt(prev[field] || "0", 10);
      return { ...prev, [field]: String(Math.max(min, cur - 1)) };
    });
  };

  // Step 1 Validation -> Proceed to Passengers
  const handleVehicleProceed = () => {
    if (!vehicleSelected) {
      setError("Please select the vehicle above to continue.");
      return;
    }
    setError("");
    setStep("passengers");
    ref.current?.scrollTo(0, 0);
  };

  // Step 2 Validation -> Proceed to Payment
  const handlePassengersProceed = (e) => {
    e.preventDefault();
    if (!data.firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (!data.lastName.trim()) {
      setError("Please enter your surname.");
      return;
    }
    if (!data.email.trim() || !data.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!data.phone.trim() || data.phone.trim().length < 5) {
      setError("Please enter your telephone number.");
      return;
    }

    const message = validateJourney(bookingData);
    if (message) {
      setError(message);
      return;
    }

    setError("");
    setStep("payment");
    ref.current?.scrollTo(0, 0);
  };

  const links = inquiryLinks(bookingData);

  return (
    <dialog
      ref={ref}
      className={`booking-dialog luxury-flow-dialog ${
        step !== "plan" ? "review-mode" : ""
      }`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="booking-title"
    >
      <div
        className={`dialog-inner luxury-dialog-inner ${
          step !== "plan" ? "review-mode" : ""
        }`}
      >
        <button
          className="close-button"
          aria-label="Close booking inquiry"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        {/* ── Top Header Stepper (Vehicles ▶ Passengers ▶ Payment ▶ Finish) ── */}
        <div className="luxury-stepper-header">
          <div className="stepper-brand">
            <div className="booking-brand">
              <Brand />
            </div>
            <span className="brand-contact">jamaluddin174@yahoo.com</span>
          </div>

          <div
            className="booking-stepper"
            role="navigation"
            aria-label="Booking steps"
          >
            <button
              type="button"
              className={`stepper-node ${step === "vehicles" ? "active" : ["passengers", "payment", "finish"].includes(step) ? "completed" : ""}`}
              onClick={() => step !== "plan" && setStep("vehicles")}
            >
              VEHICLES
            </button>
            <span className="stepper-arrow">▶</span>

            <button
              type="button"
              className={`stepper-node ${step === "passengers" ? "active" : ["payment", "finish"].includes(step) ? "completed" : ""}`}
              onClick={() => vehicleSelected && setStep("passengers")}
            >
              PASSENGERS
            </button>
            <span className="stepper-arrow">▶</span>

            <button
              type="button"
              className={`stepper-node ${step === "payment" ? "active" : step === "finish" ? "completed" : ""}`}
              onClick={() =>
                data.firstName && data.lastName && setStep("payment")
              }
            >
              PAYMENT
            </button>
            <span className="stepper-arrow">▶</span>

            <span
              className={`stepper-node ${step === "finish" ? "active" : ""}`}
            >
              FINISH
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            STEP 1: VEHICLES
           ═══════════════════════════════════════════════════════════════════════ */}
        {step === "vehicles" && (
          <div className="vehicle-quote-shell">
            {/* Confirmed Route Banner */}
            {data.pickup && (
              <div className="trip-route-highlight">
                <div className="trip-route-header">
                  <span className="trip-route-tag">CONFIRMED ROUTE</span>
                  {route.distanceKm ? (
                    <span className="trip-distance-tag">
                      <Route size={13} /> {route.distanceKm} km
                      {route.durationText ? ` · ~${route.durationText}` : ""}
                    </span>
                  ) : null}
                </div>
                <div className="trip-route-flow">
                  <div className="trip-stop pickup-stop">
                    <div className="stop-marker pickup-marker">A</div>
                    <div className="stop-details">
                      <span className="stop-type">PICKUP LOCATION</span>
                      <strong className="stop-name">{data.pickup}</strong>
                    </div>
                  </div>
                  <div className="trip-route-connector">
                    <ArrowRight size={20} />
                  </div>
                  <div className="trip-stop dest-stop">
                    <div className="stop-marker dest-marker">B</div>
                    <div className="stop-details">
                      <span className="stop-type">DESTINATION</span>
                      <strong className="stop-name">
                        {data.destination ||
                          (data.service === "Book per hour"
                            ? "Hourly booking (As directed)"
                            : "As directed")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="quote-layout">
              <aside className="quote-summary-card">
                <h3>Your Trip</h3>
                <div className="summary-item">
                  <span className="summary-label">From</span>
                  <strong>{data.pickup}</strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">To</span>
                  <strong>{data.destination || "As directed"}</strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Service</span>
                  <strong>{quote.label}</strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Rate</span>
                  <strong>{quote.breakdown}</strong>
                </div>
                <div className="summary-item">
                  <span className="summary-label">When</span>
                  <strong>{`${data.date} · ${data.time}`}</strong>
                </div>
                {route.distanceKm && (
                  <div className="summary-item">
                    <span className="summary-label">Distance</span>
                    <strong>
                      {route.distanceKm} km
                      {route.durationText ? ` · ~${route.durationText}` : ""}
                    </strong>
                  </div>
                )}
                <div className="summary-item">
                  <span className="summary-label">Price</span>
                  <strong>CHF {formatFare(quote.total)}</strong>
                </div>
              </aside>

              <div
                className={`quote-vehicle-card ${vehicleSelected ? "selected" : ""}`}
                onClick={() => {
                  setVehicleSelected(true);
                  setError("");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="quote-vehicle-header">
                  <div>
                    <h4>Mercedes-Benz V-Class</h4>
                    <span>2023 · Executive luxury van</span>
                  </div>
                  <div className="quote-price-block">
                    <span className="currency">CHF</span>
                    <strong>{formatFare(quote.total)}</strong>
                  </div>
                </div>

                <div className="quote-vehicle-body">
                  <div className="quote-vehicle-image">
                    <img
                      src="/images/v-class.webp"
                      alt="Mercedes-Benz V-Class 2023"
                    />
                  </div>

                  <div className="quote-vehicle-meta">
                    <span>Max. passengers: 7</span>
                    <span>Max. luggage: 7</span>
                  </div>
                </div>

                <div className="quote-vehicle-features">
                  <span>✓ Luggage service</span>
                  <span>✓ Complimentary bottled water</span>
                  <span>
                    ✓ Free cancellation up to 24 hours before pickup time
                  </span>
                  <span>✓ No hidden fees</span>
                </div>

                <button
                  type="button"
                  className={`vehicle-option-button ${vehicleSelected ? "selected" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setVehicleSelected((prev) => !prev);
                    setError("");
                  }}
                >
                  {vehicleSelected ? "✓ SELECTED" : "SELECT VEHICLE"}
                </button>
              </div>
            </div>

            {/* Embedded Route Map */}
            {(data.pickupPlace || data.destinationPlace) && (
              <RouteMap
                pickupPlace={data.pickupPlace}
                destinationPlace={data.destinationPlace}
                routePoints={route.routePoints}
                distanceKm={route.distanceKm}
                durationText={route.durationText}
                fareAmount={quote.total}
                height="260px"
              />
            )}

            <AdvanceNotice />

            {error && (
              <p
                className="form-error full"
                role="alert"
                style={{ marginBottom: "14px" }}
              >
                {error}
              </p>
            )}

            <button
              className="button button-red w-full"
              onClick={handleVehicleProceed}
            >
              Continue to passenger details <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STEP 2: PASSENGERS (Matching Reference Screenshot)
           ═══════════════════════════════════════════════════════════════════════ */}
        {step === "passengers" && (
          <div className="passengers-flow-grid">
            {/* ── LEFT COLUMN: "Your Trip" Card ── */}
            <aside className="your-trip-card">
              <h3 className="your-trip-title">Your Trip</h3>

              {/* Mini Map */}
              <div className="your-trip-map-container">
                <RouteMap
                  pickupPlace={data.pickupPlace}
                  destinationPlace={data.destinationPlace}
                  routePoints={route.routePoints}
                  distanceKm={route.distanceKm}
                  durationText={route.durationText}
                  height="180px"
                />
                <div className="your-trip-map-banner">
                  <span className="banner-duration">
                    Approx. duration: {route.durationText || "Variable"}
                  </span>
                  <span className="banner-distance">
                    Distance: {route.distanceKm ? `${route.distanceKm} km` : "Hourly"}
                  </span>
                </div>
              </div>

              {/* Itinerary details */}
              <div className="your-trip-itinerary">
                <div className="itinerary-row">
                  <span className="itinerary-icon pin-icon">📍</span>
                  <span className="itinerary-text">{data.pickup}</span>
                </div>
                <div className="itinerary-row">
                  <span className="itinerary-icon pin-icon">📍</span>
                  <span className="itinerary-text">
                    {data.destination || (data.service === "Book per hour" ? "Hourly (As directed)" : "As directed")}
                  </span>
                </div>
                <div className="itinerary-row">
                  <span className="itinerary-icon arrow-icon">➔</span>
                  <span className="itinerary-text">{quote.label}</span>
                </div>
                <div className="itinerary-row">
                  <span className="itinerary-icon calendar-icon">
                    <Calendar size={13} />
                  </span>
                  <span className="itinerary-text">{`${data.date}, ${data.time}`}</span>
                </div>
              </div>

              {/* Vehicle preview */}
              <div className="your-trip-vehicle">
                <span className="vehicle-class-tag">Executive Luxury Class</span>
                <div className="vehicle-photo-wrap">
                  <img
                    src="/images/v-class.webp"
                    alt="Mercedes-Benz V-Class"
                  />
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="your-trip-pricing">
                <div className="pricing-row">
                  <span>Transfer</span>
                  <span>CHF {formatFare(quote.total)}</span>
                </div>
                <div className="pricing-row">
                  <span>VAT included</span>
                </div>
                <div className="pricing-total-row">
                  <span className="total-label">Total</span>
                  <span className="total-value">
                    CHF <strong>{formatFare(quote.total)}</strong>
                  </span>
                </div>
                <span className="no-hidden-tag">✓ No hidden costs.</span>
              </div>
            </aside>

            {/* ── RIGHT COLUMN: Passenger Details & Options Form ── */}
            <form className="passenger-details-form" onSubmit={handlePassengersProceed}>
              {/* Section 1: Passenger Details */}
              <div className="form-section-block">
                <h3 className="section-block-title">Passenger details</h3>

                {/* Name & Surname */}
                <div className="form-row-2">
                  <div className="input-with-icon">
                    <User size={16} className="input-leading-icon" />
                    <input
                      name="firstName"
                      placeholder="Name*"
                      value={data.firstName}
                      onChange={update}
                      required
                    />
                  </div>
                  <div className="input-with-icon">
                    <User size={16} className="input-leading-icon" />
                    <input
                      name="lastName"
                      placeholder="Surname*"
                      value={data.lastName}
                      onChange={update}
                      required
                    />
                  </div>
                </div>

                {/* Company (optional) */}
                <div className="form-row-1">
                  <div className="input-with-icon">
                    <Building2 size={16} className="input-leading-icon" />
                    <input
                      name="company"
                      placeholder="Company"
                      value={data.company}
                      onChange={update}
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div className="form-row-1">
                  <div className="input-with-icon">
                    <Mail size={16} className="input-leading-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="E-mail*"
                      value={data.email}
                      onChange={update}
                      required
                    />
                  </div>
                </div>

                {/* Telephone with Swiss/Intl code */}
                <div className="form-row-1">
                  <div className="phone-input-group">
                    <div
                      className={`phone-prefix-select ${phoneCountryOpen ? "open" : ""}`}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setPhoneCountryOpen(false);
                        }
                      }}
                    >
                      <button
                        type="button"
                        className="phone-prefix-button"
                        onClick={() => setPhoneCountryOpen((prev) => !prev)}
                        aria-haspopup="listbox"
                        aria-expanded={phoneCountryOpen}
                        aria-label={`Country code ${selectedPhoneCountry.displayName} ${selectedPhoneCountry.code}`}
                      >
                        <span className="selected-flag-preview" aria-hidden="true">
                          {selectedPhoneCountry.flag}
                        </span>
                        <span className="selected-code-display">
                          {selectedPhoneCountry.code}
                        </span>
                        <ChevronDown size={14} className="select-caret" />
                      </button>
                      {phoneCountryOpen && (
                        <div className="phone-country-menu" role="listbox">
                          {countryCodes.map((c) => (
                            <button
                              key={c.iso}
                              type="button"
                              role="option"
                              aria-selected={c.iso === selectedPhoneCountry.iso}
                              className={`phone-country-option ${
                                c.iso === selectedPhoneCountry.iso ? "selected" : ""
                              }`}
                              onClick={() => choosePhoneCountry(c.iso)}
                            >
                              <span className="phone-country-flag" aria-hidden="true">
                                {c.flag}
                              </span>
                              <span className="phone-country-name">
                                {c.displayName}
                              </span>
                              <span className="phone-country-code">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="input-with-icon phone-number-input">
                      <Phone size={15} className="input-leading-icon" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Telephone*"
                        value={data.phone}
                        onChange={update}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Options */}
              <div className="form-section-block">
                <h3 className="section-block-title">Options</h3>

                {/* Counters: Passengers, Baggage, Child Seat */}
                <div className="options-counters-row">
                  {/* Passengers */}
                  <div className="counter-box">
                    <span className="counter-label">
                      <Users size={14} /> Passengers
                    </span>
                    <div className="counter-controls">
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => decrementOption("passengers", 1)}
                        disabled={parseInt(data.passengers || "1", 10) <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="counter-val">{data.passengers}</span>
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => incrementOption("passengers", 7)}
                        disabled={parseInt(data.passengers || "1", 10) >= 7}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Baggage */}
                  <div className="counter-box">
                    <span className="counter-label">
                      <Luggage size={14} /> Baggage
                    </span>
                    <div className="counter-controls">
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => decrementOption("luggage", 0)}
                        disabled={parseInt(data.luggage || "0", 10) <= 0}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="counter-val">{data.luggage}</span>
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => incrementOption("luggage", 7)}
                        disabled={parseInt(data.luggage || "0", 10) >= 7}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Child Seat */}
                  <div className="counter-box">
                    <span className="counter-label">
                      <Baby size={14} /> Child Seat
                    </span>
                    <div className="counter-controls">
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => decrementOption("childSeats", 0)}
                        disabled={parseInt(data.childSeats || "0", 10) <= 0}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="counter-val">{data.childSeats}</span>
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => incrementOption("childSeats", 4)}
                        disabled={parseInt(data.childSeats || "0", 10) >= 4}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Flight Number & Nameboard */}
                <div className="form-row-2 mt-4">
                  <div className="input-with-icon">
                    <Plane size={16} className="input-leading-icon" />
                    <input
                      name="flightNumber"
                      placeholder="Flight Number"
                      value={data.flightNumber}
                      onChange={update}
                    />
                  </div>
                  <div className="input-with-icon">
                    <SquarePen size={16} className="input-leading-icon" />
                    <input
                      name="nameboard"
                      placeholder="Nameboard"
                      value={data.nameboard}
                      onChange={update}
                    />
                  </div>
                </div>

                {/* Notes to driver */}
                <div className="form-row-1 mt-4">
                  <textarea
                    name="notes"
                    placeholder="Notes to driver"
                    rows={3}
                    value={data.notes}
                    onChange={update}
                    className="notes-textarea"
                  />
                </div>
              </div>

              {error && (
                <p className="form-error full" role="alert">
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="passengers-action-bar">
                <button
                  type="button"
                  className="button button-outline back-btn"
                  onClick={() => setStep("vehicles")}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" className="button gold-payment-btn">
                  PAYMENT
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STEP 3: PAYMENT / CONFIRMATION
           ═══════════════════════════════════════════════════════════════════════ */}
        {step === "payment" && (
          <div className="payment-step-shell payment-layout">
            <aside className="your-trip-card payment-trip-card">
              <h3 className="your-trip-title">Your Trip</h3>
              <div className="your-trip-map-container">
                <RouteMap
                  pickupPlace={data.pickupPlace}
                  destinationPlace={data.destinationPlace}
                  routePoints={route.routePoints}
                  distanceKm={route.distanceKm}
                  durationText={route.durationText}
                  height="156px"
                />
                <div className="your-trip-map-banner">
                  <span className="banner-duration">
                    Approx. duration: {route.durationText || "Variable"}
                  </span>
                  <span className="banner-distance">
                    Distance: {route.distanceKm ? `${route.distanceKm} km` : "Hourly"}
                  </span>
                </div>
              </div>
              <div className="your-trip-itinerary">
                <div className="itinerary-row">
                  <span className="itinerary-icon pin-icon">A</span>
                  <span className="itinerary-text">{data.pickup}</span>
                </div>
                <div className="itinerary-row">
                  <span className="itinerary-icon pin-icon">B</span>
                  <span className="itinerary-text">{data.destination || "As directed"}</span>
                </div>
                <div className="itinerary-row">
                  <span className="itinerary-icon arrow-icon">-&gt;</span>
                  <span className="itinerary-text">{quote.label}</span>
                </div>
                <div className="itinerary-row">
                  <span className="itinerary-icon calendar-icon">
                    <Calendar size={13} />
                  </span>
                  <span className="itinerary-text">{`${data.date}, ${data.time}`}</span>
                </div>
              </div>
              <div className="your-trip-vehicle">
                <span className="vehicle-class-tag">Executive Luxury Class</span>
                <div className="vehicle-photo-wrap">
                  <img src="/images/v-class.webp" alt="Mercedes-Benz V-Class" />
                </div>
              </div>
              <div className="your-trip-pricing">
                <div className="pricing-row">
                  <span>Transfer</span>
                  <span>CHF {formatFare(quote.total)}</span>
                </div>
                <div className="pricing-row">
                  <span>VAT included</span>
                </div>
                <div className="pricing-total-row">
                  <span className="total-label">Total</span>
                  <span className="total-value">CHF <strong>{formatFare(quote.total)}</strong></span>
                </div>
                <span className="no-hidden-tag">No hidden costs.</span>
              </div>
              <div className="payment-trip-contact">
                <div><Users size={13} /> Passengers: {data.passengers}</div>
                <div><User size={13} /> {[data.firstName, data.lastName].filter(Boolean).join(" ")}</div>
                <div><Mail size={13} /> {data.email}</div>
                <div><Phone size={13} /> {data.phoneCode} {data.phone}</div>
              </div>
            </aside>
            <div className="payment-confirmation-card">
              <div className="payment-card-header">
                <h3>Payment method</h3>
              </div>

              <div className="payment-summary-specs">
                <div className="spec-item">
                  <span>Passenger:</span>
                  <strong>
                    {data.firstName} {data.lastName}
                  </strong>
                </div>
                <div className="spec-item">
                  <span>Contact:</span>
                  <strong>
                    {selectedPhoneCountry.flag} {data.phoneCode} {data.phone} · {data.email}
                  </strong>
                </div>
                <div className="spec-item">
                  <span>Route:</span>
                  <strong>
                    {data.pickup} ➔ {data.destination || "As directed"}
                  </strong>
                </div>
                <div className="spec-item">
                  <span>Pickup time:</span>
                  <strong>
                    {data.date} at {data.time} (Zurich time)
                  </strong>
                </div>
                <div className="spec-item">
                  <span>Vehicle:</span>
                  <strong>Mercedes-Benz V-Class (2023)</strong>
                </div>
                <div className="spec-item">
                  <span>Guests & Luggage:</span>
                  <strong>
                    {data.passengers} passengers · {data.luggage} bags
                    {parseInt(data.childSeats || "0", 10) > 0 &&
                      ` · ${data.childSeats} child seat`}
                  </strong>
                </div>
                {data.flightNumber && (
                  <div className="spec-item">
                    <span>Flight:</span>
                    <strong>{data.flightNumber}</strong>
                  </div>
                )}
                {data.nameboard && (
                  <div className="spec-item">
                    <span>Nameboard:</span>
                    <strong>{data.nameboard}</strong>
                  </div>
                )}
              </div>

              <div className="payment-method-options">
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vehicle-card"
                    checked={paymentMethod === "vehicle-card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit card in vehicle</span>
                </label>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Pay by cash</span>
                </label>
                {paymentMethod === "cash" && (
                  <div className="payment-method-note">
                    Cash payment in the vehicle immediately after completion of the journey.
                  </div>
                )}
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online-card"
                    checked={paymentMethod === "online-card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit Card Online</span>
                </label>
              </div>

              <AdvanceNotice />

              <p className="inquiry-note mt-3">
                Select your preferred way to send this reservation inquiry. Our
                dispatcher will immediately confirm vehicle availability and send
                the secure payment link for the required{" "}
                {bookingPolicy.advancePercent}% deposit.
              </p>

              <div className="payment-channel-buttons">
                <a
                  className="button button-red w-full"
                  href={links.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setStep("finish")}
                >
                  <MessageCircle size={18} /> Confirm via WhatsApp{" "}
                  <ArrowUpRight size={18} />
                </a>
                <a
                  className="button button-outline w-full mt-3"
                  href={links.email}
                  onClick={() => setStep("finish")}
                >
                  <Mail size={18} /> Confirm via Email{" "}
                  <ArrowUpRight size={18} />
                </a>
              </div>

              <p className="payment-terms">
                By clicking on PLACE ORDER, you accept our <span>Terms &amp; Conditions.</span>
              </p>
              <a
                className="payment-place-order"
                href={paymentMethod === "online-card" ? links.email : links.whatsapp}
                target={paymentMethod === "online-card" ? undefined : "_blank"}
                rel={paymentMethod === "online-card" ? undefined : "noopener noreferrer"}
                onClick={() => setStep("finish")}
              >
                PLACE ORDER
              </a>

              <button
                type="button"
                className="text-button payment-back-button"
                onClick={() => setStep("passengers")}
              >
                ← Back to passenger details
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STEP 4: FINISH
           ═══════════════════════════════════════════════════════════════════════ */}
        {step === "finish" && (
          <div className="finish-step-shell text-center">
            <CheckCircle2 size={54} className="finish-check-icon mx-auto" />
            <h2>Inquiry Sent Successfully</h2>
            <p className="finish-desc">
              Thank you, {data.firstName}! We have received your journey
              inquiry for <strong>{data.date}</strong> at{" "}
              <strong>{data.time}</strong>. Our team will verify driver
              availability and send you the final booking confirmation.
            </p>
            <button
              className="button button-red mt-5"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            INITIAL PLAN / DIRECT MODAL FALLBACK
           ═══════════════════════════════════════════════════════════════════════ */}
        {step === "plan" && (
          <form
            className="booking-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!data.pickupPlace || !data.destinationPlace) {
                setError(
                  "Choose pickup and destination from the dropdown suggestions.",
                );
                return;
              }
              setError("");
              setStep("vehicles");
            }}
          >
            <label className="full">
              Service
              <select name="service" value={data.service} onChange={update}>
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <LocationInput
              label={isEurope ? "Pickup location (Europe)" : "Pickup location"}
              value={data.pickup}
              required
              onChange={(value) =>
                update({ target: { name: "pickup", value } })
              }
              onSelect={(value, place) => {
                setData((prev) => ({
                  ...prev,
                  pickup: value,
                  pickupPlace: place,
                }));
                setError("");
              }}
              predictions={pickupPredictions.predictions}
              loading={pickupPredictions.loading}
              error={pickupPredictions.error}
              empty={pickupPredictions.empty}
            />

            <LocationInput
              label={isEurope ? "Destination (Europe)" : "Destination"}
              value={data.destination}
              required
              onChange={(value) =>
                update({ target: { name: "destination", value } })
              }
              onSelect={(value, place) => {
                setData((prev) => ({
                  ...prev,
                  destination: value,
                  destinationPlace: place,
                }));
                setError("");
              }}
              predictions={destinationPredictions.predictions}
              loading={destinationPredictions.loading}
              error={destinationPredictions.error}
              empty={destinationPredictions.empty}
            />

            <label>
              Pickup date
              <input
                type="date"
                name="date"
                value={data.date}
                onChange={update}
                min={localDate()}
                required
              />
            </label>
            <label>
              Time in Switzerland
              <input
                type="time"
                name="time"
                value={data.time}
                onChange={update}
                required
              />
            </label>

            {error && (
              <p className="form-error full" role="alert">
                {error}
              </p>
            )}

            <button className="button button-red full mt-3" type="submit">
              Next: Select Vehicle <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
