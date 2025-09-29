import { Icon } from "@iconify/react/dist/iconify.js";
import { useState} from "react";
import { useSearchParams } from "react-router-dom";
import HRUpdateCard from "./HRUpdateCard";
import { useViewhrUpdatesQuery } from "../../../../services/hrUpdatesApi";
import ActionsHrUpdates from "./ActionsHrUpdates";
import useHasPermission from "../../../../hooks/Auth";

const HrUpdatesTab = () => {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const { isAdmin } = useHasPermission();

  // Get slug from URL params
  const slug = searchParams.get("slug") ?? "";

  // Call query, include slug
  const { data, isLoading, isError } = useViewhrUpdatesQuery({
    page: 1,
    limit: 10,
    search,
    slug,
    sortBy: "createdAt",
    order: "desc",
  });

  // When user types in search, remove slug and tab from URL
  const handleSearchChange = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.delete("slug"); // remove slug
      params.delete("tab");  // remove tab
    }
    setSearchParams(params);
  };

  return (
    <div className="d-flex flex-column gap-24">
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">HR updates</h2>
        {isAdmin && (
          <button
            className="btn btn-street-primary"
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

      {isAdmin && (
        <ActionsHrUpdates show={showModal} onHide={() => setShowModal(false)} />
      )}

      {/* Data display */}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Something went wrong</p>}
      {data?.data.hrupdates?.length
        ? data.data.hrupdates.map((update) => (
            <HRUpdateCard key={update._id} update={update} />
          ))
        : !isLoading && <p>No HR updates found.</p>}
    </div>
  );
};

export default HrUpdatesTab;
