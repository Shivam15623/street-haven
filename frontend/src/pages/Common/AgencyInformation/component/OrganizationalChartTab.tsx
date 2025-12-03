import { useState } from "react";
import MobileTree from "./Organizational/MobileTree";
import TreeGraph from "./Organizational/OrganizationalChart";
import ActionOrgNode from "./Organizational/ActionOrgNode";
import useHasPermission from "../../../../hooks/Auth";

const OrganizationalChartTab = () => {
  const [show, setshow] = useState(false);
  const { hasPermission } = useHasPermission();
  return (
    <>
      <div className="card">
        <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-20 radius-12">
          <div className="d-flex flex-row justify-content-between">
            {" "}
            <h3 className="fw-bold text-md mb-0 sm:text-lg md:text-xl">
              Organizational Structure
            </h3>
            {hasPermission({ action: "create_org_chart" }) && (
              <button
                onClick={() => setshow(true)}
                className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12"
                style={{ minWidth: "43px", minHeight: "40px" }}
              >
                Add New Role{" "}
              </button>
            )}
          </div>

          <div className="d-none d-sm-block">
            <TreeGraph />
          </div>
          <MobileTree />
        </div>
      </div>
      {(show&&hasPermission({ action: "create_org_chart" })) && <ActionOrgNode show={show} onHide={() => setshow(false)} />}
    </>
  );
};

export default OrganizationalChartTab;
