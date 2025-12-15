import React from "react";
import { ErrorMessage, Field, Formik } from "formik";
import * as yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";

import {
  useCreateAgreementMutation,
  useEditAgreementMutation,
  type AgreementData,
} from "../../../../services/AgreementApi";

import { showError, showSuccess } from "../../../../utills/toastutills";
import CustomDatePicker from "../../../../components/child/DatePicker";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import FileField from "../../../../components/child/FileField";

// -------------------------------------------------------
// ✅ Validation Schema
// -------------------------------------------------------
const AgreementFormSchema = () =>
  yup.object().shape({
    title: yup
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters")
      .required("Title is required"),

    attachment: yup
      .mixed<File>()
      .nullable()
      .test("fileSize", "File size must be < 16MB", (value) => {
        if (!value) return true;
        return value.size <= 16 * 1024 * 1024;
      }),

    startDate: yup.date().nullable().required("Start date is required"),
    endDate: yup.date().nullable().required("End date is required"),
  });

// -------------------------------------------------------
// Types
// -------------------------------------------------------
interface ActionsAgreementProps {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
  agreementToEdit?: AgreementData;
}

const ActionsAgreement: React.FC<ActionsAgreementProps> = ({
  show,
  onHide,
  onSuccess,
  agreementToEdit,
}) => {
  const isEdit = Boolean(agreementToEdit?._id);

  const [createAgreement, { isLoading }] = useCreateAgreementMutation();
  const [editAgreement, { isLoading: isEditing }] = useEditAgreementMutation();
  const [progress, setProgress] = React.useState<number>(0);
  // -------------------------------------------------------
  // Initial Values
  // -------------------------------------------------------
  const initialValues = {
    title: agreementToEdit?.title || "",
    attachment: null as File | null,
    startDate: agreementToEdit?.effectiveStartDate
      ? new Date(agreementToEdit.effectiveStartDate)
      : null,
    endDate: agreementToEdit?.effectiveEndDate
      ? new Date(agreementToEdit.effectiveEndDate)
      : null,
  };

  // -------------------------------------------------------
  // Form Submit Handler
  // -------------------------------------------------------
  const handleSave = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const formData = new FormData();

      formData.append("title", values.title);
      if (values.startDate) {
        formData.append("startDate", values.startDate.toISOString());
      }
      if (values.endDate) {
        formData.append("endDate", values.endDate.toISOString());
      }

      if (values.attachment) {
        formData.append("attachment", values.attachment);
      }

      const res = isEdit
        ? await editAgreement({
            id: agreementToEdit!._id,
            formData,
            onProgress: (p) => setProgress(p),
          }).unwrap()
        : await createAgreement({
            data: formData,
            onProgress: (p: number) => setProgress(p),
          }).unwrap();

      if (res.success) {
        showSuccess(res.message);
        resetForm();
        onSuccess?.();
        onHide();
      }
    } catch (error) {
      console.error("Error saving agreement:", error);
      showError("An error occurred while saving the agreement.");
    }
  };

  // -------------------------------------------------------
  // JSX
  // -------------------------------------------------------
  return (
    <ModalWrapper
      show={show}
      title={isEdit ? "Edit Agreement" : "Add Agreement"}
      size="lg"
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      onHide={onHide}
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isLoading || isEditing}
          variant="progress" // spinner | dots | pulse | progress
          message="Saving changes..."
          subMessage="Please wait"
          progress={progress} // only for progress variant
        />
      }
      isLoading={isLoading || isEditing}
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="submit"
            form="agreement-form"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            disabled={isLoading || isEditing}
          >
            {isLoading || isEditing
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
              ? "Save Changes"
              : "Add Agreement"}
          </button>

          <button
            type="button"
            className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      }
    >
      {/* -------------------------------------------------------
        Formik Wrapper
      ------------------------------------------------------- */}
      <Formik
        initialValues={initialValues}
        validationSchema={AgreementFormSchema()}
        onSubmit={handleSave}
      >
        {({
          handleSubmit,
          setFieldValue,
          values,
          handleBlur,
          errors,
          touched,
          setFieldTouched,
        }) => (
          <BootstrapForm
            id="agreement-form"
            className="d-flex flex-column gap-16 gap-sm-20"
            onSubmit={handleSubmit}
          >
            {/* Title */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Title</BootstrapForm.Label>
              <Field
                name="title"
                as={BootstrapForm.Control}
                placeholder="Enter agreement title"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* Start Date */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Start Date</BootstrapForm.Label>
              <CustomDatePicker
                name="startDate"
                value={values.startDate ? new Date(values.startDate) : null}
                onChange={(date) => {
                  setFieldValue("startDate", date, true); // ← Add true to validate immediately
                  setFieldTouched("startDate", true, false); // ← false prevents double validation
                }}
                onBlur={handleBlur}
                isInvalid={!!errors.startDate && touched.startDate}
              />

              <ErrorMessage
                name="startDate"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* End Date */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>End Date</BootstrapForm.Label>
              <CustomDatePicker
                name="endDate"
                value={values.endDate ? new Date(values.endDate) : null}
                onChange={(date) => {
                  setFieldValue("endDate", date, true); // ← Add true to validate immediately
                  setFieldTouched("endDate", true, false); // ← false prevents double validation
                }}
                onBlur={handleBlur}
                isInvalid={!!errors.endDate && touched.endDate}
              />
              <ErrorMessage
                name="endDate"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* Attachment */}
            <FileField
              isEdit={isEdit}
              existingFile={
                agreementToEdit?.attachment
                  ? {
                      fileName: agreementToEdit.attachment.fileName,
                      fileUrl: agreementToEdit.attachment.fileUrl,
                    }
                  : undefined
              }
              name="attachment"
              fieldLabel="Attachment"
            />
          </BootstrapForm>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default ActionsAgreement;
