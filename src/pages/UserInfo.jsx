import { useMemo, useState, useEffect } from "react";
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

import "../assets/css/userinfor.css"; 

import regions from "../data/regions";
import majorFields from "../data/majorFields";
import universities from "../data/universities";

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
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

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
    }
  };

  return (
    <PageShell width="medium" className="user-info-shell">
      <PageTitle>장학 정보 입력</PageTitle>
      <div className="profile-box">
        {/* 이름 */}
        <div className="form-row">
          <label className="form-label">이름</label>
          <input
            type="text"
            className="form-input"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="이름 입력"
          />
        </div>

        {/* 성별 */}
        <div className="form-row">
          <label className="form-label">성별</label>
          <UserInfoSelect
            value={form.selectedGender}
            onChange={(value) => setField("selectedGender", value)}
            options={genders}
            placeholder="성별 선택"
          />
        </div>

        {/* 생년월일 */}
        <div className="form-row">
          <label className="form-label">생년월일</label>
          <input
            type="date"
            className="form-input"
            value={form.birthDate}
            onChange={(event) => setField("birthDate", event.target.value)}
            min="1900-01-01"
            max="2100-12-31"
          />
        </div>

        {/* 거주 지역 */}
        <div className="form-row">
          <label className="form-label">거주 지역</label>
          <div className="form-group">
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
        <div className="form-row">
          <label className="form-label">소득 분위</label>
          <UserInfoSelect
            value={form.selectedIncomeLevel}
            onChange={(value) => setField("selectedIncomeLevel", value)}
            options={incomeLevels}
            placeholder="분위 선택"
          />
        </div>

        {/* 대학 유형 */}
        <div className="form-row">
          <label className="form-label">대학 유형</label>
          <UserInfoSelect
            value={form.selectedUnivType}
            onChange={(value) => setField("selectedUnivType", value)}
            options={univCategories}
            placeholder="대학 유형 선택"
          />
        </div>

        {/* 지원 계열 */}
        <div className="form-row">
          <label className="form-label">지원 계열</label>
          <UserInfoSelect
            value={form.selectedMajorField}
            onChange={(value) => setField("selectedMajorField", value)}
            options={majorFields}
            placeholder="계열 선택"
          />
        </div>

        {/* 학교 */}
        <div className="form-row">
          <label className="form-label">학교</label>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="대학교 선택"
              value={form.selectedUniversityName}
              readOnly
            />
            <button className="form-button" onClick={() => setIsModalOpen(true)}>
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
        <div className="form-row">
          <label className="form-label">학과/학년</label>
          <div className="form-group">
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
        <div className="form-row">
          <label className="form-label">수료 학기</label>
          <UserInfoSelect
            value={form.selectedSemester}
            onChange={(value) => setField("selectedSemester", value)}
            options={semesters}
            placeholder="학기 선택"
          />
        </div>

        {/* 성적 */}
        <div className="form-row">
          <label className="form-label">성적</label>
          <div className="form-group">
            <input
              type="number"
              className="form-input"
              step="0.01"
              placeholder="직전 학기 성적"
              value={form.gpaLastSemester}
              onChange={(event) => setField("gpaLastSemester", event.target.value)}
            />
            <input
              type="number"
              className="form-input"
              step="0.01"
              placeholder="전체 성적"
              value={form.gpaOverall}
              onChange={(event) => setField("gpaOverall", event.target.value)}
            />
          </div>
        </div>

        {/* 기타 */}
        <div className="form-row">
          <label className="form-label">기타</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={form.isMultiCulturalFamily}
                onChange={() => toggleField("isMultiCulturalFamily")}
              />{" "}
              다문화 가정
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isSingleParentFamily}
                onChange={() => toggleField("isSingleParentFamily")}
              />{" "}
              한부모 가정
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isMultipleChildrenFamily}
                onChange={() => toggleField("isMultipleChildrenFamily")}
              />{" "}
              다자녀 가정
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isNationalMerit}
                onChange={() => toggleField("isNationalMerit")}
              />{" "}
              국가유공자
            </label>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="form-row">
          <label className="form-label">추가 정보</label>
          <textarea
            className="form-textarea"
            value={form.additionalInfo}
            onChange={(event) => setField("additionalInfo", event.target.value)}
            placeholder="예시) 프랜차이즈 카페에서 주 7시간 근무 중. 소득 분위 관련 장학금을 찾고 있음."
          />
        </div>

        {/* 저장 버튼 */}
        <div className="form-row">
          <button className="save-btn" onClick={handleSave}>
            저장하기
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default UserInfo;
