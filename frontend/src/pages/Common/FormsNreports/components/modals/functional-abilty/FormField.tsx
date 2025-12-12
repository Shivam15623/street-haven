import { Icon } from "@iconify/react";

interface FormFieldProps {
  label: string;
  value?: string | number | boolean | Date | null;
  type?: "text" | "date" | "boolean" | "currency";
  className?: string;
  highlight?: boolean;
}

export function FormField({
  label,
  value,
  type = "text",
  className,
  highlight = false,
}: FormFieldProps) {
  const renderValue = () => {
    if (value === null || value === undefined || value === "") {
      return (
        <span className="text-street-base fst-italic small">Not provided</span>
      );
    }

    switch (type) {
      case "date":
        try {
          return new Date(value as string).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch {
          return String(value);
        }

      case "boolean":
        return value ? (
          <span className="d-inline-flex align-items-center gap-1 text-success">
            <Icon icon="mdi:check" width="16" height="16" />
            <span>Yes</span>
          </span>
        ) : (
          <span className="d-inline-flex align-items-center gap-1 text-street-base">
            <Icon icon="mdi:close" width="16" height="16" />
            <span>No</span>
          </span>
        );

      case "currency":
        return `₹${Number(value).toFixed(2)}`;

      default:
        return String(value);
    }
  };

  return (
    <div className={className}>
      <dt className="fw-semibold mb-8">{label}</dt>
      <dd className={highlight ? "text-primary fw-bold" : ""}>
        {renderValue()}
      </dd>
    </div>
  );
}

// ----------------- STATUS FIELD ---------------------

interface StatusFieldProps {
  label: string;
  status: "noRestrictions" | "withRestrictions" | "unable" | string;
  className?: string;
}

const statusConfig = {
  noRestrictions: {
    label: "No Restrictions",
    className: "badge bg-success-subtle text-success border border-success",
    icon: "mdi:check",
  },
  withRestrictions: {
    label: "With Restrictions",
    className: "badge bg-warning-subtle text-warning border border-warning",
    icon: "mdi:alert-circle-outline",
  },
  unable: {
    label: "Unable to Work",
    className: "badge bg-danger-subtle text-danger border border-danger",
    icon: "mdi:close",
  },
};

export function StatusField({ label, status, className }: StatusFieldProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "badge bg-secondary",
    icon: "mdi:alert-circle-outline",
  };

  return (
    <div className={className}>
      <dt className="fw-semibold mb-8">{label}</dt>
      <dd>
        <span
          className={config.className + " d-inline-flex align-items-center"}
        >
          <Icon icon={config.icon} width="14" height="14" className="me-1" />
          {config.label}
        </span>
      </dd>
    </div>
  );
}
