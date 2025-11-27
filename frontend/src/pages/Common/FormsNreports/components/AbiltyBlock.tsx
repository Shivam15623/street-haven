import { Form } from "react-bootstrap";
import { type FormikValues } from "formik";

interface Option {
  label: string;
  value: string;
}

interface AbilityBlockProps {
  label: string;
  fieldPath: string; // example: "lifting" or "bending"
  options: Option[];
  values: FormikValues;
  setFieldValue: (field: string, value: any) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
}

const AbilityBlock: React.FC<AbilityBlockProps> = ({
  label,
  fieldPath,
  options,
  values,
  setFieldValue,
  handleChange,
}) => {
  const selected: string = values.abilities[fieldPath].option;
  const otherText: string = values.abilities[fieldPath].otherText;

  return (
    <div className="col">
      <Form.Group className="d-flex flex-column gap-8">
        <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
          {label}:
        </Form.Label>

        {options.map((opt) => (
          <label
            key={opt.label}
            className="d-flex flex-row gap-8 align-items-center"
            style={{ cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={selected === opt.value}
              onChange={() =>
                setFieldValue(
                  `abilities.${fieldPath}.option`,
                  selected === opt.value ? "" : opt.value
                )
              }
              className="form-check-input"
            />

            <span className="text-xs xs:text-sm">{opt.label}</span>

            {/* "Other" text input */}
            {opt.value === "other" && selected === "other" && (
              <Form.Control
                type="text"
                name={`abilities.${fieldPath}.otherText`}
                placeholder="Please specify"
                value={otherText}
                onChange={handleChange}
                className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                style={{ height: "auto", width: "200px" }}
              />
            )}
          </label>
        ))}
      </Form.Group>
    </div>
  );
};

export default AbilityBlock;
