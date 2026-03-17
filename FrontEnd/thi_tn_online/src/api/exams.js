import { apiClient } from "./client";

export async function listExams(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/api/exams/?${searchParams}` : "/api/exams/";
  const res = await apiClient.get(url);
  return res.data;
}

export async function createExam(payload) {
  const res = await apiClient.post("/api/exams/", payload);
  return res.data;
}

export async function updateExam(examId, payload) {
  const res = await apiClient.put(`/api/exams/${examId}/edit/`, payload);
  return res.data;
}

export async function createQuestion({ examId, question }) {
  const res = await apiClient.post(`/api/exams/${examId}/questions/`, question);
  return res.data;
}

export async function getExam({ examId }) {
  const res = await apiClient.get(`/api/exams/${examId}/`);
  return res.data;
}

export async function getExamQuestions({ examId }) {
  const res = await apiClient.get(`/api/exams/${examId}/questions/`);
  return res.data;
}
