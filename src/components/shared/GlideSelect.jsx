import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export default function GlideSelect({
  options = [],
  value,
  defaultValue,
  onChange,
  ariaLabel = "Select an option",
  showTags = false,
  accentColor = "#f5f5f5",
  surfaceColor = "#27272a",
  highlightColor = "#3f3f46",
  textColor = "#f5f5f5",
  size = "md",
  radius = 10,
  menuWidth = 176,
  placement = "bottom",
  align = "left",
  variant = "dark",
  popDuration = 180,
  glideDuration = 220,
  disabled = false,
}) {
  const rootRef = useRef(null);
  const generatedId = useId();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue) ?? options[0];

  useEffect(() => {
    const closeOnOutsidePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const choose = (option) => {
    if (value === undefined) setInternalValue(option.value);
    onChange?.(option.value, option);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`glide-select glide-select-${size} glide-select-${placement} glide-select-align-${align} glide-select-${variant}`}
      style={{
        "--glide-accent": accentColor,
        "--glide-surface": surfaceColor,
        "--glide-highlight": highlightColor,
        "--glide-text": textColor,
        "--glide-radius": `${radius}px`,
        "--glide-menu-width": `${menuWidth}px`,
      }}
    >
      <button
        type="button"
        className="glide-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={generatedId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span className="glide-select-value">{selected?.label ?? "Select"}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            id={generatedId}
            className="glide-select-menu"
            role="listbox"
            initial={{ opacity: 0, y: placement === "top" ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "top" ? 6 : -6, scale: 0.98 }}
            transition={{ duration: popDuration / 1000, ease: [0.22, 1, 0.36, 1] }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === selected?.value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`glide-select-option${isSelected ? " is-selected" : ""}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: glideDuration / 1000, delay: index * 0.025 }}
                  whileHover={{ x: 3, backgroundColor: highlightColor }}
                  onClick={() => choose(option)}
                >
                  <span className="glide-select-option-label">{option.label}</span>
                  {showTags && option.tag && (
                    <span className="glide-select-option-tag">{option.tag}</span>
                  )}
                  {isSelected && <Check size={14} aria-hidden="true" />}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
