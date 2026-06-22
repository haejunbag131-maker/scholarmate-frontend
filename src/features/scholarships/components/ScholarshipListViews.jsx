import { FaRegCalendarAlt } from "react-icons/fa";

const defaultGetScholarship = (item) => item;
const defaultGetKey = (item) => item.product_id ?? item.id;

export const scholarshipActionsClassName =
  "flex w-full flex-nowrap items-center justify-center gap-3";
export const scholarshipTableWrapperClassName = "hidden overflow-x-auto md:block";
export const scholarshipTableClassName = "mb-5 w-full border-collapse";
export const scholarshipMobileListClassName = "flex flex-col gap-3.5 md:hidden";
export const scholarshipMobileCardClassName =
  "relative overflow-hidden rounded-[18px] border border-gray-200 bg-gradient-to-b from-white to-[#fbfdff] px-5 py-[18px] text-left shadow-[0_8px_22px_rgba(15,23,42,0.07)] before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:bg-[var(--color-primary)] max-[480px]:rounded-2xl max-[480px]:p-4";
export const scholarshipCardBodyClassName = "pr-12 max-[480px]:pr-11";
export const scholarshipCardActionGroupClassName = "grid w-full grid-cols-2 gap-2";
export const wishlistTableWrapperClassName =
  "mt-7 hidden max-h-[500px] w-full overflow-auto rounded-lg border border-gray-300 bg-white lg:block max-[480px]:max-h-[180px]";
export const wishlistTableClassName = "w-full table-fixed border-collapse";
export const wishlistMobileListClassName = "flex flex-col gap-3.5 lg:hidden";
export const wishlistCardActionGridClassName = "grid w-full grid-cols-[1.15fr_.85fr_.85fr] gap-2";

export function ScholarshipTable({
  items,
  columns,
  getScholarship = defaultGetScholarship,
  getKey = defaultGetKey,
  wrapperClassName = scholarshipTableWrapperClassName,
  tableClassName = scholarshipTableClassName,
  align = "left",
  headerCellClassName = "",
  cellClassName = "",
}) {
  const alignmentClassName = align === "center" ? "text-center" : "text-left";
  const baseHeaderClassName = [
    "border border-gray-300 bg-gray-100 p-2.5 text-sm font-bold max-md:p-1.5 max-md:text-xs max-[480px]:max-w-20 max-[480px]:overflow-hidden max-[480px]:text-ellipsis max-[480px]:whitespace-nowrap max-[480px]:p-[3px] max-[480px]:text-[0.7rem]",
    alignmentClassName,
    headerCellClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const baseCellClassName = [
    "border border-gray-300 p-2.5 text-sm max-md:p-1.5 max-md:text-xs max-[480px]:max-w-20 max-[480px]:overflow-hidden max-[480px]:text-ellipsis max-[480px]:whitespace-nowrap max-[480px]:p-[3px] max-[480px]:text-[0.7rem]",
    alignmentClassName,
    cellClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      <table className={tableClassName}>
        <thead>
          <tr>
            {columns.map((column, columnIndex) => (
              <th
                key={column.header}
                className={[
                  baseHeaderClassName,
                  columnIndex === 1 ? "font-bold" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const scholarship = getScholarship(item);
            return (
              <tr key={getKey(item, scholarship)}>
                {columns.map((column, columnIndex) => (
                  <td
                    key={column.header}
                    className={[
                      baseCellClassName,
                      columnIndex === 1 ? "font-bold text-[var(--color-primary)]" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {column.render(scholarship, item)}
                  </td>
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
  listClassName = scholarshipMobileListClassName,
  cardClassName = "",
  bodyClassName = "",
  actionGridClassName = scholarshipCardActionGroupClassName,
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
            className={[scholarshipMobileCardClassName, cardClassName].filter(Boolean).join(" ")}
          >
            {renderTopAction && (
              <div className="absolute right-4 top-4 z-10 max-[480px]:right-3.5 max-[480px]:top-3.5">
                {renderTopAction(scholarship, item)}
              </div>
            )}

            <div className={[scholarshipCardBodyClassName, bodyClassName].filter(Boolean).join(" ")}>
              <div className="mb-1 text-[0.78rem] font-bold tracking-normal text-slate-500">
                {scholarship.foundation_name}
              </div>
              <h3 className="text-[1.02rem] font-extrabold leading-snug tracking-normal text-[var(--color-primary)] max-[480px]:text-[0.98rem]">
                {scholarship.name}
              </h3>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[0.76rem] font-bold leading-tight text-slate-700 max-[480px]:max-w-full max-[480px]:whitespace-normal max-[480px]:text-[0.72rem]">
                <FaRegCalendarAlt className="h-[13px] w-[13px] shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                {scholarship.recruitment_start} ~ {scholarship.recruitment_end}
              </div>
            </div>

            {renderActions && (
              <div className="mt-4">
                <div className={actionGridClassName}>{renderActions(scholarship, item)}</div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
