import { Icon } from "@iconify/react";

import FileCard from "./FileCard";
import type { FileItem } from "../../interfaces/fileinterface";

type Props = {
  files: FileItem[];
  handleOpenFile: (file: FileItem) => void;
  tab: string;
  eventId: string;
};

const FileTab = ({ files, tab, handleOpenFile, eventId }: Props) => {
  return (
    <div className="p-3">
      {files.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
          <div className="mb-3 rounded-circle bg-light p-3">
            <Icon
              icon="mdi:folder-open"
              className="text-secondary"
              width={32}
              height={32}
            />
          </div>
          <p className="fs-5 fw-semibold text-street-dark">No files found</p>
          <p className="mt-1 text-street-base small">
            There are no {tab} in this event
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {files.map((file, i) => (
            <div
              className="col-6 col-sm-4 col-md-3"
              key={`${file.fileUrl}-${i}`}
            >
              <FileCard
                key={`${file.fileUrl}-${i}`}
                file={file}
                onClick={() => handleOpenFile(file)}
                eventId={eventId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTab;
