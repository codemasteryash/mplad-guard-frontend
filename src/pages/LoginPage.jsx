import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, UserRound, Users, Building2, ClipboardCheck, ArrowLeft, LockKeyhole, CheckSquare, Radar, Eye, EyeOff } from "lucide-react";
import { useAuth, ROLES, ROLE_LABELS } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { loginUser } from "../services/api";
import Button from "../components/common/Button";
import Logo from "../components/common/Logo";
import IndiaOutline from "../components/common/IndiaOutline";

const ROLE_CARDS = [
  {
    role: ROLES.DISTRICT_AUTHORITY,
    icon: Landmark,
    title: "District Authority",
    desc: "Access district level dashboards and approvals",
  },
  {
    role: ROLES.MP,
    icon: UserRound,
    title: "Member of Parliament",
    desc: "Recommend and track projects in your constituency",
  },
  {
    role: ROLES.CITIZEN,
    icon: Users,
    title: "Citizen",
    desc: "File complaints and track public grievances",
  },
  {
    role: ROLES.SNA,
    icon: Building2,
    title: "State Nodal Agency",
    desc: "Manage and oversee state-level MPLADS fund allocation",
  },
  {
    role: ROLES.IDA,
    icon: ClipboardCheck,
    title: "Implementing Agencies",
    desc: "Body Responsible For The Actual Ground-Level Execution",
  },
];

function TextField({ label, value, onChange, required, type = "text", placeholder, autoComplete, allowPasswordToggle }) {
  const [visible, setVisible] = useState(false);
  const inputType = allowPasswordToggle && visible ? "text" : type;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required && <span className="text-risk-high">*</span>}
      </span>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500"
        />
        {allowPasswordToggle && (
          <button type="button" onClick={() => setVisible((current) => !current)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-700" aria-label={visible ? "Hide password" : "Show password"}>
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </label>
  );
}

function LoginForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Username"
        value={form.username}
        onChange={(value) => setForm((current) => ({ ...current, username: value }))}
        required
        placeholder="Enter your username"
        autoComplete="username"
      />
      <TextField
        label="Password"
        value={form.password}
        onChange={(value) => setForm((current) => ({ ...current, password: value }))}
        required
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        allowPasswordToggle
      />
      {error && <p className="rounded-lg bg-risk-high/10 px-3 py-2 text-sm text-risk-high">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultRouteForRole = (role) => {
    if (role === ROLES.SNA) return "/sna/dashboard";
    if (role === ROLES.IDA) return "/ida/dashboard";
    return "/dashboard";
  };

  const expectedBackendRole = (role) => {
    if (role === ROLES.SNA) return "STATE_NODAL";
    if (role === ROLES.IDA) return "IMPLEMENTING_AGENCY";
    return role;
  };

  const frontendRoleForBackendRole = (role) => {
    if (role === "STATE_NODAL") return ROLES.SNA;
    if (role === "IMPLEMENTING_AGENCY") return ROLES.IDA;
    return role;
  };

  const handleSubmit = async ({ username, password }) => {
    setLoading(true);
    setError("");
    try {
      const { user } = await loginUser(username, password);
      const frontendRole = frontendRoleForBackendRole(user.role);
      if (frontendRole !== selectedRole && user.role !== expectedBackendRole(selectedRole)) {
        throw new Error(`This account is not a ${ROLE_LABELS[selectedRole]} account.`);
      }

      const profile = {
        ...user,
        name: user.fullName,
        employeeId: user.officerId,
      };
      login(frontendRole, profile);
      push(`Welcome, ${user.fullName || "User"}. Logged in as ${ROLE_LABELS[frontendRole]}.`, "success");
      navigate(location.state?.from || defaultRouteForRole(frontendRole), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950 p-10 text-white lg:flex">
        <IndiaOutline className="absolute -bottom-16 -right-16 h-96 w-96" fill="white" opacity={0.06} />
        <div className="relative z-10">
          <Logo dark />
          <h2 className="mt-14 font-display text-3xl font-bold leading-snug">
            e-Nirikshan
          </h2>
          <p className="mt-3 max-w-xs text-sm text-white/60">Sign in to continue to your role-based dashboard.</p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2.5">
              <LockKeyhole size={16} className="text-brand-300" /> Secure, role-based access
            </li>
            <li className="flex items-center gap-2.5">
              <CheckSquare size={16} className="text-brand-300" /> Role-specific dashboards
            </li>
            <li className="flex items-center gap-2.5">
              <Radar size={16} className="text-brand-300" /> Real-time AI risk monitoring
            </li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} MoSPI, Government of India</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-canvas px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
          </div>

          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div key="select" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <h1 className="font-display text-2xl font-bold text-ink-900">Sign in to continue</h1>
                <p className="mt-1.5 text-sm text-ink-500">Choose how you'd like to access e-Nirikshan.</p>

                <div className="mt-7 space-y-3">
                  {ROLE_CARDS.map((c) => (
                    <button
                      key={c.role}
                      onClick={() => setSelectedRole(c.role)}
                      className="flex w-full items-center gap-4 rounded-xl2 border border-ink-200 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-cardHover"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                        <c.icon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-bold text-ink-900">{c.title}</p>
                        <p className="mt-0.5 text-xs text-ink-500">{c.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-center text-xs text-ink-400">
                  Use the username and password provided by your administrator.
                </p>
                <p className="mt-3 text-center text-sm text-ink-500">
                  Citizen? <Link to="/register/citizen" className="font-semibold text-brand-600 hover:text-brand-700">Create an account</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="mb-5 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600"
                >
                  <ArrowLeft size={15} /> Back to role selection
                </button>
                <h1 className="font-display text-2xl font-bold text-ink-900">
                  Login as {ROLE_LABELS[selectedRole]}
                </h1>
                <p className="mt-1.5 mb-6 text-sm text-ink-500">
                  Enter your backend account credentials to continue.
                </p>
                <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
