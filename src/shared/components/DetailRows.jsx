export default function DetailRows({ rows, emptyText = "-", className = "" }) {
  return (
    <div className={["ui-detail-rows", className].filter(Boolean).join(" ")}>
      {rows.map(({ label, value }) => (
        <div className="ui-detail-row" key={label}>
          <strong className="ui-detail-label">{label}</strong>
          <span className="ui-detail-value">{value || emptyText}</span>
        </div>
      ))}
    </div>
  );
}
