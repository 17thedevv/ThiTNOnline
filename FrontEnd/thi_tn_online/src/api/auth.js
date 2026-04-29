import { apiClient } from "./client";
import { tokenStorage } from "./storage";

export async function register({ username, password, email, role, first_name, last_name }) {
  const res = await apiClient.post("/api/auth/register/", {
    username,
    password,
    email,
    role,
    first_name,
    last_name,
  });
  return res.data;
}

export async function login({ username, password, rememberMe = true }) {
  const res = await apiClient.post("/api/token/", { username, password });
  const { access, refresh } = res.data || {};
  if (access) tokenStorage.setAccess(access, rememberMe);
  if (refresh) tokenStorage.setRefresh(refresh, rememberMe);
  return res.data;
}

export async function getMe() {
  const res = await apiClient.get("/api/auth/me/");
  return res.data;
}

export function logout() {
  tokenStorage.clear();
}

export async function forgotPassword(username) {
  const res = await apiClient.post("/api/auth/forgot-password/", { username });
  return res.data;
}

export async function resetPassword(username, code, new_password) {
  const res = await apiClient.post("/api/auth/reset-password/", {
    username,
    code,
    new_password,
  });
  return res.data;
}
