import React from "react";
import Sheet from "../../../../components/child/Sheet";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useGetEventRegistrationsQuery } from "../../../../services/EventApi";
import Badge from "../../../../components/child/Badge";
import * as XLSX from "xlsx"; // 👈 install this if not installed: npm install xlsx

interface ViewRegistrationsProps {
  eventId: string;
}

const ViewRegistrations: React.FC<ViewRegistrationsProps> = ({ eventId }) => {
  const { data, isLoading, isError } = useGetEventRegistrationsQuery(eventId);
  const event = data?.data;

  // 🔰 Function to export Excel
  const handleExportToExcel = () => {
    if (!event || !event.registeredUsers?.length) return;

    // Prepare structured data for Excel
    const formattedData = event.registeredUsers.map((user, index) => ({
      "Sr No": index + 1,
      "First Name": user.firstname,
      "Last Name": user.lastname,
      Email: user.email,
      "Phone Number": user.phoneNo,
      Slug: user.slug,
      Status: "Registered",
    }));

    // Add event summary at the top
    const eventSummary = [
      ["Event Title", event.title],
      ["Total Registered", event.totalRegistered],
      ["Capacity", event.capacity],
      [],
    ];

    // Combine both arrays for the final Excel sheet
    const worksheetData = [
      ...eventSummary,
      Object.keys(formattedData[0]),
      ...formattedData.map((item) => Object.values(item)),
    ];

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    // Save Excel file
    XLSX.writeFile(
      workbook,
      `${event.title.replace(/\s+/g, "_")}_Registrations.xlsx`
    );
  };

  return (
    <Sheet
      title="Event Registrations"
      size={500}
      placement="end"
      footer={
        <div className="text-end d-flex justify-content-end">
          <button
            className="btn btn-success d-flex align-items-center gap-1"
            onClick={handleExportToExcel}
            disabled={!event?.registeredUsers?.length}
          >
            <Icon icon="mdi:file-excel" className="me-2" />
            Export to Excel
          </button>
        </div>
      }
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
      <div className="p-4 space-y-4 flex-grow-1 h-100">
        {/* Loading State */}
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
        ) : event ? (
          <>
            {/* Event Details */}
            <div className="border rounded-3 p-3 mb-3 bg-street-light">
              <h5 className="fw-semibold text-street-dark mb-2">
                {event.title}
              </h5>

              <div className="d-flex flex-wrap gap-3 text-sm">
                <p className="m-0">
                  <span className="fw-medium text-street-base">
                    Total Registered:
                  </span>{" "}
                  {event.totalRegistered}
                </p>
                <p className="m-0">
                  <span className="fw-medium text-street-base">Capacity:</span>{" "}
                  {event.capacity}
                </p>
              </div>
            </div>
            <div className="fw-medium text-md text-street-dark mb-3">
              Registered Attendees
            </div>

            {/* Registered Users */}
            {event.registeredUsers?.length ? (
              <div
                className="border rounded-3 flex-grow-1 overflow-auto"
                style={{ maxHeight: "300px" }}
              >
                <ul className="d-flex flex-column gap-2 m-0 p-2">
                  {event.registeredUsers.map((user) => (
                    <li
                      key={user._id}
                      className="py-2 px-1 border-bottom d-flex align-items-center justify-content-between"
                    >
                      <div>
                        <p className="fw-semibold text-street-dark mb-1">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-sm fw-medium text-street-base mb-1">
                          {user.email}
                        </p>
                        <p className="text-xs text-street-muted mb-0">
                          {user.phoneNo}
                        </p>
                      </div>
                      <Badge variant="success-soft" className="px-2 py-1">
                        Registered
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No users have registered yet.
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center">
            No data available for this event.
          </p>
        )}
      </div>
    </Sheet>
  );
};

export default ViewRegistrations;
