import { apiClient } from "./client";

export async function listSubmissions() {
  const res = await apiClient.get("/api/submissions/");
  return res.data;
}

export async function submitExam({ examId, answers }) {
  const res = await apiClient.post("/api/submissions/submit/", {
    exam: examId,
    answers,
  });
  return res.data;
}

export async function listClassSubmissions({ classId }) {
  const res = await apiClient.get(`/api/submissions/class/${classId}/`);
  return res.data;
}

export async function exportClassSubmissions({ classId }) {
  const res = await apiClient.get(`/api/submissions/class/${classId}/export/`, {
    responseType: 'blob'
  });
  return res;
}

export async function deleteSubmission(id) {
  const res = await apiClient.delete(`/api/submissions/${id}/approve/`);
  return res.data;
}

export async function approveSubmission(id, data) {
  const res = await apiClient.patch(`/api/submissions/${id}/approve/`, data);
  return res.data;
}
