import React from "react";

import * as yup from "yup";
import { Formik, Field, ErrorMessage } from "formik";
import { Form as BootstrapForm } from "react-bootstrap";
import {
  useCreatehrUpdatesMutation,
  useEdithrupdatesMutation,
} from "../../../../../services/hrUpdatesApi";
import type { hrUpdateData } from "../../../../../interfaces/hrUpdatesInterface";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";
import QuillEditor from "../../../../../components/child/QuillEditor";
import FileField from "../../../../../components/child/FileField";
import { getAxiosErrorMessage } from "../../../../../utills/utills";

// ✅ Schema
const HrUpdatesFormSchema = () =>
  yup.object().shape({
    title: yup
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters")
      .required("Title is required"),
    description: yup
      .string()
      .min(10, "Description must be at least 10 characters long")
      .test(
        "min-text-length",
        "Description must be at least 10 characters",
        (value) => getPlainTextLength(value || "") >= 10
      )
      .required(),
    attachment: yup
      .mixed<File>()
      .nullable()
      .test("fileSize", "File size must be less than 16MB", (value) => {
        if (!value) return true;
        return value.size <= 16 * 1024 * 1024;
      }),
  });
interface HrUpdateValue {
  title: string;
  description: string;
  attachment: File | null;
}
const getPlainTextLength = (html: string) => {
  if (!html) return 0;
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.trim().length || 0;
};

// ✅ FormData builder
const buildFormData = (values: HrUpdateValue) => {
  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("description", values.description);
  if (values.attachment) formData.append("attachment", values.attachment);

  return formData;
};

type ActionsHrUpdatesProps = {
  update?: hrUpdateData;
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

const ActionsHrUpdates: React.FC<ActionsHrUpdatesProps> = ({
  update,
  onHide,
  show,
  onSuccess,
}) => {
  const isEdit = Boolean(update?._id);

  const [createUpdate, { isLoading }] = useCreatehrUpdatesMutation();
  const [editUpdate, { isLoading: isEditing }] = useEdithrupdatesMutation();
  const [progress, setProgress] = React.useState<number>(0);
  const initialValues = {
    title: update?.title || "",
    description: update?.description ?? "",
    createdAt: update?.createdAt
      ? new Date(update.createdAt) // YYYY-MM-DD
      : "",
    attachment: null,
  };

  const handleSave = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const formData = buildFormData(values);

      const res = isEdit
        ? await editUpdate({
            id: update!._id,
            data: formData,
            onProgress: (p) => setProgress(p),
          }).unwrap()
        : await createUpdate({
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
      showError(getAxiosErrorMessage(error));
    }
  };

  return (
    <ModalWrapper
      show={show}
      title={isEdit ? "Edit HR Update" : "Add HR Update"}
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
        <div className="d-flex justify-content-end gap-3">
          <button
            type="submit"
            form="hr-updates-form"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            disabled={isLoading || isEditing}
          >
            {isLoading || isEditing
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
              ? "Save Changes"
              : "Add Update"}
          </button>
          <button
            className="btn btn-street-neutral btn-street-lg radius-12 d-none d-sm-flex align-items-center text-sm justify-content-center"
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={HrUpdatesFormSchema()}
        onSubmit={handleSave}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <BootstrapForm
            id="hr-updates-form"
            className="d-flex flex-column gap-16 gap-sm-20"
            onSubmit={handleSubmit}
          >
            {/* Title */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Title</BootstrapForm.Label>
              <Field
                name="title"
                as={BootstrapForm.Control}
                placeholder="Enter update title"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* Description */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Description</BootstrapForm.Label>
              <QuillEditor
                content={values.description}
                onChange={(state) => setFieldValue("description", state)}
                features={{
                  align: false,
                  backgroundColor: true,
                  color: true,
                  emoji: true,
                  headings: true,
                  link: true,
                  lists: true,
                }}
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* Attachment */}
            <FileField
              isEdit={true}
              existingFile={
                update?.attachment
                  ? {
                      fileName: update?.attachment.fileName,
                      fileUrl: update?.attachment.fileUrl,
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

export default ActionsHrUpdates;
