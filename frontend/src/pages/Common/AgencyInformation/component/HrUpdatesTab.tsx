import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import HRUpdateCard from "./HRUpdateCard";
import { useViewhrUpdatesQuery } from "../../../../services/hrUpdatesApi";
import ActionsHrUpdates from "./ActionsHrUpdates";
import StreetPaggination from "../../../../components/child/StreetPaggination";
import useHasPermission from "../../../../hooks/Auth";
import  { useDebounce } from "../../../../hooks/useDebounce";

const HrUpdatesTab = () => {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const  debouncedsearch=useDebounce(search,1000)
  const [page, setPage] = useState(1);

  // Get slug from URL params
  const slug = searchParams.get("slug") ?? "";

  // Call query, include slug
  
  const { data, isLoading, isError } = useViewhrUpdatesQuery({
    page: page,
    limit: 10,
    search:debouncedsearch,
    slug,
    sortBy: "createdAt",
    order: "desc",
  });
  const totalPages = data ? data.data.paggination.totalPages : 0;
  const { hasPermission } = useHasPermission();
  // When user types in search, remove slug and tab from URL
  const handleSearchChange = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.delete("slug"); // remove slug
      params.delete("tab"); // remove tab
    }
    setSearchParams(params);
  };
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="d-flex flex-column gap-24">
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">HR updates</h2>
        {hasPermission({ action: "create_hr_update" }) && (
          <button
            className="btn btn-street-primary text-sm d-flex  flex-row align-items-center justify-content-center radius-12 "
            style={{ minWidth: "43px", minHeight: "40px" }}
            onClick={() => setShowModal(true)}
          >
            Add New Update
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

      {<ActionsHrUpdates show={showModal} onHide={() => setShowModal(false)} />}

      {isLoading && <p>Loading...</p>}
      {isError && <p>Something went wrong</p>}
      {data?.data.hrupdates?.length
        ? data.data.hrupdates.map((update) => (
            <HRUpdateCard key={update._id} update={update} />
          ))
        : !isLoading && <p>No HR updates found.</p>}

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

export default HrUpdatesTab;
