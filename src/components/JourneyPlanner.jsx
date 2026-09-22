import {
  MapPin,
  Route,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { services, localDate, bookingPolicy } from "../config.js";
import { useState } from "react";
import Reveal from "./shared/Reveal.jsx";

export default function JourneyPlanner({ openBooking }) {
  const [rideType, setRideType] = useState("Airport Services");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
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
            <div
              className="service-switch"
              role="group"
              aria-label="Choose your service"
            >
              {services.map((service) => (
                <button
                  key={service}
                  aria-pressed={rideType === service}
                  className={rideType === service ? "active" : ""}
                  onClick={() => setRideType(service)}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
          <form
            className="quick-book"
            onSubmit={(e) => {
              e.preventDefault();
              openBooking({ service: rideType, pickup, destination, date });
            }}
          >
            <label>
              <MapPin size={18} />
              <span>
                PICKUP LOCATION
                <input
                  aria-label="Pickup location"
                  placeholder="Airport, hotel or address"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  maxLength={200}
                />
              </span>
            </label>
            <label>
              <Route size={18} />
              <span>
                YOUR DESTINATION
                <input
                  aria-label="Your destination"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  maxLength={200}
                />
              </span>
            </label>
            <label className="quick-date">
              <CalendarDays size={18} />
              <span>
                TRAVEL DATE
                <input
                  aria-label="Travel date"
                  type="date"
                  min={localDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </span>
            </label>
            <button className="button button-red" type="submit">
              Plan my journey <ArrowUpRight size={19} />
            </button>
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
