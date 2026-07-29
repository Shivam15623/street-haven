import { Icon } from "@iconify/react/dist/iconify.js";

type TicketCountCardProps = {
  count: number;
  label: string;
  variant?:
    | "open"
    | "approved"
    | "progress"
    | "completed"
    | "rejected"
    | "closed"
    | "total";
  icon?: string;
  onClick?: () => void;
  active: boolean;
};

export const TicketCountCard: React.FC<TicketCountCardProps> = ({
  count,
  label,
  variant = "total",
  icon = "lucide:circle-alert",
  onClick,
  active = false,
}) => {
  return (
    <div className="col">
      <div
        className="card h-100 ticket-card"
        style={{ cursor: "pointer" }}
        onClick={onClick}
      >
        <div
          className={`card-body d-flex flex-row ticket-card h-100 align-items-center ${
            active ? "active-count-card" : ""
          } ${variant} justify-content-between p-16 p-sm-24`}
        >
          <div className="d-flex flex-column gap-1">
            <h4 className="text-street-dark fw-bold text-lg xs:text-xxl mb-0">
              {count}
            </h4>
            <p className="text-xs xs:text-sm fw-normal">{label}</p>
          </div>

          <div className={`ticket-icon ${variant}`}>
            <Icon icon={icon} width={20} height={20} />
          </div>
        </div>
      </div>
    </div>
  );
};