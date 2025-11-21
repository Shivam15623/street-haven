import { useState } from "react";
import { Row } from "react-bootstrap";
import DocumentCard from "./components/DocumentCard";
import { Icon } from "@iconify/react/dist/iconify.js";
import "@assets/css/PageCss/program.css";
import { useFetchManualsQuery } from "../../../services/ProgramManualApi";
import ActionsProgram from "./components/ActionsProgram";
import useHasPermission from "../../../hooks/Auth";
import {  useSearchParams } from "react-router-dom";
import { useDebounce } from "../../../hooks/useDebounce";
import StreetPaggination from "../../../components/child/StreetPaggination";

const ProgramManuals = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get("slug") ?? "";
  const pageSize = 10;

  const { isAdmin } = useHasPermission();
  const handleSearchChange = (value: string) => {
    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.delete("slug"); // remove slug
    }
    setSearchParams(params);
  };

  // Fetch manuals using RTK Query
  const { data, isLoading } = useFetchManualsQuery({
    page,
    limit: pageSize,
    search: debouncedSearch,
    slug: slugParam,
    type: undefined,
    sortBy: "createdAt",
    order: "desc",
  });

  const totalPages = data
    ? Math.ceil(data.data.paggination.totalPages / pageSize)
    : 0;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-row justify-content-between align-items-center">
        {" "}
        <div className="d-flex flex-column gap-2">
          <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
            Program Manuals
          </p>
          <p className="fw-normal text-sm xs:text-md">
            Access training materials and program documentation
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-street-lg btn-street-primary radius-12 text-sm d-flex align-items-center justify-content-center"
            onClick={() => setShowModal(true)}
          >
            Add Manual
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="px-20 py-16 program-input radius-12 d-flex flex-row align-items-center gap-8">
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
      </div>

      {/* Display manuals */}
      <Row className="gy-4">
        {isLoading && <p>Loading...</p>}
        {!isLoading && data?.data.manuals.length === 0 && (
          <p>No manuals found.</p>
        )}
        {!isLoading &&
          data?.data.manuals.map((manual) => (
            <DocumentCard key={manual._id} Pdocument={manual} />
          ))}
      </Row>
      <ActionsProgram onHide={() => setShowModal(false)} show={showModal} />

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
