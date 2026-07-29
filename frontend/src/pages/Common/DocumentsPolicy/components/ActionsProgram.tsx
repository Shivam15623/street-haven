import React, { useState } from "react";
import { Formik, FieldArray, ErrorMessage } from "formik";
import {
  useCreateManualsMutation,
  useEditManualsMutation,
} from "../../../../services/ProgramManualApi";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import * as Yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import Badge from "../../../../components/child/Badge";
import { showError, showSuccess } from "../../../../utills/toastutills";
import type { Document } from "./DocumentCard";
import QuillEditor from "../../../../components/child/QuillEditor";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import FileField from "../../../../components/child/FileField";
import {
  getErrorMessage,
  getPlainTextFromHTML,
} from "../../../../utills/utills";

// 🔹 Schema generator (avoids duplication)
const programManualSchema = () =>
  Yup.object().shape({
    title: Yup.string()
      .required("Title is required")
      .min(3, "Title must be at least 3 characters"),
    description: Yup.string()
      .required("Description is required")
      .test(
        "min-text-length",
        "Description must be at least 10 characters",
        (value) => {
          const plainText = getPlainTextFromHTML(value || "");
          return plainText.length >= 10;
        },
      ),
    tags: Yup.array()
      .of(Yup.string())
      .min(1, "At least one tag is required")
      .max(3, "No more than 3 tags are allowed"),
    type: Yup.string().required("Type is required"),
    attachment: Yup.mixed<File>()
      .nullable()
      .test("fileSize", "File size must be less than 16MB", (value) => {
        if (!value) return true;
        return value.size <= 16 * 1024 * 1024;
      }),
  });
type ProgramManualFormValues = {
  title: string;
  description: string;
  type: string;
  tags: string[];
  attachment: File | null;
  newTag: string;
};
// 🔹 Helper: build FormData
const buildFormData = (values: ProgramManualFormValues) => {
  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("description", values.description);
  formData.append("type", values.type);
  values.tags.forEach((tag: string) => formData.append("tags[]", tag));
  if (values.attachment) formData.append("attachment", values.attachment);
  return formData;
};

type ActionsProgramProps = {
  document?: Document; // if passed → edit mode
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

const ActionsProgram: React.FC<ActionsProgramProps> = ({
  document,
  show,
  onHide,
  onSuccess,
}) => {
  const isEdit = Boolean(document?._id);

  const [createManual, { isLoading }] = useCreateManualsMutation();
  const [editManual, { isLoading: isEditing }] = useEditManualsMutation();
  const [progress, setProgress] = useState(0);
  // 🔹 Initial values
  const initialValues = {
    title: document?.title || "",
    description: document?.description || "",
    tags: document?.tags || [],
    type: document?.type || "",
    attachment: null,
    newTag: "",
  };

  // 🔹 Save handler (unified)
  const handleSave = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      const formData = buildFormData(values);
      const res = isEdit
        ? await editManual({
            id: document!._id,
            data: formData,
            onProgress: (p: number) => setProgress(p),
          }).unwrap()
        : await createManual({
            data: formData,
            onProgress: (p: number) => setProgress(p),
          }).unwrap();

      if (res.success) {
        showSuccess(res.message);
        setProgress(0);
        resetForm();
        onSuccess?.();
        onHide();
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <ModalWrapper
      title={isEdit ? "Edit Program Manual" : "Add Program Manual"}
      size="lg"
      show={show}
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
            form="program-manual-form"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            disabled={isLoading || isEditing}
          >
            {isLoading || isEditing
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save Changes"
                : "Add Manual"}
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
        validationSchema={programManualSchema()}
        onSubmit={handleSave}
      >
        {({ values, setFieldValue, handleSubmit, errors, touched }) => (
          <BootstrapForm
            noValidate
            id="program-manual-form"
            className="d-flex flex-column gap-2"
            onSubmit={handleSubmit}
          >
            {/* Title */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Title</BootstrapForm.Label>
              <BootstrapForm.Control
                type="text"
                placeholder="Enter title"
                value={values.title}
                isInvalid={!!errors.title && touched.title}
                onChange={(e) => setFieldValue("title", e.target.value)}
              />
              <BootstrapForm.Control.Feedback type="invalid">
                <ErrorMessage name="title" />
              </BootstrapForm.Control.Feedback>
            </BootstrapForm.Group>

            {/* Description */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Description</BootstrapForm.Label>
              <QuillEditor
                content={values.description}
                onChange={(val) => setFieldValue("description", val)}
                isInvalid={touched.description && !!errors.description}
                errorMessage={errors.description as string}
              />
              <BootstrapForm.Control.Feedback type="invalid">
                <ErrorMessage name="description" />
              </BootstrapForm.Control.Feedback>
            </BootstrapForm.Group>

            {/* Type */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Type</BootstrapForm.Label>
              <BootstrapForm.Select
                value={values.type}
                isInvalid={!!errors.type && touched.type}
                onChange={(e) => setFieldValue("type", e.target.value)}
              >
                <option value="">Select Type</option>
                {[
                  "Orientation",
                  "Safety",
                  "Policies",
                  "Training",
                  "Forms",
                  "Other",
                ].map((m) => {
                  return <option value={m}>{m}</option>;
                })}
              </BootstrapForm.Select>
              <BootstrapForm.Control.Feedback type="invalid">
                <ErrorMessage name="type" />
              </BootstrapForm.Control.Feedback>
            </BootstrapForm.Group>

            {/* Tags */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Tags</BootstrapForm.Label>
              <FieldArray name="tags">
                {({ push, remove }) => (
                  <>
                    <div className="d-flex gap-2 mb-2">
                      <BootstrapForm.Control
                        type="text"
                        placeholder="Add a tag"
                        value={values.newTag}
                        onChange={(e) =>
                          setFieldValue("newTag", e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (
                              values.newTag &&
                              values.tags.length < 3 &&
                              !values.tags.includes(values.newTag)
                            ) {
                              push(values.newTag);
                              setFieldValue("newTag", "");
                            }
                          }
                        }}
                      />
                      <button
                        className="btn-street-primary radius-8 px-3 text-lg"
                        type="button"
                        onClick={() => {
                          if (values.newTag && values.tags.length < 3) {
                            push(values.newTag);
                            setFieldValue("newTag", "");
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      {values.tags.map((tag, index) => (
                        <Badge
                          variant="primary-soft"
                          key={index}
                          className="px-2 py-1"
                        >
                          {tag}{" "}
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() => remove(index)}
                          >
                            ×
                          </span>
                        </Badge>
                      ))}
                    </div>
                    {errors.tags && touched.tags && (
                      <div className="text-danger">{errors.tags as string}</div>
                    )}
                  </>
                )}
              </FieldArray>
            </BootstrapForm.Group>

            {/* PDF Upload / Existing PDF */}
            <FileField
              existingFile={
                isEdit && document?.attachment
                  ? {
                      fileName: document.attachment.fileName,
                      fileUrl: document.attachment.fileUrl,
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

export default ActionsProgram;
