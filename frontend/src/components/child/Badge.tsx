import React from "react";
import clsx from "clsx";

type BadgeVariant =
  | "danger-soft"
  | "warning-soft"
  | "success-soft"
  | "secondary-soft"
  | "primary-soft";

type BadgeShape = "pill" | "badge";

interface BadgeProps {
  variant?: BadgeVariant;
  shape?: BadgeShape;
  children: React.ReactNode;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** If true, renders with reduced padding (smaller badge) */
  small?: boolean;
  /** If true, badge is aria-hidden for accessibility */
  ariaHidden?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "secondary-soft",
  shape = "badge",
  children,
  className,
  leftIcon,
  rightIcon,
  small = false,
  ariaHidden = false,
}) => {
  const baseClasses =
    "sh-badge inline-flex items-center justify-center gap-2 font-medium transition-colors";
  const sizeClasses = small ? "px-1 px-sm-8 py-sm-4 text-xxs" : "px-8 px-sm-16 py-1 py-sm-6 text-xs sm:text-sm";

  const shapeClasses =
    shape === "pill" ? "rounded-pill" : "rounded-md";

  const variantClass = `sh-badge-${variant}`;

  return (
    <span
      className={clsx(baseClasses, sizeClasses, shapeClasses, variantClass, className,)}
      aria-hidden={ariaHidden}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
    
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </span>
  );
};

export default Badge;
