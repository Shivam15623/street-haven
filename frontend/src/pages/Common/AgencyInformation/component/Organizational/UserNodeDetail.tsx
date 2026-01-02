import React, { useEffect } from "react";
import ModalWrapper from "../../../../../components/child/ModalWrapper";
import { useLazyFetchEmployeeByIdQuery } from "../../../../../services/EmployeeApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface UserNodeProps {
  show: boolean;
  handleclose: () => void;
  id: string;
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatRole(role?: string): string {
  if (!role) return "-";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: "1px solid var(--street-border-base-50)",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          color: "var(--street-text-base)",
          opacity: 0.7,
          marginBottom: "4px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </p>

      <p
        style={{
          fontSize: "15px",
          color: "var(--street-dark)",
          fontWeight: 500,
        }}
      >
        {value || "-"}
      </p>
    </div>
  );
};

const UserNodeDetail: React.FC<UserNodeProps> = ({ id, show, handleclose }) => {
  const [fetchUserDetail, { data, isLoading }] =
    useLazyFetchEmployeeByIdQuery();

  useEffect(() => {
    if (show) {
      fetchUserDetail({
        id,
        orgChart: true,
      });
    }
  }, [show, fetchUserDetail, id]);
  const employee = data?.data?.employee;
  const supervisor = data?.data?.supervisor;

  if (isLoading || !employee) {
    return (
      <ModalWrapper
        show={show}
        onHide={handleclose}
        title="Loading..."
        size="lg"
      >
        <div className="text-center py-32">Loading employee details…</div>
      </ModalWrapper>
    );
  }

  const fullName = `${employee.firstname ?? ""} ${employee.lastname ?? ""}`;

  return (
    <ModalWrapper
      show={show}
      onHide={handleclose}
      title={fullName || "Employee"}
      subtitle={employee.title || "-"}
      headerClassName="text-xl p-0 pb-20 text-street-dark"
      className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
      bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
      footerClassName="pt-16 pt-sm-20 px-0 pb-0"
      size="lg"
    >
      <div className="text-center mb-32">
        {employee.profilePic ? (
          <img
            className="mx-auto rounded-circle w-100-px h-100-px mb-16"
            src={employee.profilePic}
            alt={fullName}
          />
        ) : (
          <div className="d-flex align-items-center mx-auto justify-content-center text-street-primary rounded-circle w-100-px h-100-px mb-16 bg-street-primary-10 text-2xl fw-semibold">
            {getInitials(fullName)}
          </div>
        )}

        <h2 className="mb-8 fw-bold text-2xxl text-street-dark">
          {fullName || "-"}
        </h2>

        <p className="text-md fw-semibold text-street-primary">
          {employee.title || "-"}
        </p>
      </div>

      <div className="d-flex flex-column gap-0">
        <InfoRow label="Email" value={employee.email} />
        <InfoRow label="Phone" value={employee.phoneNo} />
        <InfoRow label="Role" value={formatRole(employee.role)} />
        <InfoRow
          label="Reports To"
          value={
            employee.superviserId
              ? `${supervisor?.firstname} ${supervisor?.lastname}`
              : "None"
          }
        />
      </div>
    </ModalWrapper>
  );
};

export default UserNodeDetail;
