import React, { useState } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import type { FunctionalAbility } from "../../../../../services/FormApi";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="col-md-4 d-flex flex-column gap-1">
    <div className="text-sm text-street-base">{label}</div>
    <div className="text-sm text-street-dark">{value || "N/A"}</div>
  </div>
);

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-16">
    <div className="text-lg xl:text-xl mb-2">{title}</div>
    <div className="row g-3">{children}</div>
  </div>
);

const FuctionalAbiltiesDetail = ({
  details,
}: {
  details: FunctionalAbility;
}) => {
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
        title="Add New Employee"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
      >
        {/* Scrollable Modal Body */}
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <DetailSection title="📋 Claim Information">
            <DetailItem label="Claim Number" value={details.claimNo} />
            <DetailItem
              label="Date of Accident"
              value={new Date(details.dateOfAccident).toLocaleDateString(
                "en-IN"
              )}
            />
            <DetailItem
              label="Type of Job at Accident"
              value={details.typeOfJobAtAccident}
            />
            <DetailItem label="Areas of Injury" value={details.areasOfInjury} />
          </DetailSection>
          {/* Worker Info */}
          <DetailSection title="👤 Worker Information">
            <DetailItem label="First Name" value={details.worker.firstName} />
            <DetailItem label="Last Name" value={details.worker.lastName} />
            <DetailItem
              label="Date of Birth"
              value={new Date(details.worker.dateOfBirth).toLocaleDateString(
                "en-IN"
              )}
            />
            <DetailItem label="Telephone" value={details.worker.telephone} />
            <DetailItem label="Address" value={details.worker.address} />
            <DetailItem label="City/Town" value={details.worker.cityTown} />
            <DetailItem label="Province" value={details.worker.province} />
            <DetailItem label="Postal Code" value={details.worker.postalCode} />
          </DetailSection>

          {/* Employer Info */}
          <DetailSection title="👔 Employer Information">
            <DetailItem label="Full Name" value={details.employer.fullName} />
            <DetailItem label="Telephone" value={details.employer.telephone} />
            <DetailItem label="Address" value={details.employer.address} />
            <DetailItem label="City/Town" value={details.employer.cityTown} />
            <DetailItem label="Province" value={details.employer.province} />
            <DetailItem
              label="Postal Code"
              value={details.employer.postalCode}
            />
            <DetailItem label="Fax No." value={details.employerFaxNo} />
            <DetailItem
              label="Contact Name"
              value={details.employerContactName}
            />
          </DetailSection>

          {/* Health Pro Billing */}
          <DetailSection title="🏥 Health Professional Billing Information">
            <DetailItem
              label="Designation"
              value={details.designationOfHealthPro}
            />
            <DetailItem label="Name" value={details.healthProfessionalName} />
            <DetailItem label="Address" value={details.hproAddress} />
            <DetailItem label="City/Town" value={details.hprocityTown} />
            <DetailItem label="Province" value={details.hproProvince} />
            <DetailItem label="Postal Code" value={details.hproPostalCode} />
            <DetailItem label="Fax" value={details.hproFax} />
            <DetailItem
              label="Contact Name"
              value={details.employerContactName}
            />
          </DetailSection>

          {/* WSIB */}
          <DetailSection title="📄 WSIB Information">
            <DetailItem
              label="WSIB Registered"
              value={details.iswsibRegistered ? "Yes" : "No"}
            />
            <DetailItem label="WSIB ID" value={details.wsibId} />
            <DetailItem label="Invoice Number" value={details.invoiceNo} />
            <DetailItem label="Service Code" value={details.srvCode} />
            <DetailItem
              label="HST Registration Number"
              value={details.hstRegNo}
            />
            <DetailItem label="HST Service Code" value={details.hstSrvcCode} />
            <DetailItem label="HST Amount" value={`$${details.hstAmount}`} />
          </DetailSection>
          <DetailSection title="🩺 Assessment Information">
            <DetailItem
              label="Assessment Date"
              value={new Date(details?.assesmentDate).toLocaleDateString(
                "en-IN"
              )}
            />
            <DetailItem
              label="Current Status"
              value={details.returnToWorkStatus}
            />
            <DetailItem
              label="Assessment Date"
              value={new Date(details?.assesmentDate).toLocaleDateString(
                "en-IN"
              )}
            />
          </DetailSection>
          {details.abilities && (
            <DetailSection title="🧩 Functional Abilities">
              <DetailItem label="Walking" value={details.abilities.walking} />
              <DetailItem label="Standing" value={details.abilities.standing} />
              <DetailItem label="Sitting" value={details.abilities.sitting} />
              <DetailItem
                label="Lifting (Waist to Shoulder)"
                value={details.abilities.liftingWaistToShoulder}
              />
              <DetailItem
                label="Ladder Climbing"
                value={details.abilities.ladderClimbing}
              />
              <DetailItem
                label="Lifting (Floor to Waist)"
                value={details.abilities.liftingFloorToWaist}
              />

              <DetailItem
                label="Travel to Work (Public Transit)"
                value={details.abilities.travelToWork.publicTransit}
              />
              <DetailItem
                label="Travel to Work (Car)"
                value={details.abilities.travelToWork.car}
              />
            </DetailSection>
          )}

          {details.restrictions && (
            <DetailSection title="⚠️ Restrictions">
              {details.restrictions.bendingTwisting && (
                <DetailItem
                  label="Bending / Twisting"
                  value={details.restrictions.bendingTwisting}
                />
              )}

              {details.restrictions.chemicalExposure && (
                <DetailItem
                  label="Chemical Exposure"
                  value={details.restrictions.chemicalExposure}
                />
              )}

              {details.restrictions.environmentalExposure && (
                <DetailItem
                  label="Environmental Exposure"
                  value={details.restrictions.environmentalExposure}
                />
              )}

              {details.restrictions.medicationSideEffects && (
                <DetailItem
                  label="Medication Side Effects"
                  value={details.restrictions.medicationSideEffects}
                />
              )}

              {details.restrictions.operatingMotorizedEquipment && (
                <DetailItem
                  label="Operating Motorized Equipment"
                  value={details.restrictions.operatingMotorizedEquipment}
                />
              )}

              {details.restrictions.workAboveShoulder && (
                <DetailItem
                  label="Work Above Shoulder"
                  value={details.restrictions.workAboveShoulder}
                />
              )}
            </DetailSection>
          )}
        </div>
      </ModalWrapper>
    </>
  );
};

export default FuctionalAbiltiesDetail;
