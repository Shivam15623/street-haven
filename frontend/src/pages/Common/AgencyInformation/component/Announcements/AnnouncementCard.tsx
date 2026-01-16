import React, { useState } from "react";
import type { AnnouncementData } from "../../../../../services/AnnouncementApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import ViewFileModal from "../../../../../components/child/VIewFileModal";

import ActionsAnnouncement from "./ActionsAnnouncement";
import DeleteAnnouncement from "./DeleteAnnouncement";
import useHasPermission from "../../../../../hooks/Auth";
interface AnnouncementProps {
  announcement: AnnouncementData;
}
const AnnouncementCard: React.FC<AnnouncementProps> = ({ announcement }) => {
  const { title, _id, createdAt, message, createdBy } = announcement;
  const { hasPermission } = useHasPermission();
  const [showDelete, setShowDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Format createdAt -> MM/DD/YYYY
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div className="card" id={announcement.slug}>
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-14 radius-12">
        <div className="d-flex flex-column flex-sm-row gap-18 justify-content-between">
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
          {hasPermission({ action: "edit_announcement" }) && (
            <ActionsAnnouncement
              show={showModal}
              update={announcement}
              onHide={() => setShowModal(false)}
            />
          )}

          <div className="d-none d-sm-flex flex-row gap-8 align-items-start">
            {announcement.attachment && (
              <ViewFileModal
                attachment={announcement.attachment}
                title={title}
              />
            )}
            {hasPermission({ action: "edit_announcement" }) && (
              <button
                className="btn btn-street-neutral d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
                style={{ width: "43px", height: "40px" }}
                onClick={() => setShowModal(true)}
              >
                {" "}
                <Icon icon="mdi:pencil" className="text-sm sm:text-xl" />
              </button>
            )}
            {hasPermission({ action: "delete_announcement" }) && (
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
          <div className=" row gx-2  d-sm-none">
            <div className="col-4 ">
              <button
                className="btn btn-street-neutral d-flex text-sm  flex-row align-items-center justify-content-center gap-2 radius-12 w-100 p-0"
                style={{ height: "40px" }}
                onClick={() => setShowModal(true)}
              >
                <Icon icon="mdi:pencil" className="text-sm sm:text-xl" /> Edit
              </button>
            </div>
            <div className="col-4 ">
              <button
                className="btn btn-street-delete  d-flex text-sm flex-row align-items-center justify-content-center gap-2 radius-12 w-100 p-0"
                style={{ height: "40px" }}
                onClick={() => setShowDelete(true)}
              >
                <Icon icon="lucide:trash-2" className="text-md sm:text-sm" />{" "}
                Delete
              </button>
            </div>

            <div className="col-4 ">
              {announcement.attachment && (
                <ViewFileModal
                  attachment={announcement.attachment}
                  title={title}
                  trigger={(open) => (
                    <button
                      className="btn btn-street-outline-primary flex-grow-1 w-100 d-flex justify-content-center text-sm align-items-center gap-2 px-8 py-8 px-sm-10 radius-12"
                      style={{ height: "40px" }}
                      onClick={open}
                    >
                      <Icon icon="solar:eye-bold" className="text-sm" /> View
                    </button>
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
