import { useState } from "react";
import ModalWrapper from "../components/child/ModalWrapper";
import Badge from "../components/child/Badge";
import { useFetchNotifyQuery } from "../services/notificationApi";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import StreetPaggination from "../components/child/StreetPaggination";

dayjs.extend(relativeTime);

const NotificationView = () => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<null | "global" | "personal">(null);
  const [status, setStatus] = useState<null | "read" | "unread">(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useFetchNotifyQuery({
    page,
    limit,
    readStatus: status ?? "all",
    type: type ?? undefined,
  });
  // ✅ Safe access for totalPages
  const totalPages = data?.data?.paggination?.totalPages ?? 0;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="p-8 p-sm-12 border-top notify-footer border-sh-base">
        <span
          onClick={() => setShowModal(true)}
          className="text-xs sm:text-sm link-street-primary cursor-pointer"
          style={{ textDecoration: "none" }}
        >
          View All Notifications
        </span>
      </div>

      {/* Modal */}
      <ModalWrapper
        show={showModal}
        size="xl"
        onHide={() => setShowModal(false)}
        title={"Notifications"}
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0 "
        footer={
          <button
            className="btn btn-street-neutral btn-street-lg radius-12 px-12 px-sm-16 px-md-28 text-sm"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        }
      >
        {/* Filter Section */}
        <div className="px-32 py-24 d-flex flex-column gap-16">
          <div className="d-flex flex-row flex-wrap align-items-center gap-24">
            {/* Type Filter */}
            <div className="d-flex flex-row gap-8 align-items-center">
              <span className="fw-semibold text-sm">Type:</span>
              {["All", "Global", "Personal"].map((label) => (
                <Badge
                  key={label}
                  variant={
                    (label === "Global" && type === "global") ||
                    (label === "Personal" && type === "personal") ||
                    (label === "All" && !type)
                      ? "primary"
                      : "primary-soft"
                  }
                  onClick={() =>
                    setType(
                      label === "All"
                        ? null
                        : (label.toLowerCase() as "global" | "personal")
                    )
                  }
                  className="cursor-pointer"
                >
                  {label}
                </Badge>
              ))}
            </div>

            {/* Status Filter */}
            <div className="d-flex flex-row gap-8 align-items-center">
              <span className="fw-semibold text-sm">Status:</span>
              {["All", "Unread", "Read"].map((label) => (
                <Badge
                  key={label}
                  variant={
                    (label === "Unread" && status === "unread") ||
                    (label === "Read" && status === "read") ||
                    (label === "All" && !status)
                      ? "success"
                      : "success-soft"
                  }
                  onClick={() =>
                    setStatus(
                      label === "All"
                        ? null
                        : (label.toLowerCase() as "read" | "unread")
                    )
                  }
                  className="cursor-pointer"
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div
            className="mt-4 d-flex flex-column gap-12"
            style={{
              minHeight: "400px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {/* 🌀 Loading State */}
            {isLoading && (
              <div className="d-flex flex-column gap-12">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 border-1 border-sh-base-50 radius-12 bg-neutral-100 animate-pulse"
                  >
                    <div
                      className="bg-neutral-300 mb-2 rounded"
                      style={{ height: 16, width: "60%" }}
                    />
                    <div
                      className="bg-neutral-200 mb-2 rounded"
                      style={{ height: 12, width: "80%" }}
                    />
                    <div
                      className="bg-neutral-200 rounded"
                      style={{ height: 10, width: "40%" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Notification Data */}
            {!isLoading &&
              data &&
              data?.data?.notifications?.length > 0 &&
              data.data.notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 border-1 border-sh-base-50 radius-12 d-flex flex-column gap-8 `}
                >
                  <p className="sm:text-lg text-md text-street-dark fw-semibold">
                    {n.title}
                  </p>
                  <p className="sm:text-sm text-xs">{n.message}</p>
                  <p className="text-xxs sm:text-xs text-street-base mt-0 mt-sm-1">
                    {dayjs(n.createdAt).fromNow()}
                  </p>
                </div>
              ))}

            {/* 🕳 Empty State */}
            {!isLoading &&
              (!data || data?.data?.notifications?.length === 0) && (
                <div className="text-center text-muted py-40">
                  No notifications found.
                </div>
              )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <StreetPaggination
              page={page}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </div>
      </ModalWrapper>
    </>
  );
};

export default NotificationView;
