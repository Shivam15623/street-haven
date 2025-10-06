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
  isInvalid,
  disabled,
  error,
  size,
  style = {},
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
        isInvalid={isInvalid}
        className={className} // ✅ allow extra classes
        style={{
          ...style, // ✅ merge custom styles
        }}
      />

      <span
        className="position-absolute top-50 text-street-base text-lg end-0 translate-middle-y pe-3"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? (
          <Icon icon="bi:eye-slash" className="text-xl" />
        ) : (
          <Icon icon="bi:eye" className="text-xl" />
        )}
      </span>

      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </div>
  );
};

export default PasswordInput;
