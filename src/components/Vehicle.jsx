import {
  ShieldCheck,
  BriefcaseBusiness,
  CarFront,
  Route,
  ArrowUpRight,
} from "lucide-react";
import Reveal from "./shared/Reveal.jsx";
import Label from "./shared/Label.jsx";
import VehicleGallery from "./VehicleGallery.jsx";

export default function Vehicle({ openBooking }) {
  return (
    <section className="vehicle-section container" id="vehicle">
      <Reveal className="vehicle-visual">
        <VehicleGallery />
        <div className="vehicle-photo-footer">
          <span>THE SIGNATURE VEHICLE · 2023</span>
          <span>
            MERCEDES-BENZ <span className="red-text">↗</span>
          </span>
        </div>
      </Reveal>
      <Reveal className="vehicle-content">
        <Label>YOUR PRIVATE SPACE</Label>
        <h2>
          More room.
          <br />
          <em>More possibility.</em>
        </h2>
        <h3>Mercedes-Benz V-Class <span className="vehicle-model-year">2023</span></h3>
        <p>
          A refined presence. A spacious interior. Our 2023 V-Class brings a little
          calm to busy days, with room for shared journeys and the things you
          take along.
        </p>
        <div className="vehicle-features">
          <div>
            <ShieldCheck size={20} />
            <span>Private journeys</span>
          </div>
          <div>
            <BriefcaseBusiness size={20} />
            <span>Room for your luggage</span>
          </div>
          <div>
            <CarFront size={20} />
            <span>Spacious comfort</span>
          </div>
          <div>
            <Route size={20} />
            <span>Tailored to your route</span>
          </div>
        </div>
        <button
          className="button button-dark"
          onClick={() =>
            openBooking({
              service: "Limousine",
              notes: "I would like to request the Mercedes-Benz V-Class 2023.",
            })
          }
        >
          Experience the V-Class <ArrowUpRight size={18} />
        </button>
        <p className="vehicle-note">
          Share your group size and luggage needs when you inquire.
        </p>
      </Reveal>
    </section>
  );
}
