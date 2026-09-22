import { motion } from "motion/react";
import { useRef, useState } from "react";

export default function RubberSegment({
  items = [],
  value,
  defaultValue,
  onChange,
  trackColor = "rgba(231, 234, 229, 0.72)",
  thumbColor = "rgba(255, 255, 255, 0.84)",
  textColor = "#6f766f",
  activeTextColor = "#222a25",
  size = "md",
  radius = 10,
  inset = 3,
  equalSlots = true,
  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,
  draggable = true,
  disabled = false,
  className = "",
}) {
  const trackRef = useRef(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]);
  const [dragging, setDragging] = useState(false);
  const selectedValue = value ?? internalValue;
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => (typeof item === "string" ? item : item.value) === selectedValue),
  );

  const getItemValue = (item) => (typeof item === "string" ? item : item.value);
  const getItemLabel = (item) => (typeof item === "string" ? item : item.label);

  const choose = (item, index) => {
    const nextValue = getItemValue(item);
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue, index);
  };

  const chooseFromPointer = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !items.length) return;
    const ratio = Math.min(0.999, Math.max(0, (clientX - rect.left) / rect.width));
    const index = Math.min(items.length - 1, Math.floor(ratio * items.length));
    choose(items[index], index);
  };

  const handlePointerDown = (event) => {
    if (!draggable || disabled) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    chooseFromPointer(event.clientX);
  };

  const handlePointerMove = (event) => {
    if (dragging) chooseFromPointer(event.clientX);
  };

  const handlePointerUp = (event) => {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
  };

  return (
    <div
      className={`rubber-segment rubber-segment-${size} ${className}`.trim()}
      style={{
        "--rubber-track": trackColor,
        "--rubber-thumb": thumbColor,
        "--rubber-text": textColor,
        "--rubber-active-text": activeTextColor,
        "--rubber-radius": `${radius}px`,
        "--rubber-inset": `${inset}px`,
        "--rubber-stretch": `${stretch}%`,
        "--rubber-count": items.length,
      }}
      role="radiogroup"
      aria-disabled={disabled}
    >
      <div
        ref={trackRef}
        className={`rubber-segment-track${dragging ? " is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.span
          className="rubber-segment-thumb"
          layout
          animate={{
            scaleX: 1 + Math.min(squash, 8) / 100,
            scaleY: 1 - Math.min(squash, 8) / 240,
          }}
          transition={{
            type: "spring",
            stiffness: 390 * speed,
            damping: 25,
            mass: 0.65,
            duration: glide / 1000,
          }}
          style={{ gridColumn: `${selectedIndex + 1}` }}
          aria-hidden="true"
        />
        {items.map((item, index) => {
          const itemValue = getItemValue(item);
          const selected = itemValue === selectedValue;
          return (
            <motion.button
              key={itemValue}
              type="button"
              className={`rubber-segment-option${selected ? " is-active" : ""}`}
              role="radio"
              aria-checked={selected}
              style={{ gridColumn: `${index + 1}` }}
              disabled={disabled}
              whileTap={draggable ? { scale: 0.96 } : undefined}
              transition={{ duration: 0.18 }}
              onClick={() => choose(item, index)}
            >
              {getItemLabel(item)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
