// LocationStatusToggle.tsx
import { useState } from "react";
import { useEditLocationMutation } from "../../../../../services/locationApi";
import { showError, showSuccess } from "../../../../../utills/toastutills";
import { getErrorMessage } from "../../../../../utills/utills";

interface LocationStatusToggleProps {
  id: string;
  isActive: boolean;
}

const LocationStatusToggle: React.FC<LocationStatusToggleProps> = ({
  id,
  isActive,
}) => {
  const [editLocation, { isLoading }] = useEditLocationMutation();

  const [checked, setChecked] = useState(isActive);

  const handleToggle = async () => {
    const previous = checked;

    // Optimistic update
    setChecked(!previous);

    try {
      const res = await editLocation({
        locationId: id,
        body: {
          isActive: !previous,
        },
      }).unwrap();

      if (res.success) {
        showSuccess(res.message);
      }
    } catch (err) {
      // Rollback optimistic update
      setChecked(previous);

      showError(getErrorMessage(err));
    }
  };

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={handleToggle}
        disabled={isLoading}
      />
    </div>
  );
};

export default LocationStatusToggle;