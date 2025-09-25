import { useState } from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Document, Page, pdfjs } from "react-pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import type { MeetingMinutesData } from "../../../../interfaces/meetingMinutes";

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Props = {
  meetings: MeetingMinutesData;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number;
    totalPages: number;
  };
};

const ViewTownHallMinutes = ({ attachment, meetings }: Props) => {
  const [showModal, setShowModal] = useState(false);

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
      <button
        className="btn btn-street-outline-primary d-flex align-items-center w-43-px px-8 py-8 px-sm-10 radius-12"
        onClick={() => setShowModal(true)}
      >
        <Icon icon="solar:eye-linear" className="text-lg sm:text-xl" />
      </button>

      <ModalWrapper
        title={meetings.title}
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
            <button
              className="btn btn-street-primary btn-street-lg p-8 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs"
              onClick={() =>
                handleDownload(attachment.fileUrl, attachment.fileName)
              }
            >
              <Icon icon="jam:download" className="text-xl" />
              Download
            </button>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Document
            file={attachment.fileUrl}
            loading={<p>Loading PDF...</p>}
            error={<p>Failed to load PDF</p>}
          >
            {Array.from({ length: attachment.totalPages }, (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={Math.min(window.innerWidth * 0.8, 453)}
                height={640}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="mb-4"
              />
            ))}
          </Document>
        </div>
      </ModalWrapper>
    </>
  );
};

export default ViewTownHallMinutes;
