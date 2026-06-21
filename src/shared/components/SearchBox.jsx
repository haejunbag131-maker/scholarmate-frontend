import { useEffect, useRef } from "react";

export default function SearchBox({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "검색...",
  debounceMs = 300,
  autoSearch = true,
  className = "",
  inputClassName = "",
  ariaLabel = "검색",
}) {
  const classes = ["shared-search-box", className].filter(Boolean).join(" ");
  const inputClasses = ["shared-search-input", inputClassName].filter(Boolean).join(" ");
  const hasMountedRef = useRef(false);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (!autoSearch || !onSearchRef.current) return undefined;
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onSearchRef.current?.(value);
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoSearch, debounceMs, value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(value);
  };

  return (
    <form className={classes} role="search" aria-label={ariaLabel} onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            if (onClear) {
              onClear();
              return;
            }
            onChange?.("");
            onSearch?.("");
          }
        }}
        className={inputClasses}
      />
    </form>
  );
}
