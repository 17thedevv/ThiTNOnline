import { apiClient } from "./client";

export async function listClasses() {
  const res = await apiClient.get("/api/classes/");
  return res.data;
}

export async function createClass({ name }) {
  const res = await apiClient.post("/api/classes/", { name });
  return res.data;
}

export async function getClassDetail({ classId }) {
  const res = await apiClient.get(`/api/classes/${classId}/`);
  return res.data;
}

export async function removeStudentFromClass({ classId, studentId }) {
  const res = await apiClient.post(
    `/api/classes/${classId}/remove-student/${studentId}/`
  );
  return res.data;
}

export async function joinClassByCode({ code }) {
  const res = await apiClient.post("/api/classes/join/", { code });
  return res.data;
}

export async function leaveClass({ classId }) {
  const res = await apiClient.post(`/api/classes/${classId}/leave/`);
  return res.data;
}
