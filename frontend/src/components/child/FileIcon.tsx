import React from "react";
import { Icon } from "@iconify/react";

export type FileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "doc"
  | "ppt"
  | "excel"
  | "zip"
  | "other";

interface FileIconProps {
  fileType: FileType;
  size?: number;
  className?: string;
}

/* ---------------- ICONIFY ICONS ---------------- */
const iconMap: Record<FileType, string> = {
  image: "mdi:image",
  video: "mdi:video",
  audio: "mdi:music",
  pdf: "mdi:file-pdf-box",
  doc: "mdi:file-word-box",
  ppt: "mdi:file-powerpoint-box",
  excel: "mdi:file-excel-box",
  zip: "mdi:folder-zip",
  other: "mdi:file",
};

/* ---------------- COLORS ---------------- */
const colorMap: Record<FileType, string> = {
  image: "text-primary",
  video: "text-warning",
  audio: "text-info",
  pdf: "text-danger",
  doc: "text-primary",
  ppt: "text-warning",
  excel: "text-success",
  zip: "text-secondary",
  other: "text-muted",
};

const bgColorMap: Record<FileType, string> = {
  image: "bg-primary-subtle",
  video: "bg-warning-subtle",
  audio: "bg-info-subtle",
  pdf: "bg-danger-subtle",
  doc: "bg-primary-subtle",
  ppt: "bg-warning-subtle",
  excel: "bg-success-subtle",
  zip: "bg-secondary-subtle",
  other: "bg-light",
};

/* ---------------- FILE ICON ---------------- */
export const FileIcon: React.FC<FileIconProps> = ({
  fileType,
  size = 28,
  className,
}) => {
  const icon = iconMap[fileType];
  const colorClass = colorMap[fileType];

  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      className={`${colorClass} ${className || ""}`}
    />
  );
};

/* ---------------- ICON WITH BACKGROUND ---------------- */
export const FileIconWithBackground: React.FC<FileIconProps> = ({
  fileType,
  size = 28,
  className,
}) => {
  const bgClass = bgColorMap[fileType];

  return (
    <div
      className={`d-flex align-items-center justify-content-center rounded-3 ${bgClass} ${className || ""}`}
      style={{ width: size * 2, height: size * 2 }}
    >
      <FileIcon fileType={fileType} size={size} />
    </div>
  );
};

export default FileIcon;
