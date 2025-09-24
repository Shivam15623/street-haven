import React from "react";
import { Dropdown } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const items = [
  {
    id: 1,
    title: "New townhall minutes available",
    time: "2 hours ago",
    isUnread: true,
  },
  { id: 2, title: "System maintenance scheduled", time: "1 day ago" },
  {
    id: 3,
    title: "New comment on your post",
    time: "3 days ago",
    isUnread: true,
  },
];
const NotificationDropdown = () => {
  const unreadCount = 3;
  return (
    <Dropdown className="notification-dropdown">
      {/* Toggle button */}
      <Dropdown.Toggle
        id="notification-dropdown-toggle"
        
      >
        <Icon
          icon="basil:notification-outline"
          className="alarm  notifyicon"
        />
        {unreadCount ? (
          <span className="badge-unread"></span>
        ) : null}
      </Dropdown.Toggle>

      {/* Dropdown menu */}
      <Dropdown.Menu className="p-0 border-1 border-sh-base">
        <Dropdown.Header className="p-sm-16 p-10 text-sm sm:text-md text-street-dark fw-medium">
          Notifications
        </Dropdown.Header>
        <Dropdown.Divider />

        {/* List */}
        <div className="max-h-400-px overflow-y-auto scroll-sm">
          {items.length === 0 ? (
            <div className="p-3 text-center text-sm text-street-base">
              No new notifications
            </div>
          ) : (
            items.map((item) => (
              <React.Fragment key={item.id}>
                <Dropdown.Item className="d-flex flex-row align-items-start p-10 p-sm-16 gap-8 gap-sm-12">
                  <div className="w-6-px h-6-px w-sm-8-px h-sm-8-px bg-street-primary rounded-circle mt-6 flex-shrink-0"></div>

                  <div className="flex-grow-1">
                    <p className="text-xs sm:text-sm text-street-dark mb-0">
                      {item.title}
                    </p>
                    <p className="text-xxs sm:text-xs text-street-base mt-0 mt-sm-1">{item.time}</p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
              </React.Fragment>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 p-sm-12 border-top notify-footer border-sh-base">
          <Link to="/notifications" className=" text-xs sm:text-sm link-street-primary">
            View All Notification
          </Link>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
