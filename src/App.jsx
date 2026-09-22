import { MotionConfig } from "motion/react";
import { useState, useCallback } from "react";
import useBookingWebMCP from "./hooks/useBookingWebMCP.js";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Navbar from "./components/Navbar.jsx";
import Banner from "./components/Banner.jsx";
import JourneyPlanner from "./components/JourneyPlanner.jsx";
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import Vehicle from "./components/Vehicle.jsx";
import Destinations from "./components/Destinations.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";
import FAQ from "./components/FAQ.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import BookingDialog from "./components/BookingDialog.jsx";

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initial, setInitial] = useState({});
  const openBooking = useCallback((preset = {}) => {
    setInitial(preset);
    setBookingOpen(true);
  }, []);
  useBookingWebMCP(openBooking);
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar onBook={openBooking} bookingOpen={bookingOpen} />
      <main id="main">
        <Banner openBooking={openBooking} />
        <JourneyPlanner openBooking={openBooking} />
        <About />
        <Services openBooking={openBooking} />
        <Vehicle openBooking={openBooking} />
        <Destinations openBooking={openBooking} />
        <WhyChooseUs />
        <FAQ />
        <Contact openBooking={openBooking} />
      </main>
      <Footer />
      <WhatsAppButton />
      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initial={initial}
      />
    </MotionConfig>
  );
}
