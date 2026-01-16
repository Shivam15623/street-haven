import React from "react";

// Types
export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

const SimpleTable = <T extends unknown>({
  columns,
  data,
  page,
  limit,
  total,
  onPageChange,
}: TableProps<T>) => {
  const totalPages = Math.ceil(total / limit);
  console.log("Total Pages:", totalPages, page);
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 radius-12 p-md-24">
        <div className="table-responsive w-100">
          <table
            className="table bordered-table mb-0 table-hover align-middle"
            style={{ tableLayout: "auto", width: "100%" }}
          >
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 gap-2">
          <span>
            Page {page} of {totalPages === 0 ? totalPages + 1 : totalPages}
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
    </div>
  );
};

export default SimpleTable;
