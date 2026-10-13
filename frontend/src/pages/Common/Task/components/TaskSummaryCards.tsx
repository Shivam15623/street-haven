import { useMemo } from "react";
import type { TaskStatus } from "../../../../services/taskApi";
import { TaskCountCard } from "./TaskCountCard";

interface TaskCounts {
  in_progress?: number;
  assigned?: number;
  under_review?: number;
  completed?: number;
  total?: number;
}

interface Props {
  counts?: TaskCounts;
  status: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
}

const TaskSummaryCards = ({ counts, status, onStatusChange }: Props) => {
  const cards = useMemo(
    () => [
      {
        key: "assigned",
        label: "Assigned",
        variant: "assigned",
        icon: "mdi:account-check-outline",
        count: counts?.assigned ?? 0,
      },
      {
        key: "in_progress",
        label: "In Progress",
        variant: "in_progress",
        icon: "mdi:account-clock-outline",
        count: counts?.in_progress ?? 0,
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
        count: counts?.total ?? 0,
      },
    ],
    [counts],
  );

  return (
    <div
      className={`row row-cols-xxxl-5 row-cols-lg-5  row-cols-sm-2 row-cols-1 gy-xl-3 gy-2 gx-xl-3 gx-2`}
    >
      {cards.map((card) => (
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
