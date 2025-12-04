import { Form } from "react-bootstrap";
import { type FormikValues } from "formik";

interface LimitedUseOfHandsProps {
  values: FormikValues;
  setFieldValue: (field: string, value: any) => void;
}

const LimitedUseOfHands: React.FC<LimitedUseOfHandsProps> = ({ values, setFieldValue }) => {
  const field = values.restrictions?.limitedUseOfHands || { checked: false };

  const handFields = [
    { label: "Gripping", value: "gripping" },
    { label: "Pinching", value: "pinching" },
    { label: "Other", value: "other" },
  ];

  if (!field.checked) return null;

  return (
    <div className="col">
      <Form.Group className="d-flex flex-column gap-2">
        {["left", "right"].map((hand) => (
          <div key={hand} className="d-flex flex-column gap-1 ms-3">
            <span className="text-xs font-semibold">{hand.charAt(0).toUpperCase() + hand.slice(1)} Hand</span>
            {handFields.map((hf) => (
              <label key={hf.value} className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field[hand][hf.value]}
                  onChange={(e) =>
                    setFieldValue(`restrictions.limitedUseOfHands.${hand}.${hf.value}`, e.target.checked)
                  }
                />
                {hf.label}
              </label>
            ))}
            {field[hand].other && (
              <Form.Control
                type="text"
                placeholder="Please specify"
                value={field[hand].otherText}
                onChange={(e) =>
                  setFieldValue(`restrictions.limitedUseOfHands.${hand}.otherText`, e.target.value)
                }
                className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                style={{ height: "auto", width: "200px" }}
              />
            )}
          </div>
        ))}
      </Form.Group>
    </div>
  );
};

export default LimitedUseOfHands;
