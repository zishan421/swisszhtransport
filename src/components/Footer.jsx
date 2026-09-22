import { ArrowUpRight } from "lucide-react";
import Brand from "./shared/Brand.jsx";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <Brand footer />
        <p>
          Swiss precision.
          <br />A personal touch.
        </p>
        <nav aria-label="Footer navigation">
          <a href="#services">Our services</a>
          <a href="#vehicle">The V-Class</a>
          <a href="#contact">Get in touch</a>
        </nav>
        <a className="back-top" href="#home">
          BACK TO TOP <ArrowUpRight size={17} />
        </a>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Swiss ZH Transport. All rights reserved.
          <a className="credits-link" href="/image-credits.html">
            Image credits
          </a>
        </span>
        <span>BASED IN ZURICH. MADE FOR YOUR JOURNEY.</span>
      </div>
    </footer>
  );
}
