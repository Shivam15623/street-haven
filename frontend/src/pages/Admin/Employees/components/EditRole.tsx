import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Formik } from "formik";
import { Form, Card, Button } from "react-bootstrap";
import ModalWrapper from "../../../../components/child/ModalWrapper";
import {
  useEditRoleMutation,
  useGetRolebyIdQuery,
  type RoleForm,
  type RoleInfo,
} from "../../../../services/EmployeeApi";
import { showSuccess, showError } from "../../../../utills/toastutills";

import { MODULES } from "./AddRole"; // re-use MODULE list

export default function EditRole({ roleId }: { roleId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(0);

  const { data, isFetching } = useGetRolebyIdQuery(
    { id: roleId },
    {
      skip: !showModal,
    }
  );

  const [updateRole, { isLoading }] = useEditRoleMutation();

  // Convert backend structure → RoleForm format
  const convert = (role:RoleInfo): RoleForm => ({
    roleName: role.roleName,
    description: role.description,
    permissions: MODULES.map((m) => {
      const existing = role.permissions.find(
        (p) => p.moduleKey === m.moduleKey
      );

      return {
        moduleName: m.moduleName,
        moduleKey: m.moduleKey,
        access: existing?.access ?? false,
        create: existing?.create ?? false,
        read: existing?.read ?? false,
        update: existing?.update ?? false,
        delete: existing?.delete ?? false,
        features: m.features.map((f) => {
          const found = existing?.features?.find((x) => x.key === f);
          return {
            key: f,
            label: f.replace("_", " ").toUpperCase(),
            allowed: found?.allowed ?? false,
          };
        }),
      };
    }),
  });

  return (
    <>
      <button
        className="btn btn-warning btn-sm radius-12 d-flex align-items-center gap-1"
        onClick={() => setShowModal(true)}
      >
        <Icon icon="mdi:pencil-outline" /> Edit
      </button>

      <ModalWrapper
        show={showModal}
        title="Edit Role"
        size="xl"
        onHide={() => setShowModal(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="submit"
              form="edit-role-form"
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
        {isFetching || !data?.data ? (
          <p>Loading...</p>
        ) : (
          <Formik
            initialValues={convert(data?.data)}
            enableReinitialize
            onSubmit={async (values) => {
              try {
                const res = await updateRole({
                  id: roleId,
                  updated: values,
                }).unwrap();
                if (res.success) showSuccess("Role updated successfully");
                setShowModal(false);
              } catch (err: any) {
                showError(err?.data?.message || "Update failed");
              }
            }}
          >
            {({ values, handleChange, setFieldValue, handleSubmit }) => {
              const current = values.permissions[selectedModule];

              return (
                <Form
                  id="edit-role-form"
                  onSubmit={handleSubmit}
                  className="d-flex flex-column gap-3"
                >
                  {/* Role Name */}
                  <Form.Group>
                    <Form.Label>Role Name</Form.Label>
                    <Form.Control
                      name="roleName"
                      value={values.roleName}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* Description */}
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  {/* PERMISSION EDITOR — SAME AS AddRole */}
                  <div className="d-flex radius-12 border overflow-hidden shadow-sm">
                    {/* SIDEBAR */}
                    <div
                      className="border-end bg-neutral-50 p-12 d-flex flex-column gap-2"
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

                    {/* CONTENT */}
                    <div className="flex-grow-1 p-24 d-flex flex-column gap-20">
                      {/* MODULE ACCESS */}
                      <Card className="shadow-sm">
                        <Card.Header className="p-24 pb-12">
                          <Card.Title className="fw-semibold d-flex align-items-center gap-2">
                            <Icon icon="mdi:lock-outline" />
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

                      {/* CRUD */}
                      <Card className="shadow-sm">
                        <Card.Header className="p-24 pb-12">
                          <Card.Title className="fw-semibold">
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
                                className={`py-3 radius-12 ${
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
                                {action.toUpperCase()}
                              </Button>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>

                      {/* FEATURES */}
                      {current.features.length > 0 && (
                        <Card className="shadow-sm">
                          <Card.Header className="p-24 pb-12">
                            <Card.Title className="fw-semibold">
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
        )}
      </ModalWrapper>
    </>
  );
}
