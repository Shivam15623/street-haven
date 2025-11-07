import React, { useEffect, useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Form, Button } from "react-bootstrap";
import {
  useAddNodeMutation,
  useEditNodeMutation,
  useGetTreeNodesQuery,
 
} from "../../../../../services/orgApi";
import { showSuccess } from "../../../../../utills/toastutills";

interface OrgNodeOption {
  _id: string;
  label: string;
  department: string;
}

interface ActionOrgNodeProps {
  orgNode?: {
    label: string;
    _id: string;
    reportsTo: null | { label: string; _id: string };
    department: string;
    supervises: [string];
  };
  show: boolean;
  onHide: () => void;
}

const OrgNodeSchema = () =>
  Yup.object().shape({
    label: Yup.string().required("Label is required"),
    department: Yup.string().required("Department is required"),
    reportsTo: Yup.string().nullable(),
  });

const ActionOrgNode: React.FC<ActionOrgNodeProps> = ({
  orgNode,
  show,
  onHide,
}) => {
  const isEdit = Boolean(orgNode?._id);
  const [createNode, { isLoading }] = useAddNodeMutation();
  const [editNode, { isLoading: isEditing }] = useEditNodeMutation();

  const { data: nodesData } = useGetTreeNodesQuery(undefined);
  console.log()
  const [nodeOptions, setNodeOptions] = useState<OrgNodeOption[]>([]);

  useEffect(() => {
    if (nodesData) setNodeOptions(nodesData.nodes || []);
  }, [nodesData]);

  const initialValues = {
    label: orgNode ? orgNode.label : "",
    reportsTo: orgNode?.reportsTo?._id || "",
    department: orgNode ? orgNode.department : "",
  };

  const handleSave = async (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = isEdit
        ? await editNode({ id: orgNode!._id, data: values }).unwrap()
        : await createNode(values).unwrap();

      if (res.success) {
        showSuccess(res.message);
        resetForm();
        onHide();
      }
    } catch (error) {
      console.error("Failed to save node:", error);
    }
  };

  return (
    <ModalWrapper
      show={show}
      title={isEdit ? "Edit Role" : "Add New Role"}
      size="lg"
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      onHide={onHide}
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <Button
            type="submit"
            form="org-node-form"
            variant="primary"
            disabled={isLoading || isEditing}
          >
            {isLoading || isEditing
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
              ? "Save Changes"
              : "Add Role"}
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
        </div>
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={OrgNodeSchema()}
        onSubmit={handleSave}
      >
        {({ values, setFieldValue }) => (
          <FormikForm id="org-node-form" className="d-flex flex-column gap-3">
            {/* Label */}
            <Form.Group>
              <Form.Label>Role Label</Form.Label>
              <Field
                name="label"
                as={Form.Control}
                placeholder="Enter role label"
              />
              <ErrorMessage
                name="label"
                component="div"
                className="text-danger mt-1"
              />
            </Form.Group>

            {/* Department */}
            <Form.Group>
              <Form.Label>Department</Form.Label>
              <Field
                name="department"
                as={Form.Control}
                placeholder="Enter department"
              />
              <ErrorMessage
                name="department"
                component="div"
                className="text-danger mt-1"
              />
            </Form.Group>

            {/* Reports To */}
            <Form.Group>
              <Form.Label>Reports To</Form.Label>
              <Field
                as={Form.Select}
                name="reportsTo"
                value={values.reportsTo}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFieldValue("reportsTo", e.target.value || null)
                }
              >
                <option value="">-- Select Parent Role --</option>
                {nodeOptions
                  .filter((n) => !orgNode || n._id !== orgNode._id)
                  .map((n) => (
                    <option key={n._id} value={n._id}>
                      {n.label} ({n.department})
                    </option>
                  ))}
              </Field>
              <ErrorMessage
                name="reportsTo"
                component="div"
                className="text-danger mt-1"
              />
            </Form.Group>
          </FormikForm>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default ActionOrgNode;
