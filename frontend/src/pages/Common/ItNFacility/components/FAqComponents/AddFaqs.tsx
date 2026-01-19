import React, { useState } from "react";
import { Formik, Form, FieldArray, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useAddQuestionMutation } from "../../../../../services/FAQapi";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import { getErrorMessage } from "../../../../../utills/utills";

interface QuestCredentials {
  question: string;
  answer: string;
}

interface AddFaqsProps {
  title: string;
  id: string; // category ID
}

const AddFaqs: React.FC<AddFaqsProps> = ({ title, id }) => {
  const [showModal, setShowModal] = useState(false);
  const [addQuestions, { isLoading }] = useAddQuestionMutation();

  const initialValues = {
    faqs: [{ question: "", answer: "" }],
  };

  const validationSchema = Yup.object().shape({
    faqs: Yup.array()
      .of(
        Yup.object().shape({
          question: Yup.string().required("Question is required"),
          answer: Yup.string().required("Answer is required"),
        })
      )
      .min(1, "At least one question is required"),
  });

  const handleSubmit = async (values: { faqs: QuestCredentials[] }) => {
    try {
      const res = await addQuestions({ id, questions: values.faqs }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        setShowModal(false);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <>
      <button
        className="btn btn-street-primary d-flex  flex-row align-items-center justify-content-center radius-12 p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon className="text-lg sm:text-xl" icon={"mdi:plus"} />
      </button>

      <ModalWrapper
        show={showModal}
        size="xl"
        onHide={() => setShowModal(false)}
        title={`Add Questions to "${title}"`}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        isLoading={isLoading}
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
              form="add-faqs-form"
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            >
              Save Questions
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center text-sm justify-content-center"
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
          {({ values }) => (
            <Form id="add-faqs-form">
              <div className="border bg-street-card overflow-hidden  radius-10 mt-4">
                <FieldArray name="faqs">
                  {({ push, remove }) => (
                    <div
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        position: "relative",
                      }}
                    >
                      <div className="d-flex flex-row position-sticky top-0 question-Header align-items-center justify-content-between  p-10 mb-2 ">
                        <p className="text-lg">Questions</p>
                        <button
                          className="btn btn-street-primary btn-sm d-flex flex-row gap-2 align-items-center justify-content-center"
                          type="button"
                          onClick={() => push({ question: "", answer: "" })}
                        >
                          <Icon
                            icon="material-symbols:add"
                            width={18}
                            height={18}
                          />
                          Add
                        </button>
                      </div>

                      {/* FAQ items */}
                      <div className="p-10 ">
                        {" "}
                        {values.faqs.map((_faq, index) => (
                          <div
                            key={index}
                            className="border-0-5 rounded p-3 mb-3 overflow-hidden position-relative d-flex flex-column gap-18"
                            style={{ borderColor: "#AAAAAA" }}
                          >
                            {/* Delete button only */}
                            <div className="position-absolute top-0 end-0">
                              {values.faqs.length > 1 && (
                                <button
                                  className="btn btn-street-delete  border p-1 btn-sm d-flex align-items-center"
                                  style={{
                                    borderBottomLeftRadius: "5px",
                                    borderRadius: "0px",
                                  }}
                                  onClick={() => remove(index)}
                                >
                                  <Icon
                                    icon="material-symbols:cancel"
                                    width={16}
                                    height={16}
                                  />
                                </button>
                              )}
                            </div>

                            <BootstrapForm.Group className="mb-4 d-flex flex-column gap-8">
                              <BootstrapForm.Label className="fw-semibold">
                                Question {index + 1}
                              </BootstrapForm.Label>
                              <Field
                                name={`faqs.${index}.question`}
                                as={BootstrapForm.Control}
                                placeholder="Enter question"
                              />
                              <ErrorMessage
                                name={`faqs.${index}.question`}
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </BootstrapForm.Group>

                            <BootstrapForm.Group className="mb-4 d-flex flex-column gap-8">
                              <BootstrapForm.Label className="fw-semibold">
                                Answer
                              </BootstrapForm.Label>
                              <Field
                                name={`faqs.${index}.answer`}
                                as={BootstrapForm.Control}
                                placeholder="Enter answer"
                              />
                              <ErrorMessage
                                name={`faqs.${index}.answer`}
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </BootstrapForm.Group>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FieldArray>
              </div>
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default AddFaqs;
