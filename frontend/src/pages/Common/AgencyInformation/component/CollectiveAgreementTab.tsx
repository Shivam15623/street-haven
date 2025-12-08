import { useState } from "react";
import { useFetchAgreementsQuery } from "../../../../services/AgreementApi";
import CollectiveAgreementCard from "./CollectiveAgreementCard";
import ActionsAgreement from "./ActionsAgreement";
import useHasPermission from "../../../../hooks/Auth";

const CollectiveAgreementTab = () => {
  const { data, isLoading, isError } = useFetchAgreementsQuery();
  const [open, setOpen] = useState(false);
  const { hasPermission } = useHasPermission();
  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Failed to load agreements.</div>;

  const agreements = data?.data || [];

  if (agreements.length === 0) {
    return <div>No Agreements found.</div>;
  }

  return (
    <div className="d-flex flex-column gap-24">
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h2 className="text-md sm:text-lg">Collective Agreement</h2>
        {hasPermission({ action: "create_collective_agreement" }) && (
          <button
            className="btn btn-street-primary   radius-12 text-xxs sm:text-xs radius-12 "
            style={{ minWidth: "43px", minHeight: "40px" }}
            onClick={()=>setOpen(true)}
          >
            {" "}
            + Add Collective Agreement
          </button>
        )}
      </div>
      {agreements.map((agreement) => (
        <CollectiveAgreementCard key={agreement._id} agreement={agreement} />
      ))}
      {open === true && (
        <ActionsAgreement show={open} onHide={() => setOpen(false)} />
      )}
    </div>
  );
};

export default CollectiveAgreementTab;
