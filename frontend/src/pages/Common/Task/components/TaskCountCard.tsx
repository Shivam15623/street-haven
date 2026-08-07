import { Icon } from "@iconify/react";

type TaskCountCardProps = {
  count: number;
  label: string;
  variant?: "new" | "assigned" | "under_review" | "completed" | "total";
  icon?: string;
  active?: boolean;
  onClick?: () => void;
  colSpan?: number;
  rowSpan?: number;
  layout?: "row" | "column";
};

export const TaskCountCard: React.FC<TaskCountCardProps> = ({
  count,
  label,
  variant = "total",
  icon = "lucide:list-todo",
  active = false,
  onClick,
  colSpan = 1,
  rowSpan = 1,
  layout = "row",
}) => {
  return (
    <div
      className="task-card-wrapper"
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      <div
        className="card h-100 task-card"
        style={{ cursor: onClick ? "pointer" : "default" }}
        onClick={onClick}
      >
        <div
          className={`
            card-body
            d-flex
            h-100
            align-items-center
            p-16
            p-sm-24
            ${variant}
            ${active ? "active-task-card" : ""}
            ${
              layout === "column"
                ? "flex-column justify-content-center"
                : "flex-row justify-content-between"
            }
          `}
        >
          <div
            className={`d-flex flex-column gap-1 ${
              layout === "column" ? "align-items-center" : ""
            }`}
          >
            <h4 className="text-street-dark fw-bold text-lg xs:text-xxl mb-0">
              {count}
            </h4>

            <p className="text-xs xs:text-sm fw-normal mb-0">
              {label}
            </p>
          </div>

          <div className={`task-icon ${variant}`}>
            <Icon icon={icon} width={22} height={22} />
          </div>
        </div>
      </div>
    </div>
  );
};