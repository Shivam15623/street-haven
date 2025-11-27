import { Form } from "react-bootstrap";

interface RestrictionCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  children?: React.ReactNode;
}

export const RestrictionCheckbox = ({
  label,
  checked,
  onChange,
  children,
}: RestrictionCheckboxProps) => {
  return (
    <Form.Group className="d-flex flex-column gap-2">
      <label className="d-flex align-items-center gap-2">
        <input
          type="checkbox"
          className="form-check-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-xs">{label}</span>
      </label>

      {/* Nested UI */}
      {checked && <div className="ms-3">{children}</div>}
    </Form.Group>
  );
};
