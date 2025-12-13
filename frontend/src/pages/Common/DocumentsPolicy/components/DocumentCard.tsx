import React, { useState } from "react";
import { Col } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Badge from "../../../../components/child/Badge";
import ActionsProgram from "./ActionsProgram";

import DeleteMannuals from "./DeleteMannuals";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import ViewPdfModal from "../../../../components/child/ViewPdfModal";
import useHasPermission from "../../../../hooks/Auth";
import type { FileType } from "../../../../interfaces/fileinterface";
import ViewFileModal from "../../../../components/child/VIewFileModal";
export type Document = {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  type: string;
  updatedAt: string;
  createdAt: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // Cloudinary gives bytes
    fileType: FileType;
  };
};

type DocumentCardProps = {
  Pdocument: Document;
};

const DocumentCard: React.FC<DocumentCardProps> = ({ Pdocument }) => {
  const { title, description, tags, type, updatedAt, attachment } = Pdocument;
  const [showEditModal, setShowEditModal] = useState(false);
  const { hasPermission } = useHasPermission();
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
    <Col lg={4} md={6}>
      <div className="card" style={{ height: "100%" }}>
        <div className="p-16 p-sm-20 card-body position-relative doc-card p-md-24 d-flex flex-column rounded-2 justify-content-between ">
          {/* Icon + Title + Description */}
          <div className="d-flex flex-column gap-10 gap-sm-12">
            <div className="d-flex flex-column gap-10 gap-sm-12">
              <div className="d-flex align-items-center justify-content-center doc-icon rounded-3 p-2 w-48-px h-48-px">
                <Icon icon="heroicons:document" className="text-xxl" />
              </div>
              <div className="d-flex flex-column gap-2">
                <p className="text-xs xs:text-sm text-street-dark fw-semibold">
                  {title}
                </p>
                <div
                  className="parse Te"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(description),
                  }}
                />
              </div>
            </div>
            <div className="d-flex flex-row gap-8 gap-sm-10">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="primary-soft">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Category */}
            <div>
              <Badge
                className="px-10 sm:text-xs radius-8"
                variant="secondary-soft"
              >
                {type}
              </Badge>
            </div>
          </div>

          {/* Tags */}

          {/* Footer */}
          <div className="d-flex  flex-row gap-3  align-items-center  justify-content-between">
            <div className="text-xxs xs:text-xs fw-normal">
              {" "}
              {updatedAt === Pdocument.createdAt ? (
                <>Created:{dayjs(Pdocument.createdAt).format("MM/DD/YYYY")}</>
              ) : (
                <>Updated: {dayjs(updatedAt).format("MM/DD/YYYY")}</>
              )}
            </div>
            <div className="d-flex flex-row gap-8 gap-sm-12 justify-content-end">
              <ViewFileModal attachment={attachment} title={title} />
              <button
                className="btn btn-street-primary   d-flex flex-row align-items-center justify-content-between gap-1  radius-12 text-xxs sm:text-xs"
                onClick={() =>
                  handleDownload(attachment.fileUrl, attachment.fileName)
                }
              >
                <Icon icon="jam:download" className="text-xl" />
                <span className="d-none d-xxl-block ">Download</span>
              </button>
            </div>
          </div>

          <div
            className="position-absolute z-1 d-flex flex-row gap-2"
            style={{ top: "10px", right: "10px" }}
          >
            {hasPermission({
              action: "edit_program_manual",
            }) && (
              <button
                className="btn btn-street-neutral   p-8 d-flex flex-row align-items-center justify-content-between  radius-12"
                onClick={() => setShowEditModal(true)}
              >
                <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
              </button>
            )}
            {hasPermission({
              action: "delete_program_manual",
            }) && (
              <DeleteMannuals
                attachment={attachment}
                description={description}
                id={Pdocument._id}
                title={Pdocument.title}
              />
            )}
          </div>
        </div>
      </div>
      {hasPermission({
        action: "edit_program_manual",
      }) && (
        <ActionsProgram
          document={Pdocument}
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
        />
      )}
    </Col>
  );
};

export default DocumentCard;
