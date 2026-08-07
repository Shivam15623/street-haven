import { Icon } from "@iconify/react/dist/iconify.js";

type TicketCountCardProps = {
  count: number;
  label: string;
  variant?: "open" | "approved" | "progress" | "completed" | "rejected" | "closed" | "total";
  icon?: string;
  onClick?: () => void;
  active: boolean;
  colSpan?: number;
  rowSpan?: number;
  layout?: "row" | "column"; // content direction inside the card
};

export const TicketCountCard: React.FC<TicketCountCardProps> = ({
  count,
  label,
  variant = "total",
  icon = "lucide:circle-alert",
  onClick,
  active = false,
  colSpan = 1,
  rowSpan = 1,
  layout = "row",
}) => {
  return (
    <div
      className="ticket-card-wrapper"
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      <div className="card h-100 ticket-card" style={{ cursor: "pointer" }} onClick={onClick}>
        <div
          className={`card-body d-flex ticket-card h-100 align-items-center ${
            active ? "active-count-card" : ""
          } ${variant} ${layout === "column" ? "flex-column justify-content-center" : "flex-row justify-content-between"} p-16 p-sm-24`}
        >
          <div className={`d-flex flex-column gap-1 ${layout === "column" ? "align-items-center" : ""}`}>
            <h4 className="text-street-dark fw-bold text-lg xs:text-xxl mb-0">{count}</h4>
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