const widthClassNames = {
  default: "",
  medium: "page-shell--medium",
  narrow: "page-shell--narrow",
};

export default function PageShell({
  as: Component = "main",
  width = "default",
  className = "",
  children,
}) {
  const classes = [
    "page-shell",
    widthClassNames[width] ?? "",
    className,
  ].filter(Boolean).join(" ");

  return <Component className={classes}>{children}</Component>;
}
