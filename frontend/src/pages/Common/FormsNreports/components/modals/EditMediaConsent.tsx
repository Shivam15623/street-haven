import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { Formik } from "formik";
import { Card, Form} from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";

const EditMediaConsent = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        title="Employee Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32"
        bodyClassName="p-0"
      >
        <Formik<MediaConsentFormValues>
          initialValues={{
            name: "",
            printedName: "",
            date: null,
          }}
          validationSchema={MediaConsentSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, handleSubmit }) => (
            <Form className="d-flex flex-column gap-24" onSubmit={handleSubmit}>
              {/* Header Card */}
             

              {/* Form Card */}
              <div className="card">
                <div className="card-body d-flex flex-column gap-20 px-24 py-16">
                  <div className="d-flex align-items-center gap-8 text-street-dark text-sm fw-semibold">
                    <span>I</span>

                    <div className="d-flex flex-column">
                      <input
                        className="form-control h-40-px"
                        style={{ maxWidth: "588px" }}
                        value={values.name}
                        onChange={(e) => setFieldValue("name", e.target.value)}
                      />
                      {errors.name && touched.name && (
                        <small className="text-danger">{errors.name}</small>
                      )}
                    </div>

                    <span>
                      , understand that I may be asked to participate in various
                      media-related activities including but not limited to
                    </span>
                  </div>

                  <ul
                    className="text-street-dark text-sm ms-3"
                    style={{ listStyleType: "disc" }}
                  >
                    {mediaSections.map((section, i) => (
                      <BulletSection key={i} {...section} />
                    ))}
                  </ul>

                  <SimpleListBlock
                    heading="I understand that:"
                    items={understandItems}
                  />

                  <SimpleListBlock
                    heading="This consent:"
                    items={consentItems}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="card">
                <div className="card-body d-flex flex-column gap-20 px-24 py-16">
                  <h4 className="mb-0 text-xl text-street-dark fw-semibold">
                    STAFF ACKNOWLEDGMENT
                  </h4>

                  <SimpleListBlock
                    heading="By signing below, I acknowledge that:"
                    items={acknowledegItems}
                  />

                  <div className="d-flex w-full flex-row gap-20">
                    <div className="d-flex flex-column gap-8">
                      <label className="text-xs text-street-dark">Date</label>

                      <CustomDatePicker
                        value={values.date}
                        onChange={(date) => setFieldValue("date", date)}
                      />

                      {errors.date && touched.date && (
                        <small className="text-danger">{errors.date}</small>
                      )}
                    </div>

                    <div className="d-flex flex-column gap-8">
                      <label className="text-xs text-street-dark">
                        Printed Name
                      </label>

                      <input
                        className="form-control h-40-px"
                        value={values.printedName}
                        onChange={(e) =>
                          setFieldValue("printedName", e.target.value)
                        }
                      />

                      {errors.printedName && touched.printedName && (
                        <small className="text-danger">
                          {errors.printedName}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex flex-row justify-content-end gap-10 p-20">
                  <button
                    className="btn btn-street-lg btn-street-outline-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                    type="button"
                    onClick={() =>
                      handleDownload(
                        "https://res.cloudinary.com/dskzp8jlm/image/upload/v1764757685/Media_Consent_Form_nopwfz.pdf",
                        "Media Consent Form"
                      )
                    }
                  >
                    Download
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-street-lg btn-street-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                  >
                    {isLoading ? "Submitting..." : "Submit"}
                  </button>
                </Card.Body>
              </Card>
            </Form>
          )}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default EditMediaConsent;
