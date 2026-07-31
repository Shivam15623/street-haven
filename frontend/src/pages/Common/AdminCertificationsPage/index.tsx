import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import dayjs from "dayjs";
import {
  useGetAllCertificationsQuery,
  useUpdateCertificationStatusMutation,
  type CertificationStatus,
} from "../../../services/certificationApi";
import { showError } from "../../../utills/toastutills";
import { getErrorMessage } from "../../../utills/utills";
import StreetTab from "../../../components/StreetTab";


const STATUS_CONFIG: Record<
  CertificationStatus,
  { badge: string; icon: string }
> = {
  pending: {
    badge: "bg-warning-focus text-warning-main",
    icon: "mdi:clock-outline",
  },
  approved: {
    badge: "bg-success-focus text-success-main",
    icon: "mdi:check-circle-outline",
  },
  rejected: {
    badge: "bg-danger-focus text-danger-main",
    icon: "mdi:close-circle-outline",
  },
};

const FILTERS: { key: CertificationStatus | ""; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "", label: "All" },
];

const AdminCertificationsPage = () => {
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | "">(
    "pending", // default to pending — this is the actionable queue
  );
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isFetching } = useGetAllCertificationsQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const [updateStatus, { isLoading: updating }] =
    useUpdateCertificationStatusMutation();

  const certifications = data?.data?.certifications ?? [];
  const pagination = data?.data?.pagination;

  const handleApprove = async (certificationId: string) => {
    try {
      await updateStatus({ certificationId, status: "approved" }).unwrap();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleReject = async (certificationId: string) => {
    if (!rejectReason.trim()) {
      showError("Please provide a reason for rejection");
      return;
    }
    try {
      await updateStatus({
        certificationId,
        status: "rejected",
        remarks: rejectReason.trim(),
      }).unwrap();
      setRejectingId(null);
      setRejectReason("");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="card radius-16 border-0 shadow-4">
      <div className="card-body p-24 d-flex flex-column gap-20">
        <div>
          <h6 className="text-md fw-semibold text-neutral-900 mb-4">
            Training Certifications
          </h6>
          <p className="text-sm text-neutral-500 mb-0">
            Review and action volunteer training completion certificates.
          </p>
        </div>

        <StreetTab
          activeKey={statusFilter || "all"}
          onTabChange={(key) => {
            setStatusFilter(key === "all" ? "" : (key as CertificationStatus));
            setPage(1);
          }}
          tabs={FILTERS.map((f) => ({
            key: f.key || "all",
            label: f.label,
            content: null,
          }))}
        />

        {isLoading ? (
          <div className="d-flex align-items-center justify-content-center py-64">
            <div
              className="spinner-border spinner-border-sm text-primary-600"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : certifications.length === 0 ? (
          <div className="d-flex flex-column align-items-center text-center py-64 gap-8">
            <span className="d-flex align-items-center justify-content-center radius-12 bg-neutral-50 w-48-px h-48-px">
              <Icon
                icon="mdi:certificate-outline"
                width={22}
                className="text-neutral-400"
              />
            </span>
            <p className="text-sm text-neutral-500 mb-0">
              No {statusFilter || ""} certifications found
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-12">
            {certifications.map((cert) => {
              const status = STATUS_CONFIG[cert.status];
              return (
                <div
                  key={cert._id}
                  className="border border-neutral-200 radius-12 p-16"
                >
                  <div className="d-flex align-items-start justify-content-between gap-16">
                    <div className="d-flex align-items-start gap-12 flex-grow-1">
                      <span
                        className={`d-flex align-items-center justify-content-center radius-10 w-40-px h-40-px flex-shrink-0 ${status.badge}`}
                      >
                        <Icon icon={status.icon} width={18} />
                      </span>

                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center flex-wrap gap-8 mb-2">
                          <span className="text-sm fw-medium text-neutral-900">
                            {cert.volunteer.firstname} {cert.volunteer.lastname}
                          </span>
                          <span
                            className={`badge rounded-pill text-xs fw-medium px-10 py-4-px text-capitalize ${status.badge}`}
                          >
                            {cert.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-8">
                          {cert.volunteer.email}
                        </p>
                        <div className="d-flex align-items-center flex-wrap gap-8 text-xs">
                          <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-flex align-items-center gap-6 fw-medium text-primary-600 hover-text-primary"
                          >
                            <Icon icon="mdi:file-document-outline" width={14} />
                            View certificate
                          </a>
                          <span className="text-neutral-400">
                            Submitted{" "}
                            {dayjs(cert.createdAt).format("DD MMM YYYY")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {cert.status === "pending" && (
                      <div className="d-flex gap-8 flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-sm btn-success radius-8 text-xs fw-medium"
                          onClick={() => handleApprove(cert._id)}
                          disabled={updating}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger radius-8 text-xs fw-medium"
                          onClick={() => setRejectingId(cert._id)}
                          disabled={updating}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {rejectingId === cert._id && (
                    <div className="mt-16 pt-16 border-top border-neutral-200 d-flex flex-column gap-8">
                      <label className="form-label text-xs fw-medium text-neutral-700 mb-0">
                        Reason for rejection{" "}
                        <span className="text-danger-main">*</span>
                      </label>
                      <textarea
                        className="form-control text-sm"
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Certificate image is unclear, please re-upload"
                      />
                      <div className="d-flex gap-8 justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-street-neutral radius-8 text-xs fw-medium"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger radius-8 text-xs fw-medium"
                          onClick={() => handleReject(cert._id)}
                          disabled={updating}
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-12 pt-4">
            <button
              className="btn btn-sm btn-street-neutral radius-8 w-32-px h-32-px p-0 d-flex align-items-center justify-content-center"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <Icon icon="mdi:chevron-left" width={16} />
            </button>
            <span className="text-xs text-neutral-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-sm btn-street-neutral radius-8 w-32-px h-32-px p-0 d-flex align-items-center justify-content-center"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <Icon icon="mdi:chevron-right" width={16} />
            </button>
          </div>
        )}

        {isFetching && !isLoading && (
          <div className="text-center text-xs text-neutral-400">
            Refreshing...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCertificationsPage;
