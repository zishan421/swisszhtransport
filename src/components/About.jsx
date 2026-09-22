import { ArrowUpRight } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";
import Label from "./shared/Label.jsx";

export default function About() {
  return (
    <section className="intro-section container" id="experience">
      <Reveal className="intro-side">
        <Label>THE SWISS ZH WAY</Label>
        <img
          className="zurich-crest"
          src="/images/image.png"
          alt="Zurich flag badge"
        />
        <span className="intro-location">
          ZURICH, SWITZERLAND
          <br />
          47°22′ N &nbsp; 8°33′ E
        </span>
      </Reveal>
      <Reveal className="intro-main">
        <h2>
          Some journeys take you places.
          <br />
          Ours give you <em>space.</em>
        </h2>
        <div className="intro-copy">
          <p>
            Space to unwind. To prepare. To simply enjoy the view. At Swiss ZH
            Transport, we believe the journey deserves as much attention as the
            destination.
          </p>
          <p>
            From your first airport arrival to your next important occasion,
            discover thoughtful service, effortless comfort and a more personal
            way to travel.
          </p>
        </div>
        <a className="inline-link" href="#services">
          Discover a different way to travel <ArrowUpRight size={18} />
        </a>
      </Reveal>
    </section>
  );
}
