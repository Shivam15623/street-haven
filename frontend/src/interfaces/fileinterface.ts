export interface FileItem {
  _id: string;
  fileName: string;
  fileType: FileType;
  fileUrl: string;
  uploadedAt?: Date;
  uploadedBy?: string;
}
export const getFileIcon = (type: string): string => {
  switch (type) {
    case "image":
      return "mdi:image";
    case "video":
      return "mdi:video";
    case "audio":
      return "mdi:music";
    case "pdf":
      return "mdi:file-pdf-box";
    case "code":
      return "mdi:code-braces";
    case "text":
      return "mdi:file-document";
    default:
      return "mdi:file";
  }
};

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
