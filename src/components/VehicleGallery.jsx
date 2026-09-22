import { useState } from "react";
import { motion } from "motion/react";

const photos = [
  {
    src: "/images/M2.png",
    label: "Exterior",
    alt: "Premium black Mercedes-Benz V-Class at a luxury airport entrance",
    caption: "A REFINED PRESENCE.",
  },
  {
    src: "/images/M3.png",
    label: "Interior",
    alt: "Luxury Mercedes-Benz V-Class interior cabin with cream leather seating",
    caption: "YOUR SPACE TO UNWIND.",
  },
];

export default function VehicleGallery() {
  const [active, setActive] = useState(0);
  const photo = photos[active];

  return (
    <>
      <div className={`vehicle-photo vehicle-gallery-photo ${active === 1 ? "is-interior" : ""}`}>
        <motion.img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          loading="lazy"
          width="1600"
          height="1067"
        />
        <span className="photo-label">{photo.caption}</span>
        <span className="vehicle-gallery-count" aria-hidden="true">0{active + 1} / 02</span>
      </div>
      <div className="vehicle-gallery-options" role="group" aria-label="Choose a vehicle photo">
        {photos.map((item, index) => (
          <button
            key={item.src}
            type="button"
            aria-pressed={active === index}
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
          >
            <img src={item.src} alt="" width="84" height="56" loading="lazy" />
            <span>{item.label}</span>
            <span className="gallery-option-number">0{index + 1}</span>
          </button>
        ))}
      </div>
      <p className="vehicle-imagery-note">Model imagery. Interior trim and seating may vary.</p>
    </>
  );
}
