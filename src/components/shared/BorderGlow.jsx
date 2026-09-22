import { useRef } from "react";

export default function BorderGlow({
  children,
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#120F17",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  className = "",
}) {
  const ref = useRef(null);

  const setGlowPosition = (event) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const distanceToEdge = Math.min(x, y, rect.width - x, rect.height - y);
    const edgeStrength = Math.max(0, Math.min(1, 1 - distanceToEdge / edgeSensitivity));
    const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI) + coneSpread;
    element.style.setProperty("--border-glow-x", `${x}px`);
    element.style.setProperty("--border-glow-y", `${y}px`);
    element.style.setProperty("--border-glow-alpha", `${edgeStrength * glowIntensity}`);
    element.style.setProperty("--border-glow-angle", `${angle}deg`);
  };

  const clearGlow = () => {
    ref.current?.style.setProperty("--border-glow-alpha", "0");
  };

  return (
    <span
      ref={ref}
      className={`border-glow ${animated ? "border-glow-animated" : ""} ${className}`.trim()}
      style={{
        "--border-glow-color": glowColor,
        "--border-glow-background": backgroundColor,
        "--border-glow-radius": `${borderRadius}px`,
        "--border-glow-radius-size": `${glowRadius}px`,
        "--border-glow-spread": `${coneSpread}deg`,
        "--border-glow-colors": colors.join(", "),
      }}
      onMouseMove={setGlowPosition}
      onMouseLeave={clearGlow}
    >
      <span className="border-glow-content">{children}</span>
    </span>
  );
}
