import { useState } from "react";
import HrUpdatesView from "./HrUpdatesView";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { hrUpdateData } from "../../../../interfaces/hrUpdatesInterface";
import useHasPermission from "../../../../hooks/Auth";
import ActionsHrUpdates from "./ActionsHrUpdates";
import DeleteHrUpdate from "./deleteHrUpdates";
import "react-quill/dist/quill.snow.css";
const HRUpdateCard = ({ update }: { update: hrUpdateData }) => {
  const { title, _id, createdAt, description, createdBy } = update;
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
              dangerouslySetInnerHTML={{ __html: description }}
            />
            <div className="d-flex flex-row gap-24 align-items-center text-street-base">
              <p className="d-flex flex-row align-items-center text-xs gap-8">
                <Icon
                  icon="uit:calender"
                  className="text-xs text-street-primary"
                />
                <span>{formattedDate}</span>
              </p>
              <p className="d-flex flex-row align-items-center text-xs gap-8">
                <Icon
                  icon="octicon:people-24"
                  className="text-xs text-street-primary"
                />
                <span>
                  {createdBy.firstname} {createdBy.lastname}
                </span>
              </p>
            </div>
          </div>
          {isAdmin && (
            <ActionsHrUpdates
              show={showModal}
              update={update}
              onHide={() => setShowModal(false)}
            />
          )}

          <div className="d-flex flex-row gap-8 align-items-start">
            <HrUpdatesView update={update} />
            {isAdmin && (
              <button
                className="btn btn-street-neutral d-flex align-items-center w-43-px px-8 py-8 px-sm-10 radius-12"
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
                  className="btn btn-outline-danger d-flex align-items-center w-43-px px-8 py-8 px-sm-10 radius-12"
                >
                  Delete
                </button>

                <DeleteHrUpdate
                  id={_id}
                  show={showDelete}
                  onHide={() => setShowDelete(false)}
                  onSuccess={() => console.log("Deleted successfully")}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRUpdateCard;
