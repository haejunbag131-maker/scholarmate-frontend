import { useEffect, useId, useMemo, useRef, useState } from "react";

const normalizeOptions = (options) =>
  options.map((option) =>
    typeof option === "object"
      ? option
      : {
          value: option,
          label: option,
        }
  );

export default function UserInfoSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selectId = useId();
  const rootRef = useRef(null);
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="user-info-select" data-user-info-select ref={rootRef}>
      <button
        type="button"
        className={[
          "form-select user-info-select-trigger",
          !selectedOption ? "is-placeholder" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={selectId}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
      </button>

      {open && (
        <ul id={selectId} className="user-info-select-menu" role="listbox">
          <li>
            <button
              type="button"
              className={!value ? "is-selected" : ""}
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </button>
          </li>
          {normalizedOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={option.value === value ? "is-selected" : ""}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
