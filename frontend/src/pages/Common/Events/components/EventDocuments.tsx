import React, { useState } from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import type { ViewerFile } from "../../../../components/FileViewer/FileViewer";
import FileViewer from "../../../../components/FileViewer/FileViewer";
import StreetTab from "../../../../components/StreetTab";
import FileTab from "../../../../components/child/FileTab";
type FileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "doc"
  | "ppt"
  | "excel"
  | "zip"
  | "other";

export interface FileItem {
  fileName: string;
  fileUrl: string;
  fileType: FileType; // image, pdf, docx, video, etc.
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eventName: string;
  files: FileItem[];
}


const EventDocuments: React.FC<Props> = ({
  open,
  onOpenChange,
  eventName,
  files,
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // --- GROUP FILES ---
  const images = files.filter((f) => f.fileType === "image");
  const docs = files.filter((f) =>
    ["pdf", "doc", "docx", "txt", "ppt", "pptx"].includes(f.fileType)
  );
  const videos = files.filter((f) => f.fileType === "video");
  const others = files.filter(
    (f) => !images.includes(f) && !docs.includes(f) && !videos.includes(f)
  );

  // Create Viewer Compatible Array
  const viewerFiles: ViewerFile[] = files.map((f, index) => ({
    id: String(index),
    name: f.fileName,
    url: f.fileUrl,
    type: f.fileType,
  }));

  // --- OPEN CORRECT FILE IN VIEWER ---
  const handleOpenFile = (file: FileItem) => {
    const globalIndex = files.findIndex((f) => f.fileUrl === file.fileUrl);
    setSelectedIndex(globalIndex);
    setViewerOpen(true);
  };

  // CURRENT TAB LIST
  const getCurrentTabFiles = (activeTab: string) => {
    switch (activeTab) {
      case "images":
        return images;
      case "docs":
        return docs;
      case "videos":
        return videos;
      case "others":
        return others;
      default:
        return [];
    }
  };

  return (
    <ModalWrapper
      show={open}
      size="xl"
      onHide={() => onOpenChange(false)}
      title={eventName}
      className="p-20"
      bodyClassName="p-0"
    >
      {/* Tabs */}
      <StreetTab
        tabs={[
          {
            key: "images",
            label: "Images",
            content: (
              <FileTab
                files={getCurrentTabFiles("images")}
                tab="Images"
                handleOpenFile={handleOpenFile}
              />
            ),
          },
          {
            key: "docs",
            label: "Documents",
            content: (
              <FileTab
                files={getCurrentTabFiles("docs")}
                tab="Documents"
                handleOpenFile={handleOpenFile}
              />
            ),
          },
          {
            key: "videos",
            label: "Videos",
            content: (
              <FileTab
                tab="Videos"
                files={getCurrentTabFiles("videos")}
                handleOpenFile={handleOpenFile}
              />
            ),
          },
          {
            key: "others",
            label: "Others",
            content: (
              <FileTab
                tab="Other Documents"
                files={getCurrentTabFiles("others")}
                handleOpenFile={handleOpenFile}
              />
            ),
          },
        ]}
      />

      {/* FILE VIEWER */}
      <FileViewer
        files={viewerFiles}
        initialIndex={selectedIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </ModalWrapper>
  );
};

export default EventDocuments;
