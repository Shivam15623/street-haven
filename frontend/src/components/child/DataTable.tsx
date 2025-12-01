import React from "react";

import { Icon } from "@iconify/react";

export type Column<T> = {
  title: string;
  accessorKey?: keyof T | string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, order: "asc" | "desc") => void;
  onSearchChange: (search: string) => void;
  sortBy?: string;
  order?: "asc" | "desc";
};

function DataTable<T extends object>({
  columns,
  data,
  total,
  page,
  limit,
  onLimitChange,
  onPageChange,
  onSortChange,
  onSearchChange,
  sortBy,
  order,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit);
  const pageSizes = [10, 25, 50, 100];

  return (
    <div className="w-100">
      {/* 🔎 Search + Page Size */}
      <div className="d-flex flex-row justify-content-between mb-3 align-items-center">
        <div className="position-relative w-50 w-sm-25">
          <Icon
            icon="mdi:magnify"
            className="position-absolute"
            style={{ top: "50%", left: "10px", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="form-control ps-5"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="dropdown">
          <button
            className="btn btn-outline-secondary btn-sm dropdown-toggle radius-8 d-flex align-items-center gap-1 shadow-sm"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Rows: {limit}
          </button>

          <ul
            className="dropdown-menu z-1 p-1 radius-8 border-0-5 border-sh-base-50 "
            style={{ minWidth: "100%", width: "100%" }}
          >
            {pageSizes.map((size) => (
              <li key={size}>
                <button
                  className={`dropdown-item p-1 radius-4 text-street-dark small ${
                    limit === size ? "active" : ""
                  }`}
                  onClick={() => onLimitChange(size)}
                >
                  {size}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Input */}
      </div>

      {/* 🔹 Responsive Table */}
      <div className="table-responsive" style={{ scrollbarWidth: "thin" }}>
        <table className="table bordered-table mb-0 table-hover align-middle">
          <thead>
            <tr>
              {columns.map((col, i) => {
                const isSorted = sortBy === col.accessorKey;

                return (
                  <th
                    key={i}
                    onClick={() =>
                      col.sortable !== false && col.accessorKey
                        ? onSortChange(
                            col.accessorKey as string,
                            isSorted && order === "asc" ? "desc" : "asc"
                          )
                        : undefined
                    }
                    style={{
                      cursor:
                        col.sortable !== false && col.accessorKey
                          ? "pointer"
                          : "default",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      {col.title}

                      {/* Sorting Icons */}
                      {col.sortable !== false && col.accessorKey && (
                        <>
                          {isSorted ? (
                            order === "asc" ? (
                              <Icon icon="mdi:arrow-up" width={16} />
                            ) : (
                              <Icon icon="mdi:arrow-down" width={16} />
                            )
                          ) : (
                            <Icon
                              icon="mdi:arrow-up-down"
                              width={16}
                              style={{ opacity: 0.3 }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((row, ri) => (
                <tr key={ri}>
                  {columns.map((col, ci) => (
                    <td key={ci}>
                      {col.render
                        ? col.render(row)
                        : col.accessorKey
                        ? (row as any)[col.accessorKey]
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 gap-2">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-street-outline-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12"
            disabled={page === 1 || totalPages === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-street-outline-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
