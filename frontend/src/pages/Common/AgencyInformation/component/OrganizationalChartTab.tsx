
import MobileTree from "./Organizational/MobileTree";
import TreeGraph from "./Organizational/OrganizationalChart";

const OrganizationalChartTab = () => {

  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-20 radius-12">
        <h3 className="fw-bold text-md mb-0 sm:text-lg md:text-xl">
          Organizational Structure
        </h3>
        <div className="d-none d-sm-block">
          <TreeGraph />
        </div>
        <MobileTree />
      </div>
    </div>
  );
};

export default OrganizationalChartTab;
