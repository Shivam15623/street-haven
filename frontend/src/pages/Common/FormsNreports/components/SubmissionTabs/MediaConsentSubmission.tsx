import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import SimpleTable from "../../../../../components/child/SimpleTable";

import {
  useLazyGetAllMediaConsentQuery,
  useLazyGetMediaConsentPdfQuery,
  type MediaConsent,
} from "../../../../../services/FormApi";
import EditMediaConsent from "../modals/EditMediaConsent";
import { useDebounce } from "../../../../../hooks/useDebounce";
import type { AgentTabProp } from "../../../AgencyInformation/component/CollectiveAgreementTab";
import dayjs from "dayjs";
import TablePlaceholderLoader from "../../../../../components/child/SimpleTablePlaceHolder";

// ------------------------------
// Columns
// ------------------------------
interface Column {
  header: string;
  accessor: (row: MediaConsent) => React.ReactNode;
}

// ------------------------------
// Component
// ------------------------------
const MediaConsentSubmission: React.FC<AgentTabProp> = ({ isActive }) => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    search: "",
  });
  const debouncedSearch = useDebounce(filter.search, 1000);
  const [getMediacon, { data: consentData, isLoading }] =
    useLazyGetAllMediaConsentQuery();
  useEffect(() => {
    if (isActive) {
      getMediacon({
        page: filter.page,
        limit: filter.limit,
        search: debouncedSearch,
      });
    }
  }, [isActive, getMediacon, filter.page, filter.limit, debouncedSearch]);
  const [getMediaConsentPdf] = useLazyGetMediaConsentPdfQuery();
  const handleDownload = async (id: string) => {
    try {
      const blob = await getMediaConsentPdf(id).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employee-incident-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex flex-column gap-24">
        {/* Search placeholder */}
        <div className="px-20 py-16 bg-base radius-12 placeholder-glow">
          <span
            className="placeholder col-6 rounded"
            style={{ height: "16px" }}
          />
        </div>

        <TablePlaceholderLoader columns={6} rows={5} />
      </div>
    );
  }

  const submissions: MediaConsent[] = consentData?.data?.data ?? [];
  const total: number = consentData?.data?.paggination?.total || 0;
  const columns: Column[] = [
    {
      header: "Name",
      accessor: (row) => row.name || "N/A",
    },
    {
      header: "Printed Name",
      accessor: (row) => row.printedname || "N/A",
    },
    {
      header: "Consent Date",
      accessor: (row) => dayjs(row.date).format("DD MMM YYYY"),
    },
    {
      header: "Created",
      accessor: (row) => dayjs(row.createdAt).format("DD MMM YYYY"),
    },
    {
      header: "Actions",
      accessor: (row) => {
        return (
          <div className="d-flex gap-2">
            <EditMediaConsent data={row} />
            <button
              className="d-flex gap-2 align-items-center justify-content-center btn btn-street-outline-primary radius-12 p-0"
              style={{ width: "43px", height: "40px" }}
              onClick={() => handleDownload(row._id!)}
            >
              <Icon icon={"mdi:download"} width={18} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="d-flex flex-column gap-24">
      {/* Search bar */}
      <div className="px-20 py-16 program-input bg-base radius-12 d-flex flex-row align-items-center gap-8">
        <Icon icon="proicons:search" className="text-xl opacity-50" />
        <input
          className="bg-transparent border-0 text-sm text-street-base d-flex flex-grow-1 fw-semibold"
          placeholder="Search Media Consents"
          value={filter.search}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              search: e.target.value,
              page: 1,
            }))
          }
        />
      </div>

      {/* Table */}
      {submissions.length > 0 ? (
        <SimpleTable
          columns={columns}
          data={submissions}
          page={filter.page}
          limit={filter.limit}
          total={total}
          onPageChange={(newPage) =>
            setFilter((prev) => ({ ...prev, page: newPage }))
          }
        />
      ) : (
        <p className="text-muted">No media consents submitted yet.</p>
      )}
    </div>
  );
};

export default MediaConsentSubmission;
