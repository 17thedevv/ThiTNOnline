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



