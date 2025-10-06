import React from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

export type Column<T> = {
  title: string;
  accessorKey?: keyof T | string; // optional
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
      <div className="d-flex flex-row  justify-content-between mb-3 align-items-center">
        <DropdownButton
          id="dropdown-basic-button"
          title={`Rows: ${limit}`}
          onSelect={(val) => onLimitChange(Number(val))}
        >
          {pageSizes.map((size) => (
            <Dropdown.Item key={size} eventKey={size}>
              {size}
            </Dropdown.Item>
          ))}
        </DropdownButton>

        <input
          type="text"
          placeholder="Search..."
          className="form-control w-50 w-sm-25"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 🔹 Responsive Table */}
      <div className="table-responsive ">
        <table className="table bordered-table mb-0 table-hover align-middle">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() =>
                    col.sortable !== false && col.accessorKey
                      ? onSortChange(
                          col.accessorKey as string,
                          sortBy === col.accessorKey && order === "asc"
                            ? "desc"
                            : "asc"
                        )
                      : undefined
                  }
                  style={{
                    cursor:
                      col.sortable !== false && col.accessorKey
                        ? "pointer"
                        : "default",
                  }}
                >
                  {col.title}{" "}
                  {col.sortable !== false && sortBy === col.accessorKey
                    ? order === "asc"
                      ? "🔼"
                      : "🔽"
                    : ""}
                </th>
              ))}
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
            className="btn btn-sm btn-outline-primary"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={page === totalPages}
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
