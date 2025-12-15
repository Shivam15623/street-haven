import React, { useState } from "react";
import { useViewIncidentReportQuery } from "../../../../../services/IncidentReportApi";
import type {
  IncidentReportQuery,
  IncidentReportData,
} from "../../../../../interfaces/incidentReport";
import { Icon } from "@iconify/react/dist/iconify.js";
import SimpleTable from "../../../../../components/child/SimpleTable";
import IncidentReportModal from "../modals/IncidentReport";

interface Column {
  header: string;
  accessor: (row: IncidentReportData) => React.ReactNode;
}

const columns: Column[] = [
  {
    header: "Date",
    accessor: (row) => new Date(row.dateOfIncident).toLocaleDateString(),
  },
  {
    header: "Time",
    accessor: (row) =>
      new Date(row.dateOfIncident).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    header: "Location",
    accessor: (row) => row.location || "N/A",
  },
 
  {
    header: "Witnesses",
    accessor: (row) =>
      row.witnesses.length > 0 ? row.witnesses.join(", ") : "None",
  },

  {
    header: "Reporter Name",
    accessor: (row) => row.reporterName || "Anonymous",
  },
  {
    header:"Actions",
    accessor:(row)=><IncidentReportModal incident={row}/>
  }
];

const IncidentReportSubmission = () => {
  const [filter, setFilter] = useState<IncidentReportQuery>({
    page: 1,
    limit: 10,
    order: "desc",
    search: "",
  });

  const { data: incidentSubmissions, isLoading } =
    useViewIncidentReportQuery(filter);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search Input */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Documents"
          value={filter.search}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, search: e.target.value, page: 1 }))
          }
        />
      </div>

      {/* Data Table */}
      <SimpleTable
        columns={columns}
        data={incidentSubmissions?.data.allIncidentSubmissions || []}
        page={filter.page!}
        limit={filter.limit!}
        total={incidentSubmissions?.data.paggination.total || 0}
        onPageChange={(newPage) =>
          setFilter((prev) => ({ ...prev, page: newPage }))
        }
      />
    </div>
  );
};

export default IncidentReportSubmission;
