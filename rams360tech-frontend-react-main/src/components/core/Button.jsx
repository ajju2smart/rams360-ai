import React from "react";
import "./Button.scss";

/**
 * Unified Button — replaces save-btn, delete-cancel-btn, pro-cancel-btn, pbs-add-btn, FRP-button etc.
 *
 * Usage:
 *   <Button variant="primary">Save</Button>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="danger">Delete</Button>
 *   <Button variant="primary" loading>Saving...</Button>
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...rest
}) => {
  const classes = [
    "btn-unified",
    `btn-unified--${variant}`,
    `btn-unified--${size}`,
    loading ? "btn-unified--loading" : "",
    disabled ? "btn-unified--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading && <span className="btn-unified__spinner" aria-hidden="true" />}
      <span className="btn-unified__text">{children}</span>
    </button>
  );
};

export default Button;
