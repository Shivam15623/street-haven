import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import {
  useAddEmergencyContactMutation,
  useEditEmergencyContactMutation,
} from "../../../../../services/FAQapi";
import { showSuccess } from "../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";

interface EmergencyFormValues {
  label: string;
  phone: string;
}

interface EmergencyContactModalProps {
  initialData?: EmergencyFormValues; // If present, modal works as Edit
  id?: string; // Required for edit
  trigger: React.ReactNode; // Button or element to open modal
}

const EmergencyContact: React.FC<EmergencyContactModalProps> = ({
  initialData,
  id,
  trigger,
}) => {
  const [showModal, setShowModal] = useState(false);

  const [addContact,{isLoading}] = useAddEmergencyContactMutation();
  const [editContact,{isLoading:isEditing}] = useEditEmergencyContactMutation();

  const isEdit = !!initialData;

  const initialValues: EmergencyFormValues = initialData || {
    label: "",
    phone: "",
  };

  const validationSchema = Yup.object().shape({
    label: Yup.string().required("Label is required"),
    phone: Yup.string().required("Phone number is required"),
  });

  const handleSubmit = async (values: EmergencyFormValues) => {
    try {
      if (isEdit && id) {
        const res = await editContact({ id, eme: values }).unwrap();
        if (res.success) {
          showSuccess("Emergency contact updated successfully");
        }
      } else {
        const res = await addContact(values).unwrap();
        if (res.success) {
          showSuccess("Emergency contact added successfully");
        }
      }
      setShowModal(false);
    } catch (err) {
      alert(err || "Something went wrong");
    }
  };

  return (
    <>
      <span className="w-fit" onClick={() => setShowModal(true)}>
        {trigger}
      </span>

      <ModalWrapper
        show={showModal}
        size="lg"
        onHide={() => setShowModal(false)}
        title={isEdit ? "Edit Emergency Contact" : "Add Emergency Contact"}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        ModalLoader={
          <FormSubmissionLoader
            isLoading={isLoading || isEditing}
            variant="spinner" // spinner | dots | pulse | progress
            message="Saving changes..."
            subMessage="Please wait"
          />
        }
        footer={
          <button
            type="submit"
            form="emergency-form"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
          >
            {isEdit ? "Update" : "Save"}
          </button>
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form id="emergency-form">
            <BootstrapForm.Group className="mb-3 d-flex flex-column gap-8">
              <BootstrapForm.Label>Label</BootstrapForm.Label>
              <Field
                name="label"
                as={BootstrapForm.Control}
                placeholder="Enter label"
              />
              <ErrorMessage
                name="label"
                component="div"
                className="text-danger small mt-1"
              />
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3 d-flex flex-column gap-8">
              <BootstrapForm.Label>Phone</BootstrapForm.Label>
              <Field
                name="phone"
                as={BootstrapForm.Control}
                placeholder="Enter phone"
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-danger small mt-1"
              />
            </BootstrapForm.Group>
          </Form>
        </Formik>
      </ModalWrapper>
    </>
  );
};

export default EmergencyContact;
