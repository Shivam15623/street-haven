import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { Formik } from "formik";
import { Form } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import {
  BulletSection,
  MediaConsentSchema,
  SimpleListBlock,
  type MediaConsentFormValues,
} from "../forms/MediaConsentForm";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { MediaConsent } from "../../../../../services/FormApi";

const mediaSections = [
  {
    title: "Photography",
    description: "Record video footage of me including but not limited to:",
    items: [
      "Training materials",
      "Promotional videos",
      "Virtual event presentations",
      "Social media content",
    ],
  },
  {
    title: "Audio Recording",
    description: "Record my voice for:",
    items: [
      "Promotional materials",
      "Training resources",
      "Podcast appearances",
      "Media interviews",
    ],
  },
  {
    title: "Written Materials",
    description: "Use my name, position title, and written statements in:",
    items: [
      "Organizational publications",
      "Grant applications",
      "Website content",
      "Media releases",
    ],
  },
  {
    title: "Social Media",
    description:
      "Feature my image, name, and work-related content on the organization's social media platforms.",
    items: [],
  },
];

const understandItems = [
  "Street Haven at the Crossroads may use approved media content for promotional, educational, and fundraising purposes.",
  "Content may be used across multiple platforms and materials without additional consent",
  "I will not receive compensation for the use of my likeness or statements.",
  "The organization retains the right to edit content for length, clarity, and appropriateness.",
  "I may request removal of content, though the organization cannot guarantee removal from all previously distributed materials.",
];

const consentItems = [
  "Remains in effect throughout my employment unless revoked in writing.",
  "May be modified or revoked by me at any time with 30 days written notice.",
  "Will be reviewed annually or upon significant role changes.",
  "May be limited by the organization for safety or operational reasons.",
];

const acknowledegItems = [
  "I have read and understood this consent form",
  "I have been given the opportunity to ask questions",
  "I understand my rights regarding personal information and media use",
  "I understand the unique confidentiality requirements of working in a women's shelter",
  "I can modify or revoke this consent at any time",
  "I am signing this voluntarily without coercion",
];
interface EditMediaConsentProps {
  data: MediaConsent;
}
const EditMediaConsent: React.FC<EditMediaConsentProps> = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon icon="tabler:edit" className="text-xl" />
      </button>
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        title="Employee Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32"
        bodyClassName="p-0"
      >
        
            {" "}
            <Formik<MediaConsentFormValues>
              initialValues={{
                name: data.name,
                printedName: data.printedname,
                date: new Date(data.date),
              }}
              validationSchema={MediaConsentSchema}
              onSubmit={() => {}}
            >
              {({ values, errors, touched, setFieldValue, handleSubmit }) => (
                <Form
                  className="d-flex flex-column gap-24"
                  onSubmit={handleSubmit}
                >
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
                            onChange={(e) =>
                              setFieldValue("name", e.target.value)
                            }
                          />
                          {errors.name && touched.name && (
                            <small className="text-danger">{errors.name}</small>
                          )}
                        </div>

                        <span>
                          , understand that I may be asked to participate in
                          various media-related activities including but not
                          limited to
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
                          <label className="text-xs text-street-dark">
                            Date
                          </label>

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
                </Form>
              )}
            </Formik>
 
      </ModalWrapper>
    </>
  );
};

export default EditMediaConsent;
