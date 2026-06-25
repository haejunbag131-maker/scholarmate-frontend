import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios"; 
import { message } from "antd";
import PageShell from "../shared/components/PageShell";
import PageTitle from "../shared/components/PageTitle";
import useBodyClass from "../shared/hooks/useBodyClass";
import UniversitySearchModal from "../features/userInfo/components/UniversitySearchModal";
import UserInfoSelect from "../features/userInfo/components/UserInfoSelect";
import {
  academicYears,
  genders,
  incomeLevels,
  semesters,
  univCategories,
} from "../features/userInfo/constants";
import useUserInfoForm from "../features/userInfo/hooks/useUserInfoForm";
import loadUniversitiesWithDepartments from "../features/userInfo/utils/loadUniversitiesWithDepartments";

import regions from "../data/regions";
import majorFields from "../data/majorFields";
import universities from "../data/universities";

const cardClassName =
  "mx-auto w-full max-w-[900px] rounded-xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8 lg:p-[50px]";
const rowClassName =
  "mb-5 flex w-full flex-wrap items-center max-md:mx-auto max-md:max-w-[600px] max-md:flex-col max-md:items-start max-md:px-4 max-[480px]:mb-[15px] max-[480px]:px-1";
const labelClassName =
  "mb-2.5 flex-[0_0_160px] text-base font-medium text-slate-600 max-md:flex-none max-md:text-left";
const inputClassName =
  "min-h-[46px] min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 transition-colors focus:border-[var(--color-primary)] focus:outline-none max-md:w-full max-md:rounded-md max-md:px-3 max-md:py-2.5 max-[480px]:py-[11px] max-[480px]:text-[13px]";
const groupClassName = "flex min-w-0 flex-1 flex-wrap gap-2.5 max-md:w-full";
const actionButtonClassName =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg border-0 bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 max-md:px-3 max-md:py-2 max-md:text-xs max-[480px]:px-2.5 max-[480px]:py-1.5 max-[480px]:text-[11px]";
const saveButtonClassName =
  "block w-full rounded-lg border-0 bg-gray-900 px-5 py-[15px] text-center text-base font-bold text-white transition-colors hover:bg-slate-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 max-md:px-4 max-md:py-3 max-md:text-sm max-[480px]:px-3.5 max-[480px]:py-2.5 max-[480px]:text-xs";
const checkboxGroupClassName = "flex flex-wrap gap-2.5";
const checkboxLabelClassName = "inline-flex items-center gap-1.5 text-sm font-medium text-slate-700";
const checkboxClassName = "h-4 w-4 accent-black";

const UserInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingData = location.state?.scholarshipData || {};
  const { form, setField, setFields, toggleField, buildPayload } =
    useUserInfoForm(existingData);

  // 모달 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const formCardRef = useRef(null);

  const filteredUniversities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return universities;

    return universities.filter((university) =>
      university.toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery]);

  useBodyClass("userinfor-page");

  useEffect(() => {
    let isActive = true;

    if (!form.selectedUniversityName) {
      setDepartments([]);
      setIsDepartmentsLoading(false);
      return undefined;
    }

    setDepartments([]);
    setIsDepartmentsLoading(true);

    loadUniversitiesWithDepartments()
      .then((universitiesWithDepartments) => {
        if (!isActive) return;
        setDepartments(universitiesWithDepartments[form.selectedUniversityName] || []);
      })
      .catch(() => {
        if (!isActive) return;
        setDepartments([]);
      })
      .finally(() => {
        if (!isActive) return;
        setIsDepartmentsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [form.selectedUniversityName]);

  useEffect(() => {
    let touchStartY = null;

    const blurFocusedFormControl = () => {
      const activeElement = document.activeElement;

      if (
        !(activeElement instanceof HTMLElement) ||
        !formCardRef.current?.contains(activeElement) ||
        !["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)
      ) {
        return;
      }

      activeElement.blur();
    };

    const handleTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event) => {
      const currentTouchY = event.touches[0]?.clientY;

      if (typeof currentTouchY !== "number" || touchStartY === null) {
        return;
      }

      if (Math.abs(currentTouchY - touchStartY) > 6) {
        blurFocusedFormControl();
      }
    };

    document.addEventListener("wheel", blurFocusedFormControl, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: true,
      capture: true,
    });
    window.addEventListener("scroll", blurFocusedFormControl, { passive: true });

    return () => {
      document.removeEventListener("wheel", blurFocusedFormControl, true);
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
      window.removeEventListener("scroll", blurFocusedFormControl);
    };
  }, []);

  const handleSelectUniversity = (university) => {
    setFields({
      selectedUniversityName: university,
      selectedDepartment: "",
    });
    setIsModalOpen(false);
    setSearchQuery("");
  };

  // 저장
  const handleSave = async () => {
    if (isSavingRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const response = await axios.post("/userinfor/scholarship/save/", buildPayload(), {
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        if (form.name) {
          localStorage.setItem("userName", form.name);
        }

        message.success("장학 정보가 성공적으로 저장되었습니다.");
        navigate("/profile");
      } else {
        message.error(`저장 실패: ${response.data?.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("서버 오류 발생:", error);
      message.error(`서버 오류 발생: ${error.response?.data?.error || error.message}`);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const blurActiveField = () => {
    const activeElement = document.activeElement;

    if (
      !(activeElement instanceof HTMLElement) ||
      !formCardRef.current?.contains(activeElement) ||
      !["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)
    ) {
      return;
    }

    activeElement.blur();
  };

  return (
    <PageShell width="medium" className="user-info-shell">
      <PageTitle>장학 정보 입력</PageTitle>
      <div className={cardClassName} ref={formCardRef}>
        {/* 이름 */}
        <div className={rowClassName}>
          <label className={labelClassName}>이름</label>
          <input
            type="text"
            className={inputClassName}
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="이름 입력"
          />
        </div>

        {/* 성별 */}
        <div className={rowClassName}>
          <label className={labelClassName}>성별</label>
          <UserInfoSelect
            value={form.selectedGender}
            onChange={(value) => setField("selectedGender", value)}
            options={genders}
            placeholder="성별 선택"
          />
        </div>

        {/* 생년월일 */}
        <div className={rowClassName}>
          <label className={labelClassName}>생년월일</label>
          <input
            type="date"
            className={inputClassName}
            value={form.birthDate}
            onChange={(event) => setField("birthDate", event.target.value)}
            min="1900-01-01"
            max="2100-12-31"
          />
        </div>

        {/* 거주 지역 */}
        <div className={rowClassName}>
          <label className={labelClassName}>거주 지역</label>
          <div className={groupClassName}>
            <UserInfoSelect
              value={form.selectedRegion}
              onChange={(value) => {
                setFields({
                  selectedRegion: value,
                  selectedDistrict: "",
                });
              }}
              options={Object.keys(regions)}
              placeholder="지역 선택"
            />
            <UserInfoSelect
              value={form.selectedDistrict}
              onChange={(value) => setField("selectedDistrict", value)}
              disabled={!form.selectedRegion}
              options={form.selectedRegion ? regions[form.selectedRegion] : []}
              placeholder="군/구 선택"
            />
          </div>
        </div>

        {/* 소득 분위 */}
        <div className={rowClassName}>
          <label className={labelClassName}>소득 분위</label>
          <UserInfoSelect
            value={form.selectedIncomeLevel}
            onChange={(value) => setField("selectedIncomeLevel", value)}
            options={incomeLevels}
            placeholder="분위 선택"
          />
        </div>

        {/* 대학 유형 */}
        <div className={rowClassName}>
          <label className={labelClassName}>대학 유형</label>
          <UserInfoSelect
            value={form.selectedUnivType}
            onChange={(value) => setField("selectedUnivType", value)}
            options={univCategories}
            placeholder="대학 유형 선택"
          />
        </div>

        {/* 지원 계열 */}
        <div className={rowClassName}>
          <label className={labelClassName}>지원 계열</label>
          <UserInfoSelect
            value={form.selectedMajorField}
            onChange={(value) => setField("selectedMajorField", value)}
            options={majorFields}
            placeholder="계열 선택"
          />
        </div>

        {/* 학교 */}
        <div className={rowClassName}>
          <label className={labelClassName}>학교</label>
          <div className={groupClassName}>
            <input
              type="text"
              className={inputClassName}
              placeholder="대학교 선택"
              value={form.selectedUniversityName}
              readOnly
            />
            <button type="button" className={actionButtonClassName} onClick={() => setIsModalOpen(true)}>
              검색
            </button>
          </div>
        </div>

        {/* 대학교 검색 모달 */}
        {isModalOpen && (
          <UniversitySearchModal
            searchQuery={searchQuery}
            universities={filteredUniversities}
            onSearchChange={setSearchQuery}
            onSelectUniversity={handleSelectUniversity}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        {/* 학과/학년 */}
        <div className={rowClassName}>
          <label className={labelClassName}>학과/학년</label>
          <div className={groupClassName}>
            <UserInfoSelect
              value={form.selectedDepartment}
              onChange={(value) => setField("selectedDepartment", value)}
              disabled={isDepartmentsLoading || !departments.length}
              options={departments}
              placeholder={
                isDepartmentsLoading
                  ? "학과 목록 불러오는 중..."
                  : form.selectedUniversityName
                    ? "학과 선택"
                    : "대학교를 먼저 선택하세요"
              }
            />

            <UserInfoSelect
              value={form.selectedAcademicYear}
              onChange={(value) => setField("selectedAcademicYear", value)}
              options={academicYears}
              placeholder="학년 선택"
            />
          </div>
        </div>

        {/* 수료 학기 */}
        <div className={rowClassName}>
          <label className={labelClassName}>수료 학기</label>
          <UserInfoSelect
            value={form.selectedSemester}
            onChange={(value) => setField("selectedSemester", value)}
            options={semesters}
            placeholder="학기 선택"
          />
        </div>

        {/* 성적 */}
        <div className={rowClassName}>
          <label className={labelClassName}>성적</label>
          <div className={groupClassName}>
            <input
              type="number"
              className={inputClassName}
              step="0.01"
              placeholder="직전 학기 성적"
              value={form.gpaLastSemester}
              onChange={(event) => setField("gpaLastSemester", event.target.value)}
            />
            <input
              type="number"
              className={inputClassName}
              step="0.01"
              placeholder="전체 성적"
              value={form.gpaOverall}
              onChange={(event) => setField("gpaOverall", event.target.value)}
            />
          </div>
        </div>

        {/* 기타 */}
        <div className={rowClassName}>
          <label className={labelClassName}>기타</label>
          <div className={checkboxGroupClassName}>
            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className={checkboxClassName}
                checked={form.isMultiCulturalFamily}
                onChange={() => toggleField("isMultiCulturalFamily")}
              />{" "}
              다문화 가정
            </label>
            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className={checkboxClassName}
                checked={form.isSingleParentFamily}
                onChange={() => toggleField("isSingleParentFamily")}
              />{" "}
              한부모 가정
            </label>
            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className={checkboxClassName}
                checked={form.isMultipleChildrenFamily}
                onChange={() => toggleField("isMultipleChildrenFamily")}
              />{" "}
              다자녀 가정
            </label>
            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className={checkboxClassName}
                checked={form.isNationalMerit}
                onChange={() => toggleField("isNationalMerit")}
              />{" "}
              국가유공자
            </label>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className={rowClassName}>
          <label className={labelClassName}>추가 정보</label>
          <textarea
            className={`${inputClassName} min-h-28 resize-y`}
            value={form.additionalInfo}
            onChange={(event) => setField("additionalInfo", event.target.value)}
            placeholder="예시) 프랜차이즈 카페에서 주 7시간 근무 중. 소득 분위 관련 장학금을 찾고 있음."
          />
        </div>

        {/* 저장 버튼 */}
        <div className={rowClassName}>
          <button
            type="button"
            className={saveButtonClassName}
            disabled={isSaving}
            onPointerDown={blurActiveField}
            onClick={handleSave}
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default UserInfo;
