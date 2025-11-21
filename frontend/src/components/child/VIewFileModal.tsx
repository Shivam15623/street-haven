import { useState } from "react";
import { Icon } from "@iconify/react";
import ModalWrapper from "./ModalWrapper";
import { Document, Page, pdfjs } from "react-pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type Props = {
  title: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number;
    totalPages?: number;
  };
};

const ViewFileModal = ({ attachment, title }: Props) => {
  const [showModal, setShowModal] = useState(false);

  const extension = attachment.fileUrl.split(".").pop()?.toLowerCase() || "";
  console.log("File extension:", extension);

  const handleDownload = async () => {
    const response = await fetch(attachment.fileUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = attachment.fileName;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const renderPreview = () => {
    switch (extension) {
      case "pdf":
        return (
          <Document file={{ url: attachment.fileUrl }}>
            {Array.from({ length: attachment.totalPages || 1 }, (_, index) => (
              <Page
                key={index}
                pageNumber={index + 1}
                width={Math.min(window.innerWidth * 0.8, 450)}
                height={640}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="mb-4"
              />
            ))}
          </Document>
        );

      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return (
          <img
            src={attachment.fileUrl}
            alt={attachment.fileName}
            width={Math.min(window.innerWidth * 0.8, 453)}
            height={640}
            className=" rounded-4"
          />
        );

      case "txt":
      case "csv":
      case "json":
        return (
          <iframe
            src={attachment.fileUrl}
            className="w-100  border-1 rounded-2"
            title={attachment.fileName}
            height={640}
          />
        );

      case "doc":
      case "docx":
      case "xls":
      case "xlsx":
      case "ppt":
      case "pptx":
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              attachment.fileUrl
            )}`}
            className="w-100  border rounded-lg"
            height={640}
            title={attachment.fileName}
          />
        );

      case "zip":
      case "rar":
        return (
          <div className="d-flex flex-column items-center justify-center h-[60vh] text-center">
            <Icon
              icon="mdi:zip-box"
              className="text-xxl text-street-dark mb-4"
            />
            <p>No preview available for ZIP/RAR files.</p>
            <p className="text-sm text-gray-500">Download to view contents.</p>
          </div>
        );

      default:
        return (
          <div className="d-flex flex-column items-center justify-center h-[60vh] text-center">
            <Icon
              icon="mdi:file-question-outline"
              className="text-5xl text-gray-500 mb-4"
            />
            <p>No preview available for this file type.</p>
          </div>
        );
    }
  };

  return (
    <>
      <button
        className="btn btn-street-outline-primary d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon icon="solar:eye-bold" className="text-lg" />
      </button>

      <ModalWrapper
        title={title}
        subtitle={attachment.fileName}
        size="xl"
        show={showModal}
        onHide={() => setShowModal(false)}
        footer={
          <div className="d-flex justify-content-end">
            <button className="btn btn-street-primary" onClick={handleDownload}>
              <Icon icon="jam:download" className="text-xl" /> Download
            </button>
          </div>
        }
      >
        <div className="d-flex justify-content-center">{renderPreview()}</div>
      </ModalWrapper>
    </>
  );
};

export default ViewFileModal;
