import React, { useState } from "react";

type TabItem = {
  key: string; // unique key for tab
  label: string; // tab label
  content: React.ReactNode; // tab content
};

interface StreetTabProps {
  tabs: TabItem[];
  defaultActiveKey?: string; // initial active key for uncontrolled mode
  activeKey?: string; // controlled active key
  onTabChange?: (key: string) => void; // callback for parent when tab changes
}

const StreetTab: React.FC<StreetTabProps> = ({
  tabs,
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onTabChange,
}) => {
  // Uncontrolled mode state
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey ?? tabs[0].key
  );

  // Determine current active key (controlled vs uncontrolled)
  const activeKey = controlledActiveKey ?? internalActiveKey;

  const handleTabClick = (key: string) => {
    if (!controlledActiveKey) {
      setInternalActiveKey(key); // only update internal state if uncontrolled
    }
    onTabChange?.(key); // notify parent
  };

  return (
    <>
      <ul
        className="nav bordered-tab border border-top-0 border-start-0 gap-32 border-end-0 d-flex flex-row flex-nowrap overflow-x-auto overflow-y-hidden nav-pills"
        id="pills-tab"
        role="tablist"
        style={{ scrollbarWidth: "thin" }}
      >
        {tabs.map((tab) => (
          <li className="nav-item" role="presentation" key={tab.key}>
            <button
              className={`nav-link h-100 text-center px-0 pb-18 text-xs xs:text-sm ${
                activeKey === tab.key ? "active" : ""
              }`}
              style={{ minWidth: "110px", lineHeight: "normal" }}
              id={`pills-${tab.key}-tab`}
              type="button"
              role="tab"
              aria-controls={`pills-${tab.key}`}
              aria-selected={activeKey === tab.key ? "true" : "false"}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content" id="pills-tabContent">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tab-pane fade ${
              activeKey === tab.key ? "show active" : ""
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
