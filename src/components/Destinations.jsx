import { ArrowUpRight } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";
import Label from "./shared/Label.jsx";

export default function Destinations({ openBooking }) {
  return (
    <section className="alpine-section">
      <img
        className="alpine-image"
        src="/images/swiss-alps.jpg"
        alt="A winding road through the Swiss Alps"
        loading="lazy"
        width="2400"
        height="1600"
      />
      <div className="alpine-overlay" />
      <div className="container alpine-content">
        <Reveal>
          <Label light>BEYOND THE EVERYDAY</Label>
          <h2>
            The destination is yours.
            <br />
            The journey is <em>ours.</em>
          </h2>
          <p>
            City mornings. Alpine afternoons. Wherever Switzerland
            <br className="desktop-break" /> takes you, make getting there part
            of the experience.
          </p>
          <button
            className="button button-light"
            onClick={() => openBooking({ service: "Book per km" })}
          >
            Let’s go somewhere <ArrowUpRight size={18} />
          </button>
        </Reveal>
        <div className="destination-list">
          {["Zurich", "Lucerne", "Interlaken", "St. Moritz"].map((city, i) => (
            <button
              key={city}
              onClick={() =>
                openBooking({
                  pickup: "Zurich",
                  destination: city === "Zurich" ? "Zurich Airport" : city,
                  service: "Book per km",
                })
              }
            >
              <span>0{i + 1}</span>
              {city}
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
