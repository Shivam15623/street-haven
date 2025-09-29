import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useRef, useState } from "react";
import { useSearchAllContentQuery } from "../services/searchApi";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../redux/AuthSlice";


const SearchContent = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const { user } = useSelector(selectAuth);
  const debouncedQuery = useDebounce<string>(query, 500);
  const { data: results, isLoading } = useSearchAllContentQuery(debouncedQuery);
  console.log("results", results);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (debouncedQuery) setShowDropdown(true);
    else setShowDropdown(false);
  }, [debouncedQuery]);
  const handleClear = () => setQuery("");

  return (
    <div className="position-relative search-ContentContainer w-full ">
      {/* Search bar */}
      <div
        className={`search-Content  d-flex align-items-center gap-2 ${
          showDropdown ? "queryborder" : ""
        }`}
      >
        <Icon icon="ion:search-outline" className="contentIcon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search here..."
        />
        {query && (
          <Icon
            icon="ion:close-circle"
            className="contentIcon cursor-pointer"
            onClick={handleClear}
          />
        )}
      </div>
      {showDropdown && results?.data && (
        <div
          ref={containerRef}
          className="position-absolute search-Results top-100 left-0 w-100   shadow-none overflow-y-auto"
        >
          {/* Loading state */}
          {isLoading && (
            <div className="d-flex justify-content-center align-items-center py-4">
              <div className="spinner-border text-street-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {/* Events */}
          {results.data.events?.length > 0 && (
            <div className=" d-flex flex-column gap-2 py-3 border-bottom border-gray-100">
              <div className="fw-semibold d-flex flex-row justify-content-between align-items-center text-street-primary mb-2">
                <div className="d-flex text-lg align-items-center gap-2">
                  <Icon
                    icon="ion:calendar-outline"
                    className="text-street-primary"
                  />
                  <span>Events</span>
                </div>
              </div>
              <div id="eventsContainer" className="ps-3">
                {results.data.events.map((e) => (
                  <div
                    className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded "
                    onClick={() =>
                      navigate(`/${user?.role}/events?slug=${e.slug}`)
                    }
                  >
                    <div className="resultDetails ">
                      <span className="fw-medium text-sm text-street-dark">
                        {e.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* HR Updates */}
          {results.data.hrUpdates?.length > 0 && (
            <div className=" d-flex flex-column gap-2 py-3 border-bottom border-gray-100">
              <div className="fw-semibold d-flex flex-row justify-content-between align-items-center text-street-primary mb-2">
                <div className="d-flex text-lg align-items-center gap-2">
                  <Icon
                    icon="ion:person-outline"
                    className="text-street-primary"
                  />
                  <span>HR Updates</span>
                </div>
              </div>
              <div id="hrUpdatesContainer" className="ps-3">
                {results.data.hrUpdates.map((hr) => (
                  <div
                    className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded "
                    key={hr.title}
                    onClick={() =>
                      navigate(
                        `/${user?.role}/agency_info?tab=hr_updates&slug=${hr.slug}`
                      )
                    }
                  >
                    <div className="resultDetails">
                      <span className="fw-medium text-sm text-street-dark">
                        {hr.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Meeting Minutes */}
          {results.data.meetingMinutes?.length > 0 && (
            <div className=" d-flex flex-column gap-2 py-3 border-bottom border-gray-100">
              <div className="fw-semibold d-flex flex-row justify-content-between align-items-center text-street-primary mb-2">
                <div className="d-flex text-lg align-items-center gap-2">
                  <Icon
                    icon="ion:document-text-outline"
                    className="text-street-primary"
                  />
                  <span>Meeting Minutes</span>
                </div>
              </div>
              <div id="meetingMinutesContainer" className="ps-3">
                {results.data.meetingMinutes.map((tm) => (
                  <div
                    className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded "
                    onClick={() =>
                      navigate(
                        `/${user?.role}/agency_info?tab=townhall_minutes&slug=${tm.slug}`
                      )
                    }
                  >
                    <div className="resultDetails">
                      <span className=" text-sm fw-medium text-street-dark">
                        {tm.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Program Manuals */}
          {results.data.programManuals?.length > 0 && (
            <div className=" d-flex flex-column gap-2 py-3">
              <div className="fw-semibold d-flex flex-row justify-content-between align-items-center text-street-primary mb-2">
                <div className="d-flex text-lg align-items-center gap-2">
                  <Icon
                    icon="ion:book-outline"
                    className="text-street-primary"
                  />
                  <span>Program Manuals</span>
                </div>
              </div>
              <div id="programManualsContainer" className="ps-3">
                {results.data.programManuals.map((pm) => (
                  <div
                    className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded "
                    onClick={() =>
                      navigate(
                        `/${user?.role}/programs&manuals?slug=${pm.slug}`
                      )
                    }
                  >
                    <div className="resultDetails">
                      <span className="fw-medium text-sm text-street-dark">
                        {pm.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Empty state */}
          {results.data.isEmpty && (
            <div className="px-4 py-2 text-gray-500 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchContent;
