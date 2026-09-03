import { useMemo } from "react";
import type { TaskStatus } from "../../../../services/taskApi";
import { TaskCountCard } from "./TaskCountCard";
import useHasPermission from "../../../../hooks/Auth";

interface TaskCounts {
  new?: number;
  assigned?: number;
  under_review?: number;
  completed?: number;
}

interface Props {
  counts?: TaskCounts;
  total?: number;
  status: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
}

const TaskSummaryCards = ({ counts, total, status, onStatusChange }: Props) => {
  const { hasRole } = useHasPermission();
  const isAdmin = hasRole(["volunteer_admin", "super_admin"]);

  const cards = useMemo(
    () => [
      {
        key: "new",
        label: "New",
        variant: "new",
        icon: "mdi:plus-circle-outline",
        count: counts?.new ?? 0,
        adminOnly: true,
      },
      {
        key: "assigned",
        label: "Assigned",
        variant: "assigned",
        icon: "mdi:account-check-outline",
        count: counts?.assigned ?? 0,
      },
      {
        key: "under_review",
        label: "Under Review",
        variant: "under_review",
        icon: "mdi:file-document-check-outline",
        count: counts?.under_review ?? 0,
      },
      {
        key: "completed",
        label: "Completed",
        variant: "completed",
        icon: "mdi:check-circle-outline",
        count: counts?.completed ?? 0,
      },
      {
        key: "total",
        label: "Total",
        variant: "total",
        icon: "mdi:format-list-bulleted",
        count: total ?? 0,
      },
    ],
    [counts, total],
  );

  return (
    <div
      className={`row ${isAdmin ? "row-cols-xxxl-5 row-cols-lg-5" : "row-cols-xxxl-4 row-cols-lg-4"} row-cols-sm-2 row-cols-1 gy-xl-3 gy-2 gx-xl-3 gx-2`}
    >
      {cards
        .filter((card) => !card.adminOnly || isAdmin)
        .map((card) => (
          <TaskCountCard
            key={card.key}
            count={card.count}
            label={card.label}
            variant={card.variant as TaskStatus}
            icon={card.icon}
            active={card.key === "total" ? !status : status === card.key}
            onClick={() =>
              onStatusChange(
                card.key === "total" ? undefined : (card.key as TaskStatus),
              )
            }
          />
        ))}
    </div>
  );
};

export default TaskSummaryCards;