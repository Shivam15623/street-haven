import { Icon } from "@iconify/react/dist/iconify.js";

type TicketSummaryCardProps = {
  total: number;
  breakdown: {
    label: string;
    count: number;
    color: string; // hex or css var
  }[];
  icon?: string;
  onClick?: () => void;
  active?: boolean;
};

export const TicketSummaryCard: React.FC<TicketSummaryCardProps> = ({
  total,

  icon = "lucide:tickets",
  onClick,
  active = false,
}) => {
  return (
    <div className="ticket-summary-wrapper" style={{ gridRow: "span 2" }}>
      <div
        className={`card h-100 ticket-card ticket-summary-card  ${active ? "active-count-card total" : ""}`}
        style={{ cursor: "pointer" }}
        onClick={onClick}
      >
        <div className="card-body d-flex flex-row align-items-center justify-content-between h-100 p-16 p-sm-24 gap-3">
          <div className="ticket-icon total summary">
            <Icon icon={icon} width={30} height={30} />
          </div>

          <div className="d-flex flex-column align-items-center gap-1">
            <h2 className="fw-bold mb-0" style={{ fontSize: "2.25rem" }}>
              {total}
            </h2>
            <p className="text-sm fw-normal mb-0 opacity-75">Total</p>
          </div>

        </div>
      </div>
    </div>
  );
};