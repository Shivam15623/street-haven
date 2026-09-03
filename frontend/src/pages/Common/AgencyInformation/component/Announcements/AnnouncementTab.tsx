import { useEffect, useState } from "react";
import ActionsAnnouncement from "./ActionsAnnouncement";

import { useLazyViewAnnouncementsQuery } from "../../../../../services/AnnouncementApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import AnnouncementCard from "./AnnouncementCard";
import StreetPaggination from "../../../../../components/child/StreetPaggination";
import useHasPermission from "../../../../../hooks/Auth";
import { useDebounce } from "../../../../../hooks/useDebounce";
import type { AgentTabProp } from "../Agreement/CollectiveAgreementTab";

import { useScrollToItemFromUrl } from "../../../../../hooks/useScrollToItemFromUrl";

const AnnouncementTab: React.FC<AgentTabProp> = ({ isActive }) => {
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;
  const debouncedsearch = useDebounce(search, 1000);
  const [getAnnouncements, { data, isLoading, isError }] =
    useLazyViewAnnouncementsQuery();
  useEffect(() => {
    if (isActive) {
      getAnnouncements({
        limit,
        page,
        keyword: debouncedsearch,
      });
    }
  }, [isActive, limit, page, debouncedsearch, getAnnouncements]);
  const { hasPermission } = useHasPermission();
  const totalPages = data ? data.data.paggination.totalPages : 0;
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useScrollToItemFromUrl({
    enabled: isActive && !!data?.data?.announcements,
  });

  return (
    <div className="d-flex flex-column gap-24">
      {/* Add Button */}
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">Announcements</h2>{" "}
        {hasPermission({ action: "create_announcement" }) && (
          <button
            className="btn btn-street-primary text-sm d-flex flex-row align-items-center justify-content-center radius-12 "
            style={{ minWidth: "43px", minHeight: "40px" }}
            onClick={() => setOpen(true)}
          >
            Add Announcement
          </button>
        )}
      </div>
      {/* Search box */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Documents"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <ActionsAnnouncement show={open} onHide={() => setOpen(false)} />

      {isLoading &&
        Array.from({ length: 5 }).map((_p, idx) => (
          <div className="card" key={idx}>
            <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-14 radius-12 placeholder-glow">
              <div className="d-flex flex-row justify-content-between">
                {/* Content */}
                <div className="d-flex flex-column flex-grow-1 gap-10">
                  {/* Title */}
                  <span className="placeholder col-6 placeholder-sm" />

                  {/* Description */}
                  <span className="placeholder col-10 placeholder-xs" />
                  <span className="placeholder col-9 placeholder-xs" />
                  <span className="placeholder col-7 placeholder-xs" />

                  {/* Meta */}
                  <div className="d-flex flex-row gap-24 w-50">
                    <span className="placeholder col-3 placeholder-xs" />
                    <span className="placeholder col-4 placeholder-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      {isError && <p>Something went wrong</p>}
      {data?.data.announcements?.length ? (
        data?.data.announcements.map((announcement) => (
          <AnnouncementCard
            announcement={announcement}
            key={announcement._id}
          />
        ))
      ) : (
        <>No Data Found</>
      )}
      {totalPages > 1 && (
        <StreetPaggination
          page={page}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AnnouncementTab;
