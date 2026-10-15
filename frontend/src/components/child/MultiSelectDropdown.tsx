// components/child/MultiSelectDropdown.tsx
import React, { type FC } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  allLabel: string;        // e.g. "All Locations"
  pluralLabel: string;     // e.g. "locations"
  loading?: boolean;
  showSelectAll?: boolean;
}

const MultiSelectDropdown: FC<Props> = ({
  options,
  selected,
  onChange,
  allLabel,
  pluralLabel,
  loading = false,
  showSelectAll = true,
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );

  const allSelected =
    options.length > 0 && options.every((o) => selected.includes(o.value));

  const label = !selected.length
    ? allLabel
    : selected.length === 1
      ? (options.find((o) => o.value === selected[0])?.label ?? "1 selected")
      : `${selected.length} ${pluralLabel} selected`;

  return (
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="form-select text-sm text-start text-truncate"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
      </button>

      {open && (
        <div
          className="position-absolute w-100 bg-white border radius-8 shadow-4 mt-4 py-8"
          style={{ zIndex: 1050, maxHeight: 260, overflowY: "auto" }}
          role="listbox"
          aria-multiselectable="true"
        >
          {loading ? (
            <div className="px-12 py-6 text-sm text-neutral-500">Loading...</div>
          ) : options.length === 0 ? (
            <div className="px-12 py-6 text-sm text-neutral-500">
              No options available
            </div>
          ) : (
            <>
              {showSelectAll && (
                <label className="d-flex align-items-center gap-8 px-12 py-6 text-sm fw-medium cursor-pointer border-bottom">
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    checked={allSelected}
                    onChange={() =>
                      onChange(allSelected ? [] : options.map((o) => o.value))
                    }
                  />
                  Select all
                </label>
              )}
              {options.map((o) => (
                <label
                  key={o.value}
                  className="d-flex align-items-center gap-8 px-12 py-6 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    checked={selected.includes(o.value)}
                    onChange={() => toggle(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;