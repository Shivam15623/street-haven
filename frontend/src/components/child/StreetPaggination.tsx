import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import { Link } from "react-router-dom";
interface StreetPagginationProps {
  page: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
}
const StreetPaggination:React.FC<StreetPagginationProps> = ({page,totalPages,handlePageChange}) => {
  return (
    <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center mt-3">
      {/* First Page */}
      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
        <Link
          to="#"
          onClick={() => handlePageChange(1)}
          className="page-link bg-primary-50 text-secondary-light fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
        >
          <Icon icon="ep:d-arrow-left" className="text-xl" />
        </Link>
      </li>

      {/* Prev Page */}
      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
        <Link
          to="#"
          onClick={() => handlePageChange(page - 1)}
          className="page-link bg-primary-50 text-secondary-light fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
        >
          <Icon icon="iconamoon:arrow-left-2-light" className="text-xxl" />
        </Link>
      </li>

      {/* Dynamic Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <li key={num} className="page-item">
          <Link
            to="#"
            onClick={() => handlePageChange(num)}
            className={`page-link fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px ${
              num === page
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-secondary-light"
            }`}
          >
            {num}
          </Link>
        </li>
      ))}

      {/* Next Page */}
      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
        <Link
          to="#"
          onClick={() => handlePageChange(page + 1)}
          className="page-link bg-primary-50 text-secondary-light fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
        >
          <Icon icon="iconamoon:arrow-right-2-light" className="text-xxl" />
        </Link>
      </li>

      {/* Last Page */}
      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
        <Link
          to="#"
          onClick={() => handlePageChange(totalPages)}
          className="page-link bg-primary-50 text-secondary-light fw-medium radius-8 border-0 py-10 d-flex align-items-center justify-content-center h-48-px w-48-px"
        >
          <Icon icon="ep:d-arrow-right" className="text-xl" />
        </Link>
      </li>
    </ul>
  );
};

export default StreetPaggination;
