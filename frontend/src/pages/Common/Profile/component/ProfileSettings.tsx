import React from "react";
import { Formik, Form as FormikForm } from "formik";
import { Form, Row, Col } from "react-bootstrap";
import * as Yup from "yup";
import { Icon } from "@iconify/react/dist/iconify.js";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useEditProfileMutation,
  useFetchUserProfileQuery,
} from "../../../../services/UserApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { useDispatch } from "react-redux";
import { UpdateUserDetails } from "../../../../redux/AuthSlice";
import { PatternFormat } from "react-number-format";
import { ROLES } from "../../../../interfaces/AuthInterfaces";

dayjs.extend(relativeTime);
// ✅ Validation Schema
function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
const ProfileSchema = Yup.object({
  firstName: Yup.string(),
  lastName: Yup.string(),
  title: Yup.string().oneOf(Object.values(ROLES).map((p) => formatRole(p))),
  hireDate: Yup.string(),

  workEmail: Yup.string(),
  workPhone: Yup.string().matches(
    /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
    "Enter a valid 10-digit Canadian phone number"
  ),
});
type ProfileValues = Yup.InferType<typeof ProfileSchema>;
const ProfileSettings: React.FC = () => {
  const { data: user, isLoading } = useFetchUserProfileQuery();
  const [updateUser, { isLoading: updating }] = useEditProfileMutation();
  const dispatch = useDispatch();
  const handleupdate = async (values: ProfileValues) => {
    try {
      const formdata = new FormData();
      // if (values.firstName) formdata.append("firstname", values.firstName);
      // if (values.lastName) formdata.append("lastname", values.lastName);
      if (values.workPhone) formdata.append("phoneNo", values.workPhone);

      const res = await updateUser(formdata).unwrap();
      if (res.success) {
        showSuccess(res.message);
        const payLoad = {
          // firstName: res.data.firstname,
          // lastName: res.data.lastname,
          phoneNo: res.data.phoneNo,
        };
        dispatch(UpdateUserDetails(payLoad));
      }
    } catch (error: any) {
      showError(error.data.message);
    }
  };
  if (isLoading || !user?.data) {
    return <div>Loading...</div>;
  }
  return (
    <div className="card">
      <div className="card-body p-16 radius-8 p-md-24  d-flex flex-column gap-20">
        <h3 className="text-street-dark text-xl fw-semibold">Settings</h3>

        <Formik
          initialValues={{
            firstName: user?.data.firstname,
            lastName: user?.data.lastname,
            title: user?.data.role ? formatRole(user?.data.role) : "employee",
            hireDate: dayjs(user.data.hireDate).format("MM/DD/YYYY"),
            timePeriod: dayjs(user.data.hireDate).fromNow(),
            workEmail: user?.data.email || "",
            workPhone: user?.data.phoneNo || "",
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleupdate}
        >
          {({ handleSubmit, handleChange, values, touched, errors }) => (
            <Form noValidate onSubmit={handleSubmit} as={FormikForm}>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  First Name
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    disabled={true}
                    isInvalid={touched.firstName && !!errors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Last Name
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="lastName"
                    value={values.lastName}
                    disabled={true}
                    onChange={handleChange}
                    isInvalid={touched.lastName && !!errors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Account Type
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="title"
                    value={values.title}
                    disabled
                    onChange={handleChange}
                    isInvalid={touched.title && !!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Hire Date
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    name="hireDate"
                    value={values.hireDate}
                    disabled
                    onChange={handleChange}
                    isInvalid={touched.hireDate && !!errors.hireDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.hireDate}
                  </Form.Control.Feedback>
                </Col>
              </Row>

              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Work Email
                </Form.Label>
                <Col sm={10}>
                  <div className="icon-field">
                    <span className="icon">
                      <Icon
                        icon="mdi-light:email"
                        className="text-street-base"
                      />
                    </span>
                    <Form.Control
                      type="text"
                      name="workEmail"
                      placeholder="jane.doe@streethaven.org"
                      value={values.workEmail}
                      disabled
                      onChange={handleChange}
                      isInvalid={touched.workEmail && !!errors.workEmail}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.workEmail}
                    </Form.Control.Feedback>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3 align-items-center">
                <Form.Label column sm={2}>
                  Work Phone
                </Form.Label>
                <Col sm={10}>
                  <div className="icon-field">
                    <span className="icon">
                      <Icon
                        icon="famicons:call-outline"
                        className="text-street-base"
                      />
                    </span>
                    <PatternFormat
                      format="+1 (###) ###-####"
                      allowEmptyFormatting
                      mask="_"
                      name="workPhone"
                      className={`form-control ${
                        touched.workPhone && errors.workPhone
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="+1 (123) 456-7890"
                      value={values.workPhone}
                      onValueChange={(valuesObj) => {
                        handleChange({
                          target: {
                            name: "workPhone",
                            value: valuesObj.formattedValue, // e.g. "+1 (647) 222-9988"
                          },
                        });
                      }}
                    />
                  </div>
                  {touched.workPhone && errors.workPhone && (
                    <div className="invalid-feedback d-block">
                      {errors.workPhone}
                    </div>
                  )}
                </Col>
              </Row>
              <div className="d-flex gap-16 justify-content-end">
                <button
                  type="submit"
                  className="btn btn-street-primary btn-street-lg d-flex flex-row align-items-center justify-content-center radius-12 px-8"
                  disabled={updating} // disable while loading
                >
                  {updating && (
                    <span className="spinner-border spinner-border-sm me-2" />
                  )}
                  {updating ? "Updating..." : "Submit"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProfileSettings;
