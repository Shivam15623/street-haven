import React from "react";

import { ErrorMessage, Field, Formik } from "formik";
import * as yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import {
  useCreateAnnouncementMutation,
  useEditAnnouncementMutation,
  type AnnouncementData,
} from "../../../../../services/AnnouncementApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";
import QuillEditor from "../../../../../components/child/QuillEditor";
import FileField from "../../../../../components/child/FileField";
import { getAxiosErrorMessage } from "../../../../../utills/utills";

// ✅ Schema
const AnnouncementsFormSchema = () =>
  yup.object().shape({
    title: yup
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters")
      .required("Title is required"),
    message: yup.string(),
    attachment: yup
      .mixed<File>()
      .nullable()
      .test("fileSize", "File size must be less than 16MB", (value) => {
        if (!value) return true;
        return value.size <= 16 * 1024 * 1024;
      }),
  });
interface AnnouncementValue {
  title: string;
  message: string;
  attachment: File | null;
}

// ✅ FormData builder
const buildFormData = (values: AnnouncementValue) => {
  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("message", values.message);
  if (values.attachment) formData.append("attachment", values.attachment);

  return formData;
};

type ActionsAnnouncementsProps = {
  update?: AnnouncementData;
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};
const ActionsAnnouncement: React.FC<ActionsAnnouncementsProps> = ({
  update,
  onHide,
  show,
  onSuccess,
}) => {
  const isEdit = Boolean(update?._id);

  const [createUpdate, { isLoading }] = useCreateAnnouncementMutation();
  const [editUpdate, { isLoading: isEditing }] = useEditAnnouncementMutation();
  const [progress, setProgress] = React.useState<number>(0);
  const initialValues = {
    title: update?.title || "",
    message: update?.message ?? "",

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
            formData: formData,
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
        setProgress(0);
      }
    } catch (error) {
      showError(getAxiosErrorMessage(error));
    }
  };

  return (
    <ModalWrapper
      show={show}
      title={isEdit ? "Edit Announcement" : "Add Announcement"}
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
            form="announcement-form"
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
        validationSchema={AnnouncementsFormSchema()}
        onSubmit={handleSave}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <BootstrapForm
            id="announcement-form"
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

            {/* message */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Message</BootstrapForm.Label>
              <QuillEditor
                content={values.message}
                onChange={(state) => setFieldValue("message", state)}
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
                name="message"
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

export default ActionsAnnouncement;
