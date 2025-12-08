import { useFetchAgreementsQuery } from "../../../../services/AgreementApi";
import CollectiveAgreementCard from "./CollectiveAgreementCard";

const CollectiveAgreementTab = () => {
  const { data, isLoading, isError } = useFetchAgreementsQuery();

  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Failed to load agreements.</div>;

  const agreements = data?.data || [];

  if (agreements.length === 0) {
    return <div>No Agreements found.</div>;
  }

  return (
    <div className="d-flex flex-column gap-24">
      {agreements.map((agreement) => (
        <CollectiveAgreementCard key={agreement._id} agreement={agreement} />
      ))}
    </div>
  );
};

export default CollectiveAgreementTab;
