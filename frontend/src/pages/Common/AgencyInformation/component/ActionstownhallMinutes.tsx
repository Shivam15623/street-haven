import React from "react";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import * as yup from "yup";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import { Form as BootstrapForm } from "react-bootstrap";
import {
  useCreatemeetingMinutesMutation,
  useEditmeetingMinutesMutation,
} from "../../../../services/meetingminutesApi";
import { showSuccess } from "../../../../utills/toastutills";
import Badge from "../../../../components/child/Badge";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { MeetingMinutesData } from "../../../../interfaces/meetingMinutes";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import CustomDatePicker from "../../../../components/child/DatePicker";
import FormSubmissionLoader from "../../../../components/child/FormSubmissionLoader";
import FileField from "../../../../components/child/FileField";
dayjs.extend(utc);
// ✅ Schema
const TownhallMinutesFormSchema = () =>
  yup.object().shape({
    title: yup
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters")
      .required("Title is required"),
    attendees: yup
      .number()
      .min(1)
      .typeError("Attendees must be a number")
      .positive("Attendees must be greater than 0")
      .integer("Attendees must be an integer")
      .required("Attendees are required"),
    keyTopicsDiscussed: yup
      .array()
      .of(yup.string().trim().required("Key topic cannot be empty"))
      .min(1, "At least 1 topic is required")
      .max(3, "You can add at most 3 topics"),
    keyHighlights: yup
      .array()
      .of(yup.string().trim().required("Highlight cannot be empty"))
      .min(1, "At least 1 highlight is required")
      .max(3, "You can add at most 3 highlights"),
    meetingDate: yup.date().nullable().required("Meeting date is required"),
    attachment: yup
      .mixed<File>()
      .nullable()
      .test("fileSize", "File size must be less than 16MB", (value) => {
        if (!value) return true;
        return value.size <= 16 * 1024 * 1024;
      }),
  });
interface TownHallMinuteValues {
  title: string;
  attendees: number;
  keyTopicsDiscussed: string[];
  keyHighlights: string[];
  meetingDate: Date | null;
  attachment: File | null;
  newHighlight: string;
  newTopic: string;
}

// ✅ FormData builder
const buildFormData = (values: TownHallMinuteValues) => {
  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("attendees", values.attendees.toString());
  formData.append("meetingDate", new Date(values.meetingDate!).toISOString());
  if (values.attachment) formData.append("attachment", values.attachment);

  values.keyHighlights.forEach((highlight: string, index: number) => {
    formData.append(`keyHighlights[${index}]`, highlight);
  });
  values.keyTopicsDiscussed.forEach((topic: string, index: number) => {
    formData.append(`keyTopicsDiscussed[${index}]`, topic);
  });
  return formData;
};

