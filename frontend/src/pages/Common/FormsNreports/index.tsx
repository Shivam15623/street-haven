import "@assets/css/PageCss/forms.css";
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import FormsNDReports from "./components/FormsNDReports";
import Submissions from "./components/Submissions";
import useHasPermission from "../../../hooks/Auth";

type Tab = "form" | "submissions";

const FormsNreports = () => {
  const [activeTab, setActiveTab] = useState<Tab>("form");
  const [activeKey, setActiveKey] = useState("incident_report");
  const { hasPermission } = useHasPermission();
  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between gap-4 align-items-sm-center">
        <div className=" d-sm-flex flex-column gap-2">
          <p className="fw-semibold text-xl xs:text-xxl text-street-dark">
            Forms & Reports
          </p>
          <p className="fw-normal text-sm xs:text-md">
            Submit reports, provide feedback, and view job postings
          </p>
        </div>
        {hasPermission({ action: "view_submissions" }) && (
          <div className="d-flex justify-content-end">
            <div className="form-sub-toggle w-fit flex-grow-1 d-inline-flex d-sm-flex flex-row p-6 gap-1 radius-12">
              {/* Form Tab */}
              <div
                onClick={() => setActiveTab("form")}
                className={`${
                  activeTab === "form"
                    ? "bg-street-primary text-white"
                    : "bg-transparent text-street-base"
                } d-flex gap-8 align-items-center formTab justify-content-center   px-sm-8 px-16 p-8 radius-8 cursor-pointer`}
              >
                <Icon icon="mdi:form-select" className="text-lg" />
                <span className="text-xs fw-semibold">Form</span>
              </div>

              {/* Submissions Tab */}
              <div
                onClick={() => setActiveTab("submissions")}
                className={`${
                  activeTab === "submissions"
                    ? "bg-street-primary text-white"
                    : "bg-transparent text-street-base"
                } d-flex gap-8 align-items-center justify-content-center formTab   p-6 p-sm-8 radius-8 cursor-pointer`}
              >
                <Icon icon="mdi:file-document" className="text-lg" />
                <span className="text-xs fw-semibold">Submissions</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "form" && (
        <FormsNDReports
          activeKey={activeKey}
          isViewActive={activeTab === "form"}
          onTabChange={(key) => setActiveKey(key)}
        />
      )}
      {activeTab === "submissions" &&
        hasPermission({ action: "view_submissions" }) && (
          <Submissions
            activeKey={activeKey}
            isViewActive={activeTab === "submissions"}
            onTabChange={(key) => setActiveKey(key)}
          />
        )}
    </div>
  );
};

export default FormsNreports;
