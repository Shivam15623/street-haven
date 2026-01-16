import { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import DocumentCard from "./components/DocumentCard";
import { Icon } from "@iconify/react/dist/iconify.js";
import "@assets/css/PageCss/program.css";
import { useFetchManualsQuery } from "../../../services/ProgramManualApi";
import ActionsProgram from "./components/ActionsProgram";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../../../hooks/useDebounce";
import StreetPaggination from "../../../components/child/StreetPaggination";
import useHasPermission from "../../../hooks/Auth";
import DocumentCardSkeleton from "./components/DocumentCardSkelaton";
import { useSocket } from "../../../hooks/useSocket";

const ProgramManuals = () => {
  const { socket } = useSocket();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get("slug") ?? "";
  const pageSize = 10;

  const handleSearchChange = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.delete("slug"); // remove slug
    }
    setSearchParams(params);
  };
  const { hasPermission } = useHasPermission();

  // Fetch manuals using RTK Query
  const { data, isLoading, refetch } = useFetchManualsQuery({
    page,
    limit: pageSize,
    search: debouncedSearch,
    slug: slugParam,
    type: undefined,
    sortBy: "createdAt",
    order: "desc",
  });

  const totalPages = data ? Math.ceil(data.data.paggination.totalPages) : 0;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-page-room", "program_manual_viewers");

    const handleManualDeleted = ({ manualId }: { manualId: string }) => {
      const exists = data?.data.manuals.some(
        (manual) => manual._id === manualId
      );

      // 🔥 Only refetch if it exists in current list
      if (exists) {
        refetch();
      }
    };

    socket.on("program-manual-deleted", handleManualDeleted);

    return () => {
      socket.emit("leave-page-room", "program_manual_viewers");
      socket.off("program-manual-deleted", handleManualDeleted);
    };
  }, [socket, data, refetch]);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-4 ">
        {" "}
        <div className="d-flex flex-column gap-2">
          <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
            Program Manuals
          </p>
          <p className="fw-normal text-sm xs:text-md">
            Access training materials and program documentation
          </p>
        </div>
        {hasPermission({ action: "create_program_manual" }) && (
          <button
            className="btn  flex-grow-1 flex-sm-grow-0 btn-street-primary radius-12 text-sm d-flex align-items-center justify-content-center"
            onClick={() => setShowModal(true)}
          >
            Add Manual
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="px-20 py-16 program-input radius-12 d-flex search-Content  flex-row align-items-center w-100 gap-8 max-w-700-px z-1 position-relative">
        <Icon icon="proicons:search" className="text-xl opacity-50" />

        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Documents"
          value={search}
          onChange={(e) => {
            handleSearchChange(e.target.value);
            setPage(1); // Reset to first page on search
          }}
        />

        {search && (
          <button
            type="button"
            className="  text-xl text-street-dark opacity-50 hover:opacity-100"
            onClick={() => {
              handleSearchChange("");
              setSearch(""); // clear state
              setPage(1); // reset page if needed
            }}
          >
            <Icon
              icon="ion:close-circle"
              className="text-xl opacity-50 contentIcon "
            />
          </button>
        )}
      </div>

      {/* Display manuals */}
      <Row className="gy-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, idx) => (
            <DocumentCardSkeleton key={idx} />
          ))}
        {!isLoading && data?.data.manuals.length === 0 && (
          <p>No manuals found.</p>
        )}
        {!isLoading &&
          data?.data.manuals.map((manual) => (
            <DocumentCard key={manual._id} Pdocument={manual} />
          ))}
      </Row>
      {hasPermission({ action: "create_program_manual" }) && (
        <ActionsProgram onHide={() => setShowModal(false)} show={showModal} />
      )}

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

export default ProgramManuals;
