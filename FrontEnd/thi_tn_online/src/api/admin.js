import { apiClient } from "./client";

// ============================================================
// ADMIN: QUẢN LÝ NGƯỜI DÙNG
// ============================================================

export async function getUsers(params = {}) {
  const res = await apiClient.get("/api/auth/users/", { params });
  return res.data;
}

export async function createUser(data) {
  const res = await apiClient.post("/api/auth/users/", data);
  return res.data;
}

export async function getUserById(userId) {
  const res = await apiClient.get(`/api/auth/users/${userId}/`);
  return res.data;
}

export async function updateUser(userId, data) {
  const res = await apiClient.patch(`/api/auth/users/${userId}/`, data);
  return res.data;
}

export async function deleteUser(userId) {
  const res = await apiClient.delete(`/api/auth/users/${userId}/`);
  return res.data;
}

// ============================================================
// ADMIN: QUẢN LÝ MÔN HỌC
// ============================================================

export async function getSubjects(params = {}) {
  const res = await apiClient.get("/api/subjects/", { params });
  return res.data;
}

export async function getSubjectsByClass(classId) {
  const res = await apiClient.get("/api/subjects/", { params: { class_id: classId } });
  return res.data;
}

export async function createSubject(data) {
  const res = await apiClient.post("/api/subjects/", data);
  return res.data;
}

export async function updateSubject(subjectId, data) {
  const res = await apiClient.patch(`/api/subjects/${subjectId}/`, data);
  return res.data;
}

export async function deleteSubject(subjectId) {
  const res = await apiClient.delete(`/api/subjects/${subjectId}/`);
  return res.data;
}

export async function getExamsBySubject(subjectId) {
  const res = await apiClient.get("/api/exams/", { params: { subject_id: subjectId } });
  return res.data;
}

// ============================================================
// TEACHER/ADMIN: PHÊ DUYỆT KẾT QUẢ
// ============================================================

export async function approveSubmission(submissionId, data) {
  // data: { status, score, teacher_note }
  const res = await apiClient.patch(`/api/submissions/${submissionId}/approve/`, data);
  return res.data;
}

// ============================================================
// ADMIN: THỐNG KÊ TỔNG QUAN (dùng lại từ general statistics)
// ============================================================

export async function getGeneralStatistics() {
  const res = await apiClient.get("/api/exams/statistics/general/");
  return res.data;
}

export async function getAllExams() {
  const res = await apiClient.get("/api/exams/");
  return res.data;
}
