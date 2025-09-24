import { useState } from "react";
import { Row } from "react-bootstrap";
import DocumentCard from "./components/DocumentCard";
import { Icon } from "@iconify/react/dist/iconify.js";
import "@assets/css/PageCss/program.css";
import { useFetchManualsQuery } from "../../../services/ProgramManualApi";
import ActionsProgram from "./components/ActionsProgram";
import useHasPermission from "../../../hooks/Auth";
import { Link } from "react-router-dom";

const ProgramManuals = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<string | undefined>(undefined);
  const pageSize = 10;

  const { isAdmin } = useHasPermission();

  // Fetch manuals using RTK Query
  const { data, isLoading } = useFetchManualsQuery({
    page,
    limit: pageSize,
    search,
    type,
    sortBy: "createdAt",
    order: "desc",
  });

  const totalPages = data
    ? Math.ceil(data.data.paggination.totalPages / pageSize)
    : 0;

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setPage(pageNumber);
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
            className="btn btn-street-lg btn-street-primary d-flex align-items-center justify-content-center"
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
            setSearch(e.target.value);
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
        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
          {/* First page */}
          <li className="page-item">
            <Link className="page-link" to="#" onClick={() => goToPage(1)}>
              <Icon icon="ep:d-arrow-left" className="text-xl" />
            </Link>
          </li>

          {/* Previous page */}
          <li className="page-item">
            <Link
              className="page-link"
              to="#"
              onClick={() => goToPage(page - 1)}
            >
              <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
            </Link>
          </li>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p} className="page-item">
              <Link
                className={`page-link ${
                  page === p
                    ? "bg-primary-600 text-white"
                    : "bg-primary-50 text-secondary-light"
                }`}
                to="#"
                onClick={() => goToPage(p)}
              >
                {p}
              </Link>
            </li>
          ))}

          {/* Next page */}
          <li className="page-item">
            <Link
              className="page-link"
              to="#"
              onClick={() => goToPage(page + 1)}
            >
              <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
            </Link>
          </li>

          {/* Last page */}
          <li className="page-item">
            <Link
              className="page-link"
              to="#"
              onClick={() => goToPage(totalPages)}
            >
              <Icon icon="ep:d-arrow-right" className="text-xl" />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default ProgramManuals;
