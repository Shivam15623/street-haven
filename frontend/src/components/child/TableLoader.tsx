interface SkeletonRowProps {
  columns: number;
}

const SkeletonRow = ({ columns }: SkeletonRowProps) => (
  <tr className="">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="p-3  ">
        <span
          className="placeholder col-12 rounded"
          style={{ height: "14px" }}
        />
      </td>
    ))}
  </tr>
);
interface TableLoaderProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export const TableLoader = ({
  columns = 5,
  rows = 5,
  className = "",
}: TableLoaderProps) => {
  return (
    <div className={`card border ${className}`}>
      <div className="card-body p-4 placeholder-glow">
        {/* Search bar skeleton */}
        <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
          <span
            className="placeholder col-6 rounded"
            style={{ height: "44px", maxWidth: "420px" }}
          />
          <span
            className="placeholder col-2 rounded"
            style={{ height: "36px", maxWidth: "100px" }}
          />
        </div>

        {/* Table skeleton */}
        <div className="table-responsive">
          <table className="table bordered-table mb-0">
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
              {Array.from({ length: rows }).map((_, idx) => (
                <SkeletonRow key={idx} columns={columns} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination skeleton */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span
            className="placeholder col-2 rounded"
            style={{ height: "14px", maxWidth: "100px" }}
          />
          <div className="d-flex gap-2">
            <span
              className="placeholder col-2 rounded"
              style={{ height: "36px", width: "64px" }}
            />
            <span
              className="placeholder col-2 rounded"
              style={{ height: "36px", width: "64px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
