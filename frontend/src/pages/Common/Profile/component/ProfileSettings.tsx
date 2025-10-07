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

dayjs.extend(relativeTime);
// ✅ Validation Schema
const ProfileSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  title: Yup.string().oneOf(["admin", "employee"]),
  hireDate: Yup.string(),
  timePeriod: Yup.string(),
  workEmail: Yup.string(),
  workPhone: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .required("Work phone is required"),
});
type ProfileValues = Yup.InferType<typeof ProfileSchema>;
const ProfileSettings: React.FC = () => {
  const { data: user, isLoading } = useFetchUserProfileQuery();
  const [updateUser, { isLoading: updating }] = useEditProfileMutation();
  const dispatch = useDispatch();
  const handleupdate = async (values: ProfileValues) => {
    try {
      const formdata = new FormData();
      formdata.append("firstname", values.firstName);
      formdata.append("lastname", values.lastName);
      formdata.append("phoneNo", values.workPhone);

      const res = await updateUser(formdata).unwrap();
      if (res.success) {
        showSuccess(res.message);
        const payLoad = {
          firstName: res.data.firstname,
          lastName: res.data.lastname,
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
            title: user?.data.role,
            hireDate: dayjs(user.data.createdAt).format("MM/DD/YYYY"),
            timePeriod: user?.data.createdAt
              ? dayjs(user.data.createdAt).fromNow()
              : "",
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
                  Title
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
                  Time Period
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="text"
                    size="sm"
                    name="timePeriod"
                    value={values.timePeriod}
                    disabled
                    onChange={handleChange}
                    isInvalid={touched.timePeriod && !!errors.timePeriod}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.timePeriod}
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
                    <Form.Control
                      type="text"
                      size="sm"
                      name="workPhone"
                      placeholder="+1 (416) 555-2045"
                      value={values.workPhone}
                      onChange={handleChange}
                      isInvalid={touched.workPhone && !!errors.workPhone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.workPhone}
                    </Form.Control.Feedback>
                  </div>
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
