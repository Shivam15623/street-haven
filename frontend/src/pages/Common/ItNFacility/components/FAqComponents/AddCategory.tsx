import React, { useState } from "react";
import { Formik, Form, FieldArray, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Form as BootstrapForm} from "react-bootstrap";

import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useCreateCategoryMutation } from "../../../../../services/FAQapi";
import { Icon } from "@iconify/react/dist/iconify.js";

interface QuestCredentials {
  question: string;
  answer: string;
}

interface FaqCredentials {
  title: string;
  faqs: QuestCredentials[];
}

const AddCategory: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [createCategory] = useCreateCategoryMutation();

  const initialValues: FaqCredentials = {
    title: "",
    faqs: [{ question: "", answer: "" }],
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Category title is required"),
    faqs: Yup.array()
      .of(
        Yup.object().shape({
          question: Yup.string().required("Question is required"),
          answer: Yup.string().required("Answer is required"),
        })
      )
      .min(1, "At least one question is required"),
  });

  const handleSubmit = async (values: FaqCredentials) => {
    try {
      await createCategory(values).unwrap();
      setShowModal(false);
      alert("FAQ Category created successfully");
    } catch (error) {
      alert(error || "Something went wrong");
    }
  };

  return (
    <>
      <button
        className="btn btn-street-primary btn-street-lg radius-12 d-flex gap-2 align-items-center text-sm justify-content-center"
        onClick={() => setShowModal(true)}
      >
        Add FAQ <Icon className="text-xl" icon={"mdi:plus"} />
      </button>

      <ModalWrapper
        show={showModal}
        size="xl"
        onHide={() => setShowModal(false)}
        title="Create FAQ Category"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        footer={
          <>
            <button
              type="submit"
              form="faq-category-form"
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            >
              Save Category
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
          {({ values }) => (
            <Form id="faq-category-form" className="d-flex flex-column gap-10">
              {/* Category Title */}
              <BootstrapForm.Group className="mb-4 d-flex flex-column gap-8">
                <BootstrapForm.Label className="fw-bold">
                  Category Title
                </BootstrapForm.Label>
                <Field
                  name="title"
                  as={BootstrapForm.Control}
                  placeholder="Enter category title"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-danger small mt-1"
                />
              </BootstrapForm.Group>

              {/* Questions Array - Scrollable */}
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
                        {values.faqs.map((faq, index) => (
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

export default AddCategory;
