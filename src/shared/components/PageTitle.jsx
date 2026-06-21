export default function PageTitle({
  as: Component = "h1",
  accent = false,
  className = "",
  children,
}) {
  const classes = [
    "page-title",
    accent ? "page-title--accent" : "",
    className,
  ].filter(Boolean).join(" ");

  return <Component className={classes}>{children}</Component>;
}
