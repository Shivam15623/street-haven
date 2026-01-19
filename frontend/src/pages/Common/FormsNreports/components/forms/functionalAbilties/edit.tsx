import { useEffect, useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";

import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import AssesmentSection from "./sections/AssesmentSection";
import {
  Formik,
  type FormikErrors,
  type FormikProps,
  type FormikTouched,
} from "formik";
import { Form } from "react-bootstrap";

import {
  useEditFAFMutation,
  useLazyGetFafByIdQuery,
  type FunctionalAbility,
} from "../../../../../../services/FormApi";
import type { FunctionalAbilityFormValues } from "../FunctionalAbiltiesForm";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import {
  buildInitialValues,
  extractAbilities,
  extractRestrictions,
  SECTION_FIELD_MAP,
  SECTION_VISIBILITY,
} from "../../../../../../utills/functionalAbiltyHelpers";
import { functionalAbilityFormSchema } from "../../../validations";
import ClaimWorkerSection from "./sections/ClaimSection";
import EmployerSection from "./sections/EmployerSection";
import JobInjurySection from "./sections/JobInjurySection";
import AbilitiesSection from "./sections/AbilitiesSection";
import RestrictionsSection from "./sections/RestrictionsSection";
import HealthProfessionalBillSection from "./sections/HealthProfessionalBillSection";
import { getErrorMessage } from "../../../../../../utills/utills";
import StreetTab from "../../../../../../components/StreetTab";

type ReturnToWorkStatus = "noRestrictions" | "withRestrictions" | "unable";
interface Section {
  key: string;
  label: string;
  icon?: React.ReactNode;
  visibleWhen?: ReturnToWorkStatus[];
}

const SECTIONS: Section[] = [
  {
    key: "claim-worker",
    label: "Claim & Worker Info",
    icon: <Icon icon="mdi:account" width={18} />,
  },
  {
    key: "employer",
    label: "Employer Info",
    icon: <Icon icon="mdi:office-building" width={18} />,
  },
  {
    key: "job",
    label: "Job & Injury",
    icon: <Icon icon="mdi:briefcase" width={18} />,
  },
  {
    key: "healthPro&bill",
    label: "Health professional & Billing Information",
    icon: <Icon icon="mdi:stethoscope" width={18} />,
  },

  {
    key: "assessment",
    label: "Assessment",
    icon: <Icon icon="mdi:clipboard-check-outline" width={18} />,
    visibleWhen: ["noRestrictions", "withRestrictions", "unable"],
  },
  {
    key: "abilities",
    label: "Functional Abilities",
    icon: <Icon icon="mdi:arm-flex" width={18} />,
    visibleWhen: ["withRestrictions", "unable"],
  },
  {
    key: "restrictions",
    label: "Restrictions",
    icon: <Icon icon="mdi:alert-circle-outline" width={18} />,
    visibleWhen: ["withRestrictions"],
  },
];

interface SidebarProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (key: string) => void;
  formik: FormikProps<FunctionalAbilityFormValues>;
}
const getByPath = <T extends object>(obj: T, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

const hasSectionErrors = (
  sectionKey: string,
  errors: FormikErrors<FunctionalAbilityFormValues>,
  touched: FormikTouched<FunctionalAbilityFormValues>
) => {
  const fields = SECTION_FIELD_MAP[sectionKey] ?? [];

  return fields.some((field) => {
    const error = getByPath(errors, field);
    const isTouched = getByPath(touched, field);

    return Boolean(error && isTouched);
  });
};

export const Sidebar = ({
  sections,
  activeSection,
  onSectionChange,
  formik,
}: SidebarProps) => {
  return (
    <nav
      className="d-flex flex-column gap-2 pe-16 h-100 border-end"
      style={{ width: "230px", maxWidth: "230px" }}
    >
      {sections.map((section) => {
        const isActive = activeSection === section.key;
        const hasError = hasSectionErrors(
          section.key,
          formik.errors,
          formik.touched
        );

        return (
          <button
            key={section.key}
            type="button"
            onClick={() => onSectionChange(section.key)}
            className={`btn d-flex align-items-center gap-3 text-start rounded px-3 py-2 radius-8
              ${
                hasError
                  ? "btn-danger"
                  : isActive
                  ? "btn-street-primary"
                  : "btn text-street-base"
              }
            `}
          >
            <span className="flex-grow-1 fw-medium text-sm">
              {section.label}
            </span>

            {/* Icon priority */}
            {hasError ? (
              <Icon icon="mdi:alert-circle" width={18} className="text-white" />
            ) : (
              section.icon && <span className="opacity-75">{section.icon}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

interface SectionRendererProps {
  section: string;
  formik: FormikProps<FunctionalAbilityFormValues>;
}

const SectionRenderer = ({ section, formik }: SectionRendererProps) => {
  switch (section) {
    case "claim-worker":
      return (
        <ClaimWorkerSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          setFieldValue={formik.setFieldValue}
          setFieldTouched={formik.setFieldTouched}
        />
      );

    case "employer":
      return (
        <EmployerSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          setFieldValue={formik.setFieldValue}
        />
      );

    case "job":
      return (
        <JobInjurySection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          setFieldValue={formik.setFieldValue}
          setFieldTouched={formik.setFieldTouched}
        />
      );
    case "healthPro&bill":
      return (
        <HealthProfessionalBillSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          setFieldValue={formik.setFieldValue}
          setFieldTouched={formik.setFieldTouched}
        />
      );
    case "abilities":
      return (
        <AbilitiesSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          setFieldValue={formik.setFieldValue}
          setFieldTouched={formik.setFieldTouched}
          handleBlur={formik.handleBlur}
        />
      );

    case "restrictions":
      return (
        <RestrictionsSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          setFieldValue={formik.setFieldValue}
          setFieldTouched={formik.setFieldTouched}
        />
      );

    case "assessment":
      return (
        <AssesmentSection
          values={formik.values}
          errors={formik.errors}
          touched={formik.touched}
          handleChange={formik.handleChange}
          setFieldValue={formik.setFieldValue}
          setFieldTouched={formik.setFieldTouched}
          handleBlur={formik.handleBlur}
        />
      );

    default:
      return null;
  }
};

const EditFAbilties = ({ data }: { data: FunctionalAbility }) => {
  const [showModal, setShowModal] = useState(false);
  const [editfaf, { isLoading }] = useEditFAFMutation();
  const [
    getFaf,
    { data: response, isLoading: isFetching, isFetching: isRefetching },
  ] = useLazyGetFafByIdQuery();
  useEffect(() => {
    if (showModal) {
      getFaf({ id: data._id! });
    }
  }, [showModal, getFaf, data._id]);
  const fAbility = response?.data;
  const [activeSection, setActiveSection] = useState("claim-worker");
  const loading = isFetching || isRefetching;
  const handleSubmit = async (
    values: FunctionalAbilityFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const payload: any = { ...values };
      if (!values.hstAmount) {
        delete payload.hstAmount;
      }
      if (!values.hstRegNo) {
        delete payload.hstRegNo;
      }
      if (!values.hstSrvcCode) {
        delete payload.hstSrvcCode;
      }
      if (values.returnToWorkStatus === "withRestrictions") {
        payload.abilities = extractAbilities(values.abilities);
        payload.restrictions = extractRestrictions(values.restrictions);
      } else if (values.returnToWorkStatus === "noRestrictions") {
        delete payload.abilities;
        delete payload.restrictions;
        delete payload.commentsOnAbilties;
        delete payload.isDiscussRTWtoPatient;
        delete payload.assessmentDuration;
        delete payload.recomendedHours;
        delete payload.startdate;
      } else if (values.returnToWorkStatus === "unable") {
        delete payload.abilities;
        delete payload.restrictions;
        delete payload.commentsOnAbilties;
        delete payload.assessmentDuration;
        delete payload.recomendedHours;
        delete payload.startdate;
        delete payload.isDiscussRTWtoPatient;
      }

      // Conditional fields

      if (values.discussedRTW) delete payload.nodateOfDiscusswill;
      if (values.designationOfHealthPro !== "Other")
        delete payload.otherDesignation;
      if (!values.iswsibRegistered) delete payload.wsibId;

      const res = await editfaf({ id: data._id!, creds: payload }).unwrap();

      if (res.success) {
        showSuccess(res.message);
        resetForm();
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <>
      {" "}
      <button
        className="btn btn-sm btn-street-edit radius-12 d-flex align-items-center justify-content-center p-0"
        style={{ width: "43px", height: "40px" }}
        onClick={() => setShowModal(true)}
      >
        <Icon icon="tabler:edit" className="text-xl" />
      </button>{" "}
      <ModalWrapper
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        title="Employee Incident Report"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 "
        bodyClassName="p-0 d-flex flex-column "
        footerClassName="pt-16 px-0 pb-0"
        isLoading={loading || isLoading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={loading || isLoading}
            variant="spinner"
            size="lg"
            message={loading ? "Loading Data.." : "Updating Incident Report"}
          />
        }
        footer={
          <>
            <button
              className="btn btn-street-primary btn-street-lg radius-12 d-flex align-items-center justify-content-center"
              type="submit"
              form="edit-functional-abilty-form"
            >
              Update
            </button>
          </>
        }
      >
        {!loading && fAbility && (
          <div className="d-flex flex-column" style={{ minHeight: "56vh" }}>
            <Formik
              initialValues={buildInitialValues(fAbility)}
              validationSchema={functionalAbilityFormSchema}
              onSubmit={handleSubmit}
            >
              {(formik) => {
                const returnToWorkStatus = formik.values
                  .returnToWorkStatus as ReturnToWorkStatus;

                const visibleSections = SECTIONS.filter((section) => {
                  if (section.key === "abilities") {
                    return SECTION_VISIBILITY.abilities.includes(
                      returnToWorkStatus
                    );
                  }
                  if (section.key === "restrictions") {
                    return SECTION_VISIBILITY.restrictions.includes(
                      returnToWorkStatus
                    );
                  }
                  return true;
                });

                return (
                  <Form
                    className="d-flex"
                    id="edit-functional-abilty-form"
                    onSubmit={formik.handleSubmit}
                  >
                    {/* Sidebar */}
                    <div
                      className="d-sm-none d-block "
                      style={{
                        maxWidth: "100%",
                        overflowX: "hidden",
                      }}
                    >
                      <StreetTab
                        tabs={visibleSections.map((m) => {
                          return {
                            content: (
                              <div
                                className="pt-20 px-8"
                                style={{ background: "var(--street-bg-f2)" }}
                              >
                                <SectionRenderer
                                  section={m.key}
                                  formik={formik}
                                />
                              </div>
                            ),
                            key: m.key,
                            label: m.label,
                          };
                        })}
                      />
                    </div>
                    <div
                      className="p-16 d-sm-block d-none"
                      style={{ background: "var(--street-bg-f2)" }}
                    >
                      {" "}
                      <Sidebar
                        onSectionChange={(key) => setActiveSection(key)}
                        activeSection={activeSection}
                        sections={visibleSections}
                        formik={formik}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1 p-24 d-sm-block d-none">
                      <div
                        style={{
                          maxHeight: "50vh",
                          overflowY: "auto",
                          overflowX: "hidden",
                          scrollbarWidth: "thin",
                        }}
                      >
                        {" "}
                        <SectionRenderer
                          section={activeSection}
                          formik={formik}
                        />
                      </div>{" "}
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        )}
      </ModalWrapper>
    </>
  );
};

export default EditFAbilties;
