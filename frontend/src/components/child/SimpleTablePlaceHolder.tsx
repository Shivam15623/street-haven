import React from "react";

interface TablePlaceholderLoaderProps {
  columns?: number;
  rows?: number;
}

const TablePlaceholderLoader: React.FC<TablePlaceholderLoaderProps> = ({
  columns = 6,
  rows = 5,
}) => {
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 placeholder-glow">
        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table bordered-table mb-0 table-hover align-middle">
            <thead>
              <tr>
                {Array.from({ length: columns }).map((_, idx) => (
                  <th key={idx}>
                    <span
                      className="placeholder col-8 rounded"
                      style={{ height: "14px" }}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: columns }).map((_, colIdx) => (
                    <td key={colIdx}>
                      <span
                        className="placeholder col-12 rounded d-block"
                        style={{ height: "12px" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 gap-2">
            <span
              className="placeholder col-3 rounded"
              style={{ height: "12px" }}
            />
            <div className="d-flex gap-2">
              <span
                className="placeholder rounded"
                style={{ height: "32px", width: "70px" }}
              />
              <span
                className="placeholder rounded"
                style={{ height: "32px", width: "70px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePlaceholderLoader;
