import { Formik, Form } from "formik";
import { Icon } from "@iconify/react/dist/iconify.js";
import dayjs from "dayjs";
import {
  useGetMyCertificationQuery,
  useSubmitCertificationMutation,
} from "../../../../services/certificationApi";
import { showError } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";
import { useState } from "react";
import FileField from "../../../../components/child/FileField";

const STATUS_CONFIG: Record<
  string,
  { badge: string; icon: string; iconColor: string }
> = {
  pending: {
    badge: "bg-warning-focus text-warning-main",
    icon: "mdi:clock-outline",
    iconColor: "text-warning-main",
  },
  approved: {
    badge: "bg-success-focus text-success-main",
    icon: "mdi:check-circle-outline",
    iconColor: "text-success-main",
  },
  rejected: {
    badge: "bg-danger-focus text-danger-main",
    icon: "mdi:close-circle-outline",
    iconColor: "text-danger-main",
  },
};

interface TrainingCertFormValues {
  file: File | null;
}

const TrainingCertificateTab = () => {
  const { data, isLoading } = useGetMyCertificationQuery();
  const [submitCertification, { isLoading: submitting }] =
    useSubmitCertificationMutation();
  const [progress, setProgress] = useState(0);
  const initialValues: TrainingCertFormValues = {
    file: null,
  };

  const cert = data?.data;
  const canUpload = !cert || cert.status === "rejected";
  const status = cert ? STATUS_CONFIG[cert.status] : null;

  if (isLoading) {
    return (
      <div className="card radius-16 border-0">
        <div className="card-body d-flex align-items-center justify-content-center py-64">
          <div
            className="spinner-border spinner-border-sm text-primary-600"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card radius-16 border-0 shadow-4">
      <div className="card-body p-24 d-flex flex-column gap-24">
        <div>
          <h6 className="text-md fw-semibold text-neutral-900 mb-4">
            Training Completion Certificate
          </h6>
          <p className="text-sm text-neutral-500 mb-0">
            Upload proof of your completed training so we can verify it.
          </p>
        </div>

        {cert && (
          <div className="border border-neutral-200 radius-12 p-20 d-flex flex-column gap-12">
            <div className="d-flex align-items-start justify-content-between gap-12">
              <div className="d-flex align-items-center gap-12">
                <span
                  className={`d-flex align-items-center justify-content-center radius-10 w-40-px h-40-px ${status?.badge}`}
                >
                  <Icon
                    icon={status?.icon || "mdi:file-document-outline"}
                    width={20}
                  />
                </span>
                <div>
                  <p className="text-sm fw-medium text-neutral-900 mb-2">
                    Certificate
                  </p>
                  <p className="text-xs text-neutral-500 mb-0">
                    Submitted {dayjs(cert.createdAt).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>

              <span
                className={`badge rounded-pill text-xs fw-medium px-12 py-6 text-capitalize ${status?.badge}`}
              >
                {cert.status}
              </span>
            </div>

            {!canUpload && (
              <a
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-center gap-8 text-sm fw-medium text-primary-600 hover-text-primary w-fit"
              >
                <Icon icon="mdi:eye-outline" width={16} />
                View submitted certificate
              </a>
            )}

            {cert.status === "rejected" && cert.remarks && (
              <div className="d-flex align-items-start gap-8 bg-danger-focus radius-8 p-12">
                <Icon
                  icon="mdi:alert-circle-outline"
                  width={16}
                  className="text-danger-main flex-shrink-0 mt-2-px"
                />
                <p className="text-xs text-danger-main mb-0">
                  <span className="fw-semibold">Reason for rejection: </span>
                  {cert.remarks}
                </p>
              </div>
            )}

            {cert.status === "pending" && (
              <p className="text-xs text-neutral-500 mb-0">
                Your certificate is awaiting admin review.
              </p>
            )}
          </div>
        )}

        {canUpload && (
          <Formik
            initialValues={initialValues}
            onSubmit={async (values, { resetForm }) => {
              if (!values.file) {
                showError("Please select your training completion certificate");
                return;
              }

              setProgress(0);

              try {
                await submitCertification({
                  file: values.file,
                  onProgress: setProgress,
                }).unwrap();

                resetForm();
                setProgress(0);
              } catch (error) {
                setProgress(0);
                showError(getErrorMessage(error));
              }
            }}
          >
            {({ values }) => (
              <Form className="d-flex flex-column gap-16">
                <div>
                  <label className="form-label text-sm fw-medium text-neutral-700 mb-8">
                    Upload certificate
                  </label>
                  <FileField
                    isEdit={false}
                    name="file"
                    fieldLabel="Training Completion Certificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-neutral-400 mt-8 mb-0">
                    Accepted formats: PDF, JPG, PNG
                  </p>
                </div>

                {values.file && (
                  <div className="d-flex align-items-center gap-8 bg-neutral-50 radius-8 px-12 py-8 w-fit">
                    <Icon
                      icon="mdi:file-check-outline"
                      width={16}
                      className="text-primary-600"
                    />
                    <span className="text-xs text-neutral-700">
                      {values.file.name}
                    </span>
                  </div>
                )}

                {progress > 0 && progress < 100 && (
                  <div className="d-flex align-items-center gap-12">
                    <div className="progress progress-sm flex-grow-1 radius-40 overflow-hidden">
                      <div
                        className="progress-bar bg-primary-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 fw-medium">
                      {progress}%
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-street-primary radius-8 py-10 px-20 text-sm fw-medium w-fit d-flex align-items-center gap-8"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      Uploading {progress}%
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:upload" width={16} />
                      Submit for Review
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default TrainingCertificateTab;
