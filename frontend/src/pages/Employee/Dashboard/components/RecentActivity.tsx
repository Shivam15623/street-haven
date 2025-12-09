import CardlistWrapper from "./CardListWrapper";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useFetchActivityLogsQuery,
  type ActivityLogData,
} from "../../../../services/notificationApi";
import { useEffect, useState } from "react";
import { useSocket } from "../../../../hooks/useSocket";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../../redux/AuthSlice";

dayjs.extend(relativeTime);

const RecentActivity = () => {
  const { data, isLoading } = useFetchActivityLogsQuery({ limit: 5, page: 1 });
  const { socket } = useSocket();
  const { user } = useSelector(selectAuth);
  const [activityLogs, setActivityLogs] = useState<ActivityLogData[]>([]);

  useEffect(() => {
    setActivityLogs(data?.data.logs ?? []);
  }, [data?.data.logs]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinUserRoom", { userId: user?._id });

    socket.on("activity:new", (newactivity: ActivityLogData) => {
      setActivityLogs((prev) => [newactivity, ...prev]);
    });

    return () => {
      socket.emit("leaveUserRoom", { userId: user?._id });
      socket.off("activity:new");
    };
  }, [socket, user?._id]);

  return (
    <CardlistWrapper title="Recent Activity">
      <div className="d-flex flex-column gap-3">
        {isLoading
          ? // Bootstrap loading placeholders
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center justify-content-between p-2 p-sm-3 border rounded"
              >
                <div className="flex-grow-1">
                  <div className="placeholder-glow w-100">
                    <span className="placeholder col-8"></span>
                  </div>
                  <div className="placeholder-glow mt-1">
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
                <div
                  className="placeholder rounded-circle"
                  style={{ width: "12px", height: "12px" }}
                ></div>
              </div>
            ))
          : activityLogs.map((item) => {
              const now = dayjs();
              const createdAt = dayjs(item.createdAt);
              const diffMinutes = now.diff(createdAt, "minute");

              const timeText =
                diffMinutes < 10 ? "Just now" : createdAt.fromNow();

              return (
                <div
                  key={item._id}
                  className="d-flex flex-row align-items-center justify-content-between gap-3 p-2 p-sm-3 border rounded"
                  style={{ borderColor: "#AAAAAA" }}
                >
                  <div className="d-flex flex-column justify-content-center gap-1 gap-sm-2">
                    <h3 className="fw-semibold mb-1 small text-dark">
                      {item.message}
                    </h3>
                    <div className="text-muted small">
                      {item.performedBy.name} • {timeText}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </CardlistWrapper>
  );
};

export default RecentActivity;
