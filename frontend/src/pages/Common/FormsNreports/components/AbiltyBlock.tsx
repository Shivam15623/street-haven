import { Form } from "react-bootstrap";
import { type FormikValues } from "formik";

interface Option {
  label: string;
  value: string;
}

interface AbilityBlockProps {
  label: string;
  fieldPath: string;
  options: Option[];
  values: FormikValues;
  errors: FormikValues;
  touched: FormikValues;
  setFieldValue: (field: string, value: any) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
}

const AbilityBlock: React.FC<AbilityBlockProps> = ({
  label,
  fieldPath,
  options,
  values,
  errors,
  touched,
  setFieldValue,
  handleChange,
}) => {
  const selected: string = values.abilities[fieldPath].option;
  const otherText: string = values.abilities[fieldPath].otherText;

  const fieldErrors = errors?.abilities?.[fieldPath];
  const fieldTouched = touched?.abilities?.[fieldPath];

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

            <span className="text-xs ">{opt.label}</span>

            {/* Other Option Input */}
            {opt.value === "other" && selected === "other" && (
              <div className="d-flex flex-column">
                <Form.Control
                  type="text"
                  name={`abilities.${fieldPath}.otherText`}
                  placeholder="Please specify"
                  value={otherText}
                  onChange={handleChange}
                  className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
                  style={{ height: "auto", width: "200px" }}
                />

                {/* OTHER INPUT ERROR */}
                {fieldErrors?.otherText && fieldTouched?.otherText && (
                  <small className="text-danger">{fieldErrors.otherText}</small>
                )}
              </div>
            )}
          </label>
        ))}

        {/* MAIN OPTION ERROR */}
        {fieldErrors?.option && fieldTouched?.option && (
          <small className="text-danger">{fieldErrors.option}</small>
        )}
      </Form.Group>
    </div>
  );
};

export default AbilityBlock;
