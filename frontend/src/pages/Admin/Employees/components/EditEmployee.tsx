import React, { useState } from "react";
import { Formik, ErrorMessage } from "formik";
import * as yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { useEditEmployeeMutation } from "../../../../services/EmployeeApi";
import { showSuccess } from "../../../../utills/toastutills";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormImageUploader from "./FormProfileUploader";
import { PatternFormat } from "react-number-format";

const editEmployeeSchema = yup.object({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup.string()
    .matches(
      /^[A-Za-z0-9._%+-]+@streethaven\.com$/,
      "Email must be from @streethaven.com domain"
    )
    .required("Email is required"),
  phoneNo: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/,
      "Enter a valid Canadian phone number (e.g. +1 (123) 456-7890)"
    ),
  profilePic: yup.mixed<File>().nullable(),
});

type EditEmployeeValues = yup.InferType<typeof editEmployeeSchema>;

interface EditEmployeeProps {
  initialValues: EditEmployeeValues;
  id: string;
  profilePic: string | null;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({
  initialValues,
  id,
  profilePic,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, { isLoading }] = useEditEmployeeMutation();

  const handleSave = async (values: EditEmployeeValues) => {
    try {
      const formData = new FormData();
      formData.append("firstname", values.firstname);
      formData.append("lastname", values.lastname);
      formData.append("email", values.email);
      formData.append("phoneNo", values.phoneNo);

      if (values.profilePic) {
        formData.append("profilePic", values.profilePic);
      }

      const res = await editEmployee({ id, data: formData }).unwrap();
      if (res.success) showSuccess(res.message);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save employee:", err);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-street-edit radius-12 d-flex flex-row align-items-center justify-content-center p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon icon="tabler:edit" className="text-xl" />
      </button>

      <ModalWrapper
        show={showModal}
        title="Edit Employee Profile"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="submit"
              form="edit-employee-form"
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={editEmployeeSchema}
          onSubmit={handleSave}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <BootstrapForm
              id="edit-employee-form"
              className="d-flex flex-column gap-18"
              onSubmit={handleSubmit}
            >
              {/* Profile Picture */}
              <div className="d-flex flex-row align-items-center justify-content-center">
                <FormImageUploader
                  setFieldValue={setFieldValue}
                  value={values.profilePic}
                  imageUrl={profilePic}
                />
              </div>

              {/* First Name */}
              <BootstrapForm.Group className="d-flex flex-column gap-8">
                <BootstrapForm.Label>First Name</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  value={values.firstname}
                  isInvalid={!!errors.firstname && touched.firstname}
                  onChange={(e) => setFieldValue("firstname", e.target.value)}
                />
                <BootstrapForm.Control.Feedback type="invalid">
                  <ErrorMessage name="firstname" />
                </BootstrapForm.Control.Feedback>
              </BootstrapForm.Group>

              {/* Last Name */}
              <BootstrapForm.Group className="d-flex flex-column gap-8">
                <BootstrapForm.Label>Last Name</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="text"
                  value={values.lastname}
                  isInvalid={!!errors.lastname && touched.lastname}
                  onChange={(e) => setFieldValue("lastname", e.target.value)}
                />
                <BootstrapForm.Control.Feedback type="invalid">
                  <ErrorMessage name="lastname" />
                </BootstrapForm.Control.Feedback>
              </BootstrapForm.Group>

              {/* Email */}
              <BootstrapForm.Group className="d-flex flex-column gap-8">
                <BootstrapForm.Label>Email</BootstrapForm.Label>
                <BootstrapForm.Control
                  type="email"
                  value={values.email}
                  isInvalid={!!errors.email && touched.email}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                />
                <BootstrapForm.Control.Feedback type="invalid">
                  <ErrorMessage name="email" />
                </BootstrapForm.Control.Feedback>
              </BootstrapForm.Group>

              {/* Phone Number */}
              <BootstrapForm.Group className="d-flex flex-column gap-8">
                <BootstrapForm.Label>Phone Number</BootstrapForm.Label>
                <PatternFormat
                  format="+1 (###) ###-####"
                  allowEmptyFormatting
                  mask="_"
                  name="phoneNo"
                  className={`form-control ${
                    touched.phoneNo && errors.phoneNo ? "is-invalid" : ""
                  }`}
                  placeholder="+1 (123) 456-7890"
                  value={values.phoneNo}
                  onValueChange={(valuesObj) =>
                    setFieldValue("phoneNo", valuesObj.formattedValue)
                  }
                />
                <BootstrapForm.Control.Feedback type="invalid">
                  <ErrorMessage name="phoneNo" />
                </BootstrapForm.Control.Feedback>
              </BootstrapForm.Group>
            </BootstrapForm>
          )}
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default EditEmployee;
