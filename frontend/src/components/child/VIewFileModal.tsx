import { useState } from "react";
import { Icon } from "@iconify/react";
import ModalWrapper from "./ModalWrapper";

type Props = {
  title: string;
  attachment: {
    fileName: string;
    fileUrl: string;
    size: number;
    totalPages?: number;
  };
  trigger?: (open: () => void) => React.ReactNode;
};

const ViewFileModal = ({ attachment, title, trigger }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const extension = attachment.fileUrl.split(".").pop()?.toLowerCase() || "";

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const getDisplayFileName = (fileName: string) => {
    return fileName.replace(/^\d+_/, "");
  };
  const handleDownload = async () => {
    const response = await fetch(attachment.fileUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = getDisplayFileName(attachment.fileName);
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const renderPreview = () => {
    switch (extension) {
      case "pdf":
        // #toolbar=0&navpanes=0&scrollbar=0 strips the native viewer's
        // toolbar/sidebar/scrollbar in Chromium-based browsers.
        // Not all browsers honor these params (e.g. Firefox's built-in
        // viewer ignores them), but it degrades gracefully — you still
        // get a working preview, just with default browser chrome.
        return (
          <div
            className="w-100 d-flex justify-content-center"
            style={{ maxWidth: 900, margin: "0 auto" }}
          >
            <iframe
              src={`${attachment.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title={getDisplayFileName(attachment.fileName)}
              width="100%"
              height={640}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: 8,
                display: "block",
              }}
            />
          </div>
        );

      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return (
          <img
            src={attachment.fileUrl}
            alt={getDisplayFileName(attachment.fileName)}
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
            title={getDisplayFileName(attachment.fileName)}
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
              attachment.fileUrl,
            )}`}
            className="w-100  border rounded-lg"
            height={640}
            title={getDisplayFileName(attachment.fileName)}
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
      {trigger ? (
        trigger(openModal)
      ) : (
        <button
          className="btn btn-street-outline-primary d-flex justify-content-center align-items-center w-43-px px-8 py-8 px-sm-10 radius-12"
          style={{ width: "43px", height: "40px" }}
          onClick={openModal}
        >
          <Icon icon="solar:eye-bold" className="text-lg" />
        </button>
      )}

      <ModalWrapper
        title={title}
        subtitle={getDisplayFileName(attachment.fileName)}
        size="xl"
        show={showModal}
        onHide={closeModal}
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              className="btn btn-street-primary btn-street-lg d-flex align-items-center justify-content-center gap-2 radius-12"
              onClick={handleDownload}
            >
              <Icon icon="jam:download" className="text-xl" /> Download
            </button>
          </div>
        }
      >
        <div className="d-flex justify-content-center overflow-hidden ">
          {renderPreview()}
        </div>
      </ModalWrapper>
    </>
  );
};

export default ViewFileModal;
