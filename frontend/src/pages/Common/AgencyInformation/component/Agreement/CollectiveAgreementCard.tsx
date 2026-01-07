import { useState } from "react";
import type { AgreementData } from "../../../../../services/AgreementApi";
import ActionsAgreement from "./ActionsAgreement";

import { Icon } from "@iconify/react/dist/iconify.js";
import useHasPermission from "../../../../../hooks/Auth";

import dayjs from "dayjs";
import ViewFileModal from "../../../../../components/child/VIewFileModal";
import DeleteAgreement from "./DeleteAgreement";
const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(2) + " KB";
  return (kb / 1024).toFixed(2) + " MB";
};
const CollectiveAgreementCard = ({
  agreement,
}: {
  agreement: AgreementData;
}) => {
  const { attachment, updatedAt, createdAt } = agreement;
  const [open, setOpen] = useState(false);
  const { hasPermission } = useHasPermission();
  const [showDelete, setShowDelete] = useState(false);
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl); // Free memory
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <>
      {" "}
      <div className="card">
        <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-20 radius-12">
          <div className="d-flex flex-row justify-content-between align-items-center">
            <div className="d-flex flex-row gap-12 gap-sm-20 align-items-center">
              <div className="collective-icon w-40-px h-40-px p-8 radius-8">
                {" "}
                <Icon
                  icon="iconamoon:file-document-light"
                  width={24.29}
                  height={24.29}
                />
              </div>
              <div className="d-flex flex-column gap-1">
                <h4 className="text-sm xs:text-lg sm:text-xl mb-0 fw-semibold text-street-dark">
                  {agreement.title}
                </h4>
                <div className="d-flex flex-row flex-wrap text-xxs xs:text-xs fw-normal gap-1 gap-sm-8">
                  {" "}
                  <span>{attachment.fileType.toUpperCase()}</span>•
                  <span>{formatFileSize(attachment.size)}</span>•
                  <span>
                    {" "}
                    {updatedAt === createdAt ? (
                      <>
                        Created:
                        {dayjs(createdAt).format("MM/DD/YYYY")}
                      </>
                    ) : (
                      <>Updated: {dayjs(updatedAt).format("MM/DD/YYYY")}</>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="d-none d-sm-flex flex-row gap-6 gap-sm-12">
              <ViewFileModal attachment={attachment} title={agreement.title} />
              {hasPermission({ action: "edit_collective_agreement" }) && (
                <button
                  className="btn btn-street-neutral d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                  style={{ width: "43px", height: "40px" }}
                  onClick={() => setOpen(true)}
                >
                  {" "}
                  <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
                </button>
              )}
              {hasPermission({ action: "delete_collective_agreement" }) && (
                <button
                  onClick={() => setShowDelete(true)}
                  className="btn btn-street-delete d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                  style={{ width: "43px", height: "40px" }}
                >
                  <Icon icon="lucide:trash-2" className="text-sm sm:text-xl" />
                </button>
              )}

              <button
                className="btn btn-street-primary btn-street-lg p-8 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs radius-12 p-0"
                style={{ minWidth: "43px", minHeight: "40px" }}
                onClick={() =>
                  handleDownload(attachment.fileUrl, attachment.fileName)
                }
              >
                <Icon icon="jam:download" className="text-xl" />
                Download
              </button>
            </div>
          </div>

          <hr className="d-sm-none d-block" />
          <div className="d-flex d-sm-none flex-row justify-content-end gap-8 gap-sm-12">
            <ViewFileModal attachment={attachment} title={agreement.title} />

            {}
            {hasPermission({ action: "edit_collective_agreement" }) && (
              <button
                className="btn btn-street-neutral d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                style={{ width: "43px", height: "40px" }}
                onClick={() => setOpen(true)}
              >
                {" "}
                <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
              </button>
            )}
            {hasPermission({ action: "delete_collective_agreement" }) && (
              <button
                onClick={() => setShowDelete(true)}
                className="btn btn-street-delete d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                style={{ width: "43px", height: "40px" }}
              >
                <Icon icon="lucide:trash-2" className="text-sm sm:text-xl" />
              </button>
            )}

            <button
              className="btn btn-street-primary btn-street-lg p-8 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs radius-12 p-0"
              style={{ minWidth: "43px", minHeight: "40px" }}
              onClick={() =>
                handleDownload(attachment.fileUrl, attachment.fileName)
              }
            >
              <Icon icon="jam:download" className="text-xl" />
              Download
            </button>
          </div>
        </div>
      </div>
      <ActionsAgreement
        agreementToEdit={agreement}
        show={open}
        onHide={() => setOpen(false)}
      />
      <DeleteAgreement
        id={agreement._id}
        show={showDelete}
        onHide={() => setShowDelete(false)}
      />
    </>
  );
};

export default CollectiveAgreementCard;
