export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  children,
  ...props
}) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const buttonProps =
    Component === "button" ? { type: props.type || "button", disabled } : {};

  return (
    <Component className={classes} aria-disabled={disabled} {...buttonProps} {...props}>
      {children}
    </Component>
  );
}
