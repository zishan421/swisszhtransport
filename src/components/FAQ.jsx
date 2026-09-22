import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { bookingPolicy, bookingRates, business } from "../config.js";
import Reveal from "./shared/Reveal.jsx";
import Label from "./shared/Label.jsx";

const faqItems = [
  [
    "How do I book a journey?",
    `Choose your service and enter your journey details. Send your inquiry by WhatsApp or email, and we will respond with availability and a personalised quote. Your booking is confirmed only after availability is agreed and the required ${bookingPolicy.advancePercent}% advance payment is received.`,
  ],
  [
    "Is an advance payment required?",
    `Yes. An advance payment of ${bookingPolicy.advancePercent}% of the agreed total fare is required to confirm your booking. The remaining balance is ${bookingPolicy.balancePercent}%. Sending an inquiry does not make a payment or reserve your journey. Contact our team for payment arrangements.`,
  ],
  [
    "Can you pick me up at Zurich Airport?",
    "Yes. Choose Book per km and include your flight number, arrival date and destination. We will arrange the pickup details with you when confirming your journey.",
  ],
  [
    "Can I request the Mercedes-Benz V-Class 2023?",
    "Yes. Mention the Mercedes-Benz V-Class 2023 in your inquiry, together with your passenger count and luggage requirements. Our team will confirm vehicle availability and the right configuration for your group.",
  ],
  [
    "Are journeys outside Zurich available?",
    "Yes. Tell us where you would like to go. We welcome inquiries for Swiss city transfers, alpine destinations and longer journeys, with routes and pricing agreed before your trip.",
  ],
  [
    "How much will my journey cost?",
    `Hourly and wedding bookings require at least ${bookingRates.minimumBookingHours} hours at CHF ${bookingRates.perHour}/hr and CHF ${bookingRates.weddingPerHour}/hr respectively. Distance: CHF ${bookingRates.perKm}/km, with Zurich Airport to Zurich city fixed at CHF ${bookingRates.zurichAirportToCity} and Zurich city to Zurich Airport at CHF ${bookingRates.zurichCityToAirport}. A ${bookingRates.perDayHours}-hour day inside Switzerland costs CHF ${bookingRates.perDay}, including ${bookingRates.insideSwitzerlandMaxKm} km; extra distance is CHF ${bookingRates.perDayExtraKm}/km. Outside Switzerland: CHF ${bookingRates.outsideSwitzerlandPerDay} per ${bookingRates.perDayHours}-hour day including ${bookingRates.outsideSwitzerlandIncludedKm} km; longer routes require driver confirmation and an additional charge.`,
  ],
];
export default function FAQ() {
  const [activeFaq, setActiveFaq] = useState(0);
  return (
    <section className="faq-section container">
      <Reveal className="faq-intro">
        <Label>A LITTLE CLARITY</Label>
        <h2>
          Before
          <br />
          you <em>go.</em>
        </h2>
        <p>
          Something else on your mind?
          <br />
          We’re just a message away.
        </p>
        <a
          className="inline-link"
          href={`https://wa.me/${business.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Talk to us <ArrowUpRight size={18} />
        </a>
      </Reveal>
      <div className="faq-list">
        {faqItems.map(([question, answer], i) => (
          <Reveal key={question} delay={i * 0.04}>
            <div className={`faq-item ${activeFaq === i ? "is-open" : ""}`}>
              <button
                aria-expanded={activeFaq === i}
                aria-controls={`answer-${i}`}
                id={`question-${i}`}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <span>{question}</span>
                {activeFaq === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
              <AnimatePresence initial={false}>
                {activeFaq === i && (
                  <motion.div
                    id={`answer-${i}`}
                    role="region"
                    aria-labelledby={`question-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
