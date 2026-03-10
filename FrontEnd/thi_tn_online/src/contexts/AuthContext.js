import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "../api/auth";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (mounted) setUser(me);
      } catch {
        // No token / invalid token: treat as logged out.
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isBootstrapping, login, logout }),
    [user, isBootstrapping]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
