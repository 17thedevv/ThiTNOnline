import { apiClient } from "./client";

// Get current user profile
export async function getProfile() {
  const res = await apiClient.get("/api/auth/profile/");
  return res.data;
}

// Update user profile
export async function updateProfile(data) {
  const res = await apiClient.patch("/api/auth/profile/update/", data);
  return res.data;
}

// Upload avatar
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  
  const res = await apiClient.post("/api/auth/profile/upload-avatar/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Change password
export async function changePassword(data) {
  const res = await apiClient.post("/api/auth/profile/change-password/", data);
  return res.data;
}

// Get user by ID (admin/teacher function)
export async function getUserById(userId) {
  const res = await apiClient.get(`/api/auth/users/${userId}/`);
  return res.data;
}

// Get all users (admin function)
export async function getAllUsers() {
  const res = await apiClient.get("/api/auth/users/");
  return res.data;
}
