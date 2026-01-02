import React, { useEffect, useState } from "react";
import {
  useDeleteIncidentReportMutation,
  useLazyViewIncidentReportQuery,
} from "../../../../../../services/IncidentReportApi";
import type {
  IncidentReportQuery,
  IncidentReportData,
} from "../../../../../../interfaces/incidentReport";
import { Icon } from "@iconify/react/dist/iconify.js";
import SimpleTable from "../../../../../../components/child/SimpleTable";
import IncidentReportModal from "./IncidentReport";
import EditIncidentReport from "./edit";
import DeleteConfirmModal from "../delete";
import { useDebounce } from "../../../../../../hooks/useDebounce";
import type { AgentTabProp } from "../../../../AgencyInformation/component/CollectiveAgreementTab";
import dayjs from "dayjs";

interface Column {
  header: string;
  accessor: (row: IncidentReportData) => React.ReactNode;
}

const IncidentReportSubmission: React.FC<AgentTabProp> = ({ isActive }) => {
  const [filter, setFilter] = useState<IncidentReportQuery>({
    page: 1,
    limit: 10,
    order: "desc",
    search: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(filter.search, 1000);
  const [deleteIncidentReport, { isLoading: deleting }] =
    useDeleteIncidentReportMutation();
  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteIncidentReport({ id: selectedId }).unwrap();
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };
  const [getviewIncident, { data: incidentSubmissions, isLoading }] =
    useLazyViewIncidentReportQuery();
  useEffect(() => {
    if (isActive) {
      getviewIncident({
        page: filter.page,
        limit: filter.limit,
        search: debouncedSearch,
      });
    }
  }, [isActive, getviewIncident, filter.page, filter.limit, debouncedSearch]);
  const columns: Column[] = [
    {
      header: "Date",
      accessor: (row) => dayjs(row.dateOfIncident).format("DD MMM YYYY"),
    },
    {
      header: "Time",
      accessor: (row) => dayjs(row.dateOfIncident).format("hh:mm A"),
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
      header: "Actions",
      accessor: (row) => (
        <div className="d-flex gap-2">
          <EditIncidentReport data={row} />
          <IncidentReportModal incident={row} />
          <button
            className="btn btn-sm btn-street-delete d-flex flex-row align-items-center justify-content-center radius-12 text-md"
            onClick={() => handleDeleteClick(row._id)}
          >
            <Icon icon="mdi:delete" className="text-xl" />
          </button>
        </div>
      ),
    },
  ];

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
      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Incident Report"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
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
