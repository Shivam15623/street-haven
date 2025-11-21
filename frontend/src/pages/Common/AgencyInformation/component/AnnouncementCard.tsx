import React, { useState } from "react";
import type { AnnouncementData } from "../../../../services/AnnouncementApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import ViewFileModal from "../../../../components/child/VIewFileModal";
import useHasPermission from "../../../../hooks/Auth";

import ActionsAnnouncement from "./ActionsAnnouncement";
import DeleteAnnouncement from "./DeleteAnnouncement";
interface AnnouncementProps {
  announcement: AnnouncementData;
}
const AnnouncementCard: React.FC<AnnouncementProps> = ({ announcement }) => {
  const { title, _id, createdAt, message, createdBy } = announcement;
  const { isAdmin } = useHasPermission();
  const [showDelete, setShowDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Format createdAt -> MM/DD/YYYY
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-14 radius-12">
        <div className="d-flex flex-row justify-content-between">
          <div className="d-flex flex-column flex-grow-1 gap-10">
            <p className="text-md text-street-dark fw-semibold">{title}</p>
            <div
              className="prose flex-grow-1"
              dangerouslySetInnerHTML={{ __html: message }}
            />
            <div className="d-flex flex-row gap-24 align-items-center text-street-base">
              <p className="d-flex flex-row align-items-center text-xs gap-8">
                <Icon
                  icon="uis:calender"
                  className="text-xs text-street-primary"
                />
                <span>{formattedDate}</span>
              </p>
              <p className="d-flex flex-row align-items-center text-xs gap-8">
                <Icon
                  icon="fa6-solid:user-group"
                  className="text-xs text-street-primary"
                />
                <span>
                  {createdBy.firstname} {createdBy.lastname}
                </span>
              </p>
            </div>
          </div>
          {isAdmin && (
            <ActionsAnnouncement
              show={showModal}
              update={announcement}
              onHide={() => setShowModal(false)}
            />
          )}

          <div className="d-flex flex-row gap-8 align-items-start">
            {announcement.attachment && (
              <ViewFileModal
                attachment={announcement.attachment}
                title={title}
              />
            )}

            {isAdmin && (
              <button
                className="btn btn-street-neutral d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                style={{ width: "43px", height: "40px" }}
                onClick={() => setShowModal(true)}
              >
                {" "}
                <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowDelete(true)}
                  className="btn btn-street-delete d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                  style={{ width: "43px", height: "40px" }}
                >
                  <Icon icon="lucide:trash-2" className="text-sm sm:text-xl" />
                </button>

                <DeleteAnnouncement
                  id={_id}
                  show={showDelete}
                  onHide={() => setShowDelete(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
