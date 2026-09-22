import { useRef } from "react";
import "./SpotlightCard.css";

export default function SpotlightCard({
  as: Component = "div",
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.65)",
  style,
  ...props
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    // Map the tilted card's screen coordinates back to its local dimensions.
    const x = ((event.clientX - rect.left) / rect.width) * card.offsetWidth;
    const y = ((event.clientY - rect.top) / rect.height) * card.offsetHeight;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <Component
      {...props}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`.trim()}
      style={{ ...style, "--spotlight-color": spotlightColor }}
    >
      <span className="card-spotlight__surface" aria-hidden="true" />
      {children}
    </Component>
  );
}
