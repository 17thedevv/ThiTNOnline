const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const tokenStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS_KEY);
  },
  setAccess(token) {
    localStorage.setItem(ACCESS_KEY, token);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  setRefresh(token) {
    localStorage.setItem(REFRESH_KEY, token);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

