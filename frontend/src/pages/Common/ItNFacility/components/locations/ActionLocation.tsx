import React, { useEffect } from "react";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Form as BootstrapForm } from "react-bootstrap";
import {
  useCreateLocationMutation,
  useEditLocationMutation,
  type Location,
} from "../../../../../services/locationApi";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import { getErrorMessage } from "../../../../../utills/utills";
import FormSubmissionLoader from "../../../../../components/child/FormSubmissionLoader";
import UserMultiSelect from "../../../../../components/UserMultiSelect";
import UserSelect from "../../../../../components/UserSelect";

const locationSchema = () =>
  Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters"),
    managerIds: Yup.array().of(Yup.string()),
    facilityManager: Yup.string().nullable(),
  });

type LocationFormValues = {
  name: string;
  managerIds: string[];
  facilityManager?: string;
};

type ActionsLocationProps = {
  location?: Location; // if passed → edit mode
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

const ActionsLocation: React.FC<ActionsLocationProps> = ({
  location,
  show,
  onHide,
  onSuccess,
}) => {
  const isEdit = Boolean(location?._id);

  const [createLocation, { isLoading }] = useCreateLocationMutation();
  const [editLocation, { isLoading: isEditing }] = useEditLocationMutation();

  // used to populate the manager picker + show names for already-assigned ids

  const initialValues: LocationFormValues = {
    name: location?.name || "",
    managerIds: location?.managers.map((m) => m._id) || [],
    facilityManager: location?.facilityManager?._id,
  };

  useEffect(() => {});
  const handleSave = async (
    values: LocationFormValues,
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      const body = {
        name: values.name,
        managerIds: values.managerIds,
        facilityManager: values.facilityManager,
      };

      const res = isEdit
        ? await editLocation({
            locationId: location!._id,
            body,
          }).unwrap()
        : await createLocation(body).unwrap();

      if (res.success) {
        showSuccess(res.message);
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
      title={isEdit ? "Edit Location" : "Add Location"}
      size="md"
      show={show}
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      onHide={onHide}
      ModalLoader={
        <FormSubmissionLoader
          isLoading={isLoading || isEditing}
          variant="spinner"
          message="Saving changes..."
          subMessage="Please wait"
        />
      }
      isLoading={isLoading || isEditing}
      footer={
        <div className="d-flex justify-content-end gap-3">
          <button
            type="submit"
            form="location-form"
            className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center text-sm justify-content-center"
            disabled={isLoading || isEditing}
          >
            {isLoading || isEditing
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save Changes"
                : "Add Location"}
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
        validationSchema={locationSchema()}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ values, setFieldValue, handleSubmit, errors, touched }) => (
          <BootstrapForm
            noValidate
            id="location-form"
            className="d-flex flex-column gap-2"
            onSubmit={handleSubmit}
          >
            {/* Name */}
            <BootstrapForm.Group className="d-flex flex-column gap-8">
              <BootstrapForm.Label>Name</BootstrapForm.Label>
              <BootstrapForm.Control
                type="text"
                placeholder="Enter location name"
                value={values.name}
                isInvalid={!!errors.name && touched.name}
                onChange={(e) => setFieldValue("name", e.target.value)}
              />
              <BootstrapForm.Control.Feedback type="invalid">
                <ErrorMessage name="name" />
              </BootstrapForm.Control.Feedback>
            </BootstrapForm.Group>

            {/* Managers */}
            <BootstrapForm.Group className="position-relative">
              <UserMultiSelect
                className="position-relative"
                label="Managers"
                role={["manager"]}
                placeholder="Select Manager"
                value={values.managerIds}
                isDisabled={isLoading || isEditing}
                onChange={(vals) => setFieldValue("managerIds", vals)}
              />
              <BootstrapForm.Control.Feedback type="invalid">
                <ErrorMessage name="managerIds" />
              </BootstrapForm.Control.Feedback>
            </BootstrapForm.Group>

            {/* Facility Manager */}
            <BootstrapForm.Group className="position-relative">
              {/*
                NOTE: UserMultiSelect is reused here in "single select" mode by
                capping the selection to one id. If your codebase has a
                dedicated single-select user picker, swap this out for that
                component instead — it'll be cleaner than the array workaround
                below.
              */}
              <UserSelect
                className="position-relative"
                label="Facility Manager"
                role={["manager"]}
                placeholder="Select Manager"
                value={values.facilityManager ?? ""}
                disabled={isLoading || isEditing}
                onChange={(vals) => setFieldValue("facilityManager", vals)}
              />
              <BootstrapForm.Control.Feedback type="invalid">
                <ErrorMessage name="facilityManager" />
              </BootstrapForm.Control.Feedback>
            </BootstrapForm.Group>
          </BootstrapForm>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default ActionsLocation;
