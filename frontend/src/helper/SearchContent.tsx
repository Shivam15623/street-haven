import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useRef, useState } from "react";
import { useSearchAllContentQuery } from "../services/searchApi";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";

// ---------- Types ----------
interface SearchProps {
  mobileMode: boolean;
  onclose: () => void;
}

interface SearchItem {
  slug: string;
  title: string;
}

// ---------- Reusable Group Component ----------
const ResultGroup = ({
  title,
  icon,
  items,
  onClick,
}: {
  title: string;
  icon: string;
  items: SearchItem[];
  onClick: (slug: string) => void;
}) => {
  if (!items?.length) return null;

  return (
    <div className="d-flex flex-column gap-2 py-2 py-sm-3 border-bottom border-gray-100">
      <div className="fw-semibold d-flex align-items-center gap-2 text-street-primary mb-2">
        <Icon icon={icon} className="text-street-primary" />
        <span className="text-sm sm:text-md">{title}</span>
      </div>

      <div className="ps-2 ps-sm-3">
        {items.map((item) => (
          <div
            key={item.slug}
            className=" py-1 px-1 py-sm-2 px-sm-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded"
            onClick={() => onClick(item.slug)}
          >
            <span className="fw-medium text-xs sm:text-sm text-street-dark">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Main Component ----------
const SearchContent: React.FC<SearchProps> = ({ mobileMode, onclose }) => {
  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce<string>(query, 1000);

  const { data: results, isLoading } = useSearchAllContentQuery(
    debouncedQuery,
    { skip: debouncedQuery === "" || !debouncedQuery }
  );

  // ---------- Close dropdown on outside click ----------
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---------- Toggle dropdown on search ----------
  useEffect(() => {
    setShowDropdown(!!debouncedQuery);
  }, [debouncedQuery]);

  // ---------- Clear search ----------
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (query === "") {
      if (mobileMode) {
        onclose();
      }
    } else {
      setQuery("");
      setShowDropdown(false);

      inputRef.current?.focus();
    }
  };

  // --- Navigate handlers ---
  const goToEvent = (slug: string) => navigate(`/events?slug=${slug}`);

  const goToHR = (slug: string) =>
    navigate(`/agency_info?tab=hr_updates&slug=${slug}`);

  const goToMinutes = (slug: string) =>
    navigate(`/agency_info?tab=event_minutes&slug=${slug}`);

  const goToManual = (slug: string) =>
    navigate(`/programs&manuals?slug=${slug}`);

  return (
    <div
      ref={containerRef}
      className="position-relative search-ContentContainer w-full"
    >
      {/* Search Bar */}
      <div
        className={`search-Content d-flex align-items-center gap-2 ${
          showDropdown ? "queryborder" : ""
        }`}
      >
        <Icon icon="ion:search-outline" className="contentIcon" />

        <input
          type="text"
          value={query}
          ref={inputRef}
          className="flex-grow-1"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search here..."
        />

        {(mobileMode || query) && (
          <Icon
            icon="ion:close-circle"
            className="contentIcon cursor-pointer"
            onClick={handleClear}
          />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && results && (
        <div className="position-absolute search-Results top-100 left-0 w-100 shadow-none overflow-y-auto">
          {isLoading && (
            <div className="d-flex justify-content-center align-items-center py-4">
              <div className="spinner-border text-street-primary" />
            </div>
          )}

          {!isLoading && (
            <>
              <ResultGroup
                title="Events"
                icon="ion:calendar-outline"
                items={results.data.events}
                onClick={goToEvent}
              />

              <ResultGroup
                title="HR Updates"
                icon="ion:person-outline"
                items={results.data.hrUpdates}
                onClick={goToHR}
              />

              <ResultGroup
                title="Meeting Minutes"
                icon="ion:document-text-outline"
                items={results.data.meetingMinutes}
                onClick={goToMinutes}
              />

              <ResultGroup
                title="Program Manuals"
                icon="ion:book-outline"
                items={results.data.programManuals}
                onClick={goToManual}
              />

              {results.data.isEmpty && (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No results found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchContent;
