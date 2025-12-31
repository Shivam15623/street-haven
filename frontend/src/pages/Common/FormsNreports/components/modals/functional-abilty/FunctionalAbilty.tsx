import { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import { FormField, StatusField } from "./FormField";
import { FormSection } from "./FormSection";
import { AbilitiesGrid } from "./AbiltiesGrid";
import { RestrictionsGrid } from "./RestrictionGrid";
import {
  CANADA_PROVINCES,
  useGetFafByIdQuery,
  type FunctionalAbility,
} from "../../../../../../services/FormApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";

interface FunctionalAbilityDetailProps {
  details: FunctionalAbility;
}
const provinceLabel = (value: string) =>
  CANADA_PROVINCES.find((p) => p.value === value)?.label ?? "-";

export function FunctionalAbilityDetail({
  details,
}: FunctionalAbilityDetailProps) {
  const [showModal, setShowModal] = useState(false);
  const {
    data: response,
    isLoading: isFetching,
    isFetching: isRefetching,
  } = useGetFafByIdQuery({ id: details._id! }, { skip: !showModal });
  const fAbility = response?.data;
  const loading = isFetching || isRefetching;
  console.log(fAbility);

  return (
    <>
      <button
        className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        View Details
      </button>

      <ModalWrapper
        show={showModal}
        title="Submission Detail:Functional Abilties Form"
        size="xl"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
        isLoading={loading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={loading}
            variant="spinner"
            size="lg"
            message={"Loading Data..."}
          />
        }
      >
        {/* Scrollable Modal Body */}

        {!loading && fAbility && (
          <div className="p-6 d-flex flex-column gap-20">
            {/* Section A: Claim & Worker Information */}
            <FormSection
              title="Worker & Claim Information"
              sectionId="A"
              variant="a"
            >
              <div className="d-flex flex-column gap-10">
                {/* Claim Info Row */}
                <div className="row  gy-3 gy-md-0 gx-0 gx-md-4">
                  <div className="col-12">
                    <FormField
                      label="Claim No"
                      value={fAbility.claimNo}
                      type="text"
                      highlight
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <FormField
                      label="Date of Accident"
                      value={fAbility.dateOfAccident}
                      type="date"
                      highlight
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <FormField
                      label="Type of Job"
                      value={fAbility.typeOfJobAtAccident}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormField
                      label="Areas of Injury"
                      value={fAbility.areasOfInjury}
                    />
                  </div>
                </div>

                <hr />

                {/* Worker Info */}
                <div>
                  <h4 className="text-md d-flex  fw-semibold uppercase tracking-wider text-street-base mb-20  align-items-center gap-2">
                    <Icon icon="mdi:account" className="w-4 h-4" />
                    Worker Details
                  </h4>
                  <div className="form-field-grid">
                    <FormField
                      label="First Name"
                      value={fAbility.worker?.firstName}
                    />
                    <FormField
                      label="Last Name"
                      value={fAbility.worker?.lastName}
                    />
                    <FormField
                      label="Date of Birth"
                      value={fAbility.worker?.dateOfBirth}
                      type="date"
                    />
                    <FormField
                      label="Telephone"
                      value={fAbility.worker?.telephone}
                    />
                    <FormField
                      label="Address"
                      value={fAbility.worker?.address}
                      className="lg:col-span-2"
                    />
                    <FormField
                      label="City/Town"
                      value={fAbility.worker?.cityTown}
                    />
                    <FormField
                      label="Province"
                      value={provinceLabel(fAbility.worker?.province)}
                    />
                    <FormField
                      label="Postal Code"
                      value={fAbility.worker?.postalCode}
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Employer Information */}
            <FormSection title="Employer Information" sectionId="B" variant="b">
              <div className="d-flex flex-column gap-8">
                <div className="form-field-grid">
                  <FormField
                    label="Employer Name"
                    value={fAbility.employer?.fullName}
                  />
                  <FormField
                    label="Telephone"
                    value={fAbility.employer?.telephone}
                  />
                  <FormField label="Fax No." value={fAbility.employerFaxNo} />
                  <FormField
                    label="Address"
                    value={fAbility.employer?.address}
                    className="lg:col-span-2"
                  />
                  <FormField
                    label="City/Town"
                    value={fAbility.employer?.cityTown}
                  />
                  <FormField
                    label="Province"
                    value={provinceLabel(fAbility.employer?.province)}
                  />
                  <FormField
                    label="Postal Code"
                    value={fAbility.employer?.postalCode}
                  />
                </div>

                <hr />

                <div className="row  gy-3 gy-md-0 gx-0 gx-md-4">
                  <div className="col-6 col-md-3">
                    <FormField
                      label="Discussed RTW"
                      value={fAbility.discussedRTW}
                      type="boolean"
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    {" "}
                    <FormField
                      label="Discussion Date"
                      value={fAbility.nodateOfDiscusswill}
                      type="date"
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    {" "}
                    <FormField
                      label="Contact Name"
                      value={fAbility.employerContactName}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <FormField label="Position" value={fAbility.position} />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Section C: Health Professional */}
            <FormSection
              title="Health Professional's Billing Information"
              sectionId="C"
              variant="c"
            >
              <div className="d-flex flex-column gap-8">
                <div className="form-field-grid">
                  <FormField
                    label="Designation"
                    value={fAbility.designationOfHealthPro}
                  />
                  <FormField
                    label="Professional Name"
                    value={fAbility.healthProfessionalName}
                  />
                  <FormField
                    label="WSIB Registered"
                    value={fAbility.iswsibRegistered}
                    type="boolean"
                  />
                  <FormField label="WSIB ID" value={fAbility.wsibId} />
                  <FormField
                    label="Invoice Number"
                    value={fAbility.invoiceNo}
                  />
                  <FormField label="Service Code" value={fAbility.srvCode} />
                </div>

                <hr />

                {/* Address */}
                <div className="form-field-grid">
                  <FormField
                    label="Address"
                    value={fAbility.hproAddress}
                    className="lg:col-span-2"
                  />
                  <FormField label="City/Town" value={fAbility.hprocityTown} />
                  <FormField
                    label="Province"
                    value={provinceLabel(fAbility.hproProvince)}
                  />
                  <FormField
                    label="Postal Code"
                    value={fAbility.hproPostalCode}
                  />
                  <FormField label="Fax" value={fAbility.hproFax} />
                </div>

                <hr />

                {/* HST Info */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-street-base-foreground mb-4">
                    HST Information
                  </h4>
                  <div className="row  gy-3 gy-md-0 gx-0 gx-md-4">
                    <div className="col-6 col-md-3">
                      <FormField
                        label="HST Registration No."
                        value={fAbility.hstRegNo}
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      {" "}
                      <FormField
                        label="HST Service Code"
                        value={fAbility.hstSrvcCode}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      {" "}
                      <FormField
                        label="HST Amount"
                        value={fAbility.hstAmount}
                        type="currency"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Section D: Assessment */}
            <FormSection
              title="Assessment Information"
              sectionId="D"
              variant="d"
            >
              <div className="row  gy-3 gy-md-0 gx-0 gx-md-4">
                <div className="col-6 ">
                  <FormField
                    label="Assessment Date"
                    value={fAbility.assesmentDate}
                    type="date"
                    highlight
                  />
                </div>
                <div className="col-6 ">
                  {" "}
                  {fAbility.returnToWorkStatus && (
                    <StatusField
                      label="Return to Work Status"
                      status={fAbility.returnToWorkStatus}
                      className="sm:col-span-2"
                    />
                  )}
                </div>
              </div>
            </FormSection>

            {/* Section E: Abilities */}
            <FormSection title="Functional Abilities" sectionId="E" variant="e">
              <AbilitiesGrid abilities={fAbility.abilities} />
            </FormSection>

            {/* Section E.2: Restrictions */}
            <FormSection title="Restrictions" sectionId="E" variant="e">
              <RestrictionsGrid restrictions={fAbility.restrictions} />

              {fAbility.commentsOnAbilties && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-street-base-foreground mb-2">
                    Additional Comments
                  </h4>
                  <p className="text-sm text-foreground">
                    {fAbility.commentsOnAbilties}
                  </p>
                </div>
              )}
            </FormSection>

            {/* Section F: Follow-up */}
            <FormSection
              title="Follow-up Information"
              sectionId="F"
              variant="f"
            >
              <div className="row  gy-3 gy-md-0 gx-0 gx-md-4">
                <div className="col-6 col-md-3">
                  <FormField
                    label="Assessment Duration"
                    value={fAbility.assessmentDuration}
                  />
                </div>
                <div className="col-6 col-md-3">
                  {" "}
                  <FormField
                    label="Discussed RTW with Patient"
                    value={fAbility.isDiscussRTWtoPatient}
                    type="boolean"
                  />
                </div>

                <div className="col-6 col-md-3">
                  <FormField
                    label="Next Appointment"
                    value={fAbility.nextAppointmentDate}
                    type="date"
                    highlight
                  />
                </div>
              </div>
            </FormSection>
            <FormSection title="Form Distribution" sectionId="G" variant="f">
              <div className="border rounded p-3">
                <p className="fw-semibold mb-2">
                  I have provided this completed Functional Abilities Form to:
                </p>

                <div className="d-flex align-items-center gap-4">
                  {/* Worker */}
                  <div className="d-flex align-items-center gap-2">
                    <Icon
                      icon={
                        fAbility.providedTo?.worker
                          ? "mdi:checkbox-marked"
                          : "mdi:checkbox-blank-outline"
                      }
                      className={
                        fAbility.providedTo?.worker
                          ? "text-success"
                          : "text-street-base"
                      }
                      width={20}
                    />
                    <span className="fw-medium">Worker</span>
                  </div>

                  <span className="fw-semibold text-street-base">and/or</span>

                  {/* Employer */}
                  <div className="d-flex align-items-center gap-2">
                    <Icon
                      icon={
                        fAbility.providedTo?.employer
                          ? "mdi:checkbox-marked"
                          : "mdi:checkbox-blank-outline"
                      }
                      className={
                        fAbility.providedTo?.employer
                          ? "text-success"
                          : "text-street-base"
                      }
                      width={20}
                    />
                    <span className="fw-medium">Employer</span>
                  </div>
                </div>
              </div>
            </FormSection>
          </div>
        )}
      </ModalWrapper>
    </>
  );
}
