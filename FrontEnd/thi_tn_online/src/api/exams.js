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
  // Chỉ gửi metadata (title, duration, max_attempts, due_date)
  // Câu hỏi được update riêng qua updateQuestion / createQuestion
  const res = await apiClient.patch(`/api/exams/${examId}/edit/`, {
    title: payload.title,
    duration: payload.duration,
    max_attempts: payload.max_attempts,
    due_date: payload.due_date,
  });
  return res.data;
}

export async function updateQuestion(examId, questionId, payload) {
  const res = await apiClient.patch(`/api/exams/${examId}/questions/${questionId}/`, payload);
  return res.data;
}

export async function deleteExam(examId) {
  const res = await apiClient.delete(`/api/exams/${examId}/edit/`);
  return res.data;
}

export async function createQuestion({ examId, question }) {
  const formData = new FormData();
  formData.append('question_text', question.question_text);
  formData.append('option_a', question.option_a || '');
  formData.append('option_b', question.option_b || '');
  formData.append('option_c', question.option_c || '');
  formData.append('option_d', question.option_d || '');
  formData.append('correct_answer', question.correct_answer || 'A');
  formData.append('exam', question.exam);
  if (question.image) {
    formData.append('image', question.image);
  }
  const res = await apiClient.post(`/api/exams/${examId}/questions/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
