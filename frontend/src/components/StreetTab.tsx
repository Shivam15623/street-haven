import React from "react";

type TabItem = {
  key: string; // unique key for tab
  label: string; // tab label
  content: React.ReactNode; // tab content
};

interface StreetTabProps {
  tabs: TabItem[];
  defaultActiveKey?: string;
}

const StreetTab: React.FC<StreetTabProps> = ({ tabs, defaultActiveKey }) => {
  return (
    <>
      <ul
        className="nav  bordered-tab border border-top-0 border-start-0 gap-10 gap-sm-16 gap-md-32 border-end-0 d-inline-flex nav-pills "
        id="pills-tab"
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <li className="nav-item" role="presentation" key={tab.key}>
            <button
              className={`nav-link h-100 text-center px-0 pb-24 text-xs xs:text-sm ${
                (defaultActiveKey && defaultActiveKey === tab.key) ||
                (!defaultActiveKey && index === 0)
                  ? "active"
                  : ""
              }`} 
              style={{maxWidth:"165px"}}
              id={`pills-${tab.key}-tab`}
              data-bs-toggle="pill"
              data-bs-target={`#pills-${tab.key}`}
              type="button"
              role="tab"
              aria-controls={`pills-${tab.key}`}
              aria-selected={
                (defaultActiveKey && defaultActiveKey === tab.key) ||
                (!defaultActiveKey && index === 0)
                  ? "true"
                  : "false"
              }
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content" id="pills-tabContent">
        {tabs.map((tab, index) => (
          <div
            key={tab.key}
            className={`tab-pane fade ${
              (defaultActiveKey && defaultActiveKey === tab.key) ||
              (!defaultActiveKey && index === 0)
                ? "show active"
                : ""
            }`}
            id={`pills-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`pills-${tab.key}-tab`}
            tabIndex={0}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
};

export default StreetTab;
