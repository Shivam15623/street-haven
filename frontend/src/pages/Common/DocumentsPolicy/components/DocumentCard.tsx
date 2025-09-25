import React, { useState } from "react";
import { Col } from "react-bootstrap";
import { Icon } from "@iconify/react";
import DocumentDetails from "./DocumentDetails";
import Badge from "../../../../components/child/Badge";
import ActionsProgram from "./ActionsProgram";
import useHasPermission from "../../../../hooks/Auth";
import DeleteMannuals from "./DeleteMannuals";

export type Document = {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  type: string;
  updatedAt: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // Cloudinary gives bytes
    totalPages: number;
  };
};

type DocumentCardProps = {
  Pdocument: Document;
};

const DocumentCard: React.FC<DocumentCardProps> = ({ Pdocument }) => {
  const { title, description, tags, type, updatedAt, attachment } = Pdocument;
  const [showEditModal, setShowEditModal] = useState(false);
  const { isAdmin } = useHasPermission();
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
      <div className="card">
        <div className="p-16 p-sm-20 card-body position-relative doc-card p-md-24 d-flex flex-column rounded-2 gap-10 gap-sm-12">
          {/* Icon + Title + Description */}
          <div className="d-flex flex-column gap-10 gap-sm-12">
            <div className="d-flex align-items-center justify-content-center doc-icon rounded-3 p-2 w-48-px h-48-px">
              <Icon icon="heroicons:document" className="text-xxl" />
            </div>
            <div className="d-flex flex-column gap-2">
              <p className="text-xs xs:text-sm text-street-dark fw-semibold">
                {title}
              </p>
              <p className="fw-normal text-xs xs:text-sm">{description}</p>
            </div>
          </div>

          {/* Tags */}
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

          {/* Footer */}
          <div className="d-flex flex-row align-items-center justify-content-between">
            <div className="text-xxs xs:text-xs fw-normal">
              Updated: {updatedAt}
            </div>
            <div className="d-flex flex-row gap-8 gap-sm-12">
              <DocumentDetails title={title} attachment={attachment} />
              <button
                className="btn btn-street-primary btn-street-lg p-8 d-flex flex-row align-items-center justify-content-between gap-1 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs"
                onClick={() =>
                  handleDownload(attachment.fileUrl, attachment.fileName)
                }
              >
                <Icon icon="jam:download" className="text-sm sm:text-xl" />
                Download
              </button>
            </div>
          </div>
          {isAdmin && (
            <div
              className="position-absolute z-3 d-flex flex-row gap-2"
              style={{ top: "10px", right: "10px" }}
            >
              <button
                className="btn btn-street-neutral   p-8 d-flex flex-row align-items-center justify-content-between  radius-12"
                onClick={() => setShowEditModal(true)}
              >
                <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
              </button>
              <DeleteMannuals
                attachment={attachment}
                description={description}
                id={Pdocument._id}
                title={Pdocument.title}
              />
            </div>
          )}
        </div>
      </div>

      <ActionsProgram
        document={Pdocument}
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      />
    </Col>
  );
};

export default DocumentCard;
