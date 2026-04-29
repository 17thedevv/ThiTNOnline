import { apiClient } from "./client";

export async function getBankQuestions(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/api/exams/questions/bank/?${searchParams}` : "/api/exams/questions/bank/";
  const res = await apiClient.get(url);
  return res.data;
}

export async function createBankQuestion(data) {
  const formData = new FormData();
  formData.append('question_text', data.question_text);
  formData.append('option_a', data.option_a || '');
  formData.append('option_b', data.option_b || '');
  formData.append('option_c', data.option_c || '');
  formData.append('option_d', data.option_d || '');
  formData.append('correct_answer', data.correct_answer || 'A');
  if (data.subject) {
    formData.append('subject', data.subject);
  }
  if (data.image) {
    formData.append('image', data.image);
  }

  const res = await apiClient.post("/api/exams/questions/bank/", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateBankQuestion(id, data) {
  const formData = new FormData();
  formData.append('question_text', data.question_text);
  formData.append('option_a', data.option_a || '');
  formData.append('option_b', data.option_b || '');
  formData.append('option_c', data.option_c || '');
  formData.append('option_d', data.option_d || '');
  formData.append('correct_answer', data.correct_answer || 'A');
  if (data.subject) {
    formData.append('subject', data.subject);
  } else {
    formData.append('subject', '');
  }
  if (data.image) {
    formData.append('image', data.image);
  }

  const res = await apiClient.patch(`/api/exams/questions/bank/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteBankQuestion(id) {
  const res = await apiClient.delete(`/api/exams/questions/bank/${id}/`);
  return res.data;
}
