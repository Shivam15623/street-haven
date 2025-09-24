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

  return (
    <div className="card-body">
      <div className="table-responsive w-100">
        <table
          className="table striped-table mb-0"
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
          <tfoot>
            <tr>
              <td colSpan={columns.length}>
                <div className="d-flex justify-content-center align-items-center gap-2 py-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${
                        page === i + 1
                          ? "btn-primary text-white"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => onPageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="btn btn-sm btn-outline-primary"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SimpleTable;
