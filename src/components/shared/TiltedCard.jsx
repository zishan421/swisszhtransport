import { useRef } from "react";

export default function TiltedCard({
  children,
  rotateAmplitude = 8,
  scaleOnHover = 1.02,
  className = "",
}) {
  const innerRef = useRef(null);

  const handleMove = (event) => {
    const element = innerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty("--tilt-x", `${x * rotateAmplitude}deg`);
    element.style.setProperty("--tilt-y", `${y * -rotateAmplitude}deg`);
    element.style.setProperty("--tilt-scale", scaleOnHover);
    element.style.setProperty("--glare-x", `${(x + 0.5) * 100}%`);
    element.style.setProperty("--glare-y", `${(y + 0.5) * 100}%`);
  };

  const handleLeave = () => {
    const element = innerRef.current;
    if (!element) return;
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--tilt-scale", "1");
  };

  return (
    <div className={`tilted-card ${className}`.trim()} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div ref={innerRef} className="tilted-card-inner">
        {children}
      </div>
    </div>
  );
}
