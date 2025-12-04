import { Form } from "react-bootstrap";
import { type FormikValues } from "formik";

interface NestedCheckboxGroupProps {
  label: string;
  fieldPath: string;
  options: { label: string; value: string }[];
  values: FormikValues;
  setFieldValue: (field: string, value: any) => void;
}

const NestedCheckboxGroup: React.FC<NestedCheckboxGroupProps> = ({
  label,
  fieldPath,
  options,
  values,
  setFieldValue,
}) => {
  const field = values.restrictions?.[fieldPath] || { checked: false };

  return (
    <div className="col">
      <Form.Group className="d-flex flex-column gap-2">
        <label
          className="d-flex align-items-center gap-2"
          style={{ cursor: "pointer" }}
        >
          <input
            type="checkbox"
            className="form-check-input"
            checked={field.checked}
            onChange={(e) =>
              setFieldValue(
                `restrictions.${fieldPath}.checked`,
                e.target.checked
              )
            }
          />
          <span className="text-xs">{label}</span>
        </label>

        {field.checked &&
          options.map((opt) => (
            <label
              key={opt.value}
              className="d-flex align-items-center gap-2 ms-3 text-xs"
            >
              <input
                type="checkbox"
                className="form-check-input"
                checked={field[opt.value]}
                onChange={(e) =>
                  setFieldValue(
                    `restrictions.${fieldPath}.${opt.value}`,
                    e.target.checked
                  )
                }
              />
              {opt.label}
            </label>
          ))}
      </Form.Group>
    </div>
  );
};

export default NestedCheckboxGroup;
