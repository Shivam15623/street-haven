import { Form } from "react-bootstrap";
import { type FormikValues } from "formik";

interface CheckboxWithDetailsProps {
  label: string;
  fieldPath: string;
  values: FormikValues;
  errors: FormikValues;
  touched: FormikValues;
  setFieldValue: (field: string, value: any) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}

const CheckboxWithDetails: React.FC<CheckboxWithDetailsProps> = ({
  label,
  fieldPath,
  values,
  errors,
  touched,
  setFieldValue,
  handleChange,
  placeholder = "Please specify",
}) => {
  const field = values.restrictions?.[fieldPath] || {
    checked: false,
    details: "",
  };

  const error =
    errors?.restrictions?.[fieldPath]?.details &&
    touched?.restrictions?.[fieldPath]?.details;

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
          />{" "}
          <span className="text-xs">{label}</span>
        </label>
      </Form.Group>

      {field.checked && (
        <>
          <Form.Control
            type="text"
            placeholder={placeholder}
            name={`restrictions.${fieldPath}.details`}
            value={field.details}
            onChange={handleChange}
            className="p-0 ms-2 border-bottom-1 border-top-0 border-end-0 rounded-0 border-start-0"
            style={{ height: "auto", width: "200px" }}
          />

          {error && (
            <div className="text-danger ms-2" style={{ fontSize: "12px" }}>
              {errors.restrictions[fieldPath].details}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CheckboxWithDetails;
