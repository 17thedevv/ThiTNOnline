import axios from "axios";
import { tokenStorage } from "./storage";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess();
  if (access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;
  const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
    refresh,
  });
  const newAccess = res?.data?.access;
  if (newAccess) tokenStorage.setAccess(newAccess);
  return newAccess || null;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccess = await refreshPromise;
    if (!newAccess) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${newAccess}`;
    return apiClient(original);
  }
);

