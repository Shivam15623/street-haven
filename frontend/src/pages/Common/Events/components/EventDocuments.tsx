import React, { useState } from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";

import FileViewer from "../../../../components/FileViewer/FileViewer";
import StreetTab from "../../../../components/StreetTab";
import FileTab from "../../../../components/child/FileTab";
import type { FileItem } from "../../../../interfaces/fileinterface";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eventName: string;
  eventId: string;
  files: FileItem[];
}
const EventDocuments: React.FC<Props> = ({
  open,
  onOpenChange,
  eventName,
  files,
  eventId,
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
                eventId={eventId}
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
                eventId={eventId}
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
                eventId={eventId}
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
                eventId={eventId}
              />
            ),
          },
        ]}
      />

      {/* FILE VIEWER */}
      <FileViewer
        files={files}
        initialIndex={selectedIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />
    </ModalWrapper>
  );
};

export default EventDocuments;
