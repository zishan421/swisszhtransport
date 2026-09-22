import { X, MessageCircle, ArrowUpRight, Mail, ArrowRight } from "lucide-react";
import {
  services,
  validateJourney,
  inquiryLinks,
  localDate,
  bookingPolicy,
} from "../config.js";
import { useRef, useState, useEffect } from "react";
import Label from "./shared/Label.jsx";
import AdvanceNotice from "./AdvanceNotice.jsx";

export default function BookingDialog({ open, onClose, initial }) {
  const ref = useRef(null);
  const [data, setData] = useState({
    service: services[0],
    pickup: "",
    destination: "",
    date: "",
    time: "10:00",
    passengers: "1",
    name: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  useEffect(() => {
    if (!open) {
      ref.current?.close();
      return;
    }
    setData((prev) => ({ ...prev, ...initial }));
    setError("");
    setReview(false);
    ref.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, initial]);
  const update = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };
  const submit = (e) => {
    e.preventDefault();
    const message = validateJourney(data);
    if (message) {
      setError(message);
      return;
    }
    setReview(true);
    ref.current?.scrollTo(0, 0);
  };
  const links = inquiryLinks(data);
  return (
    <dialog
      ref={ref}
      className="booking-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="booking-title"
    >
      <div className="dialog-inner">
        <button
          className="close-button"
          aria-label="Close booking inquiry"
          onClick={onClose}
        >
          <X size={22} />
        </button>
        <Label>Your next journey</Label>
        <h2 id="booking-title">
          {review
            ? "A beautiful journey\nstarts here."
            : "Let’s take you\nsomewhere."}
        </h2>
        <p className="dialog-intro">
          {review
            ? "Review your details, then send your inquiry to our team."
            : "A few details. A journey tailored to you."}
        </p>
        {review ? (
          <div>
            <dl className="review-list">
              {[
                ["Service", data.service],
                ["From", data.pickup],
                ["To", data.destination],
                ["When", `${data.date} · ${data.time}`],
                ["Passengers", data.passengers],
                ["Name", data.name],
                ...(data.notes ? [["Notes", data.notes]] : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <AdvanceNotice />
            <p className="inquiry-note">
              Sending this inquiry does not make a payment or confirm a booking.
              Pickup times are in Switzerland local time.
            </p>
            <a
              className="button button-red w-full"
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> Send via WhatsApp{" "}
              <ArrowUpRight size={18} />
            </a>
            <a className="button button-outline w-full mt-3" href={links.email}>
              <Mail size={18} /> Send via email <ArrowUpRight size={18} />
            </a>
            <button
              className="text-button mt-5"
              onClick={() => setReview(false)}
            >
              Edit journey details
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="booking-form">
            <label className="full">
              Service
              <select name="service" value={data.service} onChange={update}>
                {services.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Pickup location
              <input
                name="pickup"
                value={data.pickup}
                onChange={update}
                placeholder="Airport, hotel or address"
                maxLength={200}
                required
                autoComplete="off"
              />
            </label>
            <label>
              Destination
              <input
                name="destination"
                value={data.destination}
                onChange={update}
                placeholder="Where are you going?"
                maxLength={200}
                required
                autoComplete="off"
              />
            </label>
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
            <label>
              Your name
              <input
                name="name"
                value={data.name}
                onChange={update}
                placeholder="Full name"
                maxLength={100}
                autoComplete="name"
                required
              />
            </label>
            <label>
              Passengers
              <select
                name="passengers"
                value={data.passengers}
                onChange={update}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8+"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="full">
              Anything else? <span className="optional">(optional)</span>
              <textarea
                name="notes"
                value={data.notes}
                onChange={update}
                placeholder="Flight number, luggage or special requests…"
                maxLength={1000}
                rows={3}
              />
            </label>
            {error && (
              <p className="form-error full" role="alert">
                {error}
              </p>
            )}
            <AdvanceNotice />
            <button className="button button-red full" type="submit">
              Review your inquiry <ArrowRight size={18} />
            </button>
            <p className="inquiry-note full">
              Request your quote first. A {bookingPolicy.advancePercent}%
              advance payment is required before your booking is confirmed.
            </p>
          </form>
        )}
      </div>
    </dialog>
  );
}
