import React from "react";
import Sheet from "../../../../components/child/Sheet";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useGetEventRegistrationsQuery } from "../../../../services/EventApi";
import Badge from "../../../../components/child/Badge";

interface ViewRegistrationsProps {
  eventId: string;
}

const ViewRegistrations: React.FC<ViewRegistrationsProps> = ({ eventId }) => {
  const { data, isLoading, isError } = useGetEventRegistrationsQuery(eventId);

  return (
    <Sheet
      title="Event Registrations"
      size={500}
      placement="end"
      trigger={
        <button
          className="btn btn-street-primary d-flex align-items-center justify-content-center gap-2"
          title="View Registrations"
        >
          <Icon icon="mdi:account-group-outline" className="text-xl" />
          <span>View</span>
        </button>
      }
    >
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="d-flex flex-column gap-1 w-50">
                <div className="placeholder-glow">
                  <span className="placeholder col-6 mb-1"></span>
                </div>
                <div className="placeholder-glow">
                  <span className="placeholder col-8"></span>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-red-500">Failed to load registrations.</p>
        ) : data?.data?.registeredUsers?.length ? (
          <ul className="d-flex flex-column gap-2">
            {data.data.registeredUsers.map((user) => (
              <li
                key={user._id}
                className="py-2 d-flex align-items-center justify-content-between"
              >
                <div>
                  <p className="fw-semibold text-street-dark">
                    {user.firstname} {user.lastname}
                  </p>
                  <p className="text-sm fw-medium text-street-base">
                    {user.email}
                  </p>
                </div>
                <Badge variant="success-soft" className="px-2 py-1">
                  Registered
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">
            No users have registered yet.
          </p>
        )}
      </div>
    </Sheet>
  );
};

export default ViewRegistrations;
