import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ViewTownHallMinutes from "./ViewTownHallMinutes";
import Badge from "../../../../components/child/Badge";
import type { MeetingMinutesData } from "../../../../interfaces/meetingMinutes";
import useHasPermission from "../../../../hooks/Auth";
import ActionstownhallMinutes from "./ActionstownhallMinutes";
import DeleteMeetingMinutes from "./DeleteMeetingMinutes";

export type TownhallMinuteCardProps = {
  meeting: MeetingMinutesData;
};
const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(2) + " KB";
  return (kb / 1024).toFixed(2) + " MB";
};
const TownhallMinuteCard: React.FC<TownhallMinuteCardProps> = ({ meeting }) => {
  const {
    attachment,
    attendees,
    meetingDate,
    title,
    keyHighlights,
    keyTopicsDiscussed,
  } = meeting;
  const [showModal, setShowModal] = useState(false);
  const { isAdmin } = useHasPermission();
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
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-13 radius-12">
        {/* Header */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-12">
          <div className="d-flex flex-column gap-10">
            <h4 className="text-sm xs:text-lg sm:text-xl mb-0 fw-semibold text-street-dark">
              {title}
            </h4>
            <div className="d-flex align-items-center flex-row flex-wrap text-xxs xs:text-xs fw-normal gap-10 gap-sm-24">
              <span className="d-flex align-items-center gap-1 gap-sm-6">
                <Icon
                  icon="uit:calender"
                  className="text-street-primary  text-xxs xs:text-xs"
                />
                {new Date(meetingDate).toLocaleDateString()}
              </span>
              <span className="d-flex align-items-center gap-1 gap-sm-6">
                <Icon
                  icon="octicon:people-24"
                  className="text-street-primary text-xxs xs:text-xs"
                />
                {attendees} attendees
              </span>
              <span className="d-flex align-items-center gap-1 gap-sm-6">
                <Icon
                  icon="iconamoon:file-document-light"
                  className="text-street-primary text-xxs xs:text-xs"
                />
                {attachment.totalPages} pages
              </span>
              <span>• {formatFileSize(attachment.size)}</span>
            </div>
          </div>

          <div className="d-none d-sm-flex flex-row gap-6 gap-sm-12">
            <ViewTownHallMinutes attachment={attachment} meetings={meeting} />
            <button
              className="btn btn-street-primary btn-street-lg p-8 px-sm-24 px-md-32 radius-12 text-xxs sm:text-xs"
              onClick={() =>
                handleDownload(attachment.fileUrl, attachment.fileName)
              }
            >
              <Icon icon="jam:download" className="text-xl" />
              Download
            </button>
            {isAdmin && (
              <button
                className="btn btn-street-neutral"
                onClick={() => setShowModal(true)}
              >
                {" "}
                <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
              </button>
            )}
            {isAdmin && (
              <DeleteMeetingMinutes
                attachment={attachment}
                id={meeting._id}
                meetingDate={meetingDate}
                title={title}
              />
            )}
          </div>
        </div>

        {/* Topics */}
        {keyTopicsDiscussed.length > 0 && (
          <div className="d-flex flex-column gap-10">
            <p className=" text-xxs xs:text-xs fw-semibold">
              Key Topics Discussed
            </p>
            <div className="d-flex flex-row flex-wrap gap-13">
              {keyTopicsDiscussed.map((topic, idx) => (
                <Badge key={idx} variant="primary-soft">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* Highlights */}
        {keyHighlights.length > 0 && (
          <div className="d-flex flex-column gap-6 gap-sm-10">
            <p className="text-street-dark text-xxs xs:text-xs fw-semibold">
              Key Highlights
            </p>
            <ul
              className="text-xxs xs:text-xs fw-normal gap-2-px"
              style={{ listStyle: "disc", paddingLeft: "20px" }}
            >
              {keyHighlights.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}
        <hr className="d-sm-none d-block" />
        <div className="d-flex d-sm-none flex-row justify-content-end gap-8 gap-sm-12">
          {isAdmin && (
            <DeleteMeetingMinutes
              attachment={attachment}
              id={meeting._id}
              meetingDate={meetingDate}
              title={title}
            />
          )}
          {isAdmin && (
            <button
              className="btn btn-street-neutral"
              onClick={() => setShowModal(true)}
            >
              {" "}
              <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
            </button>
          )}

          <ViewTownHallMinutes attachment={attachment} meetings={meeting} />
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
      </div>
      <ActionstownhallMinutes
        onHide={() => setShowModal(false)}
        show={showModal}
        meeting={meeting}
      />
    </div>
  );
};

export default TownhallMinuteCard;
