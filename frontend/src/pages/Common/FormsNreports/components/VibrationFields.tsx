import { Form } from "react-bootstrap";
import type { RestrictionsValues } from "./RestrictionSection";

interface Props {
  values: RestrictionsValues;
  setFieldValue: (field: string, value: unknown) => void;
}

export const VibrationFields = ({ values, setFieldValue }: Props) => {
  const vib = values.exposureToVibration;

  return (
    <div className="ms-2 d-flex flex-column gap-2 text-xs">
      <Form.Select
        value={vib.type}
        onChange={(e) =>
          setFieldValue("restrictions.exposureToVibration.type", e.target.value)
        }
        className="w-100"
      >
        <option value="">Select type</option>
        <option value="Hand-Arm">Hand-Arm</option>
        <option value="Whole Body">Whole Body</option>
      </Form.Select>
    </div>
  );
};
