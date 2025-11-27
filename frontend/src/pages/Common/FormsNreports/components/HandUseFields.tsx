import { Form } from "react-bootstrap";
import type { RestrictionsValues } from "./RestrictionSection";

interface Props {
  values: RestrictionsValues;
  setFieldValue: (field: string, value: unknown) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const HandUseFields = ({
  values,
  setFieldValue,
  handleChange,
}: Props) => {
  const hands = values.limitedUseOfHands;

  return (
    <div className="ms-2 d-flex flex-column gap-2 text-xs">
      <label className="d-flex gap-2">
        <input
          type="checkbox"
          checked={hands.left}
          onChange={(e) =>
            setFieldValue(
              "restrictions.limitedUseOfHands.left",
              e.target.checked
            )
          }
        />
        Left hand
      </label>

      <label className="d-flex gap-2">
        <input
          type="checkbox"
          checked={hands.right}
          onChange={(e) =>
            setFieldValue(
              "restrictions.limitedUseOfHands.right",
              e.target.checked
            )
          }
        />
        Right hand
      </label>

      <label className="d-flex gap-2">
        <input
          type="checkbox"
          checked={hands.other}
          onChange={(e) =>
            setFieldValue(
              "restrictions.limitedUseOfHands.other",
              e.target.checked
            )
          }
        />
        Other
        {hands.other && (
          <Form.Control
            type="text"
            placeholder="Other details"
            name="restrictions.limitedUseOfHands.otherText"
            value={hands.otherText}
            onChange={handleChange}
            className="p-0 ms-2 border-bottom"
            style={{ width: "200px" }}
          />
        )}
      </label>
    </div>
  );
};
