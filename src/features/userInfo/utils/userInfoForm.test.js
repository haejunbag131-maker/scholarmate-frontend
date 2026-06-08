import test from "node:test";
import assert from "node:assert/strict";
import {
  buildUserInfoPayload,
  createInitialUserInfoForm,
} from "./userInfoForm.js";

test("createInitialUserInfoForm maps server fields to form fields", () => {
  const form = createInitialUserInfoForm({
    name: "홍길동",
    gender: "남성",
    birth_date: "2000-01-01",
    university_name: "한국대학교",
    gpa_last_semester: 4.1,
    is_national_merit: true,
  });

  assert.equal(form.name, "홍길동");
  assert.equal(form.selectedGender, "남성");
  assert.equal(form.birthDate, "2000-01-01");
  assert.equal(form.selectedUniversityName, "한국대학교");
  assert.equal(form.gpaLastSemester, 4.1);
  assert.equal(form.isNationalMerit, true);
});

test("buildUserInfoPayload converts empty optional values to null", () => {
  const payload = buildUserInfoPayload(createInitialUserInfoForm());

  assert.equal(payload.gender, null);
  assert.equal(payload.birth_date, null);
  assert.equal(payload.region, null);
  assert.equal(payload.gpa_last_semester, null);
  assert.equal(payload.additional_info, null);
});

test("buildUserInfoPayload parses numeric GPA values", () => {
  const form = {
    ...createInitialUserInfoForm(),
    gpaLastSemester: "3.75",
    gpaOverall: "4.12",
  };

  const payload = buildUserInfoPayload(form);

  assert.equal(payload.gpa_last_semester, 3.75);
  assert.equal(payload.gpa_overall, 4.12);
});

test("buildUserInfoPayload keeps boolean flags explicit", () => {
  const form = {
    ...createInitialUserInfoForm(),
    isMultiCulturalFamily: true,
    isSingleParentFamily: false,
  };

  const payload = buildUserInfoPayload(form);

  assert.equal(payload.is_multi_cultural_family, true);
  assert.equal(payload.is_single_parent_family, false);
  assert.equal(payload.is_multiple_children_family, false);
  assert.equal(payload.is_national_merit, false);
});
