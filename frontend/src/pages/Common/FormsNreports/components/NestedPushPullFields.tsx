import { Form } from "react-bootstrap";
import type { RestrictionsValues } from "./RestrictionSection";

interface Props {
  values: RestrictionsValues;
  setFieldValue: (field: string, value: unknown) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const NestedPushPullFields = ({
  values,
  setFieldValue,
  handleChange,
}: Props) => {
  const pushPull = values.limitedPushingPulling;

  return (
    <div className="d-flex flex-column gap-2 text-xs ms-1">
      <label className="d-flex gap-2">
        <input
          type="checkbox"
          checked={pushPull.leftArm}
          onChange={(e) =>
            setFieldValue(
              "restrictions.limitedPushingPulling.leftArm",
              e.target.checked
            )
          }
        />
        Left Arm
      </label>

      <label className="d-flex gap-2">
        <input
          type="checkbox"
          checked={pushPull.rightArm}
          onChange={(e) =>
            setFieldValue(
              "restrictions.limitedPushingPulling.rightArm",
              e.target.checked
            )
          }
        />
        Right Arm
      </label>

      <label className="d-flex gap-2">
        <input
          type="checkbox"
          checked={pushPull.other}
          onChange={(e) =>
            setFieldValue(
              "restrictions.limitedPushingPulling.other",
              e.target.checked
            )
          }
        />
        Other
        {pushPull.other && (
          <Form.Control
            type="text"
            placeholder="Other details"
            name="restrictions.limitedPushingPulling.otherText"
            value={pushPull.otherText}
            onChange={handleChange}
            className="p-0 ms-2 border-bottom"
            style={{ width: "200px" }}
          />
        )}
      </label>
    </div>
  );
};
