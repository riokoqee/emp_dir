import { apiGet, apiUpload } from "./http";

export async function getEmployeesByDepartment(id) {
  return apiGet(`/api/employees/by-dept/${id}`);
}

export async function searchEmployees(query) {
  const params = new URLSearchParams({ q: query });
  return apiGet(`/api/employees/search?${params.toString()}`);
}
