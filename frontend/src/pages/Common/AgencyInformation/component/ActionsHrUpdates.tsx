import React from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import * as yup from "yup";
import { Formik, Field, ErrorMessage } from "formik";
import { Form as BootstrapForm } from "react-bootstrap";
import { showSuccess } from "../../../../utills/toastutills";
import PdfField from "../../../../components/child/PdfField";
import type { hrUpdateData } from "../../../../interfaces/hrUpdatesInterface";
import {
  useCreatehrUpdatesMutation,
  useEdithrupdatesMutation,
} from "../../../../services/hrUpdatesApi";
import DraftEditor from "../../../../components/child/DrafEditor";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import TiptapEditor from "../../../../components/child/DrafEditor";

// ✅ Schema
const HrUpdatesFormSchema = (isEdit: boolean) =>
  yup.object().shape({
    title: yup
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters")
      .required("Title is required"),
    description: yup.string(),

    attachment: yup
      .mixed<File>()
      .nullable()
      .test("fileType", "Only PDF files are allowed", (value) => {
        if (!value) return isEdit; // required in create, optional in edit
        return value instanceof File && value.type === "application/pdf";
      })
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

  const initialValues = {
    title: update?.title || "",
    description: update?.description ?? "",
    createdAt: update?.createdAt
      ? new Date(update.createdAt).toISOString().split("T")[0] // YYYY-MM-DD
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
        ? await editUpdate({ id: update!._id, data: formData }).unwrap()
        : await createUpdate(formData).unwrap();

      if (res.success) {
        showSuccess(res.message);
        resetForm();
        onSuccess?.();
        onHide();
      }
    } catch (error) {
      console.error("Failed to save HR update:", error);
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
      footer={
        <div className="d-flex gap-2 justify-content-end">
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
            className="btn btn-street-neutral btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={HrUpdatesFormSchema(isEdit)}
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
              <TiptapEditor
                content={values.description}
                onChange={(state) => setFieldValue("description", state)}
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* Attachment */}
            <PdfField
              existingPdf={
                isEdit && update?.attachment
                  ? {
                      fileName: update.attachment.fileName,
                      fileUrl: update.attachment.fileUrl,
                    }
                  : undefined
              }
              fieldLabel="Attachment"
              name="attachment"
              isEdit={isEdit}
            />
          </BootstrapForm>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default ActionsHrUpdates;
