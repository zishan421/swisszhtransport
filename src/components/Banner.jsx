import { ArrowUpRight, ArrowDown } from "lucide-react";
import {
  useReducedMotion,
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import { useRef } from "react";
import Label from "./shared/Label.jsx";
import { ease } from "../lib/animation.js";

export default function Banner({ openBooking }) {
  const hero = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: heroProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "22%"]);
  const heroX = useTransform(heroProgress, [0, 1], ["0%", "-4%"]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.14]);

  return (
    <section className="hero" id="home" ref={hero}>
      <motion.div
        className="hero-video-wrap"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.15 }}
      >
        <img
          className="hero-video"
          src="/images/M1.png"
          alt="Black Mercedes-Benz V-Class at a luxury hotel entrance"
        />
        <div className="hero-video-sheen" />
        <div className="hero-video-grain" />
      </motion.div>

      <motion.div
        className="hero-image"
        style={{
          x: reduced ? 0 : heroX,
          y: reduced ? 0 : heroY,
          scale: reduced ? 1 : heroScale,
        }}
      >
        <img
          src="/images/M2.png"
          alt="Premium black Mercedes-Benz V-Class luxury van at the airport entrance"
          fetchPriority="high"
        />
      </motion.div>

      <div className="hero-shade" />
      <div className="hero-content container">
        <motion.div
          className="hero-badges"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <span className="hero-badge">Mercedes-Benz V-Class</span>
          <span className="hero-badge hero-badge-muted">Luxury private transfer</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
        >
          <Label light>SWISS PRECISION. PERSONAL SERVICE.</Label>
        </motion.div>
        <h1>
          {["The art of", "arriving."].map((line, i) => (
            <span className="hero-line" key={line}>
              <motion.span
                initial={{ y: reduced ? 0 : "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.15,
                  delay: 0.25 + i * 0.14,
                  ease,
                }}
                className={i ? "serif-italic" : ""}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Extraordinary journeys. Effortlessly yours.
          <br />
          Private transport in Zurich and beyond.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <button className="button button-light" onClick={() => openBooking()}>
            Find your journey <ArrowUpRight size={19} />
          </button>
        </motion.div>
      </div>
      <div className="hero-caption">
        <span className="swiss-cross">+</span>
        <span>
          BASED IN ZURICH
          <br />
          <b>AT HOME ON THE ROAD.</b>
        </span>
      </div>
      <a
        href="#journey"
        className="hero-scroll"
        aria-label="Explore journey options"
      >
        <span>SCROLL TO DISCOVER</span>
        <ArrowDown size={17} />
      </a>
      <div className="hero-index">
        <span>01</span>
        <span className="index-line" />
        03
      </div>
    </section>
  );
}
