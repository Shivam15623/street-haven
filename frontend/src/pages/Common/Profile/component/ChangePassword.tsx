import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Col, Row } from "react-bootstrap";
import PasswordInput from "../../../../components/Authentication/PasswordInput";
import { useChangePasswordMutation } from "../../../../services/UserApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";

const ChangePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

type ChangePasswordValues = Yup.InferType<typeof ChangePasswordSchema>;

const ChangePassword = () => {
  const [changepassword, { isLoading }] = useChangePasswordMutation();

  const handleChangePassword = async (
    values: ChangePasswordValues,
    resetForm: () => void
  ) => {
    try {
      const res = await changepassword(values).unwrap();
      if (res.success) {
        showSuccess(res.message);
        resetForm(); // ✅ Reset form after success
      }
    } catch (error) {
      showError(getErrorMessage(error));

      // Optionally show error toast here
    }
  };

  return (
    <div className="card">
      <div className="card-body p-16 radius-8 p-md-24 d-flex flex-column gap-20">
        <h3 className="text-street-dark text-xl fw-semibold">
          Change Password
        </h3>

        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={ChangePasswordSchema}
          onSubmit={(values, { resetForm }) =>
            handleChangePassword(values, resetForm)
          }
        >
          {({ handleSubmit, handleChange, values, errors, touched }) => (
            <Form noValidate onSubmit={handleSubmit}>
              {/* Current Password */}
              <Form.Group
                as={Row}
                className="mb-3 align-items-center"
                controlId="currentPassword"
              >
                <Form.Label column sm={2}>
                  Current Password
                </Form.Label>
                <Col sm={10} className="d-flex flex-column gap-10">
                  <PasswordInput
                    size="sm"
                    name="currentPassword"
                    value={values.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter Current Password"
                    isInvalid={
                      touched.currentPassword && !!errors.currentPassword
                    }
                    error={errors.currentPassword}
                  />
                </Col>
              </Form.Group>

              {/* New Password */}
              <Form.Group
                as={Row}
                className="mb-3 align-items-center"
                controlId="newPassword"
              >
                <Form.Label column sm={2}>
                  New Password
                </Form.Label>
                <Col sm={10}>
                  <PasswordInput
                    size="sm"
                    name="newPassword"
                    value={values.newPassword}
                    onChange={handleChange}
                    placeholder="Enter New Password"
                    isInvalid={touched.newPassword && !!errors.newPassword}
                    error={errors.newPassword}
                  />
                </Col>
              </Form.Group>

              {/* Confirm Password */}
              <Form.Group
                as={Row}
                className="mb-3 align-items-center"
                controlId="confirmPassword"
              >
                <Form.Label column sm={2}>
                  Confirm Password
                </Form.Label>
                <Col sm={10}>
                  <PasswordInput
                    size="sm"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm New Password"
                    isInvalid={
                      touched.confirmPassword && !!errors.confirmPassword
                    }
                    error={errors.confirmPassword}
                  />
                </Col>
              </Form.Group>

              {/* Buttons */}
              <div className="d-flex gap-16 justify-content-end">
                <button
                  className="btn btn-street-primary btn-street-lg d-flex flex-row align-items-center justify-content-center radius-12 w-144-px h-40-px px-8"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ChangePassword;
