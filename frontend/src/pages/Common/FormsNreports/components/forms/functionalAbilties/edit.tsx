import { useState } from "react";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";

import EmployerSection from "./sections/EmployerSection";
import JobInjurySection from "./sections/JobInjurySection";
import ClaimWorkerSection from "./sections/ClaimSection";
import AbilitiesSection from "./sections/AbilitiesSection";
import RestrictionsSection from "./sections/RestrictionsSection";
import { Icon } from "@iconify/react/dist/iconify.js";
const SECTIONS = [
  { key: "claim-worker", label: "Claim & Worker Info" },

  { key: "employer", label: "Employer Info" },
  { key: "job", label: "Job & Injury" },
  { key: "abilities", label: "Functional Abilities" },
  { key: "restrictions", label: "Restrictions" },
  { key: "assessment", label: "Assessment" },
  { key: "review", label: "Review & Submit" },
] as const;
interface SidebarProps {
  active: string;
  onChange: (key: string) => void;
}
type ReturnToWorkStatus = "noRestrictions" | "withRestrictions" | "unable";

const SECTION_VISIBILITY = {
  abilities: ["withRestrictions", "unable"],
  restrictions: ["withRestrictions"],
  assessment: ["noRestrictions", "withRestrictions", "unable"],
} as const;

const Sidebar: React.FC<SidebarProps & { sections: typeof SECTIONS }> = ({
  active,
  onChange,
  sections,
}) => {
  return (
    <div className="border-end pe-2" style={{ minWidth: "220px" }}>
      <ul className="nav nav-pills flex-column gap-1">
        {sections.map((s) => (
          <li className="nav-item" key={s.key}>
            <button
              type="button"
              className={`nav-link text-start w-100 ${
                active === s.key ? "active" : "text-dark"
              }`}
              onClick={() => onChange(s.key)}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SectionRenderer = ({ section }: { section: string }) => {
  switch (section) {
    case "claim":
      return <ClaimWorkerSection />;

    case "employer":
      return <EmployerSection />;
    case "job":
      return <JobInjurySection />;
    case "abilities":
      return <AbilitiesSection />;
    case "restrictions":
      return <RestrictionsSection />;

    default:
      return null;
  }
};

const EditFAbilties = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("claim");
  //   const returnToWorkStatus: ReturnToWorkStatus =
  //   watch("returnToWorkStatus");
  const returnToWorkStatus: ReturnToWorkStatus = "withRestrictions";
  const visibleSections = SECTIONS.filter((section) => {
    if (section.key === "abilities") {
      return SECTION_VISIBILITY.abilities.includes(returnToWorkStatus);
    }

    if (section.key === "restrictions") {
      return SECTION_VISIBILITY.restrictions.includes(returnToWorkStatus);
    }

    if (section.key === "assessment") {
      return SECTION_VISIBILITY.assessment.includes(returnToWorkStatus);
    }

    return true; // always show others
  });
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
        className="p-20 gap-16"
        bodyClassName="p-0 d-flex flex-column gap-16"
        footerClassName="pt-16 px-0 pb-0"
        isLoading={false}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={false}
            variant="spinner"
            size="lg"
            message="Updating Incident Report"
          />
        }
      >
        <div className="d-flex" style={{ minHeight: "56vh" }}>
          {/* Sidebar */}
          <Sidebar
            active={activeSection}
            onChange={setActiveSection}
            sections={visibleSections}
          />

          {/* Content */}
          <div className="flex-grow-1 ps-4">
            <SectionRenderer section={activeSection} />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
};

export default EditFAbilties;
