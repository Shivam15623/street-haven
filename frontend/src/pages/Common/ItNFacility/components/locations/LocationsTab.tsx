import { useMemo, useState } from "react";
import {
  useFetchLocationsQuery,
  type Location,
} from "../../../../../services/locationApi";
import type { Column } from "../../../../../components/child/SimpleTable";
import SimpleTable from "../../../../../components/child/SimpleTable";
import ActionsLocation from "./ActionLocation";
import ViewLocation from "./ViewLocation";
import { Icon } from "@iconify/react/dist/iconify.js";
import Badge from "../../../../../components/child/Badge";
import LocationStatusToggle from "./LocationStatusToggle";

const LIMIT = 10;

const LocationsTab = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const [showAction, setShowAction] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<Location>();

  const { data, isLoading, isFetching } = useFetchLocationsQuery({
    isActive: statusFilter === "all" ? undefined : statusFilter === "true",
  });

  const allLocations = useMemo(() => {
    return data?.data ?? [];
  }, [data?.data]);

  const paginated = useMemo(() => {
    const start = (page - 1) * LIMIT;
    return allLocations.slice(start, start + LIMIT);
  }, [allLocations, page]);

  const columns: Column<Location>[] = [
    { header: "Name", accessor: (row) => row.name },
    {
      header: "Managers",
      accessor: (row) => row.managers.length,
    },
    {
      header: "Status",
      accessor: (row) => (
        <div className="d-flex flex-row align-items-center gap-2">
          <Badge
            className="px-md-10"
            variant={row.isActive ? "success-soft" : "danger-soft"}
          >
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
          <LocationStatusToggle id={row._id} isActive={row.isActive} />
        </div>
      ),
    },

    {
      header: "Actions",
      accessor: (row) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-street-outline-primary radius-12 d-flex align-items-center justify-content-center p-0"
            style={{ width: "43px", height: "40px" }}
            title="View Details"
            onClick={() => {
              setSelectedLocation(row);
              setShowView(true);
            }}
          >
            <Icon icon="lucide:eye" className="text-xl" />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
            style={{ width: "43px", height: "40px" }}
            title="Edit Task"
            onClick={() => {
              setSelectedLocation(row);
              setShowAction(true);
            }}
          >
            <Icon icon="mdi:pencil-outline" className="text-xl" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">Locations</h2>
        <button
          className="btn btn-sm btn-street-primary radius-12"
          onClick={() => setShowAction(true)}
        >
          + Add Location
        </button>
      </div>

      <div className="d-flex flex-row gap-2 align-items-center">
        <label className="text-sm">Status:</label>
        <select
          className="form-select form-select-sm w-auto"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "all" | "true" | "false");
            setPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div>Loading locations...</div>
      ) : (
        <SimpleTable<Location>
          columns={columns}
          data={paginated}
          page={page}
          limit={LIMIT}
          total={allLocations.length}
          onPageChange={setPage}
        />
      )}
      {isFetching && !isLoading && (
        <span className="text-sm text-muted">Refreshing...</span>
      )}

      <ActionsLocation
        show={showAction}
        location={selectedLocation}
        onHide={() => {
          setSelectedLocation(undefined);
          setShowAction(false);
        }}
      />
      {selectedLocation && (
        <ViewLocation
          location={selectedLocation}
          onHide={() => {
            setShowView(false);
            setSelectedLocation(undefined);
          }}
          show={showView}
        />
      )}
    </div>
  );
};

export default LocationsTab;
