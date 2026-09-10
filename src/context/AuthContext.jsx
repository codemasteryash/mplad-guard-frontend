import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logoutUser } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "mplads_sentinel_session";

export const ROLES = {
  DISTRICT_AUTHORITY: "DISTRICT_AUTHORITY",
  MP: "MP",
  CITIZEN: "CITIZEN",
  SNA: "SNA",
  IDA: "IDA",
  IA: "IA",
  ADMIN: "ADMIN",
};

export const ROLE_LABELS = {
  [ROLES.DISTRICT_AUTHORITY]: "District Authority",
  [ROLES.MP]: "Member of Parliament",
  [ROLES.CITIZEN]: "Citizen",
  [ROLES.SNA]: "State Nodal Agency",
  [ROLES.IDA]: "Implementing Agency",
  [ROLES.IA]: "Implementing Agency",
  [ROLES.ADMIN]: "Administrator",
};

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session?.role ? { ...session, role: session.role.toUpperCase() } : session;
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
    setSession({ role: role.toUpperCase(), profile, loggedInAt: new Date().toISOString() });
  };

  const logout = async () => {
    setSession(null);
    try {
      await logoutUser();
    } catch {
      // Local cleanup still logs the user out when the API is unavailable.
    }
  };

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
