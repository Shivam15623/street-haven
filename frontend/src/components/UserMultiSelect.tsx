import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAllEmployeesQuery } from "../services/EmployeeApi";
import type { Role } from "../interfaces/AuthInterfaces";

interface Option {
  value: string;
  label: string;
}

interface UserMultiSelectProps {
  value?: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  role?: Role[];
  isDisabled?: boolean;
  className?: string;
  managedBy?:boolean;
}

const UserMultiSelect = ({
  value = [],
  onChange,
  label = "Users",
  placeholder = "Select Users",
  role,
  isDisabled = false,
  className = "",
  managedBy=false
}: UserMultiSelectProps) => {
  const { data, isLoading } = useAllEmployeesQuery({
    forDropdown: true,
    managedBy,
    role,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const options: Option[] = useMemo(
    () =>
      (data?.data.employees ?? []).map((emp) => ({
        value: emp._id,
        label: `${emp.firstname} ${emp.lastname}`,
      })),
    [data],
  );

  const selectedOptions = useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  // Position the portal-rendered menu against the trigger, accounting for
  // available space below/above (so it flips up near the bottom of the modal)
  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const menuMaxHeight = 260;
    const openUpward = spaceBelow < menuMaxHeight && rect.top > spaceBelow;

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? viewportHeight - rect.top + 4 : undefined,
      maxHeight: menuMaxHeight,
      zIndex: 2000,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    // Recalculate on scroll (modal body scroll, window scroll) and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside trigger AND menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);
      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label className="form-label  mb-6">
          {label}
        </label>
      )}

      <div className="position-relative" ref={triggerRef}>
        {/* Trigger */}
        <div
          className={`form-select d-flex flex-wrap align-items-center gap-1 ${
            isDisabled ? "disabled bg-neutral-100" : "cursor-pointer"
          }`}
          style={{
            minHeight: "44px",
            height: "auto",
          }}
          onClick={() => {
            if (!isDisabled) setIsOpen((prev) => !prev);
          }}
        >
          {selectedOptions.length === 0 && (
            <span className=" text-sm">{placeholder}</span>
          )}

          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="badge bg-primary-50 text-primary-600 d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1"
              style={{ fontSize: "12px" }}
            >
              {opt.label}
              {!isDisabled && (
                <button
                  type="button"
                  className="btn-close-custom"
                  onClick={(e) => removeOption(e, opt.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    lineHeight: 1,
                    padding: 0,
                    fontSize: "14px",
                  }}
                >
                  &times;
                </button>
              )}
            </span>
          ))}

          {selectedOptions.length > 0 && !isDisabled && (
            <button
              type="button"
              onClick={clearAll}
              className="ms-auto text-neutral-400 border-0 bg-transparent"
              style={{ fontSize: "12px" }}
              title="Clear all"
            >
              &times;
            </button>
          )}
        </div>

        {/* Dropdown — rendered via portal so it isn't clipped by the
            modal body's `overflow: auto` / `maxHeight: 60vh` container */}
        {isOpen &&
          !isDisabled &&
          createPortal(
            <div
              ref={menuRef}
              className="border rounded-8 shadow-sm"
              style={{ ...menuStyle, background: "var(--street-card)" }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Sticky Search */}
              <div
                className="p-2 border-bottom bg-base-50"
                style={{ position: "sticky", top: 0, zIndex: 2 }}
              >
                <input
                  type="text"
                  autoFocus
                  className="form-control form-control-sm"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Scrollable Options */}
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {isLoading && (
                  <div className="p-2 text-sm text-neutral-500">Loading...</div>
                )}

                {!isLoading && filteredOptions.length === 0 && (
                  <div className="p-2 text-sm text-neutral-500">
                    No options found
                  </div>
                )}

                {!isLoading &&
                  filteredOptions.map((opt) => {
                    const isSelected = value.includes(opt.value);

                    return (
                      <div
                        key={opt.value}
                        className={`d-flex align-items-center gap-2 px-2 py-2 text-sm cursor-pointer ${
                          isSelected ? "bg-primary-50" : ""
                        }`}
                        onClick={() => toggleOption(opt.value)}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="form-check-input m-0"
                        />
                        <span>{opt.label}</span>
                      </div>
                    );
                  })}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};

export default UserMultiSelect;
