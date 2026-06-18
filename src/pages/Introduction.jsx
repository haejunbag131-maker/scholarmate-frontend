import { Link } from "react-router-dom";

export default function Introduction() {
  return (
    <div className="px-5 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl">
        <div className="bg-white rounded-2xl shadow-lg p-7 sm:p-10 md:p-16">
          <h1 className="text-center text-4xl md:text-6xl font-extrabold text-[#0B2D6B]">
            ScholarMate
          </h1>
          <p className="mt-6 text-center text-gray-700 text-xl md:text-2xl leading-relaxed">
            ScholarMate는 학생들이 장학금 정보를 놓치지 않도록 돕는{" "}
            <span className="font-semibold">AI 기반 개인 맞춤형 장학금 추천 서비스</span>
            입니다.
          </p>

          <ul className="mt-10 grid gap-6 md:grid-cols-3 text-center">
            <li className="p-5 sm:p-6 rounded-xl border">
              <h2 className="font-semibold text-[#0B2D6B] text-lg md:text-xl">맞춤 추천</h2>
              <p className="text-gray-600 mt-3">전공/소득/지역/성적 등을 반영한 추천 로직</p>
            </li>
            <li className="p-5 sm:p-6 rounded-xl border">
              <h2 className="font-semibold text-[#0B2D6B] text-lg md:text-xl">마감 캘린더</h2>
              <p className="text-gray-600 mt-3">찜한 장학금 마감일/제출서류를 한눈에</p>
            </li>
            <li className="p-5 sm:p-6 rounded-xl border">
              <h2 className="font-semibold text-[#0B2D6B] text-lg md:text-xl">알림</h2>
              <p className="text-gray-600 mt-3">마감 임박 푸시/메일 알림(추가 예정)</p>
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              to="/scholarships"
              className="px-6 py-3 rounded-lg bg-[#0B2D6B] text-white font-semibold transition hover:bg-[#092559] hover:text-white"
            >
              장학금 보러가기
            </Link>
            <Link
              to="/recommendation"
              className="px-6 py-3 rounded-lg border border-[#0B2D6B] text-[#0B2D6B] font-semibold transition hover:bg-gray-100 hover:text-[#0B2D6B]"
            >
              추천 받기
            </Link>
          </div>
        </div>
      </section>

      {/* Tech / 로드맵 */}
      <section className="mx-auto mt-12 grid w-full max-w-7xl gap-6 sm:mt-16 sm:gap-8 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-7 sm:p-8 md:p-10">
          <h2 className="text-xl font-bold text-[#0B2D6B] text-center md:text-left">기술 스택</h2>
          <ul className="mt-4 text-gray-700 list-disc list-inside space-y-2">
            <li>Frontend: React (Vite) + Tailwind</li>
            <li>Backend: Django + DRF + SimpleJWT</li>
            <li>DB: MySQL</li>
            <li>Infra: AWS (EC2, Nginx, Gunicorn)</li>
          </ul>
        </div>
        <div className="rounded-2xl border bg-white p-7 sm:p-8 md:p-10">
          <h2 className="text-xl font-bold text-[#0B2D6B] text-center md:text-left">로드맵</h2>
          <ol className="mt-4 text-gray-700 list-decimal list-inside space-y-2">
            <li>장학 데이터 정제 및 일괄 동기화</li>
            <li>개인화 추천(가중치/룰 → ML 고도화)</li>
            <li>캘린더/알림 강화</li>
            <li>접근성/반응형 UI 개선</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
