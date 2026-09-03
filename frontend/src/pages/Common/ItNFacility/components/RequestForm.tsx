import { Formik } from "formik";
import * as Yup from "yup";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import ImageUpload from "../../../../components/child/Imageupload";
import { useCreateTicketMutation } from "../../../../services/ticketApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import { getErrorMessage } from "../../../../utills/utills";
import { useFetchLocationsQuery } from "../../../../services/locationApi";
import { lazy } from "react";
import TicketCategorySelect from "./TicketCategorySelect";

const QuillEditor = lazy(
  () => import("../../../../components/child/QuillEditor"),
);

const requestSchema = Yup.object({
  reqTitle: Yup.string().required("Request Title is required"),
  description: Yup.string().required("Description is required"),
  category: Yup.string().required("Category is required"),
  location: Yup.string().required("Location is required"),
  photo: Yup.mixed<File>().nullable(),
});
type requestticketValue = Yup.InferType<typeof requestSchema>;

interface RequestFormProps {
  onCancel: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onCancel }) => {
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const {
    data,
    isLoading: locationLoading,
    isError: locationError,
  } = useFetchLocationsQuery({});

  const handlecreateTicket = async (
    values: requestticketValue,
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      const formData = new FormData();
      formData.append("reqTitle", values.reqTitle);
      formData.append("description", values.description);
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
      showError(getErrorMessage(error));
    }
  };

  return (
    <>
      <div className="card mb-5 ">
        <div className="card-body d-flex flex-column gap-20 p-16 p-sm-20 p-md-24">
          <h5 className="text-xl fw-semibold mb-0 ">Support Request</h5>
          <div className="position-relative d-flex flex-column gap-20 p-16 p-sm-20 p-md-24">
            {isLoading && (
              <FormSubmissionLoader
                isLoading={isLoading}
                message="Submitting Request"
                size="lg"
                variant="spinner"
              />
            )}
            <Formik
              initialValues={{
                reqTitle: "",
                description: "",
                category: "",
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
                setFieldValue,
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
                          <QuillEditor
                            content={values.description}
                            onChange={(val) =>
                              setFieldValue("description", val)
                            }
                            isInvalid={
                              touched.description && !!errors.description
                            }
                          />
                          {touched.description && errors.description && (
                            <div className="invalid-feedback d-block">
                              {errors.description}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Category — everyone gets a dropdown, super admin also gets add/edit/delete */}
                    <Row>
                      <Col>
                        <Form.Group
                          controlId="category"
                          className="d-flex flex-column gap-8"
                        >
                          <Form.Label className="fw-medium text-street-dark">
                            Category
                          </Form.Label>
                          <TicketCategorySelect
                            name="category"
                            value={values.category}
                            onChange={(id) => setFieldValue("category", id)}
                            isInvalid={touched.category && !!errors.category}
                            errorMessage={errors.category as string}
                          />
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
                          <div className="d-flex align-items-center gap-8">
                            <Form.Select
                              name="location"
                              size="sm"
                              value={values.location}
                              onChange={handleChange}
                              disabled={locationLoading || locationError}
                              className="text-street-base"
                              isInvalid={touched.location && !!errors.location}
                            >
                              <option value="">
                                {locationLoading
                                  ? "Loading locations..."
                                  : locationError
                                    ? "Failed to load locations"
                                    : "Select location"}
                              </option>
                              {data?.data.map((loc) => (
                                <option key={loc._id} value={loc._id}>
                                  {loc.name}
                                </option>
                              ))}
                            </Form.Select>
                            {locationLoading && (
                              <Spinner
                                animation="border"
                                size="sm"
                                role="status"
                              />
                            )}
                          </div>
                          {touched.location && errors.location && (
                            <div className="invalid-feedback d-block">
                              {errors.location}
                            </div>
                          )}

                          {locationError && (
                            <small className="text-danger">
                              Could not load locations. Please refresh the page.
                            </small>
                          )}
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
                </div>
              )}
            </Formik>
          </div>
        </div>
      </div>{" "}
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

export default RequestForm;
