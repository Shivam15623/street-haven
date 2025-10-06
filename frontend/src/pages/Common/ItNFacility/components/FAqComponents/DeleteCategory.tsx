import React, { useState } from "react";

import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useDeleteCategoryMutation } from "../../../../../services/FAQapi"; // adjust path
import { showSuccess } from "../../../../../utills/toastutills";
import { Icon } from "@iconify/react/dist/iconify.js";

interface DeleteCategoryProps {
  id: string;
  title: string;
}

const DeleteCategory: React.FC<DeleteCategoryProps> = ({ id, title }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    try {
      const res = await deleteCategory({ id }).unwrap();
      if (res.success) {
        setShowModal(false);
        showSuccess(`Category "${title}" deleted successfully`);
      }
    } catch (error) {
      alert(error || "Something went wrong");
    }
  };

  return (
    <>
      <button
        className="text-lg btn btn-street-delete btn-sm  d-flex flex-row align-items-center justify-content-center"
        onClick={() => setShowModal(true)}
      >
        <Icon icon="lucide:trash-2" />
      </button>

      <ModalWrapper
        show={showModal}
        size="lg"
        onHide={() => setShowModal(false)}
        title="Delete FAQ Category"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        footer={
          <>
            <button
              className="btn btn-street-delete btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
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
          Are you sure you want to delete the category "<strong>{title}</strong>
          "? This action cannot be undone.
        </p>
      </ModalWrapper>
    </>
  );
};

export default DeleteCategory;
