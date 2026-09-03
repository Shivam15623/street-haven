import { Icon } from "@iconify/react/dist/iconify.js";
import type { FileType } from "../../interfaces/fileinterface";
import { formatFileSize } from "./utills";
import { FileIconWithBackground } from "../child/FileIcon";

interface Attachment {
  _id: string;
  type: FileType;
  fileName: string;
  size: number;
  fileUrl: string;
  thumbnail?: string;
}

export const AttachmentPreview = ({
  attachment,
  onClick,
}: {
  attachment: Attachment;
  onClick: () => void;
}) => {
  const readableSize = formatFileSize(attachment.size);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(attachment.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (attachment.type === "image") {
    return (
      <div
        className="position-relative overflow-hidden rounded-3 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={attachment.fileUrl}
          alt={attachment.fileName}
          className="w-100"
          style={{
            height: "12rem",
            objectFit: "cover",
            transition: "transform 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div className="position-absolute bottom-0 end-0 bg-dark bg-opacity-50 text-white small px-2 py-1 rounded-2 m-2">
          {readableSize}
        </div>
      </div>
    );
  }

  if (attachment.type === "video") {
    return (
      <div
        className="position-relative overflow-hidden rounded-3 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={attachment.thumbnail || "/placeholder-video.jpg"}
          alt={attachment.fileName}
          className="w-100"
          style={{ height: "12rem", objectFit: "cover" }}
        />
        <div className="position-absolute top-50 start-50 translate-middle bg-white bg-opacity-75 rounded-circle p-3">
          <Icon icon="mdi:play" className="text-primary fs-3" />
        </div>
        <div className="position-absolute bottom-0 end-0 bg-dark bg-opacity-50 text-white small px-2 py-1 rounded-2 m-2">
          {readableSize}
        </div>
      </div>
    );
  }

  if (attachment.type === "audio") {
    return (
      <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-light">
        <FileIconWithBackground fileType={attachment.type} size={26} />
        <div className="flex-grow-1 text-truncate">
          <div className="fw-medium text-truncate">{attachment.fileName}</div>
          <div className="text-muted small">{readableSize}</div>
        </div>
        <button
          onClick={handleDownload}
          className="btn btn-sm btn-light rounded-circle"
        >
          <Icon icon="mdi:download" className="fs-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-white hover-shadow-sm cursor-pointer"
      onClick={onClick}
    >
      <FileIconWithBackground fileType={attachment.type} size={26} />
      <div className="flex-grow-1 text-truncate">
        <div className="fw-medium text-sm text-truncate">
          {attachment.fileName}
        </div>
        <div className="text-muted text-xs small">{readableSize}</div>
      </div>
      <button
        onClick={handleDownload}
        className="btn h-100 btn-light rounded-circle"
      >
        <Icon icon="mdi:download" className="fs-5" />
      </button>
    </div>
  );
};
