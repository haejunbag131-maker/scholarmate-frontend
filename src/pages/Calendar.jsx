import { useEffect, useState } from "react";
import axios from "../api/axios";
import CalendarEventModal from "../features/calendar/components/CalendarEventModal";
import CalendarHeader from "../features/calendar/components/CalendarHeader";
import CalendarToast from "../features/calendar/components/CalendarToast";
import ScholarshipCalendarView from "../features/calendar/components/ScholarshipCalendarView";
import { getDaysUntil, parseDateOnly } from "../features/calendar/utils/dates";
import useBodyClass from "../shared/hooks/useBodyClass";
import useToast from "../shared/hooks/useToast";
import "../assets/css/calendar.css";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [submittedIds, setSubmittedIds] = useState(() => {
    const saved = localStorage.getItem("submittedScholarships");
    return saved ? JSON.parse(saved) : [];
  });
  const [alertIds, setAlertIds] = useState([]);
  const { toast, showToast } = useToast();

  useBodyClass("calendar-page");

  useEffect(() => {
    axios
      .get("/scholarships/calendar/")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setEvents(rows);
        setAlertIds(rows.filter((event) => event.is_alert_enabled).map((event) => event.id));
      })
      .catch((err) => {
        console.error("캘린더 불러오기 실패", err);
        showToast("캘린더를 불러오지 못했습니다.", "error");
      });
  }, [showToast]);

  useEffect(() => {
    const d1Alert = events.find(
      (event) => getDaysUntil(event.deadline) === 1 && alertIds.includes(event.id)
    );
    if (d1Alert) showToast(`[알림] 내일 마감: ${d1Alert.title}`, "info", 3000);
  }, [events, alertIds, showToast]);

  useEffect(() => {
    if (!searchTerm) return;
    const matched = events.find((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchedDate = parseDateOnly(matched?.deadline);
    if (matchedDate) setCalendarDate(matchedDate);
  }, [searchTerm, events]);

  const updateSubmittedIds = (nextIds) => {
    setSubmittedIds(nextIds);
    localStorage.setItem("submittedScholarships", JSON.stringify(nextIds));
  };

  const handleSubmitComplete = () => {
    if (!selectedEvent || submittedIds.includes(selectedEvent.id)) return;
    updateSubmittedIds([...submittedIds, selectedEvent.id]);
    showToast("제출 완료로 표시했습니다.", "success");
  };

  const handleSubmitCancel = () => {
    if (!selectedEvent) return;
    updateSubmittedIds(submittedIds.filter((id) => id !== selectedEvent.id));
    showToast("제출 완료가 취소되었습니다.", "info");
  };

  const handleCopyDocuments = async () => {
    const text = selectedEvent?.required_documents_details?.trim();
    if (!text) {
      showToast("복사할 제출 서류가 없습니다.", "error");
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast("제출 서류가 복사되었습니다.", "success");
  };

  const handleAlertRegister = async () => {
    if (!selectedEvent) return;
    try {
      await axios.post("/scholarships/calendar/alerts/", {
        wishlist_id: selectedEvent.id,
      });
      if (!alertIds.includes(selectedEvent.id)) {
        setAlertIds((prev) => [...prev, selectedEvent.id]);
      }
      showToast("마감 알림이 등록되었습니다.", "success");
    } catch (error) {
      showToast(error?.response?.data?.error || "알림 등록에 실패했습니다.", "error");
    }
  };

  const handleAlertCancel = async () => {
    if (!selectedEvent) return;
    try {
      await axios.delete(`/scholarships/calendar/alerts/${selectedEvent.id}/`);
      setAlertIds((prev) => prev.filter((id) => id !== selectedEvent.id));
      showToast("알림이 취소되었습니다.", "info");
    } catch (error) {
      showToast(error?.response?.data?.error || "알림 취소에 실패했습니다.", "error");
    }
  };

  return (
    <div className="calendar-page-shell">
      <CalendarHeader searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

      <ScholarshipCalendarView
        events={events}
        searchTerm={searchTerm}
        calendarDate={calendarDate}
        submittedIds={submittedIds}
        onCalendarDateChange={setCalendarDate}
        onOpenEvent={setSelectedEvent}
      />

      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          submitted={submittedIds.includes(selectedEvent.id)}
          alertEnabled={alertIds.includes(selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
          onCopyDocuments={handleCopyDocuments}
          onSubmitComplete={handleSubmitComplete}
          onSubmitCancel={handleSubmitCancel}
          onAlertRegister={handleAlertRegister}
          onAlertCancel={handleAlertCancel}
        />
      )}

      <CalendarToast toast={toast} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        body.calendar-page .react-calendar__tile--now {
          background: #eff6ff !important;
          color: #1e3a8a !important;
        }
        body.calendar-page .react-calendar__tile--now:enabled:hover,
        body.calendar-page .react-calendar__tile--now:enabled:focus {
          background: #dbeafe !important;
        }
        body.calendar-page .react-calendar__tile--active,
        body.calendar-page .react-calendar__tile--active:enabled:hover,
        body.calendar-page .react-calendar__tile--active:enabled:focus {
          background: #2563eb !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
