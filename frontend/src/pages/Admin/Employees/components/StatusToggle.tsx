// StatusToggle.tsx
import { useState } from "react";
import { useStatusToggleMutation } from "../../../../services/EmployeeApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";

interface StatusToggleProps {
  id: string;
  status: "active" | "inactive";
}

const StatusToggle: React.FC<StatusToggleProps> = ({ id, status }) => {
  const [statusToggle, { isLoading }] = useStatusToggleMutation();
  const [checked, setChecked] = useState(status === "active");

  const handleToggle = async () => {
    const previous = checked;
    setChecked(!previous); // optimistic update

    try {
      const res = await statusToggle({ id }).unwrap();
      if (res.success) {
        showSuccess(res.message);
      }
    } catch (err) {
      showError(getErrorMessage(err));
      setChecked(previous);
    }
  };

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={isLoading}
        onChange={handleToggle}
      />
    </div>
  );
};

export default StatusToggle;
