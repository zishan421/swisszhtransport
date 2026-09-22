import { business } from "../config.js";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";
import Label from "./shared/Label.jsx";

export default function Contact({ openBooking }) {
  return (
    <section className="contact-section" id="contact">
      <div className="container">
        <Reveal className="contact-top">
          <div>
            <Label light>YOUR NEXT CHAPTER STARTS HERE</Label>
            <h2>
              Shall we <em>go?</em>
            </h2>
          </div>
          <button
            className="contact-arrow"
            aria-label="Plan your journey"
            onClick={() => openBooking()}
          >
            <ArrowUpRight strokeWidth={1} size={64} />
          </button>
        </Reveal>
        <div className="contact-bottom">
          <p>
            A simple transfer. A special occasion.
            <br />
            Let’s make it a journey to remember.
          </p>
          <a href={`tel:+${business.whatsapp}`}>
            <span>CALL US</span>
            {business.phone}
            <ArrowUpRight size={17} />
          </a>
          <a href={`mailto:${business.email}`}>
            <span>WRITE TO US</span>
            {business.email}
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
