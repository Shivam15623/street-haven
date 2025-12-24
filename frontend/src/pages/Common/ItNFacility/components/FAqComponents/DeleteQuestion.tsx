import React, { useState } from "react";

import { Icon } from "@iconify/react/dist/iconify.js";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useDeleteQuestionMutation } from "../../../../../services/FAQapi";

interface DeleteQuestionProps {
  cid: string;
  qid: string;
  question: string;
}

const DeleteQuestion: React.FC<DeleteQuestionProps> = ({
  cid,
  qid,
  question,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteQuestion, { isLoading }] = useDeleteQuestionMutation();

  const handleDelete = async () => {
    try {
      await deleteQuestion({ cid, qid }).unwrap();
      setShowModal(false);
      console.log("Question deleted successfully");
    } catch (error) {
      console.log(error || "Something went wrong");
    }
  };

  return (
    <>
      <Icon
        icon="material-symbols:delete-outline"
        className="icon-street-delete cursor-pointer"
        width={18}
        height={18}
        onClick={() => setShowModal(true)}
      />

      <ModalWrapper
        show={showModal}
        size="lg"
        onHide={() => setShowModal(false)}
        title="Delete Question"
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
          Are you sure you want to delete the question "
          <strong>{question}</strong>"? This action cannot be undone.
        </p>
      </ModalWrapper>
    </>
  );
};

export default DeleteQuestion;