type ActionsMeetingsProps = {
  meeting?: MeetingMinutesData;
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

const ActionstownhallMinutes: React.FC<ActionsMeetingsProps> = ({
  meeting,
  onHide,
  show,
  onSuccess,
}) => {
  const isEdit = Boolean(meeting?._id);

  const [createmeeting, { isLoading }] = useCreatemeetingMinutesMutation();
  const [editMeeting, { isLoading: isEditing }] =
    useEditmeetingMinutesMutation();
  const [progress, setProgress] = React.useState<number>(0);
  const initialValues = {
    title: meeting?.title || "",
    attendees: meeting?.attendees || 0,
    keyTopicsDiscussed: meeting?.keyTopicsDiscussed || [],
    meetingDate: meeting?.meetingDate
      ? new Date(meeting.meetingDate) // YYYY-MM-DD
      : null,
    keyHighlights: meeting?.keyHighlights || [],
    attachment: null,
    newHighlight: "",
    newTopic: "",
  };

  const handleSave = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const formData = buildFormData(values);
      const res = isEdit
        ? await editMeeting({
            id: meeting!._id,
            data: formData,
            onProgress: (p) => setProgress(p),
          }).unwrap()
        : await createmeeting({
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
      console.error("Failed to save meeting minutes:", error);
    }
  };

  return (
    <ModalWrapper
      show={show}
      title={isEdit ? "Edit Event Minutes" : "Add Event Minutes"}
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
            form="minute-meeting-form"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            disabled={isLoading || isEditing}
          >
            {isLoading || isEditing
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
              ? "Save Changes"
              : "Add Minutes"}
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
        validationSchema={TownhallMinutesFormSchema()}
        onSubmit={handleSave}
      >
        {({
          values,
          handleSubmit,
          setFieldValue,
          touched,
          setFieldTouched,
          errors,
          handleBlur,
        }) => (
          <BootstrapForm
            id="minute-meeting-form"
            className="d-flex flex-column gap-16 gap-sm-20"
            onSubmit={handleSubmit}
          >
            {/* Title */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Title</BootstrapForm.Label>
              <Field
                name="title"
                as={BootstrapForm.Control}
                placeholder="Enter meeting title"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* Attendees */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Attendees</BootstrapForm.Label>
              <Field
                name="attendees"
                type="number"
                min={1}
                step={1}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault(); // 🚫 block negatives & scientific notation
                  }
                }}
                as={BootstrapForm.Control}
                placeholder="Enter number of attendees"
              />
              <ErrorMessage
                name="attendees"
                component="div"
                className="text-danger"
              />
            </BootstrapForm.Group>

            {/* Meeting Date */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Meeting Date</BootstrapForm.Label>
              <CustomDatePicker
                value={values.meetingDate ? new Date(values.meetingDate) : null}
                onChange={(date) => {
                  setFieldValue("meetingDate", date, true); // ← Add true to validate immediately
                  setFieldTouched("meetingDate", true, false); // ← false prevents double validation
                }}
                onBlur={handleBlur}
                isInvalid={!!errors.meetingDate && touched.meetingDate}
              />

              {errors.meetingDate && touched.meetingDate && (
                <div className="invalid-feedback d-block">
                  {errors.meetingDate}
                </div>
              )}
            </BootstrapForm.Group>

            {/* Key Topics Discussed */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Key Topics Discussed</BootstrapForm.Label>
              <FieldArray
                name="keyTopicsDiscussed"
                render={(arrayHelpers) => (
                  <>
                    <div className="d-flex gap-1 mb-2">
                      <Field
                        name="newTopic"
                        as={BootstrapForm.Control}
                        placeholder="Enter topic"
                      />
                      <button
                        className="btn-street-primary radius-8 px-3 text-lg"
                        type="button"
                        onClick={() => {
                          if (
                            values.newTopic &&
                            values.keyTopicsDiscussed.length < 3
                          ) {
                            arrayHelpers.push(values.newTopic);
                            setFieldValue("newTopic", "");
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {values.keyTopicsDiscussed.map((topic, index) => (
                        <Badge
                          variant="primary-soft"
                          key={index}
                          className="px-2 py-1"
                        >
                          {topic}
                          <Icon
                            icon="lucide:x"
                            onClick={() => arrayHelpers.remove(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <ErrorMessage
                      name="keyTopicsDiscussed"
                      component="div"
                      className="text-danger"
                    />
                  </>
                )}
              />
            </BootstrapForm.Group>

            {/* Key Highlights */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Key Highlights</BootstrapForm.Label>
              <FieldArray
                name="keyHighlights"
                render={(arrayHelpers) => (
                  <>
                    <div className="d-flex gap-1 mb-2">
                      <Field
                        name="newHighlight"
                        as={BootstrapForm.Control}
                        placeholder="Enter highlight"
                      />
                      <button
                        className="btn-street-primary radius-8 px-3 text-lg"
                        type="button"
                        onClick={() => {
                          if (
                            values.newHighlight &&
                            values.keyHighlights.length < 3
                          ) {
                            arrayHelpers.push(values.newHighlight);
                            setFieldValue("newHighlight", "");
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                    {/* Show list */}{" "}
                    <ul className="list-group">
                      {" "}
                      {values.keyHighlights.map((highlight, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {" "}
                          {highlight}{" "}
                          <button
                            type="button"
                            className=" btn-outline-danger"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            {" "}
                            ×{" "}
                          </button>{" "}
                        </li>
                      ))}{" "}
                    </ul>
                    <ErrorMessage
                      name="keyHighlights"
                      component="div"
                      className="text-danger"
                    />
                  </>
                )}
              />
            </BootstrapForm.Group>

            {/* Attachment */}
            <FileField
              existingFile={
                isEdit && meeting?.attachment
                  ? {
                      fileName: meeting.attachment.fileName,
                      fileUrl: meeting.attachment.fileUrl,
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

export default ActionstownhallMinutes;
