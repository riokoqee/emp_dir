import { apiGet } from "./http";

export async function getDepartments() {
  return apiGet("/api/departments");
}
