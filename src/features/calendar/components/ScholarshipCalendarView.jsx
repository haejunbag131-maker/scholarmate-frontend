import { useMemo } from "react";
import Calendar from "react-calendar";
import CalendarEventTile from "./CalendarEventTile";
import { formatDate } from "../utils/dates";
import "react-calendar/dist/Calendar.css";

export default function ScholarshipCalendarView({
  events,
  searchTerm,
  calendarDate,
  submittedIds,
  onCalendarDateChange,
  onOpenEvent,
}) {
  const calendarShellClass = useMemo(
    () =>
      [
        "[&_.react-calendar]:w-full",
        "[&_.react-calendar]:max-w-full",
        "[&_.react-calendar]:border-0",
        "[&_.react-calendar]:py-5",
        "sm:[&_.react-calendar]:py-8",
        "lg:[&_.react-calendar]:py-10",
        "[&_.react-calendar__month-view__weekdays]:mb-2",
        "sm:[&_.react-calendar__month-view__weekdays]:mb-4",
        "[&_.react-calendar__tile]:min-w-0",
        "[&_.react-calendar__tile]:min-h-[54px]",
        "sm:[&_.react-calendar__tile]:min-h-[76px]",
        "lg:[&_.react-calendar__tile]:min-h-[88px]",
        "[&_.react-calendar__tile]:px-1",
        "[&_.react-calendar__tile]:py-2",
        "[&_.react-calendar__tile]:flex",
        "[&_.react-calendar__tile]:flex-col",
        "[&_.react-calendar__tile]:items-center",
        "[&_.react-calendar__tile]:justify-start",
        "[&_.react-calendar__tile]:gap-1",
        "[&_.react-calendar__tile]:rounded-lg",
        "[&_.react-calendar__tile]:text-[0.8rem]",
        "sm:[&_.react-calendar__tile]:text-[0.9rem]",
        "[&_.react-calendar__tile]:text-gray-900",
        "[&_.react-calendar__tile]:bg-white",
        "[&_.react-calendar__tile:hover]:bg-gray-100",
        "[&_.react-calendar__tile--now]:!bg-[color-mix(in_srgb,var(--color-primary)_12%,#fff)]",
        "[&_.react-calendar__tile--now]:!rounded-lg",
        "[&_.react-calendar__tile--now]:font-semibold",
        "[&_.react-calendar__tile--now]:!text-[var(--color-secondary)]",
        "[&_.react-calendar__tile--active]:!bg-[var(--color-primary)]",
        "[&_.react-calendar__tile--active]:!text-white",
        "[&_.react-calendar__tile--active]:!rounded-lg",
        "[&_.react-calendar__month-view__days__day--neighboringMonth]:text-gray-300",
        "[&_.react-calendar__navigation]:flex",
        "[&_.react-calendar__navigation]:items-center",
        "[&_.react-calendar__navigation]:justify-center",
        "[&_.react-calendar__navigation]:mb-2",
        "sm:[&_.react-calendar__navigation]:mb-4",
        "[&_.react-calendar__navigation__label]:bg-transparent",
        "[&_.react-calendar__navigation__arrow]:bg-transparent",
        "max-[480px]:[&_.react-calendar__tile]:min-h-[48px]",
        "max-[480px]:[&_.react-calendar__tile]:px-0.5",
        "max-[480px]:[&_.react-calendar__tile]:py-1.5",
        "max-[480px]:[&_.react-calendar__tile]:text-[0.75rem]",
      ].join(" "),
    []
  );

  const renderTileContent = ({ date }) => {
    const dateStr = formatDate(date);
    const matches = events.filter(
      (event) =>
        event.deadline?.startsWith(dateStr) &&
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matches.length === 0) return null;

    return (
      <div className="flex w-full flex-col gap-1 px-0.5">
        {matches.map((event) => (
          <CalendarEventTile
            key={event.id}
            event={event}
            submitted={submittedIds.includes(event.id)}
            onOpen={onOpenEvent}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={calendarShellClass}>
      <Calendar
        tileContent={renderTileContent}
        key={searchTerm}
        value={calendarDate}
        onChange={onCalendarDateChange}
        prev2Label="«"
        next2Label="»"
      />
    </div>
  );
}
