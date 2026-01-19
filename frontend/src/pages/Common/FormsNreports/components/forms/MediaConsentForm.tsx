import { Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { Form } from "react-bootstrap";
import { Card } from "react-bootstrap";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { useCreatemediaConsentMutation } from "../../../../../services/FormApi";
import { showSuccess } from "../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";

// ------------------ VALIDATION SCHEMA ------------------
export const MediaConsentSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  printedName: Yup.string().required("Printed name is required"),
  date: Yup.date()
    .required("Date is required")
    .nullable()
    .test("not-future-date", "Date cannot be in the future", (val) => {
      if (!val) return true;
      const today = new Date();
      const selected = new Date(val);
      // ignore time when comparing
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return selected <= today;
    }),
});
export type MediaConsentFormValues = {
  name: string;
  printedName: string;
  date: Date | null;
};
// Reusable bullet section with nested items
export const BulletSection = ({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) => (
  <li>
    <p className="mb-12">
      <span className="fw-semibold">{title}:</span> {description}
    </p>

    {items?.length > 0 && (
      <ul className="ps-50" style={{ listStyleType: "circle" }}>
        {items.map((item, i) => (
          <li key={i} className="mb-8">
            {item}
          </li>
        ))}
      </ul>
    )}
  </li>
);

// Generic list block
export const SimpleListBlock = ({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) => (
  <ul>
    <li className="text-street-dark fw-semibold text-sm mb-12">{heading}</li>
    <li>
      <ul className="text-sm" style={{ listStyleType: "disc" }}>
        {items.map((item, i) => (
          <li key={i} className="mb-8">
            {item}
          </li>
        ))}
      </ul>
    </li>
  </ul>
);

export const MediaConsentForm = () => {
  const [createMediaConsent, { isLoading }] = useCreatemediaConsentMutation();
  const handleSubmit = async (
    values: MediaConsentFormValues,
    { resetForm }: FormikHelpers<MediaConsentFormValues>
  ) => {
    try {
      const payload = {
        name: values.name,
        printedname: values.printedName,
        date: values.date,
      };

      const res = await createMediaConsent(payload).unwrap();

      if (res.success) {
        showSuccess("Media Consent form submitted successfully");
        resetForm(); // 🔥 typesafe reset
      }
    } catch (error) {
      console.error("Error submitting Media Consent form:", error);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

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

  return (
    <>
      {" "}
      <Formik<MediaConsentFormValues>
        initialValues={{
          name: "",
          printedName: "",
          date: null,
        }}
        validationSchema={MediaConsentSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleSubmit,
          setFieldTouched,
        }) => (
          <Form className="d-flex flex-column gap-24" onSubmit={handleSubmit}>
            {/* Header Card */}
            <div className="card">
              <div className="card-body d-flex flex-column flex-sm-row gap-20 align-items-center">
                <img src="/assets/images/shForm.png" width={144} height={113} />
                <div>
                  <h4 className="text-xxl sm:text-xl text-street-dark fw-semibold mb-2">
                    MEDIA CONSENT FORM
                  </h4>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="card">
              <div className="card-body d-flex flex-column gap-20 px-24 py-16">
                <div className="d-flex flex-wrap align-items-center gap-8 text-street-dark text-sm fw-semibold">
                  <span>I</span>

                  <div className="d-flex flex-column">
                    <input
                      className="form-control h-40-px"
                      style={{ maxWidth: "588px", minWidth: "200px" }}
                      value={values.name}
                      onChange={(e) => setFieldValue("name", e.target.value)}
                    />
                    {errors.name && touched.name && (
                      <small className="text-danger">{errors.name}</small>
                    )}
                  </div>

                  <span
                    style={{
                      minWidth: 0, // 🔑 allow wrapping
                      flexGrow: 1, // take remaining space
                      textWrap: "wrap",
                    }}
                  >
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

                <SimpleListBlock heading="This consent:" items={consentItems} />
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
                      onChange={(date) => {
                        setFieldValue("date", date, true);
                        setFieldTouched("date", true, false);
                      }}
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
              <Card.Body className="d-flex flex-row justify-content-end   p-20">
                <div className="d-flex flex-row gap-10">
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
                </div>
              </Card.Body>
            </Card>
          </Form>
        )}
      </Formik>
      <FormSubmissionLoader
        isLoading={isLoading}
        size="lg"
        variant="spinner"
        message="Please Wait"
        subMessage="Processing Your Request Please Wait"
      />
    </>
  );
};

export default MediaConsentForm;
