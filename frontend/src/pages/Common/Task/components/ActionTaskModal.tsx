import React, { lazy, useMemo } from "react";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify"; // remove if you use a different toast lib
import {
  useCreateTaskMutation,
  useEditTaskMutation,
  type ITask,
  type TaskStatus,
} from "../../../../services/taskApi";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { useAllEmployeesQuery } from "../../../../services/EmployeeApi";
import CustomDatePicker from "../../../../components/child/DatePicker";
const QuillEditor = lazy(() => import("../../../../components/child/QuillEditor"));
export interface AssignableUser {
  _id: string;
  name: string;
  email: string;
}

interface ActionTaskModalProps {
  show: boolean;
  onHide: () => void;
  mode: "create" | "edit";
  task?: ITask | null; // required when mode === "edit"

  onSuccess?: (task: ITask) => void;
}

interface TaskFormValues {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
}

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: "Assigned", value: "assigned" },
  { label: "Under Review", value: "under_review" },
  { label: "Completed", value: "completed" },
];

const validationSchema = Yup.object({
  title: Yup.string().trim().required("Task title is required"),
  description: Yup.string().trim().required("Task description is required"),
  assignedTo: Yup.string().required("Please assign this task to a volunteer"),
  dueDate: Yup.date()
    .nullable()
    .min(new Date(new Date().toDateString()), "Due date cannot be in the past"),
  status: Yup.mixed<TaskStatus>()
    .oneOf(["assigned", "under_review", "completed"])
    .required(),
});

const ActionTaskModal: React.FC<ActionTaskModalProps> = ({
  show,
  onHide,
  mode,
  task,

  onSuccess,
}) => {
  const {
    data: employeeData,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
  } = useAllEmployeesQuery(
    { forDropdown: true, role: ["volunteer"],managedBy:true },
    { skip: !show },
  );
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [editTask, { isLoading: isEditing }] = useEditTaskMutation();

  const isLoading = isCreating || isEditing;
  const isEdit = mode === "edit";

  const initialValues: TaskFormValues = useMemo(
    () => ({
      title: task?.title ?? "",
      description: task?.description ?? "",
      assignedTo: task?.assignedTo?._id ?? "",
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
      status: task?.status ?? "assigned",
    }),
    [task],
  );

  const handleSubmit = async (values: TaskFormValues, { resetForm }: any) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate || null,
      };

      if (isEdit && task) {
        const res = await editTask({
          taskId: task._id,
          body: { ...payload, status: values.status },
        }).unwrap();

        toast.success(res.message || "Task updated successfully");
        onSuccess?.(res.data);
      } else {
        const res = await createTask(payload).unwrap();

        toast.success(res.message || "Task created successfully");
        onSuccess?.(res.data);
      }

      resetForm();
      onHide();
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <ModalWrapper
      show={show}
      onHide={onHide}
      title={isEdit ? "Edit Task" : "Create Task"}
      subtitle={
        isEdit
          ? "Update the task details below"
          : "Fill in the details to assign a new task"
      }
      footer={
        <div className="d-flex justify-content-end gap-8 ">
          <button
            type="button"
            className="btn btn-secondary  text-sm d-flex flex-row align-items-center gap-8 justify-content-center"
            onClick={onHide}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form={isEdit ? "edit-task" : "create-task"}
            className="btn btn-street-primary text-sm d-flex flex-row align-items-center gap-8 justify-content-center"
            disabled={isLoading}
          >
            {isLoading && (
              <Spinner animation="border" size="sm" role="status" />
            )}
            {isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      }
      size="lg"
      isLoading={isLoading}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          handleSubmit: formikSubmit,
          touched,
          errors,
          setFieldValue,
          handleBlur,
        }) => (
          <Form
            noValidate
            id={isEdit ? "edit-task" : "create-task"}
            onSubmit={formikSubmit}
          >
            <Form.Group className="mb-16 d-flex flex-column gap-1">
              <Form.Label>Title</Form.Label>
              <Field
                type="text"
                name="title"
                as={Form.Control}
                placeholder="Enter task title"
                disabled={isLoading}
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-danger text-xs mt-4"
              />
            </Form.Group>

            <Form.Group className="mb-16 d-flex flex-column gap-1">
              <Form.Label>Description</Form.Label>

              <QuillEditor
                content={values.description}
                onChange={(val) => setFieldValue("description", val)}
                disabled={isLoading}
                isInvalid={touched.description && !!errors.description}
               
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-danger text-xs mt-4"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-16 d-flex flex-column gap-1">
                  <Form.Label>Assign To</Form.Label>
                  <Field
                    as="select"
                    name="assignedTo"
                    className="form-select"
                    disabled={isLoading || isEmployeeLoading || isEmployeeError}
                  >
                    <option value="">
                      {isEmployeeLoading
                        ? "Loading Volunteers..."
                        : isEmployeeError
                          ? "Failed to load volunteers"
                          : "Select Volunteers"}
                    </option>
                    {employeeData?.data.employees.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.firstname} {u.lastname} ({u.email})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="assignedTo"
                    component="div"
                    className="text-danger text-xs mt-4"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-16 d-flex flex-column gap-1">
                  <Form.Label>Due Date</Form.Label>
                  <CustomDatePicker
                    value={values.dueDate ? new Date(values.dueDate) : null}
                    onChange={(date) => setFieldValue("dueDate", date)}
                    onBlur={handleBlur}
                    disabled={isLoading}
                  />

                  <ErrorMessage
                    name="dueDate"
                    component="div"
                    className="text-danger text-xs mt-4"
                  />
                </Form.Group>
              </Col>
            </Row>

            {isEdit && (
              <Form.Group className="mb-16 d-flex flex-column gap-1">
                <Form.Label>Status</Form.Label>
                <Field
                  as="select"
                  name="status"
                  className="form-select"
                  disabled={isLoading}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-danger text-xs mt-4"
                />
              </Form.Group>
            )}
          </Form>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default ActionTaskModal;
