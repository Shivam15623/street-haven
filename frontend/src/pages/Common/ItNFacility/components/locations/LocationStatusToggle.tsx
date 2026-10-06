import { useEffect, useState } from "react";
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

  // Keep local state in sync when the location/prop changes
  useEffect(() => {
    setChecked(isActive);
  }, [id, isActive]);

  const handleToggle = async () => {
    const previous = checked;
    const next = !previous;

    // Optimistic update
    setChecked(next);

    try {
      const res = await editLocation({
        locationId: id,
        body: {
          isActive: next,
        },
      }).unwrap();

      if (res.success) {
        showSuccess(res.message);
      }
    } catch (err) {
      // Rollback
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