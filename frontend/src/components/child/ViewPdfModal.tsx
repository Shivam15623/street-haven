import { useEffect, useRef, useState } from "react";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Document, Page, pdfjs } from "react-pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
import ModalWrapper from "./ModalWrapper";

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Props = {
  title: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number;
    totalPages: number;
  };
};
const LazyPage = ({ pageNumber }: { pageNumber: number }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect(); // stop observing after visible
          }
        });
      },
      { rootMargin: "200px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: "24px", minHeight: "300px" }}>
      {visible && (
        <Page
          pageNumber={pageNumber}
          width={Math.min(window.innerWidth * 0.8, 450)}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      )}
    </div>
  );
};

const ViewPdfModal = ({ attachment, title }: Props) => {
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
        <Icon icon="solar:eye-bold" className="text-lg sm:text-xl" />
      </button>

      <ModalWrapper
        title={title}
        size="xl"
        subtitle={`${attachment.fileName} • ${attachment.totalPages} pages`}
        show={showModal}
        onHide={() => setShowModal(false)}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              className="btn btn-street-primary btn-street-lg d-flex align-items-center justify-content-center gap-2 radius-12"
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
            file={{ url: attachment.fileUrl }}
            loading={<p>Loading PDF...</p>}
            error={<p>Failed to load PDF</p>}
          >
            {Array.from({ length: attachment.totalPages }, (_, index) => (
              <LazyPage key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </div>
      </ModalWrapper>
    </>
  );
};

export default ViewPdfModal;
