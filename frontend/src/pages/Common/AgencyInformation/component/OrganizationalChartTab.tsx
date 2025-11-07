import { useState } from "react";
import MobileTree from "./Organizational/MobileTree";
import TreeGraph from "./Organizational/OrganizationalChart";
import ActionOrgNode from "./Organizational/ActionOrgNode";

const OrganizationalChartTab = () => {
  const [show, setshow] = useState(false);
  return (
    <>
      <div className="card">
        <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-20 radius-12">
          <div className="d-flex flex-row justify-content-between">
            {" "}
            <h3 className="fw-bold text-md mb-0 sm:text-lg md:text-xl">
              Organizational Structure
            </h3>
            <button onClick={()=>setshow(true)} className="btn btn-street-primary">Add New Role </button>
          </div>

          <div className="d-none d-sm-block">
            <TreeGraph />
          </div>
          <MobileTree />
        </div>
      </div>
      {show && <ActionOrgNode show={show} onHide={() => setshow(false)} />}
    </>
  );
};

export default OrganizationalChartTab;
