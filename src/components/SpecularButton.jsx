import { useState } from "react";
import "./SpecularButton.css";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function SpecularButton({
  as: Component = "button",
  size = "md",
  radius = 18,
  tint = "#ffffff",
  tintOpacity = 0,
  blur = 0,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  onClick,
  children,
  className = "",
  style,
  type = "button",
  ...props
}) {
  const [pointer, setPointer] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = (event) => {
    if (!followMouse) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    const distance = Math.hypot(x - 50, y - 50);
    const maxDistance = Math.max(1, proximity / Math.max(bounds.width, bounds.height) * 100);

    setPointer({
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
      opacity: clamp(1 - distance / maxDistance, 0.12, 1) * intensity,
    });
  };

  const handlePointerLeave = () => {
    if (followMouse) setPointer({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <Component
      {...props}
      type={Component === "button" ? type : undefined}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`button specular-button specular-button--${size} ${className}`.trim()}
      data-auto-animate={autoAnimate ? "true" : undefined}
      style={{
        ...style,
        "--specular-radius": `${radius}px`,
        "--specular-tint": tint,
        "--specular-tint-opacity": tintOpacity,
        "--specular-blur": `${blur}px`,
        "--specular-text": textColor,
        "--specular-line": lineColor,
        "--specular-base": baseColor,
        "--specular-intensity": intensity,
        "--specular-shine-size": `${shineSize}%`,
        "--specular-shine-fade": `${shineFade}%`,
        "--specular-thickness": `${thickness}px`,
        "--specular-speed": `${Math.max(0.2, speed)}s`,
        "--specular-x": `${pointer.x}%`,
        "--specular-y": `${pointer.y}%`,
        "--specular-opacity": pointer.opacity,
      }}
    >
      <span className="specular-button__surface" aria-hidden="true" />
      <span className="specular-button__content">{children}</span>
    </Component>
  );
}
