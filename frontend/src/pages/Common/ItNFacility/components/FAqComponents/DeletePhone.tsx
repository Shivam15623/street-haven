import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useDeleteEmergencyContactMutation } from "../../../../../services/FAQapi";
import { Icon } from "@iconify/react/dist/iconify.js";

interface DeleteEmergencyContactProps {
  id: string;
  label: string;
}

const DeleteEmergencyContact: React.FC<DeleteEmergencyContactProps> = ({
  id,
  label,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteContact] = useDeleteEmergencyContactMutation();

  const handleDelete = async () => {
    try {
      await deleteContact({ id }).unwrap();
      setShowModal(false);
      console.log("Emergency contact deleted successfully");
    } catch (err) {
      console.log(err || "Something went wrong");
    }
  };

  return (
    <>
      <Icon
        className="icon-street-delete text-lg"
        icon="lucide:trash-2"
        onClick={() => setShowModal(true)}
      />

      <ModalWrapper
        show={showModal}
        size="lg"
        onHide={() => setShowModal(false)}
        title="Confirm Delete"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        footer={
          <>
            <button
              className="btn btn-street-delete btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{label}</strong> from
          emergency contacts?
        </p>
      </ModalWrapper>
    </>
  );
};

export default DeleteEmergencyContact;
