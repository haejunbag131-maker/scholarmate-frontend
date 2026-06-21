import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Button from "../shared/components/Button";
import LoadingState from "../shared/components/LoadingState";
import PageShell from "../shared/components/PageShell";
import PageTitle from "../shared/components/PageTitle";

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [scholarshipData, setScholarshipData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // 로딩 상태

  useEffect(() => {
    let alive = true;

    // 토큰 갱신
    const refreshAccessToken = async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("리프레시 토큰이 없습니다.");

        const response = await axios.post("/auth/jwt/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("token", newAccessToken);
        return newAccessToken;
      } catch (err) {
        console.error("🚨 액세스 토큰 갱신 실패:", err);
        if (alive) setError("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        navigate("/login");
        return null;
      }
    };

    // 사용자 기본 정보
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/auth/users/me/");
        if (alive) setUserData(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) await fetchUserData();
        } else if (alive) {
          setError("사용자 정보를 불러오지 못했습니다.");
        }
      }
    };

    // 장학 정보
    const fetchScholarshipData = async () => {
      try {
        const response = await axios.get("/userinfor/scholarship/get/");
        if (alive) setScholarshipData(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) await fetchScholarshipData();
        } else if (err.response?.status === 404) {
          if (alive) setScholarshipData({});
        } else if (alive) {
          setError("장학 정보를 불러오지 못했습니다.");
        }
      }
    };

    const loadData = async () => {
      setLoading(true);
      await fetchUserData();
      await fetchScholarshipData();
      if (alive) setLoading(false);
    };
    loadData();
    return () => {
      alive = false;
    };
  }, [navigate]);

  // UI 처리 
  if (loading) {
    return (
      <PageShell width="narrow">
        <LoadingState message="마이페이지를 불러오는 중..." minHeight="calc(100vh - 140px)" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell width="narrow">
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
          {error}
        </div>
      </PageShell>
    );
  }

  if (!userData) {
    return (
      <PageShell width="narrow">
        <LoadingState message="사용자 정보를 불러오는 중..." minHeight="180px" />
      </PageShell>
    );
  }

  if (scholarshipData === null) {
    return (
      <PageShell width="narrow">
        <LoadingState message="장학 정보를 불러오는 중..." minHeight="180px" />
      </PageShell>
    );
  }

  const hasScholarshipData = Object.keys(scholarshipData).length > 0;
  const scholarshipFields = [
    ["이름", scholarshipData.name],
    ["성별", scholarshipData.gender],
    ["출생일", scholarshipData.birth_date],
    ["거주 지역", `${scholarshipData.region || "없음"}, ${scholarshipData.district || "없음"}`],
    ["소득 분위", scholarshipData.income_level],
    ["대학 유형", scholarshipData.university_type],
    ["대학", scholarshipData.university_name],
    ["학과", scholarshipData.major_field],
    ["학년", scholarshipData.academic_year_type],
    ["수료 학기", scholarshipData.semester],
    ["최근 학기 성적", scholarshipData.gpa_last_semester],
    ["전체 성적", scholarshipData.gpa_overall],
    ["다문화 가정", scholarshipData.is_multi_cultural_family ? "예" : "아니오"],
    ["한부모 가정", scholarshipData.is_single_parent_family ? "예" : "아니오"],
    ["다자녀 가정", scholarshipData.is_multiple_children_family ? "예" : "아니오"],
    ["국가유공자", scholarshipData.is_national_merit ? "예" : "아니오"],
    ["추가 정보", scholarshipData.additional_info],
  ];

  return (
    <PageShell width="narrow">
      <div className="mx-auto w-full max-w-3xl">
        <PageTitle>
          {userData.username}님의 마이페이지
        </PageTitle>

        <div className="grid gap-5">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50 px-6 py-6 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-black text-white">
                {userData.username?.slice(0, 1)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-primary)]">회원 정보</p>
                <h2 className="mt-1 truncate text-2xl font-black text-slate-900">
                  {userData.username}
                </h2>
                <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                  {userData.email || "이메일 없음"}
                </p>
              </div>
            </div>
            <div className="grid gap-0 divide-y divide-slate-100 px-6 py-2 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <InfoItem label="아이디" value={userData.username} />
              <InfoItem label="이메일" value={userData.email || "없음"} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--color-primary)]">맞춤 추천 기준</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">장학 정보</h2>
              </div>
              <Button
                variant="primary"
                className="black-action-button"
                onClick={() => navigate("/userinfor", { state: { scholarshipData } })}
              >
                장학 정보 수정
              </Button>
            </div>

            {hasScholarshipData ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {scholarshipFields.map(([label, value]) => (
                  <InfoItem key={label} label={label} value={value ?? "없음"} boxed />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                <p className="font-bold text-slate-700">장학 정보가 없습니다.</p>
                <p className="mt-1 text-sm text-slate-500">
                  장학 정보를 입력하면 맞춤 추천을 더 정확하게 받을 수 있습니다.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function InfoItem({ label, value, boxed = false }) {
  return (
    <div className={boxed ? "rounded-lg bg-slate-50 px-4 py-3" : "px-0 py-4 sm:px-5"}>
      <p className="text-xs font-black tracking-normal text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-bold text-slate-900">
        {value || "없음"}
      </p>
    </div>
  );
}
