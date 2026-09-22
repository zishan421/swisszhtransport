import { useId, useState } from "react";
import { MapPin, Loader } from "lucide-react";
import { normalizePredictions } from "../../lib/locationSuggestions.js";

export default function LocationInput({
  label,
  value,
  onChange,
  predictions,
  onSelect,
  loading,
  error,
  empty,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const safePredictions = normalizePredictions(predictions);
  const listId = useId();
  const choose = (prediction) => {
    onSelect(prediction.description, prediction);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <label className="location-field">
      <MapPin size={18} />
      <span>
        {label}
        <input
          aria-label={label}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && safePredictions.length > 0}
          aria-controls={listId}
          aria-activedescendant={
            open && safePredictions[activeIndex]
              ? `${listId}-${activeIndex}`
              : undefined
          }
          placeholder="Type to search…"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
              return;
            }
            if (!safePredictions.length) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex(
                (index) =>
                  (index +
                    (event.key === "ArrowDown" ? 1 : safePredictions.length - 1) +
                    safePredictions.length) %
                  safePredictions.length,
              );
            }
            if (event.key === "Enter" && open && safePredictions[activeIndex]) {
              event.preventDefault();
              choose(safePredictions[activeIndex]);
            }
          }}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 200)}
          maxLength={200}
          autoComplete="off"
          required={required}
        />
        {open && safePredictions.length > 0 && (
          <div className="location-dropdown" role="listbox" id={listId}>
            {safePredictions.map((p, index) => (
              <button
                key={p.place_id}
                type="button"
                className="location-option"
                id={`${listId}-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(p)}
              >
                <span className="location-pin">◉</span>
                <span>
                  <strong>
                    {p.structured_formatting?.main_text ?? p.description}
                  </strong>
                  {p.structured_formatting?.secondary_text && (
                    <span className="location-secondary">
                      {" "}
                      · {p.structured_formatting.secondary_text}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
        {open && loading && safePredictions.length === 0 && (
          <div className="location-dropdown">
            <span className="location-loading">
              <Loader size={14} className="spin" /> Searching…
            </span>
          </div>
        )}
        {open && empty && (
          <div className="location-dropdown">
            <span className="location-loading" role="status">
              No places found. Try a city, street or airport name.
            </span>
          </div>
        )}
        {open &&
          value.trim().length >= 2 &&
          error &&
          safePredictions.length === 0 && (
            <div className="location-dropdown">
              <span className="location-loading" role="status">
                {error}
              </span>
            </div>
          )}
      </span>
    </label>
  );
}
