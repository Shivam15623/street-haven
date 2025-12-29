import { useState } from "react";
import ActionsAnnouncement from "./ActionsAnnouncement";

import { useViewAnnouncementsQuery } from "../../../../services/AnnouncementApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import AnnouncementCard from "./AnnouncementCard";
import StreetPaggination from "../../../../components/child/StreetPaggination";
import useHasPermission from "../../../../hooks/Auth";
import { useDebounce } from "../../../../hooks/useDebounce";

const AnnouncementTab = () => {
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;
  const debouncedsearch = useDebounce(search, 1000);
  const { data, isLoading, isError } = useViewAnnouncementsQuery({
    limit,
    page,
    keyword: debouncedsearch,
  });
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

      {isLoading && <p>Loading...</p>}
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
