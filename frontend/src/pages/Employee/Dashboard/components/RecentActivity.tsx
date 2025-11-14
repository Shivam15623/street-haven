import CardlistWrapper from "./CardListWrapper";
import { Icon } from "@iconify/react/dist/iconify.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const RecentActivity = () => {
  const announcements = [
    {
      id: 1,
      title: "New Safety Protocol uploaded by HR",
      author: "Sarah Johnson",
      date: "2025-08-21T09:40:00", // Example ISO datetime
    },
    {
      id: 2,
      title: "Event meeting scheduled for Friday",
      author: "Leadership Team",
      date: "2025-08-20T14:30:00",
    },
    {
      id: 3,
      title: "Amanda completed 2 years at Street Haven!",
      author: "HR Team",
      date: "2025-08-21T09:40:00", // Example ISO datetime
    },
    {
      id: 4,
      title: "IT ticket resolved - Network connectivity",
      author: "Tech Support",
      date: "2025-08-20T14:30:00",
    },
    {
      id: 5,
      title: "Housing manual updated with new procedures",
      author: "Tech Support",
      date: "2025-08-21T09:40:00", // Example ISO datetime
    },
  ];

  return (
    <CardlistWrapper title="Recent Activity">
      <div className="d-flex flex-column gap-3">
        {announcements.map((item) => {
          const now = dayjs();
          const createdAt = dayjs(item.date);
          const diffMinutes = now.diff(createdAt, "minute");

          const timeText = diffMinutes < 10 ? "Just now" : createdAt.fromNow();

          return (
            <div
              key={item.id}
              className="d-flex flex-row align-items-center justify-content-between gap-3 p-8 p-sm-12 border-0-5 rounded-2"
              style={{
                borderColor: "#AAAAAA",
              }}
            >
              <div className="d-flex flex-column justify-content-center gap-1 gap-sm-8">
                <h3 className="fw-semibold mb-0 text-xs xs:text-sm text-street-dark">
                  {item.title}
                </h3>
                <div className="text-xxs d-flex text-street-base flex-row gap-8 xs:text-xs fw-normal">
                  <span>{item.author}</span>•<span>{timeText}</span>
                </div>
              </div>
              <Icon
                icon="simple-line-icons:arrow-right"
                className="w-12-px h-12-px "
              />
            </div>
          );
        })}
      </div>
    </CardlistWrapper>
  );
};

export default RecentActivity;
