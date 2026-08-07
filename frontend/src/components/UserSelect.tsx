import { useMemo } from "react";
import { useAllEmployeesQuery } from "../services/EmployeeApi";
import type { Role } from "../interfaces/AuthInterfaces";

interface UserSelectProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  role?: Role[];
  disabled?: boolean;
  className?: string;
}

const UserSelect = ({
  value = "",
  onChange,
  label = "User",
  placeholder = "All Users",
  role,
  disabled = false,
  className = "",
}: UserSelectProps) => {
  const { data, isLoading } = useAllEmployeesQuery({
    forDropdown: true,
    role,
  });

  const employees = useMemo(() => data?.data.employees ?? [], [data]);

  return (
    <div className={className}>
      {label && (
        <label className="form-label text-xs fw-medium text-neutral-700 mb-6">
          {label}
        </label>
      )}

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="form-select text-sm"
      >
        <option value="">{placeholder}</option>

        {isLoading ? (
          <option disabled>Loading...</option>
        ) : (
          employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.firstname} {emp.lastname}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

export default UserSelect;