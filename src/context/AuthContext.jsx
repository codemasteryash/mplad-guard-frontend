import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "mplads_sentinel_session";

export const ROLES = {
  DISTRICT_AUTHORITY: "district_authority",
  MP: "mp",
  CITIZEN: "citizen",
};

export const ROLE_LABELS = {
  [ROLES.DISTRICT_AUTHORITY]: "District Authority",
  [ROLES.MP]: "Member of Parliament",
  [ROLES.CITIZEN]: "Citizen",
};

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = (role, profile) => {
    setSession({ role, profile, loggedInAt: new Date().toISOString() });
  };

  const logout = () => setSession(null);

  const value = useMemo(
    () => ({
      isAuthenticated: !!session,
      role: session?.role || null,
      profile: session?.profile || null,
      login,
      logout,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
