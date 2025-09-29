import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { Button } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Document, Page, pdfjs } from "react-pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import type { hrUpdateData } from "../../../../interfaces/hrUpdatesInterface";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Props = {
  update: hrUpdateData;
};

const HrUpdatesView = ({ update }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const { attachment } = update;
 console.log(attachment.fileUrl)
  return (
    <>
      <Button
        className="btn btn-street-outline-primary d-flex align-items-center w-43-px px-8 py-8 px-sm-10 radius-12"
        onClick={() => setShowModal(true)}
      >
        <Icon icon="solar:eye-linear" className="text-lg sm:text-xl" />
      </Button>

      <ModalWrapper
        title={update.title}
        size="xl"
        subtitle={`${attachment.fileName} • ${attachment.totalPages} pages`}
        show={showModal}
        onHide={() => setShowModal(false)}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        footer={
          <div className="d-flex flex-row justify-content-end">
            <Button className="btn btn-street-primary btn-street-lg p-8 d-flex flex-row align-items-center justify-content-between gap-1 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs">
              <Icon icon="jam:download" className="text-xl" />
              Download
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            background: "transparent",
            maxHeight: "640px",
            overflow: "auto",
          }}
        >
          <Document
            file={{url:attachment.fileUrl}}
            loading={<p>Loading PDF...</p>}
            error={<p>Failed to load PDF</p>}
          >
            <Page
              pageNumber={1}
              width={Math.min(window.innerWidth * 0.8, 450)}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </div>
      </ModalWrapper>
    </>
  );
};

export default HrUpdatesView;
