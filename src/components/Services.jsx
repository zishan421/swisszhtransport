import { Plane, BriefcaseBusiness, CarFront, ArrowUpRight } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";
import Label from "./shared/Label.jsx";

const serviceItems = [
  {
    number: "01",
    title: "Airport Services",
    icon: Plane,
    subtitle: "A seamless arrival.",
    copy: "From touchdown to your destination. Start or end your trip with a comfortable, private airport transfer.",
    detail: "ZURICH AIRPORT & BEYOND",
  },
  {
    number: "02",
    title: "Limousine",
    icon: BriefcaseBusiness,
    subtitle: "Make an entrance.",
    copy: "Business engagements, special occasions or simply a little more comfort. A chauffeur experience built around you.",
    detail: "BUSINESS & SPECIAL OCCASIONS",
  },
  {
    number: "03",
    title: "Taxi",
    icon: CarFront,
    subtitle: "Your city. Your pace.",
    copy: "Across Zurich or further afield. Enjoy a personal, door-to-door journey that fits around your day.",
    detail: "CITY & INTERCITY JOURNEYS",
  },
];
export default function Services({ openBooking }) {
  return (
    <section id="services" className="services-section">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <Label>AT YOUR SERVICE</Label>
            <h2>
              Every occasion.
              <br />
              <em>Exceptionally handled.</em>
            </h2>
          </div>
          <p>
            Three ways to travel.
            <br />
            One considered standard of care.
          </p>
        </Reveal>
        <div className="service-grid">
          {serviceItems.map(
            ({ number, title, icon: Icon, subtitle, copy, detail }, i) => (
              <Reveal delay={i * 0.1} key={title}>
                <button
                  className="service-card"
                  onClick={() => openBooking({ service: title })}
                >
                  <div className="service-card-top">
                    <Icon size={28} strokeWidth={1.2} />
                    <span>{number}</span>
                  </div>
                  <span className="service-detail">{detail}</span>
                  <h3>{title}</h3>
                  <p className="service-subtitle">{subtitle}</p>
                  <p>{copy}</p>
                  <div className="service-card-bottom">
                    <span>Explore your journey</span>
                    <span className="circle-arrow">
                      <ArrowUpRight size={21} />
                    </span>
                  </div>
                </button>
              </Reveal>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
