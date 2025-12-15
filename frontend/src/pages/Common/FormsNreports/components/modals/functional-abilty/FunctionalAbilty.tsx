import { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import { FormField, StatusField } from "./FormField";
import { FormSection } from "./FormSection";
import { AbilitiesGrid } from "./AbiltiesGrid";
import { RestrictionsGrid } from "./RestrictionGrid";
import type { FunctionalAbility } from "../../../../../../services/FormApi";
import { Icon } from "@iconify/react/dist/iconify.js";

interface FunctionalAbilityDetailProps {
  details: FunctionalAbility;
}

export function FunctionalAbilityDetail({
  details,
}: FunctionalAbilityDetailProps) {
  const [showModal, setShowModal] = useState(false);

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
      >
        {/* Scrollable Modal Body */}
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
                      value={details.claimNo}
                      type="text"
                      highlight
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <FormField
                      label="Date of Accident"
                      value={details.dateOfAccident}
                      type="date"
                      highlight
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <FormField
                      label="Type of Job"
                      value={details.typeOfJobAtAccident}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <FormField
                      label="Areas of Injury"
                      value={details.areasOfInjury}
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
                      value={details.worker?.firstName}
                    />
                    <FormField
                      label="Last Name"
                      value={details.worker?.lastName}
                    />
                    <FormField
                      label="Date of Birth"
                      value={details.worker?.dateOfBirth}
                      type="date"
                    />
                    <FormField
                      label="Telephone"
                      value={details.worker?.telephone}
                    />
                    <FormField
                      label="Address"
                      value={details.worker?.address}
                      className="lg:col-span-2"
                    />
                    <FormField
                      label="City/Town"
                      value={details.worker?.cityTown}
                    />
                    <FormField
                      label="Province"
                      value={details.worker?.province}
                    />
                    <FormField
                      label="Postal Code"
                      value={details.worker?.postalCode}
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
                    value={details.employer?.fullName}
                  />
                  <FormField
                    label="Telephone"
                    value={details.employer?.telephone}
                  />
                  <FormField label="Fax No." value={details.employerFaxNo} />
                  <FormField
                    label="Address"
                    value={details.employer?.address}
                    className="lg:col-span-2"
                  />
                  <FormField
                    label="City/Town"
                    value={details.employer?.cityTown}
                  />
                  <FormField
                    label="Province"
                    value={details.employer?.province}
                  />
                  <FormField
                    label="Postal Code"
                    value={details.employer?.postalCode}
                  />
                </div>

                <hr />

                <div className="row  gy-3 gy-md-0 gx-0 gx-md-4">
                  <div className="col-6 col-md-3">
                    <FormField
                      label="Discussed RTW"
                      value={details.discussedRTW}
                      type="boolean"
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    {" "}
                    <FormField
                      label="Discussion Date"
                      value={details.nodateOfDiscusswill}
                      type="date"
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    {" "}
                    <FormField
                      label="Contact Name"
                      value={details.employerContactName}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <FormField label="Position" value={details.position} />
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
                    value={details.designationOfHealthPro}
                  />
                  <FormField
                    label="Professional Name"
                    value={details.healthProfessionalName}
                  />
                  <FormField
                    label="WSIB Registered"
                    value={details.iswsibRegistered}
                    type="boolean"
                  />
                  <FormField label="WSIB ID" value={details.wsibId} />
                  <FormField label="Invoice Number" value={details.invoiceNo} />
                  <FormField label="Service Code" value={details.srvCode} />
                </div>

                <hr />

                {/* Address */}
                <div className="form-field-grid">
                  <FormField
                    label="Address"
                    value={details.hproAddress}
                    className="lg:col-span-2"
                  />
                  <FormField label="City/Town" value={details.hprocityTown} />
                  <FormField label="Province" value={details.hproProvince} />
                  <FormField
                    label="Postal Code"
                    value={details.hproPostalCode}
                  />
                  <FormField label="Fax" value={details.hproFax} />
                </div>

                <hr />

                {/* HST Info */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    HST Information
                  </h4>
                  <div className="row  gy-3 gy-md-0 gx-0 gx-md-4">
                    <div className="col-6 col-md-3">
                      <FormField
                        label="HST Registration No."
                        value={details.hstRegNo}
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      {" "}
                      <FormField
                        label="HST Service Code"
                        value={details.hstSrvcCode}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      {" "}
                      <FormField
                        label="HST Amount"
                        value={details.hstAmount}
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
                    value={details.assesmentDate}
                    type="date"
                    highlight
                  />
                </div>
                <div className="col-6 ">
                  {" "}
                  {details.returnToWorkStatus && (
                    <StatusField
                      label="Return to Work Status"
                      status={details.returnToWorkStatus}
                      className="sm:col-span-2"
                    />
                  )}
                </div>
              </div>
            </FormSection>

            {/* Section E: Abilities */}
            <FormSection title="Functional Abilities" sectionId="E" variant="e">
              <AbilitiesGrid abilities={details.abilities} />
            </FormSection>

            {/* Section E.2: Restrictions */}
            <FormSection title="Restrictions" sectionId="E" variant="e">
              <RestrictionsGrid restrictions={details.restrictions} />

              {details.commentsOnAbilties && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Additional Comments
                  </h4>
                  <p className="text-sm text-foreground">
                    {details.commentsOnAbilties}
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
                    value={details.assessmentDuration}
                  />
                </div>
                <div className="col-6 col-md-3">
                  {" "}
                  <FormField
                    label="Discussed RTW with Patient"
                    value={details.isDiscussRTWtoPatient}
                    type="boolean"
                  />
                </div>

                <div className="col-6 col-md-3">
                  <FormField
                    label="Next Appointment"
                    value={details.nextAppointmentDate}
                    type="date"
                    highlight
                  />
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
