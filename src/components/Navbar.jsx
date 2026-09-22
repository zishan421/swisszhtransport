import { AnimatePresence, motion } from "motion/react";
import { Phone, ArrowUpRight, X, Menu } from "lucide-react";
import { business } from "../config.js";
import { useState, useEffect } from "react";
import Brand from "./shared/Brand.jsx";

export default function Navbar({ onBook, bookingOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (bookingOpen) setMenuOpen(false);
  }, [bookingOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);
  const openBooking = (preset = {}) => {
    setMenuOpen(false);
    onBook(preset);
  };
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#services">Our services</a>
          <a href="#vehicle">The V-Class</a>
          <a href="#experience">The experience</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav-actions">
          <a className="phone-link" href={`tel:+${business.whatsapp}`}>
            <Phone size={14} />
            <span>{business.phone}</span>
          </a>
          <button
            className="button button-dark nav-book"
            onClick={() => openBooking()}
          >
            Book your journey <ArrowUpRight size={16} />
          </button>
          <button
            className="menu-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {[
              ["Our services", "services"],
              ["The V-Class", "vehicle"],
              ["The experience", "experience"],
              ["Contact", "contact"],
            ].map(([text, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                {text}
                <ArrowUpRight size={18} />
              </a>
            ))}
            <button className="button button-red" onClick={() => openBooking()}>
              Book your journey <ArrowUpRight size={18} />
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
