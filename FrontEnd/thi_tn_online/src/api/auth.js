import { apiClient } from "./client";
import { tokenStorage } from "./storage";

export async function register({ username, password, email, role }) {
  const res = await apiClient.post("/api/auth/register/", {
    username,
    password,
    email,
    role,
  });
  return res.data;
}

export async function login({ username, password }) {
  const res = await apiClient.post("/api/token/", { username, password });
  const { access, refresh } = res.data || {};
  if (access) tokenStorage.setAccess(access);
  if (refresh) tokenStorage.setRefresh(refresh);
  return res.data;
}

export async function getMe() {
  const res = await apiClient.get("/api/auth/me/");
  return res.data;
}

export function logout() {
  tokenStorage.clear();
}

