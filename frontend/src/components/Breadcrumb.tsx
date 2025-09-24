import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items = [] }) => {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
      {/* Page Title */}
      <h6 className="fw-semibold mb-0">
        {items.length > 0 ? items[items.length - 1].label : ""}
      </h6>

      {/* Breadcrumb List */}
      <ul className="d-flex align-items-center gap-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li className="fw-medium">
              {item.path ? (
                <Link
                  to={item.path}
                  className="d-flex align-items-center gap-1 hover-text-primary"
                >
                  {item.icon && (
                    <Icon icon={item.icon} className="icon text-lg" />
                  )}
                  {item.label}
                </Link>
              ) : (
                <span className="d-flex align-items-center gap-1">
                  {item.icon && (
                    <Icon icon={item.icon} className="icon text-lg" />
                  )}
                  {item.label}
                </span>
              )}
            </li>

            {/* Separator */}
            {index < items.length - 1 && <li>-</li>}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default Breadcrumb;
