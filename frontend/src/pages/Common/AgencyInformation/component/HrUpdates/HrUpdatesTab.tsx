import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HRUpdateCard from "./HRUpdateCard";
import { useLazyViewhrUpdatesQuery } from "../../../../../services/hrUpdatesApi";
import ActionsHrUpdates from "./ActionsHrUpdates";
import StreetPaggination from "../../../../../components/child/StreetPaggination";
import useHasPermission from "../../../../../hooks/Auth";
import { useDebounce } from "../../../../../hooks/useDebounce";
import type { AgentTabProp } from "../Agreement/CollectiveAgreementTab";
import HRUpdateCardSkeleton from "./HrUpdaresCardSkelaton";

const HrUpdatesTab: React.FC<AgentTabProp> = ({ isActive }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = useHasPermission();
  const navigate = useNavigate();
  const slug = searchParams.get("slug") ?? "";
  const itemParams=searchParams.get("item")??null

  /* ✅ Lazy query */
  const [getHrUpdates, { data, isLoading, isError }] =
    useLazyViewhrUpdatesQuery();

  /* ✅ Trigger API when deps change */
  useEffect(() => {
    if (isActive) {
      getHrUpdates({
        page,
        limit: 10,
        search: debouncedSearch,
        slug,
        sortBy: "createdAt",
        order: "desc",
      });
    }
  }, [page, debouncedSearch, slug, getHrUpdates, isActive]);

  const totalPages = data?.data?.paggination?.totalPages ?? 0;

  /* ✅ Search handler */
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.delete("slug");
      params.delete("item");
      params.delete("tab");
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    if (!itemParams || !data) return;

    const el = document.getElementById(itemParams);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Clean URL after a short delay
    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      params.delete("item");

      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [itemParams, data, navigate]);
  return (
    <div className="d-flex flex-column gap-24">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">HR Updates</h2>

        {hasPermission({ action: "create_hr_update" }) && (
          <button
            className="btn btn-street-primary text-sm radius-12"
            onClick={() => setShowModal(true)}
          >
            Add New Update
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm flex-grow-1 fw-semibold"
          placeholder="Search Documents"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <ActionsHrUpdates show={showModal} onHide={() => setShowModal(false)} />

      {/* States */}
      {isLoading &&
        Array.from({ length: 5 }).map((_p, idx) => (
          <HRUpdateCardSkeleton key={idx} />
        ))}
      {isError && <p>Something went wrong</p>}

      {!isLoading && data?.data?.hrupdates?.length === 0 && (
        <p>No HR updates found.</p>
      )}

      {/* List */}
      {data?.data?.hrupdates?.map((update) => (
        <HRUpdateCard key={update._id} update={update} />
      ))}

      {/* Pagination */}
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
