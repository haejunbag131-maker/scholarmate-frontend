import { Link } from "react-router-dom";
import {
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaHeart,
  FaSearch,
  FaUserGraduate,
} from "react-icons/fa";
import PageShell from "../shared/components/PageShell";

const featureItems = [
  {
    icon: FaSearch,
    title: "장학금 탐색",
    text: "전체 장학금에서 모집 기간, 유형, 재단 정보를 빠르게 훑고 필요한 공고만 확인합니다.",
  },
  {
    icon: FaUserGraduate,
    title: "맞춤 추천",
    text: "학교, 지역, 소득 분위, 성적 정보를 바탕으로 조건에 맞는 장학금을 우선 정리합니다.",
  },
  {
    icon: FaHeart,
    title: "관심 장학금",
    text: "지원할 가능성이 있는 장학금을 저장하고 나중에 다시 비교할 수 있습니다.",
  },
  {
    icon: FaCalendarAlt,
    title: "마감 캘린더",
    text: "관심 장학금의 마감일과 제출 상태를 달력에서 함께 관리합니다.",
  },
];

const workflowItems = [
  "나의 장학 정보를 입력합니다.",
  "전체 장학금과 추천 장학금을 비교합니다.",
  "관심 장학금으로 저장하고 마감일을 확인합니다.",
  "커뮤니티와 쪽지로 준비 경험을 공유합니다.",
];

export default function Introduction() {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <PageShell className="py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold text-[var(--color-secondary)]">
                장학금 준비를 한 화면에서
              </p>
              <h1 className="m-0 text-2xl font-black leading-tight text-gray-950 sm:text-3xl lg:text-4xl">
                ScholarMate는
                <br />
                조건 확인부터 마감 관리까지
                <br />
                이어지는 장학금 관리 플랫폼입니다.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
                공고를 찾고, 내 조건과 맞는지 보고, 저장하고, 마감일까지 챙기는 흐름을
                <br />
                끊기지 않게 연결했습니다.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/scholarships"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#111827] px-5 py-3 text-sm font-black text-white hover:bg-[#020617] hover:text-white"
                >
                  전체 장학금 보기
                </Link>
                <Link
                  to="/recommendation"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-secondary)] bg-white px-5 py-3 text-sm font-black text-[var(--color-secondary)] hover:bg-[color-mix(in_srgb,var(--color-secondary)_10%,#fff)] hover:text-[var(--color-secondary)]"
                >
                  추천 장학금 확인
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="grid gap-3">
                {workflowItems.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageShell>
      </section>

      <PageShell className="py-10 sm:py-12">
        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl font-black text-gray-950">핵심 기능</h2>
              <p className="mt-2 text-sm text-gray-600">
                장학금 탐색부터 일정 관리까지 실제 지원 흐름에 맞춰 구성했습니다.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-700">
              <FaCheckCircle className="text-[var(--color-primary)]" aria-hidden="true" />
              반복 확인 시간을 줄이는 구조
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureItems.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,#fff)] text-[var(--color-primary)]">
                  <Icon aria-hidden="true" />
                </div>
                <h3 className="m-0 text-base font-black text-gray-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <FaClipboardList className="text-[var(--color-primary)]" aria-hidden="true" />
              <h2 className="m-0 text-xl font-black text-gray-950">관리 기준</h2>
            </div>
            <ul className="m-0 space-y-3 p-0 text-sm leading-6 text-gray-700">
              <li className="list-none">모집 기간과 장학 유형을 먼저 비교합니다.</li>
              <li className="list-none">나의 조건에 맞는 추천 항목을 따로 확인합니다.</li>
              <li className="list-none">관심 장학금으로 저장한 뒤 캘린더에서 마감일을 추적합니다.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <FaBell className="text-[var(--color-primary)]" aria-hidden="true" />
              <h2 className="m-0 text-xl font-black text-gray-950">지원 준비 흐름</h2>
            </div>
            <p className="m-0 text-sm leading-7 text-gray-700">
              장학금 상세 조건을 확인하고, 제출 서류와 마감일을 캘린더에 연결해 놓으면
              지원 전 확인해야 할 내용을 한 번에 점검할 수 있습니다.
            </p>
          </div>
        </section>
      </PageShell>
    </div>
  );
}
