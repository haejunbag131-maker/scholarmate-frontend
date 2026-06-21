import { FaRegCalendarAlt } from "react-icons/fa";

const defaultGetScholarship = (item) => item;
const defaultGetKey = (item) => item.product_id ?? item.id;

export function ScholarshipTable({
  items,
  columns,
  getScholarship = defaultGetScholarship,
  getKey = defaultGetKey,
  wrapperClassName = "hidden md:block overflow-x-auto",
  tableClassName = "scholarships-table w-full",
}) {
  return (
    <div className={wrapperClassName}>
      <table className={tableClassName}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const scholarship = getScholarship(item);
            return (
              <tr key={getKey(item, scholarship)}>
                {columns.map((column) => (
                  <td key={column.header}>{column.render(scholarship, item)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ScholarshipMobileCards({
  items,
  getScholarship = defaultGetScholarship,
  getKey = defaultGetKey,
  listClassName = "scholarship-mobile-list md:hidden",
  cardClassName = "",
  bodyClassName = "",
  actionGridClassName = "scholarship-card-action-group",
  renderTopAction,
  renderActions,
}) {
  return (
    <div className={listClassName}>
      {items.map((item) => {
        const scholarship = getScholarship(item);
        return (
          <article
            key={getKey(item, scholarship)}
            className={["scholarship-mobile-card", cardClassName].filter(Boolean).join(" ")}
          >
            {renderTopAction?.(scholarship, item)}

            <div className={["scholarship-card-body", bodyClassName].filter(Boolean).join(" ")}>
              <div className="scholarship-card-foundation">
                {scholarship.foundation_name}
              </div>
              <h3 className="scholarship-card-title">{scholarship.name}</h3>
              <div className="scholarship-card-period">
                <FaRegCalendarAlt className="scholarship-card-period-icon" aria-hidden="true" />
                {scholarship.recruitment_start} ~ {scholarship.recruitment_end}
              </div>
            </div>

            {renderActions && (
              <div className="scholarship-card-actions">
                <div className={actionGridClassName}>{renderActions(scholarship, item)}</div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
