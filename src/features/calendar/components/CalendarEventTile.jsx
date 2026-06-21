import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFire,
  FaMapPin,
} from "react-icons/fa";
import { getDaysUntil } from "../utils/dates";

function getDeadlineBadge(deadline) {
  const diffDays = getDaysUntil(deadline);
  if (diffDays === 0) return { Icon: FaFire, label: "D-day", className: "text-rose-500" };
  if (diffDays === 1) return { Icon: FaClock, label: "D-1", className: "text-amber-600" };
  if (diffDays === 3) {
    return { Icon: FaExclamationTriangle, label: "D-3", className: "text-orange-500" };
  }
  return null;
}

export default function CalendarEventTile({ event, submitted, onOpen }) {
  const badge = getDeadlineBadge(event.deadline);
  const StatusIcon = submitted ? FaCheckCircle : FaMapPin;

  return (
    <div
      title={event.title}
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onOpen(event);
      }}
      className={[
        "w-full max-w-full truncate rounded-md px-1 py-0.5 text-[0.62rem] font-semibold sm:px-1.5 sm:text-[0.7rem]",
        submitted
          ? "bg-emerald-100 text-emerald-800"
          : "bg-[color-mix(in_srgb,var(--color-primary)_14%,#fff)] text-[var(--color-secondary)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_35%,#fff)]",
      ].join(" ")}
    >
      <span className="inline-flex max-w-full items-center gap-1">
        <StatusIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{event.title.slice(0, 2)} 마감</span>
        {badge && (
          <span className="ml-1 inline-flex items-center gap-0.5 opacity-90">
            <badge.Icon className={`h-3 w-3 ${badge.className}`} aria-hidden="true" />
            {badge.label}
          </span>
        )}
      </span>
    </div>
  );
}
