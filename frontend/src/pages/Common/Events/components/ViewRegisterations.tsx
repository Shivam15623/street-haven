import React from "react";
import Sheet from "../../../../components/child/Sheet";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useGetEventRegistrationsQuery } from "../../../../services/EventApi";
import Badge from "../../../../components/child/Badge";
import * as XLSX from "xlsx"; // 👈 install this if not installed: npm install xlsx

interface ViewRegistrationsProps {
  eventId: string;
}
import { AnimatePresence, motion } from "framer-motion";

interface RegisteredUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNo: string;
  slug?: string;
}

interface RegistrationCardProps {
  user: RegisteredUser;
  index: number;
}

const RegistrationCard = ({ user, index }: RegistrationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group relative card rounded-3  p-16  border-sh-base-1-2"
    >
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="d-flex align-items-start gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div
            style={{ width: "40px", height: "40px" }}
            className=" rounded-circle bg-street-primary-10 d-flex align-items-center justify-content-center flex-shrink-0"
          >
            <Icon icon="lucide:user" className="text-xl text-street-primary" />
          </div>

          {/* User Info */}
          <div className="min-w-0 d-flex flex-column gap-6-px flex-grow-1">
            <h4 className="fw-semibold text-street-dark text-md mb-1 truncate">
              {user.firstname} {user.lastname}
            </h4>

            <div className="d-flex flex-column gap-1">
              <div className="d-flex align-items-center gap-2 text-sm text-street-base">
                <Icon icon="lucide:mail" className="text-sm  flex-shrink-0" />
                <span className="text-truncate">{user.email}</span>
              </div>

              <div className="d-flex align-items-center gap-2 text-sm text-street-base">
                <Icon
                  icon="lucide:phone"
                  className="text-sm text-street-base flex-shrink-0"
                />
                <span>{user.phoneNo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant="success-soft">Registered</Badge>
      </div>
    </motion.div>
  );
};

const ViewRegistrations: React.FC<ViewRegistrationsProps> = ({ eventId }) => {
  const { data, isLoading, isError } = useGetEventRegistrationsQuery(eventId);
  const event = data?.data;

  // 🔰 Function to export Excel
  const handleExportToExcel = () => {
    if (!event || !event.registeredUsers?.length) return;

    /* -------------------- DATA -------------------- */

    const formattedData = event.registeredUsers.map((user, index) => ({
      "Sr No": index + 1,
      "First Name": user.firstname,
      "Last Name": user.lastname,
      Email: user.email,
      "Phone Number": user.phoneNo,
      Status: "Registered",
    }));

    const eventSummary = [
      ["Event Title", event.title],
      ["Total Registered", event.totalRegistered],
      ["Capacity", event.capacity],
      [],
    ];

    const headers = Object.keys(formattedData[0]);
    const rows = formattedData.map(Object.values);

    const worksheetData = [...eventSummary, headers, ...rows];

    /* -------------------- WORKSHEET -------------------- */

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    /* -------------------- STYLING -------------------- */

    // Bold event summary
    ["A1", "A2", "A3"].forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = { font: { bold: true } };
      }
    });

    // Header row styling
    const headerRowIndex = eventSummary.length + 1; // Excel index starts at 1
    headers.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({
        r: headerRowIndex - 1,
        c: colIndex,
      });

      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        };
      }
    });

    /* -------------------- COLUMN WIDTHS -------------------- */

    worksheet["!cols"] = [
      { wch: 8 }, // Sr No
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 30 }, // Email
      { wch: 18 }, // Phone
      { wch: 15 }, // Status
    ];

    /* -------------------- FREEZE HEADER -------------------- */

    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: headerRowIndex,
    };

    /* -------------------- WORKBOOK -------------------- */

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    XLSX.writeFile(
      workbook,
      `${event.title.replace(/\s+/g, "_")}_Registrations.xlsx`
    );
  };

  const capacityPercentage = event
    ? (event.totalRegistered / event.capacity) * 100
    : 0;
  return (
    <Sheet
      title="Event Registrations"
      size={500}
      placement="end"
      footer={
        <div className="text-end d-flex justify-content-end">
          <button
            className="btn btn-success radius-12 w-100 text-sm d-flex align-items-center justify-content-center gap-2"
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
          className="btn btn-info-600 radius-12 text-xs d-flex align-items-center justify-content-center gap-2"
          title="View Registrations"
        >
          <Icon icon="mdi:account-group-outline" className="text-xl" />
          <span className="d-none d-sm-inline-block ">View</span>
        </button>
      }
    >
      <div className="p-4  flex-grow-1 h-100">
        {!isLoading && !isError && event && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="d-flex flex-column gap-12"
            >
              {/* Event Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="card rounded-3 border d-flex flex-column gap-16 border-sh-base-1-2 p-16 shadow-none"
              >
                <h3 className="fw-semibold text-street-dark text-lg mb-1">
                  {event.title}
                </h3>

                <div className="row gx-3 gy-0 ">
                  <div className="d-flex  col-6 align-items-center gap-3">
                    <div className="w-36-px h-36-px rounded-2 bg-success-subtle d-flex align-items-center justify-content-center">
                      <Icon
                        icon="lucide:user-check"
                        className="text-md text-success"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-street-base">Registered</p>
                      <p className="fw-semibold text-street-dark">
                        {event.totalRegistered}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex  col-6 align-items-center gap-3">
                    <div className="w-36-px h-36-px rounded-2 bg-street-primary-10 d-flex align-items-center justify-content-center">
                      <Icon
                        icon="lucide:users"
                        className="text-md text-street-primary"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-street-base">Capacity</p>
                      <p className="font-semibold text-street-dark">
                        {event.capacity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="d-flex flex-column gap-8">
                  <div className="d-flex justify-content-between text-xs">
                    <span className="text-street-base">Capacity filled</span>
                    <span className="fw-medium text-street-dark">
                      {Math.round(capacityPercentage)}%
                    </span>
                  </div>
                  <div className="h-8-px bg-secondary-subtle rounded-pill overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${capacityPercentage}%` }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                      className="h-100 rounded-pill bg-street-primary"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Registered Users Section */}
              <div>
                <h4 className="fw-medium text-street-dark text-md mb-3 d-flex align-items-center gap-2">
                  <Icon
                    icon="lucide:users"
                    className="text-md text-street-base"
                  />
                  Registered Attendees
                  <span className="text-xs text-street-base fw-normal">
                    ({event.registeredUsers?.length || 0})
                  </span>
                </h4>

                {event.registeredUsers?.length ? (
                  <div className="d-flex flex-column gap-2">
                    {event.registeredUsers.map((user, index) => (
                      <RegistrationCard
                        key={user._id}
                        user={user}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center bg-secondary/30 rounded-lg"
                  >
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Icon
                        icon="lucide:inbox"
                        className="text-2xl text-muted"
                      />
                    </div>
                    <h3 className="font-semibold text-street-dark mb-1">
                      No Registrations Yet
                    </h3>
                    <p className="text-sm text-street-base">
                      Be the first to register for this event!
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Sheet>
  );
};

export default ViewRegistrations;
