let universitiesWithDepartmentsPromise;

export default function loadUniversitiesWithDepartments() {
  if (!universitiesWithDepartmentsPromise) {
    universitiesWithDepartmentsPromise = import(
      "../../../data/universities_with_departments"
    ).then(({ default: universitiesWithDepartments }) => universitiesWithDepartments);
  }

  return universitiesWithDepartmentsPromise;
}
