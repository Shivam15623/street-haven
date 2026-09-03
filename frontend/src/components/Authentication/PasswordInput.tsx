import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, type CSSProperties } from "react";
import { Form } from "react-bootstrap";

interface PasswordInputProps {
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur?: (e: React.FocusEvent<any>) => void;
  isInvalid?: boolean;
  disabled?: boolean;
  size?: "sm" | "lg"; // ✅ optional size prop
  error?: string;
  style?: CSSProperties; // ✅ custom styles
  className?: string; // ✅ custom classes
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  placeholder = "Enter password",
  value,
  onChange,
  onBlur,
  disabled,
  error,
  size,
  style = {},
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="position-relative">
      <div className="position-relative">
        <Form.Control
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          size={size}
          isInvalid={!!error}
          autoComplete="off"
          className={`nullInvalid-password-input ${className}`}
          style={{
            paddingRight: "2.5rem", // space for the eye icon
            ...style,
          }}
        />

        <span
          className="position-absolute top-50 end-0 translate-middle-y pe-3 cursor-pointer"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <Icon icon="bi:eye-slash" className="text-xl" />
          ) : (
            <Icon icon="bi:eye" className="text-xl" />
          )}
        </span>
      </div>

      {/* Feedback below input, separate from input+icon wrapper */}
      {error && (
        <div className="mt-1">
          <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
            {error}
          </Form.Control.Feedback>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
