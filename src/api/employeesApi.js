import { apiGet, apiUpload } from "./http";

export async function getEmployeesByDepartment(id) {
  return apiGet(`/api/employees/by-dept/${id}`);
}

export async function searchEmployees(query) {
  const params = new URLSearchParams({ q: query });
  return apiGet(`/api/employees/search?${params.toString()}`);
}

export const getAllEmployees = async () => {
  const res = await fetch("http://localhost:8080/api/employees");
  if (!res.ok) throw new Error("Ошибка загрузки сотрудников");
  return res.json();
};