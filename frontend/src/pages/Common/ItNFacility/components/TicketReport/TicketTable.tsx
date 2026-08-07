import React, { useMemo, useState } from "react";

import TicketDetailDrawer from "./TicketDetailDrawer";
import type { Column } from "../../../../../components/child/SimpleTable";
import SimpleTable from "../../../../../components/child/SimpleTable";
import type { BadgeVariant } from "../../../../../components/child/Badge";
import Badge from "../../../../../components/child/Badge";

export interface TicketReport {
  id: string;
  slug: string;
  ticketId: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  submittedBy: string;
  assignedTo: string;
  approvedBy: string;
  created: string;
  resolved: string | null;
}
const statusVariant: Record<string, BadgeVariant> = {
  Open: "warning-soft",
  Approved: "info-soft",
  "In Progress": "orange-soft",
  Completed: "success-soft",
  Rejected: "danger-soft",
  Closed: "secondary-soft",
};
interface Props {
  tickets: TicketReport[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

const TicketReportTable: React.FC<Props> = ({
  tickets,
  page,
  limit,
  total,
  onPageChange,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleView = (id: string) => {
    setSelectedTicketId(id);
    setOpen(true);
  };

  const columns: Column<TicketReport>[] = useMemo(
    () => [
      {
        header: "#",
        accessor: (_, index) => (page - 1) * limit + index + 1,
      },
      {
        header: "Ticket ID",
        accessor: (row) => row.ticketId,
      },
      {
        header: "Title",
        accessor: (row) => row.title,
      },
      {
        header: "Status",
        accessor: (row) => (
          <Badge variant={statusVariant[row.status] ?? "secondary-soft"}>
            {row.status}
          </Badge>
        ),
      },
      {
        header: "Priority",
        accessor: (row) =>
          row.priority === "-" ? (
            "--"
          ) : (
            <Badge
              variant={
                row.priority === "High"
                  ? "danger-soft"
                  : row.priority === "Medium"
                    ? "warning-soft"
                    : "success-soft"
              }
            >
              {row.priority}
            </Badge>
          ),
      },
      {
        header: "Category",
        accessor: (row) => row.category,
      },
      {
        header: "Location",
        accessor: (row) => row.location,
      },
      {
        header: "Submitted By",
        accessor: (row) => row.submittedBy,
      },
      {
        header: "Assigned To",
        accessor: (row) => row.assignedTo ?? "--",
      },
      {
        header: "Approved By",
        accessor: (row) => row.approvedBy ?? "--",
      },
      {
        header: "Created",
        accessor: (row) => new Date(row.created).toLocaleDateString(),
      },
      {
        header: "Resolved",
        accessor: (row) =>
          row.resolved ? new Date(row.resolved).toLocaleDateString() : "-",
      },
      {
        header: "Action",
        accessor: (row) => (
          <button
            className="btn btn-street-primary btn-sm"
            onClick={() => handleView(row.id)}
          >
            View
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <SimpleTable
        columns={columns}
        data={tickets}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
      />

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default TicketReportTable;
