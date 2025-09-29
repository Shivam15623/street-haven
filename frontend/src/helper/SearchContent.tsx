import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { useSearchAllContentQuery } from "../services/searchApi";
import { useDebounce } from "../hooks/useDebounce";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
interface StatusBadgeProps {
  status: "new" | "update";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const bgClass =
    status === "new" ? "sh-badge-success-soft " : "sh-badge-warning-soft";
  return (
    <span className={`badge ${bgClass} text-xs rounded-pill `}>
      {status === "new" ? "New" : "Update"}
    </span>
  );
};
const SearchContent = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);
  const { data: results, isLoading } = useSearchAllContentQuery(debouncedQuery);
  console.log("results", results);

  const handleClear = () => setQuery("");

  return (
    <div className="position-relative search-ContentContainer w-full ">
      {/* Search bar */}
      <div
        className={`search-Content  d-flex align-items-center gap-2 ${
          debouncedQuery ? "queryborder" : ""
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
      {debouncedQuery && results?.data && (
        <div className="position-absolute search-Results top-100 left-0 w-100   shadow-none overflow-y-auto">
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
                <span
                  className="bg-danger text-white text-xxs d-flex justify-content-center align-items-center rounded-circle"
                  style={{ width: "18px", height: "18px" }}
                >
                  {results.data.events?.length}
                </span>
              </div>
              <div id="eventsContainer" className="ps-3">
                {results.data.events.map((e) => (
                  <div className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded ">
                    <div className="resultDetails ">
                      <span className="fw-medium text-md text-street-dark">
                        {e.title}
                      </span>
                      <span className="text-xs text-street-base">
                        {dayjs(e.eventDate).format("DD MMM YYYY")}
                      </span>
                      <span className="text-xs text-street-base">
                        {dayjs(e.startTime).format("hh:mm A")} -{" "}
                        {dayjs(e.endTime).format("hh:mm A")}
                      </span>
                    </div>
                    {e.status !== null && <StatusBadge status={e.status} />}
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
                <span
                  className="bg-danger text-white text-xxs d-flex justify-content-center align-items-center rounded-circle"
                  style={{ width: "18px", height: "18px" }}
                >
                  {results.data.hrUpdates?.length}
                </span>
              </div>
              <div id="hrUpdatesContainer" className="ps-3">
                {results.data.hrUpdates.map((hr) => (
                  <div
                    className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded "
                    key={hr.title}
                  >
                    <div className="resultDetails">
                      <span className="fw-medium text-md text-street-dark">
                        {hr.title}
                      </span>
                      <span className="text-xs text-street-base">
                        {dayjs(hr.createdAt).format("DD MMM YYYY")}
                      </span>
                    </div>
                    {hr.status !== null && <StatusBadge status={hr.status} />}
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
                <span
                  className="bg-danger text-white text-xxs d-flex justify-content-center align-items-center rounded-circle"
                  style={{ width: "18px", height: "18px" }}
                >
                  {results.data.meetingMinutes?.length}
                </span>
              </div>
              <div id="meetingMinutesContainer" className="ps-3">
                {results.data.meetingMinutes.map((tm) => (
                  <div className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded ">
                    <div className="resultDetails">
                      <span className=" text-md fw-medium text-street-dark">
                        {tm.title}
                      </span>
                      <span className="text-xs text-street-base">
                        {dayjs(tm.meetingDate).format("DD MMM YYYY")}
                      </span>
                    </div>
                    {tm.status !== null && <StatusBadge status={tm.status} />}
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
                <span
                  className="bg-danger text-white text-xxs d-flex justify-content-center align-items-center rounded-circle"
                  style={{ width: "18px", height: "18px" }}
                >
                  {results.data.programManuals?.length}
                </span>
              </div>
              <div id="programManualsContainer" className="ps-3">
                {results.data.programManuals.map((pm) => (
                  <div className="py-2 px-2 d-flex justify-content-between align-items-center hover-item cursor-pointer rounded ">
                    <div className="resultDetails">
                      <span className="fw-medium text-md text-street-dark">
                        {pm.title}
                      </span>
                      <span className="text-xs text-street-base">
                        {pm.description}
                      </span>
                      <span className="text-xs text-street-base">
                        {dayjs(pm.createdAt).format("DD MMM YYYY")}
                      </span>
                    </div>
                    {pm.status !== null && <StatusBadge status={pm.status} />}
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
