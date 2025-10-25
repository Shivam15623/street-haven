import { Formik } from "formik";
import * as Yup from "yup";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import ImageUpload from "../../../../components/child/Imageupload";
import { useCreateTicketMutation } from "../../../../services/ticketApi";
import { showSuccess } from "../../../../utills/toastutills";

const requestSchema = Yup.object({
  reqTitle: Yup.string().required("Request Title is required"),
  description: Yup.string().required("Description is required"),
  priority: Yup.string().oneOf(["Low", "Medium", "High"]).default("Low"),
  category: Yup.string()
    .oneOf(["IT Help Desk", "Property Maintenance"])
    .required("Category is required"),
  location: Yup.string().required("location is required"),
  photo: Yup.mixed<File>().nullable(),
});
type requestticketValue = Yup.InferType<typeof requestSchema>;
interface RequestFormProps {
  onCancel: () => void;
}
const RequestForm: React.FC<RequestFormProps> = ({ onCancel }) => {
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const handlecreateTicket = async (
    values: requestticketValue,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const formData = new FormData();
      formData.append("reqTitle", values.reqTitle);
      formData.append("description", values.description);
      formData.append("priority", values.priority);
      formData.append("category", values.category);
      formData.append("location", values.location);
      if (values.photo) {
        formData.append("photo", values.photo);
      }
      const res = await createTicket(formData).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="card mb-5 ">
      <div className="card-body d-flex flex-column gap-20 p-16 p-sm-20 p-md-24">
        <h5 className="text-xl fw-semibold mb-0 ">IT Support Request</h5>
        <Formik
          initialValues={{
            reqTitle: "",
            description: "",
            priority: "Low",
            category: "IT Help Desk",
            location: "",
            photo: undefined,
          }}
          validationSchema={requestSchema}
          onSubmit={handlecreateTicket}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
          }) => (
            <div
              className={`position-relative ${
                isLoading ? "pointer-events-none" : ""
              }`}
            >
              <Form
                noValidate
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-20"
              >
                {/* Request Title */}

                <Row>
                  <Col>
                    <Form.Group
                      controlId="reqTitle"
                      className="d-flex flex-column gap-8"
                    >
                      <Form.Label className="fw-medium  text-street-dark">
                        Request Title
                      </Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        name="reqTitle"
                        placeholder="Enter your request"
                        value={values.reqTitle}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="py-12 px-16 text-street-base"
                        isInvalid={touched.reqTitle && !!errors.reqTitle}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.reqTitle}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Description */}
                <Row>
                  <Col>
                    <Form.Group
                      controlId="description"
                      className="d-flex flex-column gap-8"
                    >
                      <Form.Label className="fw-medium text-street-dark">
                        Detailed Description
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        placeholder="Please provide as much detail as possible about the issue, including any error messages, when it started, and steps you've already tried..."
                        className="py-12 px-16 text-sm text-street-base"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.description && !!errors.description}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Priority & category side by side */}
                <Row>
                  <Col>
                    <Form.Group
                      controlId="priority"
                      className="d-flex flex-column gap-8"
                    >
                      <Form.Label className="fw-medium  text-street-dark">
                        Priority
                      </Form.Label>
                      <Form.Select
                        name="priority"
                        size="sm"
                        value={values.priority}
                        onChange={handleChange}
                        className="text-street-base"
                        isInvalid={touched.priority && !!errors.priority}
                      >
                        <option value="">Select Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.priority}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group
                      controlId="category"
                      className="d-flex flex-column gap-8"
                    >
                      <Form.Label className="fw-medium text-street-dark">
                        Category
                      </Form.Label>
                      <Form.Select
                        name="category"
                        size="sm"
                        value={values.category}
                        onChange={handleChange}
                        className="text-street-base"
                        isInvalid={touched.category && !!errors.category}
                      >
                        <option value="">Select category</option>
                        {["IT Help Desk", "Property Maintenance"].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Location */}
                <Row>
                  <Col>
                    <Form.Group
                      controlId="location"
                      className="d-flex flex-column gap-8"
                    >
                      <Form.Label className="fw-medium text-street-dark">
                        Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        name="location"
                        placeholder="Enter location"
                        value={values.location}
                        className="py-12 px-16 text-street-base"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.location && !!errors.location}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.location}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Photo Upload */}
                <Row>
                  <Col>
                    <ImageUpload
                      name="photo"
                      label="Took a photo or screenshot?"
                    />
                  </Col>
                </Row>

                {/* Submit Button */}
                <div className="d-flex flex-row justify-content-end">
                  <div className="d-flex flex-row gap-13 ">
                    {" "}
                    <button
                      type="submit"
                      className="btn btn-street-primary btn-street-lg text-sm btn-md px-8 bg-street-primary w-144-px text-white fw-medium radius-12"
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onCancel();
                      }}
                      className="btn text-sm btn-md px-8 btn-street-neutral  w-144-px text-street-base fw-medium radius-12"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Form>
              {isLoading && (
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center "
                  style={{ zIndex: 10 }}
                >
                  <Spinner
                    animation="border"
                    role="status"
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderWidth: "0.25rem",
                      color: "var(--street-primary-base)",
                    }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}
            </div>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RequestForm;
