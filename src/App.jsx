import { MotionConfig } from "motion/react";
import { useState, useCallback, useEffect } from "react";
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
import PageSkeleton from "./components/PageSkeleton.jsx";

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initial, setInitial] = useState({});
  const [skeletonVisible, setSkeletonVisible] = useState(true);
  const [skeletonExiting, setSkeletonExiting] = useState(false);
  const openBooking = useCallback((preset = {}) => {
    setInitial(preset);
    setBookingOpen(true);
  }, []);
  useEffect(() => {
    let mounted = true;
    const startedAt = performance.now();
    let hideTimer;
    let removeTimer;
    const finishLoading = () => {
      const minimumVisibleTime = 420;
      const remaining = Math.max(0, minimumVisibleTime - (performance.now() - startedAt));
      hideTimer = window.setTimeout(() => {
        if (!mounted) return;
        setSkeletonExiting(true);
        removeTimer = window.setTimeout(() => {
          if (mounted) setSkeletonVisible(false);
        }, 240);
      }, remaining);
    };

    if (document.readyState === "complete") finishLoading();
    else window.addEventListener("load", finishLoading, { once: true });

    return () => {
      mounted = false;
      window.removeEventListener("load", finishLoading);
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);
  useBookingWebMCP(openBooking);
  return (
    <MotionConfig reducedMotion="user">
      {skeletonVisible && <PageSkeleton exiting={skeletonExiting} />}
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
