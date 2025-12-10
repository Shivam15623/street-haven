import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import { Icon } from "@iconify/react/dist/iconify.js";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useEditQuestionMutation } from "../../../../../services/FAQapi";
import { showSuccess } from "../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";

interface EditQuestionProps {
  cid: string;
  qid: string;
  question: string;
  answer: string;
}

const EditQuestion: React.FC<EditQuestionProps> = ({
  cid,
  qid,
  question,
  answer,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editQuestion, { isLoading }] = useEditQuestionMutation();

  const initialValues = { question, answer };

  const validationSchema = Yup.object().shape({
    question: Yup.string().required("Question is required"),
    answer: Yup.string().required("Answer is required"),
  });

  const handleSubmit = async (values: { question: string; answer: string }) => {
    try {
      const res = await editQuestion({ cid, qid, faq: values }).unwrap();
      if (res.success) {
        showSuccess("Question updated successfully");
      }
      setShowModal(false);
    } catch (error) {
      alert(error || "Something went wrong");
    }
  };

  return (
    <>
      <Icon
        icon="material-symbols:edit"
        width={18}
        height={18}
        className="icon-street-edit  cursor-pointer"
        onClick={() => setShowModal(true)}
      />

      <ModalWrapper
        show={showModal}
        size="lg"
        onHide={() => setShowModal(false)}
        title="Edit Question"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        ModalLoader={
          <FormSubmissionLoader
            isLoading={isLoading}
            variant="spinner" // spinner | dots | pulse | progress
            message="Saving changes..."
            subMessage="Please wait"
          />
        }
        footer={
          <>
            <button
              type="submit"
              form="edit-question-form"
              disabled={isLoading}
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            >
              {isLoading ? "Saving..." : "Save"}
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
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form id="edit-question-form">
            <BootstrapForm.Group className="mb-3 d-flex flex-column gap-8">
              <BootstrapForm.Label>Question</BootstrapForm.Label>
              <Field
                name="question"
                as={BootstrapForm.Control}
                placeholder="Enter question"
              />
              <ErrorMessage
                name="question"
                component="div"
                className="text-danger small mt-1"
              />
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3 d-flex flex-column gap-8">
              <BootstrapForm.Label>Answer</BootstrapForm.Label>
              <Field
                name="answer"
                as={BootstrapForm.Control}
                placeholder="Enter answer"
              />
              <ErrorMessage
                name="answer"
                component="div"
                className="text-danger small mt-1"
              />
            </BootstrapForm.Group>
          </Form>
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default EditQuestion;
