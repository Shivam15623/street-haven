import React from "react";
import DOMPurify from "dompurify";
import dayjs from "dayjs";
import ModalWrapper from "../../../../components/child/ModalWrapper"; // adjust path
import Badge from "../../../../components/child/Badge";
import type { Document } from "./DocumentCard";

type Props = {
  show: boolean;
  onHide: () => void;
  doc: Document;
  footer?: React.ReactNode;
};

const DocumentDetailsModal: React.FC<Props> = ({ show, onHide, doc, footer }) => {
  const isUpdated = doc.updatedAt !== doc.createdAt;

  return (
    <ModalWrapper
      show={show}
      onHide={onHide}
      title={doc.title}
      subtitle={`${isUpdated ? "Updated" : "Created"}: ${dayjs(
        isUpdated ? doc.updatedAt : doc.createdAt
      ).format("MM/DD/YYYY")}`}
      size="lg"
      footer={footer}
    >
      <div className="d-flex flex-column gap-16">
        <div className="d-flex flex-wrap gap-8">
          <Badge variant="secondary-soft" className="px-10 radius-8">
            {doc.type}
          </Badge>
          {doc.tags.map((tag, idx) => (
            <Badge key={idx} variant="primary-soft">
              {tag}
            </Badge>
          ))}
        </div>

        <div
          className="parse Te"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(doc.description),
          }}
        />
      </div>
    </ModalWrapper>
  );
};

export default DocumentDetailsModal;