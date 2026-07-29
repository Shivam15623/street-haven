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

const STATUS_BADGE: Record<CertificationStatus, string> = {
  pending: "bg-warning-subtle text-warning-emphasis",
  approved: "bg-success-subtle text-success-emphasis",
  rejected: "bg-danger-subtle text-danger-emphasis",
};

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
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">Training Certifications</h5>
      </div>

      {/* Status filter tabs */}
      <div className="d-flex gap-2 mb-3">
        {(["", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s || "all"}
            type="button"
            className={`btn btn-sm ${
              statusFilter === s
                ? "btn-street-primary"
                : "btn-outline-secondary"
            }`}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : certifications.length === 0 ? (
        <div className="text-center text-muted py-5">
          <Icon icon="mdi:certificate-outline" className="text-2xl mb-2" />
          <p className="mb-0">No {statusFilter || ""} certifications found</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {certifications.map((cert) => (
            <div key={cert._id} className="border rounded-3 p-3">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-medium">
                      {cert.volunteer.firstname} {cert.volunteer.lastname}
                    </span>
                    <span
                      className={`badge rounded-pill text-xs ${STATUS_BADGE[cert.status]}`}
                    >
                      {cert.status}
                    </span>
                  </div>
                  <div className="text-muted small mb-1">
                    {cert.volunteer.email}
                  </div>
                  <div className="d-flex align-items-center gap-2 small">
                    <Icon icon="mdi:file-document-outline" className="text-street-primary" />
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-street-primary"
                    >
                      View certificate
                    </a>
                    <span className="text-muted">
                      · Submitted {dayjs(cert.createdAt).format("DD MMM YYYY")}
                    </span>
                  </div>
                </div>

                {cert.status === "pending" && (
                  <div className="d-flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(cert._id)}
                      disabled={updating}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setRejectingId(cert._id)}
                      disabled={updating}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {rejectingId === cert._id && (
                <div className="mt-3 pt-3 border-top">
                  <label className="form-label small fw-medium">
                    Reason for rejection <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control mb-2"
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Certificate image is unclear, please re-upload"
                  />
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleReject(cert._id)}
                      disabled={updating}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
          <button
            className="btn btn-sm btn-light"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <Icon icon="mdi:chevron-left" />
          </button>
          <span className="small text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-sm btn-light"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <Icon icon="mdi:chevron-right" />
          </button>
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="text-center text-muted small mt-2">Refreshing...</div>
      )}
    </div>
  );
};

export default AdminCertificationsPage;
