import { useCallback, useState } from "react";

const createInitialForm = (existingData = {}) => ({
  name: existingData.name || "",
  selectedGender: existingData.gender || "",
  birthDate: existingData.birth_date || "",
  selectedRegion: existingData.region || "",
  selectedDistrict: existingData.district || "",
  selectedIncomeLevel: existingData.income_level || "",
  selectedUnivType: existingData.university_type || "",
  selectedUniversityName: existingData.university_name || "",
  selectedMajorField: existingData.major_field || "",
  selectedDepartment: existingData.department || "",
  selectedAcademicYear: existingData.academic_year_type || "",
  selectedSemester: existingData.semester || "",
  gpaLastSemester: existingData.gpa_last_semester ?? "",
  gpaOverall: existingData.gpa_overall ?? "",
  additionalInfo: existingData.additional_info || "",
  isMultiCulturalFamily: existingData.is_multi_cultural_family || false,
  isSingleParentFamily: existingData.is_single_parent_family || false,
  isMultipleChildrenFamily: existingData.is_multiple_children_family || false,
  isNationalMerit: existingData.is_national_merit || false,
});

const parseGpa = (value) => (value ? parseFloat(value) : null);

export default function useUserInfoForm(existingData) {
  const [form, setForm] = useState(() => createInitialForm(existingData));

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFields = useCallback((fields) => {
    setForm((prev) => ({ ...prev, ...fields }));
  }, []);

  const toggleField = useCallback((field) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const buildPayload = useCallback(
    () => ({
      name: form.name,
      gender: form.selectedGender || null,
      birth_date: form.birthDate || null,
      region: form.selectedRegion || null,
      district: form.selectedDistrict || null,
      income_level: form.selectedIncomeLevel || null,
      university_type: form.selectedUnivType || null,
      university_name: form.selectedUniversityName || null,
      major_field: form.selectedMajorField || null,
      department: form.selectedDepartment || null,
      academic_year_type: form.selectedAcademicYear || null,
      semester: form.selectedSemester || null,
      gpa_last_semester: parseGpa(form.gpaLastSemester),
      gpa_overall: parseGpa(form.gpaOverall),
      is_multi_cultural_family: !!form.isMultiCulturalFamily,
      is_single_parent_family: !!form.isSingleParentFamily,
      is_multiple_children_family: !!form.isMultipleChildrenFamily,
      is_national_merit: !!form.isNationalMerit,
      additional_info: form.additionalInfo || null,
    }),
    [form]
  );

  return {
    form,
    setField,
    setFields,
    toggleField,
    buildPayload,
  };
}
