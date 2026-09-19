import * as Yup from "yup";
import { Formik } from "formik";
import { Col, Form, Row } from "react-bootstrap";

import ModalWrapper from "../../../../components/child/ModalWrapper";
import PasswordInput from "../../../../components/Authentication/PasswordInput";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";

import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";

import { useChangeEmployeePasswordMutation } from "../../../../services/EmployeeApi";

interface ChangePasswordValues {
  newPassword: string;
  confirmPassword: string;
}

interface ChangeEmployeePasswordProps {
  employeeId: string;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const ChangePasswordSchema = Yup.object({
  newPassword: Yup.string()
    .required("New Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[A-Z]/,
      "Must contain at least one uppercase letter",
    )
    .matches(
      /[a-z]/,
      "Must contain at least one lowercase letter",
    )
    .matches(
      /\d/,
      "Must contain at least one number",
    )
    .matches(
      /[@$!%*?&#]/,
      "Must contain at least one special character",
    ),

  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf(
      [Yup.ref("newPassword")],
      "Passwords must match",
    ),
});

const ChangeEmployeePassword = ({
  employeeId,
  showModal,
  setShowModal,
}: ChangeEmployeePasswordProps) => {
  const [changeEmployeePassword, { isLoading }] =
    useChangeEmployeePasswordMutation();

  const handleChangePassword = async (
    values: ChangePasswordValues,
  ) => {
    try {
      const res = await changeEmployeePassword({
        id: employeeId,
        data: values,
      }).unwrap();

      if (res.success) {
        showSuccess(res.message);
        setShowModal(false);
      }
    } catch (error: unknown) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <ModalWrapper
      show={showModal}
      title="Change Password"
      size="md"
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      onHide={() => setShowModal(false)}
      isLoading={isLoading}
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isLoading}
          variant="spinner"
        />
      }
      footer={
        <div className="d-flex justify-content-end gap-3">
          <button
            type="submit"
            form="change-password-form"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            disabled={isLoading}
          >
            {isLoading ? "Changing..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center text-sm justify-content-center"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>
      }
    >
      <Formik<ChangePasswordValues>
        initialValues={{
          newPassword: "",
          confirmPassword: "",
        }}
        validationSchema={ChangePasswordSchema}
        onSubmit={handleChangePassword}
      >
        {({
          handleSubmit,
          handleChange,
          values,
          touched,
          errors,
        }) => (
          <Form
            noValidate
            id="change-password-form"
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-16"
          >
            <Row>
              <Col>
                <Form.Group
                  controlId="newPassword"
                  className="d-flex flex-column gap-1"
                >
                  <Form.Label className="fw-normal m-0">
                    New Password
                  </Form.Label>

                  <PasswordInput
                    name="newPassword"
                    value={values.newPassword}
                    onChange={handleChange}
                    isInvalid={
                      touched.newPassword &&
                      !!errors.newPassword
                    }
                    error={errors.newPassword}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group
                  controlId="confirmPassword"
                  className="d-flex flex-column gap-1"
                >
                  <Form.Label className="fw-normal m-0">
                    Confirm Password
                  </Form.Label>

                  <PasswordInput
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    isInvalid={
                      touched.confirmPassword &&
                      !!errors.confirmPassword
                    }
                    error={errors.confirmPassword}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default ChangeEmployeePassword;