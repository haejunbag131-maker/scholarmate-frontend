import { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import Calendar from "react-calendar";
import useBodyClass from "../shared/hooks/useBodyClass";
import "react-calendar/dist/Calendar.css";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [submittedIds, setSubmittedIds] = useState(() => {
    const saved = localStorage.getItem("submittedScholarships");
    return saved ? JSON.parse(saved) : [];
  });

  const [alertIds, setAlertIds] = useState(() => {
    const saved = localStorage.getItem("alertScholarships");
    return saved ? JSON.parse(saved) : [];
  });

  useBodyClass("calendar-page");

  useEffect(() => {
    axios
      .get("/scholarships/calendar/")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("캘린더 불러오기 실패", err));
  }, []);

  useEffect(() => {
    const today = new Date();
    const d1Alerts = events.filter((e) => {
      const deadline = new Date(e.deadline);
      const diff = Math.floor((deadline - today) / (1000 * 60 * 60 * 24));
      return diff === 1 && alertIds.includes(e.id);
    });

    d1Alerts.forEach((e) => {
      alert(`⏰ [알림] 내일 마감: ${e.title}`);
    });
  }, [events, alertIds]);

  useEffect(() => {
    if (!searchTerm) return;
    const matched = events.find((e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matched?.deadline) {
      setCalendarDate(new Date(matched.deadline));
    }
  }, [searchTerm, events]);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  // react-calendar 내부 자식들을 Tailwind로 스타일링하기 위한 descendant selector 클래스
  const calendarShellClass = useMemo(
    () =>
      [
        "[&_.react-calendar]:w-full",
        "[&_.react-calendar]:border-0",
        "[&_.react-calendar]:py-16", // 
        "[&_.react-calendar__month-view__weekdays]:mb-4",

        "[&_.react-calendar__tile]:w-[70px]", 
        "[&_.react-calendar__tile]:h-[80px]",     
        "lg:[&_.react-calendar__tile]:h-[100px]", 

        "[&_.react-calendar__tile]:flex",
        "[&_.react-calendar__tile]:items-center",
        "[&_.react-calendar__tile]:justify-center",
        "[&_.react-calendar__tile]:rounded-lg",
        "[&_.react-calendar__tile]:text-[0.9rem]",
        "[&_.react-calendar__tile]:text-gray-900",
        "[&_.react-calendar__tile]:bg-white",
        "[&_.react-calendar__tile:hover]:bg-gray-100",

        // 오늘/선택일 
        "[&_.react-calendar__tile--now]:!bg-sky-100",
        "[&_.react-calendar__tile--now]:!rounded-full",
        "[&_.react-calendar__tile--now]:font-semibold",
        "[&_.react-calendar__tile--now]:!text-gray-900",
        "[&_.react-calendar__tile--active]:!bg-sky-500",
        "[&_.react-calendar__tile--active]:!text-white",
        "[&_.react-calendar__tile--active]:!rounded-full",
        "[&_.react-calendar__tile--active]:w-[60px]",
        "[&_.react-calendar__tile--active]:h-[60px]",

        // 이웃달
        "[&_.react-calendar__month-view__days__day--neighboringMonth]:text-gray-300",

        // 네비게이션
        "[&_.react-calendar__navigation]:flex",
        "[&_.react-calendar__navigation]:items-center",
        "[&_.react-calendar__navigation]:justify-center",
        "[&_.react-calendar__navigation]:mb-4",
        "[&_.react-calendar__navigation__label]:bg-transparent",
        "[&_.react-calendar__navigation__arrow]:bg-transparent",

        // 모바일에서는 다시 조금 줄이기 
        "max-[480px]:[&_.react-calendar__tile]:w-[45px]",
        "max-[480px]:[&_.react-calendar__tile]:h-[45px]",
        "max-[480px]:[&_.react-calendar__tile]:text-[0.75rem]",
        "max-[480px]:[&_.react-calendar__tile--active]:w-[40px]",
        "max-[480px]:[&_.react-calendar__tile--active]:h-[40px]",
      ].join(" "),
    []
  );

  const renderTileContent = ({ date }) => {
    const dateStr = formatDate(date);

    const matches = events.filter(
      (e) =>
        e.deadline?.startsWith(dateStr) &&
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matches.length === 0) return null;

    return (
      <div className="flex w-full flex-col gap-1 px-0.5">
        {matches.map((event, index) => {
          const today = new Date();
          const deadline = new Date(event.deadline);
          const diffDays = Math.floor(
            (deadline - today) / (1000 * 60 * 60 * 24)
          );

          let badge = "";
          if (diffDays === 0) badge = "🔥 D-day";
          else if (diffDays === 1) badge = "⏰ D-1";
          else if (diffDays === 3) badge = "⚠️ D-3";

          const isSubmitted = submittedIds.includes(event.id);

          return (
            <button
              type="button"
              key={index}
              title={event.title}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              className={[
                "w-full truncate rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold",
                isSubmitted
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-gray-900",
              ].join(" ")}
            >
              {isSubmitted ? "✅" : "📌"} {event.title.slice(0, 2)} 마감
              {badge && <span className="ml-1 opacity-80">({badge})</span>}
            </button>
          );
        })}
      </div>
    );
  };

  const handleSubmitComplete = () => {
    if (!submittedIds.includes(selectedEvent.id)) {
      const updated = [...submittedIds, selectedEvent.id];
      setSubmittedIds(updated);
      localStorage.setItem("submittedScholarships", JSON.stringify(updated));
    }
  };

  const handleSubmitCancel = () => {
    const updated = submittedIds.filter((id) => id !== selectedEvent.id);
    setSubmittedIds(updated);
    localStorage.setItem("submittedScholarships", JSON.stringify(updated));
    alert("❎ 제출 완료가 취소되었습니다.");
  };

  const handleAlertRegister = () => {
    if (!alertIds.includes(selectedEvent.id)) {
      const updated = [...alertIds, selectedEvent.id];
      setAlertIds(updated);
      localStorage.setItem("alertScholarships", JSON.stringify(updated));
      alert("🔔 마감 알림이 등록되었습니다!");
    }
  };

  const handleAlertCancel = () => {
    const updated = alertIds.filter((id) => id !== selectedEvent.id);
    setAlertIds(updated);
    localStorage.setItem("alertScholarships", JSON.stringify(updated));
    alert("🔕 알림이 취소되었습니다.");
  };

  return (
    <div className="mx-auto mt-16 mb-10 w-full max-w-[1000px] rounded-2xl bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] max-[480px]:p-4">
      <div className="mb-4 flex flex-col items-center gap-3">
        <h1 className="mb-2 border-b border-gray-300 pb-4 text-3xl font-bold text-gray-900">
          📅 나의 장학 캘린더
        </h1>
        <input
          type="text"
          placeholder="장학금 이름 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border-2 border-sky-700 bg-white px-3 py-2 text-base text-gray-900 outline-none transition focus:border-sky-900"
        />
      </div>

      <div className={calendarShellClass}>
        <Calendar
          tileContent={renderTileContent}
          key={searchTerm}
          value={calendarDate}
          onChange={setCalendarDate}
          prev2Label={"«"}
          next2Label={"»"}
        />
      </div>

      {isModalOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-[100] flex h-[100vh] w-[100vw] items-center justify-center bg-black/40"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-[90%] max-w-[420px] animate-[fadeIn_0.2s_ease-in-out] rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-[480px]:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-bold">🎓 {selectedEvent.title}</h3>

            <p className="mb-1 font-semibold">제출 서류</p>
            <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-800">
              {selectedEvent.required_documents_details?.trim() ||
                "제출 서류 정보가 없습니다."}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const text = selectedEvent.required_documents_details?.trim();
                  if (!text) return alert("복사할 제출 서류가 없습니다.");
                  navigator.clipboard.writeText(text);
                  alert("✅ 제출 서류가 복사되었습니다!");
                }}
                className="rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700"
              >
                📋 복사하기
              </button>

              {submittedIds.includes(selectedEvent.id) ? (
                <button
                  onClick={handleSubmitCancel}
                  className="rounded-md bg-rose-100 px-3 py-2 text-rose-700 hover:bg-rose-200"
                >
                  🚫 제출 취소
                </button>
              ) : (
                <button
                  onClick={handleSubmitComplete}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                >
                  ✅ 제출 완료
                </button>
              )}

              {alertIds.includes(selectedEvent.id) ? (
                <button
                  onClick={handleAlertCancel}
                  className="rounded-md bg-gray-100 px-3 py-2 text-gray-800 hover:bg-gray-200"
                >
                  🔕 알림 취소
                </button>
              ) : (
                <button
                  onClick={handleAlertRegister}
                  className="rounded-md bg-amber-500 px-3 py-2 text-white hover:bg-amber-600"
                >
                  🔔 알림 등록
                </button>
              )}

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-gray-800 px-3 py-2 text-white hover:bg-black"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
