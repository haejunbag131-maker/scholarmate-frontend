import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios"; 
import useBodyClass from "../shared/hooks/useBodyClass";
import UniversitySearchModal from "../features/userInfo/components/UniversitySearchModal";
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
      alert("로그인이 필요합니다.");
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

        alert("장학 정보가 성공적으로 저장되었습니다.");
        navigate("/profile");
      } else {
        alert(`저장 실패: ${response.data?.error || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("서버 오류 발생:", error);
      alert(`서버 오류 발생: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="profile-box">
        <h2 className="title">장학 정보 입력</h2>

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
          <select
            className="form-select"
            value={form.selectedGender}
            onChange={(event) => setField("selectedGender", event.target.value)}
          >
            <option value="">성별 선택</option>
            {genders.map((gender, index) => (
              <option key={index} value={gender}>
                {gender}
              </option>
            ))}
          </select>
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
            <select
              className="form-select"
              value={form.selectedRegion}
              onChange={(event) => {
                setFields({
                  selectedRegion: event.target.value,
                  selectedDistrict: "",
                });
              }}
            >
              <option value="">지역 선택</option>
              {Object.keys(regions).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={form.selectedDistrict}
              onChange={(event) => setField("selectedDistrict", event.target.value)}
              disabled={!form.selectedRegion}
            >
              <option value="">군/구 선택</option>
              {form.selectedRegion &&
                regions[form.selectedRegion].map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* 소득 분위 */}
        <div className="form-row">
          <label className="form-label">소득 분위</label>
          <select
            className="form-select"
            value={form.selectedIncomeLevel}
            onChange={(event) => setField("selectedIncomeLevel", event.target.value)}
          >
            <option value="">분위 선택</option>
            {incomeLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* 대학 유형 */}
        <div className="form-row">
          <label className="form-label">대학 유형</label>
          <select
            className="form-select"
            value={form.selectedUnivType}
            onChange={(event) => setField("selectedUnivType", event.target.value)}
          >
            <option value="">대학 유형 선택</option>
            {univCategories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* 지원 계열 */}
        <div className="form-row">
          <label className="form-label">지원 계열</label>
          <select
            className="form-select"
            value={form.selectedMajorField}
            onChange={(event) => setField("selectedMajorField", event.target.value)}
          >
            <option value="">계열 선택</option>
            {majorFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
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
            <select
              className="form-select"
              value={form.selectedDepartment}
              onChange={(event) => setField("selectedDepartment", event.target.value)}
              disabled={isDepartmentsLoading || !departments.length}
            >
              <option value="">
                {isDepartmentsLoading
                  ? "학과 목록 불러오는 중..."
                  : form.selectedUniversityName
                    ? "학과 선택"
                    : "대학교를 먼저 선택하세요"}
              </option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              value={form.selectedAcademicYear}
              onChange={(event) => setField("selectedAcademicYear", event.target.value)}
            >
              <option value="">학년 선택</option>
              {academicYears.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 수료 학기 */}
        <div className="form-row">
          <label className="form-label">수료 학기</label>
          <select
            className="form-select"
            value={form.selectedSemester}
            onChange={(event) => setField("selectedSemester", event.target.value)}
          >
            <option value="">학기 선택</option>
            {semesters.map((semester, index) => (
              <option key={index} value={semester}>
                {semester}
              </option>
            ))}
          </select>
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
    </div>
  );
};

export default UserInfo;
