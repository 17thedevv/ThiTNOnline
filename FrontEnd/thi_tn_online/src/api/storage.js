const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const tokenStorage = {
  getAccess() {
    return sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY);
  },
  setAccess(token, rememberMe = true) {
    if (rememberMe) {
      localStorage.setItem(ACCESS_KEY, token);
      sessionStorage.removeItem(ACCESS_KEY);
    } else {
      sessionStorage.setItem(ACCESS_KEY, token);
      localStorage.removeItem(ACCESS_KEY);
    }
  },
  getRefresh() {
    return sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
  },
  setRefresh(token, rememberMe = true) {
    if (rememberMe) {
      localStorage.setItem(REFRESH_KEY, token);
      sessionStorage.removeItem(REFRESH_KEY);
    } else {
      sessionStorage.setItem(REFRESH_KEY, token);
      localStorage.removeItem(REFRESH_KEY);
    }
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};
