import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { Button } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Document, Page, pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Props = {
  title: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number; // bytes
    totalPages: number;
  };
};

const DocumentDetails = ({ attachment, title }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

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
    <div>
      <Button
        className="btn btn-street-outline-primary d-flex align-items-center w-43-px px-8 py-8 px-sm-10 radius-12"
        onClick={() => setShowModal(true)}
      >
        <Icon icon="solar:eye-bold" className="text-lg sm:text-xl" />
      </Button>

      <ModalWrapper
        title={title}
        subtitle={`${attachment.fileName} • ${
          numPages || attachment.totalPages
        } pages`}
        size="xl"
        show={showModal}
        onHide={() => setShowModal(false)}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        footer={
          <div className="d-flex justify-content-end w-100">
            <Button
              className="btn btn-street-primary btn-street-lg d-flex align-items-center radius-12 justify-content-center text-sm gap-1"
              onClick={() =>
                handleDownload(attachment.fileUrl, attachment.fileName)
              }
            >
              <Icon icon="jam:download" className="text-lg" />
              Download
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            maxHeight: "80vh",
          }}
        >
          <Document
            file={{ url: attachment.fileUrl }}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p>Loading PDF...</p>}
            error={<p>Failed to load PDF</p>}
          >
            {Array.from(
              new Array(numPages || attachment.totalPages),
              (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={Math.min(window.innerWidth * 0.8, 453)}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className={"mb-4"}
                />
              )
            )}
          </Document>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default DocumentDetails;
