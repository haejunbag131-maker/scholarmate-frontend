import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

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
    <div className="relative min-w-0 flex-1 max-md:w-full" data-user-info-select ref={rootRef}>
      <button
        type="button"
        className={[
          "flex min-h-[46px] w-full items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 pr-[52px] text-left text-sm font-medium text-slate-600 transition-colors focus:border-[var(--color-primary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 max-md:rounded-md max-md:px-3 max-md:py-2.5 max-md:pr-12 max-[480px]:py-[11px] max-[480px]:pr-[46px] max-[480px]:text-[13px]",
          !selectedOption ? "text-gray-500" : "",
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
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {selectedOption?.label ?? placeholder}
        </span>
        <FaChevronDown
          className="pointer-events-none absolute right-[18px] h-3.5 w-3.5 shrink-0 text-gray-900 max-md:right-4 max-[480px]:right-3.5"
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={selectId}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 m-0 max-h-44 list-none overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg border border-gray-300 bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.16)] max-[480px]:max-h-40"
          role="listbox"
        >
          <li>
            <button
              type="button"
              className={[
                "block min-h-9 w-full rounded-md border-0 bg-transparent px-2.5 py-2 text-left text-sm font-medium leading-snug text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:outline-none",
                !value ? "bg-gray-100" : "",
              ]
                .filter(Boolean)
                .join(" ")}
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
                className={[
                  "block min-h-9 w-full rounded-md border-0 bg-transparent px-2.5 py-2 text-left text-sm font-medium leading-snug text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:outline-none",
                  option.value === value ? "bg-gray-100" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
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
