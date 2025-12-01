import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import { Formik } from "formik";
import {
  useAddRoleMutation,
  type RoleForm,
} from "../../../../services/EmployeeApi";
import { showSuccess } from "../../../../utills/toastutills";

// ------------------------------
// MODULE CONFIG
// ------------------------------
const MODULES = [
  {
    moduleName: "Events",
    moduleKey: "events",
    features: ["view_registerations"],
  },
  {
    moduleName: "Employees",
    moduleKey: "employees",
    features: ["reset_password"],
  },
  {
    moduleName: "Program & Mannuals",
    moduleKey: "program_mannuals",
    features: [],
  },
  { moduleName: "Ticket", moduleKey: "ticket", features: [] },
  { moduleName: "FAQ & Resources", moduleKey: "faq_resources", features: [] },
  { moduleName: "Event Minutes", moduleKey: "event_minutes", features: [] },
];

export default function AddRole() {
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(0);

  const [createRole, { isLoading }] = useAddRoleMutation();

  // ---------- Initial Values ----------
  const initialValues: RoleForm = {
    roleName: "",
    description: "",
    permissions: MODULES.map((m) => ({
      moduleName: m.moduleName,
      moduleKey: m.moduleKey,
      access: false,
      create: false,
      read: false,
      update: false,
      delete: false,
      features: m.features.map((f) => ({
        key: f,
        label: f.replace("_", " ").toUpperCase(),
        allowed: false,
      })),
    })),
  };

  return (
    <>
      <button
        className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        <Icon icon="mdi:plus" className="text-sm sm:text-xl" /> Add Role
      </button>

      <ModalWrapper
        show={showModal}
        title="Add New Role"
        size="xl"
        onHide={() => setShowModal(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="submit"
              form="formik-role"
              className="btn btn-street-primary btn-street-lg radius-12"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>

            <button
              className="btn btn-street-neutral btn-street-lg radius-12"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        }
      >
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => {
            try {
              const res = await createRole(values).unwrap();
              if (res.success) {
                showSuccess(res.message);
              }
              setShowModal(false);
            } catch (error) {
              console.error(error);
            }
          }}
        >
          {({ values, handleChange, setFieldValue, handleSubmit }) => {
            const current = values.permissions[selectedModule];

            return (
              <Form
                id="formik-role"
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-3"
              >
                {/* ROLE NAME */}
                <Form.Group className="d-flex flex-column gap-2">
                  <Form.Label>Role Name</Form.Label>
                  <Form.Control
                    name="roleName"
                    value={values.roleName}
                    onChange={handleChange}
                    placeholder="Enter role name"
                    required
                  />
                </Form.Group>

                {/* DESCRIPTION */}
                <Form.Group className="d-flex flex-column gap-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Short description"
                  />
                </Form.Group>

                {/* PERMISSIONS WRAPPER */}
                <div className="d-flex radius-12 border overflow-hidden shadow-sm">
                  {/* SIDEBAR */}
                  <div
                    className="border-end bg-neutral-50 p-12 d-flex flex-column gap-2 overflow-y-auto"
                    style={{ width: 220 }}
                  >
                    {values.permissions.map((mod, index) => (
                      <button
                        type="button"
                        key={mod.moduleKey}
                        onClick={() => setSelectedModule(index)}
                        className={`w-100 p-12 radius-12 text-sm fw-medium text-left ${
                          selectedModule === index
                            ? "btn btn-street-primary"
                            : "btn btn-outline-secondary"
                        }`}
                      >
                        {mod.moduleName}
                      </button>
                    ))}
                  </div>

                  {/* CONTENT AREA */}
                  <div className="flex-grow-1 p-24 d-flex flex-column gap-20">
                    {/* MODULE ACCESS */}
                    <Card className="shadow-sm">
                      <Card.Header className="p-24 pb-12">
                        <Card.Title className="fw-semibold d-flex align-items-center gap-2">
                          <Icon
                            icon="mdi:lock-outline"
                            className="text-primary"
                          />
                          Module Access
                        </Card.Title>
                      </Card.Header>

                      <Card.Body className="d-flex justify-content-between">
                        <span>Enable access to this module</span>
                        <Form.Check
                          type="switch"
                          checked={current.access}
                          onChange={(e) =>
                            setFieldValue(
                              `permissions.${selectedModule}.access`,
                              e.target.checked
                            )
                          }
                        />
                      </Card.Body>
                    </Card>

                    {/* CRUD PERMISSIONS */}
                    <Card className="shadow-sm">
                      <Card.Header className="p-24 pb-12">
                        <Card.Title className="fw-semibold d-flex align-items-center gap-2">
                          <Icon
                            icon="mdi:cog-outline"
                            className="text-primary-600"
                          />
                          CRUD Permissions
                        </Card.Title>
                      </Card.Header>

                      <Card.Body>
                        <div
                          className="d-grid gap-2"
                          style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                        >
                          {(
                            ["create", "read", "update", "delete"] as const
                          ).map((action) => (
                            <Button
                              key={action}
                              type="button"
                              className={`py-3 radius-12 d-flex flex-column align-items-center justify-content-center ${
                                current[action]
                                  ? "btn-street-primary"
                                  : "btn-street-outline-primary"
                              }`}
                              onClick={() =>
                                setFieldValue(
                                  `permissions.${selectedModule}.${action}`,
                                  !current[action]
                                )
                              }
                            >
                              <Icon
                                icon={
                                  action === "create"
                                    ? "mdi:plus-circle-outline"
                                    : action === "read"
                                    ? "mdi:eye-outline"
                                    : action === "update"
                                    ? "mdi:pencil-outline"
                                    : "mdi:delete-outline"
                                }
                                width={20}
                                height={20}
                              />
                              <span className="small text-uppercase fw-semibold mt-1">
                                {action}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>

                    {/* EXTRA FEATURES */}
                    {current.features.length > 0 && (
                      <Card className="shadow-sm">
                        <Card.Header className="p-24 pb-12">
                          <Card.Title className="fw-semibold d-flex align-items-center gap-2">
                            <Icon
                              icon="mdi:star-outline"
                              className="text-indigo"
                            />
                            Extra Features
                          </Card.Title>
                        </Card.Header>

                        <Card.Body className="d-flex flex-column gap-2">
                          {current.features.map((f, idx) => (
                            <div
                              key={f.key}
                              className="d-flex align-items-center justify-content-between p-12 bg-neutral-50 rounded"
                            >
                              <span>{f.label}</span>
                              <Form.Check
                                type="switch"
                                checked={f.allowed}
                                onChange={(e) =>
                                  setFieldValue(
                                    `permissions.${selectedModule}.features.${idx}.allowed`,
                                    e.target.checked
                                  )
                                }
                              />
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </ModalWrapper>
    </>
  );
}
