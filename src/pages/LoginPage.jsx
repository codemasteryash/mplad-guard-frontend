import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark, UserRound, Users, Building2, ClipboardCheck,
  ArrowLeft, LockKeyhole, CheckSquare, Radar, Eye, EyeOff, Copy, Check,
} from "lucide-react";
import { useAuth, ROLES, ROLE_LABELS } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { clearAccessToken, loginUser } from "../services/api";
import { STATES } from "../data/mockData";
import { classNames } from "../utils/format";
import { registerCitizen, registerStaff } from "../services/api";
import Button from "../components/common/Button";
import Logo from "../components/common/Logo";
import IndiaOutline from "../components/common/IndiaOutline";
import Modal from "../components/common/Modal";

const ROLE_CARDS = [
  { role: ROLES.DISTRICT_AUTHORITY, icon: Landmark, title: "District Authority", desc: "Access district level dashboards and approvals" },
  { role: ROLES.MP, icon: UserRound, title: "Member of Parliament", desc: "Recommend and track projects in your constituency" },
  { role: ROLES.CITIZEN, icon: Users, title: "Citizen", desc: "File complaints and track public grievances" },
  { role: ROLES.SNA, icon: Building2, title: "State Nodal Agency", desc: "Manage and oversee state-level MPLADS fund allocation" },
  { role: ROLES.IDA, icon: ClipboardCheck, title: "Implementing Agency", desc: "Execute works, verify progress, and report on-site evidence" },
];

function StateSelect({ value, onChange, label = "State", required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label} {required && <span className="text-risk-high">*</span>}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500">
        <option value="">Select State</option>
        {STATES.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
      </select>
    </label>
  );
}

function DistrictSelect({ state, value, onChange, label = "District", required }) {
  const districts = STATES.find((s) => s.name === state)?.districts || [];
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label} {required && <span className="text-risk-high">*</span>}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={!state}
        className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 disabled:bg-ink-50 disabled:text-ink-400">
        <option value="">{state ? "Select District" : "Select a state first"}</option>
        {districts.map((d) => <option key={d.code} value={d.name}>{d.name} ({d.code})</option>)}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, required, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label} {required && <span className="text-risk-high">*</span>}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500" />
    </label>
  );
}

// ---------------------------------------------------------------------------
// REGISTER forms — unchanged fields/behavior from before, just relabeled.
// ---------------------------------------------------------------------------
function DistrictAuthorityForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", employeeId: "", state: "", district: "", designation: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === "state" ? { district: "" } : {}) }));
  const handleSubmit = (e) => {
    e.preventDefault();
    const districtObj = STATES.find((s) => s.name === form.state)?.districts.find((d) => d.name === form.district);
    onSubmit({ name: form.name, employeeId: form.employeeId, state: form.state, district: form.district, districtCode: districtObj?.code, pincode: districtObj?.pincode, designation: form.designation || "District Nodal Officer" });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Rakesh Sharma" />
      <TextField label="Employee / Officer ID" value={form.employeeId} onChange={set("employeeId")} required placeholder="e.g. DA-2024-0451" />
      <StateSelect value={form.state} onChange={set("state")} required />
      <DistrictSelect state={form.state} value={form.district} onChange={set("district")} required />
      <TextField label="Designation (optional)" value={form.designation} onChange={set("designation")} placeholder="e.g. District Nodal Officer" />
      <Button type="submit" className="w-full" size="lg">Register as District Authority</Button>
    </form>
  );
}

function IdaForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", employeeId: "", state: "", district: "", designation: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === "state" ? { district: "" } : {}) }));
  const handleSubmit = (e) => {
    e.preventDefault();
    const districtObj = STATES.find((s) => s.name === form.state)?.districts.find((d) => d.name === form.district);
    onSubmit({ name: form.name, employeeId: form.employeeId, state: form.state, district: form.district, districtCode: districtObj?.code, pincode: districtObj?.pincode, designation: form.designation || "Implementing Agency Officer" });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Rakesh Sharma" />
      <TextField label="Employee / Officer ID" value={form.employeeId} onChange={set("employeeId")} required placeholder="e.g. IA-2026-0451" />
      <StateSelect value={form.state} onChange={set("state")} required />
      <DistrictSelect state={form.state} value={form.district} onChange={set("district")} required />
      <TextField label="Designation (optional)" value={form.designation} onChange={set("designation")} placeholder="e.g. Site Engineer, PWD" />
      <Button type="submit" className="w-full" size="lg">Register as Implementing Agency</Button>
    </form>
  );
}

function SnaForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", employeeId: "", state: "", designation: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: form.name, employeeId: form.employeeId, state: form.state, designation: form.designation || "State Nodal Officer" });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Anjali Desai" />
      <TextField label="Employee / Officer ID" value={form.employeeId} onChange={set("employeeId")} required placeholder="e.g. SNA-2026-0451" />
      <StateSelect value={form.state} onChange={set("state")} required />
      <TextField label="Designation (optional)" value={form.designation} onChange={set("designation")} placeholder="e.g. State Nodal Officer" />
      <Button type="submit" className="w-full" size="lg">Register as SNA</Button>
    </form>
  );
}

function MpForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", house: "Lok Sabha", state: "", constituency: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ ...form }); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Anita Verma" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">House <span className="text-risk-high">*</span></span>
        <div className="flex gap-2">
          {["Lok Sabha", "Rajya Sabha"].map((h) => (
            <button type="button" key={h} onClick={() => set("house")(h)}
              className={classNames("flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors", form.house === h ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600")}>
              {h}
            </button>
          ))}
        </div>
      </label>
      <StateSelect value={form.state} onChange={set("state")} required />
      <TextField label="Constituency" value={form.constituency} onChange={set("constituency")} required placeholder="e.g. North Constituency" />
      <Button type="submit" className="w-full" size="lg">Register as MP</Button>
    </form>
  );
}

function CitizenForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", mobile: "", password: "", state: "", district: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === "state" ? { district: "" } : {}) }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ ...form }); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Priya Singh" />
      <TextField label="Mobile Number" value={form.mobile} onChange={set("mobile")} required type="tel" placeholder="10-digit mobile number" />
      <TextField label="Password" value={form.password} onChange={set("password")} required type="password" placeholder="Create a password" />
      <StateSelect value={form.state} onChange={set("state")} label="State (optional)" />
      <DistrictSelect state={form.state} value={form.district} onChange={set("district")} label="District (optional)" />
      <Button type="submit" className="w-full" size="lg">Register as Citizen</Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// LOGIN form — shared across all 5 roles, per the reference design: just
// username + password, issued by a government administrator.
// ---------------------------------------------------------------------------
function SimpleLoginForm({ onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Username <span className="text-risk-high">*</span></span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your username"
          className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">Password <span className="text-risk-high">*</span></span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </label>
      <Button type="submit" className="w-full" size="lg">Sign in</Button>
    </form>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState("register"); // "register" | "login"
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedCredential, setCopiedCredential] = useState(null);

  const copyCredential = async (field, value) => {
    await navigator.clipboard.writeText(value);
    setCopiedCredential(field);
    setTimeout(() => setCopiedCredential(null), 1800);
  };

  const defaultRouteForRole = (role) => {
    if (role === ROLES.SNA) return "/sna/dashboard";
    if (role === ROLES.IDA) return "/ida/dashboard";
    return "/dashboard";
  };

  const completeLogin = (role, profile) => {
    login(role, profile);
    push(`Welcome, ${profile.name || "User"}. ${mode === "register" ? "Registered" : "Logged in"} as ${ROLE_LABELS[role]}.`, "success");
    navigate(location.state?.from || defaultRouteForRole(role), { replace: true });
  };

  const handleRegisterSubmit = (role) => async (profile) => {
    try {
      if (role === ROLES.CITIZEN) {
        const result = await registerCitizen({
          fullName: profile.name,
          phone: profile.mobile,
          password: profile.password,
        });
        completeLogin(ROLES.CITIZEN, {
          name: result.user.fullName,
          employeeId: result.user.username,
          username: result.user.username,
          state: result.user.state,
          district: result.user.district,
        });
        return;
      }

      const backendRole = {
        [ROLES.DISTRICT_AUTHORITY]: "DISTRICT_AUTHORITY",
        [ROLES.MP]: "MP",
        [ROLES.SNA]: "STATE_NODAL",
        [ROLES.IDA]: "IMPLEMENTING_AGENCY",
      }[role];
      const result = await registerStaff({
        role: backendRole,
        fullName: profile.name,
        officerId: profile.employeeId,
        state: profile.state,
        district: profile.district,
        designation: profile.designation,
        house: profile.house,
        constituency: profile.constituency,
      });
      setGeneratedCredentials(result.credentials);
      setMode("login");
    } catch (error) {
      push(error.response?.data?.error || error.message || "Registration failed.", "error");
    }
  };

  const handleLoginSubmit = (selectedRole) => async ({ username, password }) => {
    try {
      const user = await loginUser(username, password);
      const roleMap = {
        ADMIN: ROLES.ADMIN,
        MINISTRY: ROLES.ADMIN,
        STATE_NODAL: ROLES.SNA,
        DISTRICT_AUTHORITY: ROLES.DISTRICT_AUTHORITY,
        MP: ROLES.MP,
        IMPLEMENTING_AGENCY: ROLES.IDA,
        CITIZEN: ROLES.CITIZEN,
      };
      const backendRole = roleMap[user.role];
      if (!backendRole) throw new Error("This account has an unsupported role.");
      if (backendRole !== selectedRole) {
        throw new Error(`These credentials belong to ${ROLE_LABELS[backendRole]}. Select that role to continue.`);
      }
      completeLogin(backendRole, {
        name: user.fullName,
        employeeId: user.officerId || user.username,
        username: user.username,
        state: user.state,
        district: user.district,
        constituency: user.constituency,
        house: user.house,
        designation: user.designation,
      });
    } catch (error) {
      clearAccessToken();
      push(error.response?.data?.error || error.message || "Unable to sign in.", "error");
    }
  };

  const selectRole = (role) => setSelectedRole(role);
  const backToSelect = () => setSelectedRole(null);

  return (
    <>
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950 p-10 text-white lg:flex">
        <IndiaOutline className="absolute -bottom-16 -right-16 h-96 w-96" fill="white" opacity={0.06} />
        <div className="relative z-10">
          <Logo dark />
          <h2 className="mt-14 font-display text-3xl font-bold leading-snug">e-Nirikshan</h2>
          <p className="mt-3 max-w-xs text-sm text-white/60">Sign in to continue to your role-based dashboard.</p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2.5"><LockKeyhole size={16} className="text-brand-300" /> Secure, role-based access</li>
            <li className="flex items-center gap-2.5"><CheckSquare size={16} className="text-brand-300" /> Role-specific dashboards</li>
            <li className="flex items-center gap-2.5"><Radar size={16} className="text-brand-300" /> Real-time AI risk monitoring</li>
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
                <div className="flex justify-center">
                  <div className="inline-flex rounded-full border border-ink-200 bg-white p-1 shadow-sm">
                    <button
                      onClick={() => setMode("register")}
                      className={classNames("rounded-full px-6 py-2 text-sm font-semibold transition-colors", mode === "register" ? "bg-brand-500 text-white shadow-sm" : "text-ink-600 hover:text-brand-600")}
                    >
                      Register
                    </button>
                    <button
                      onClick={() => setMode("login")}
                      className={classNames("rounded-full px-6 py-2 text-sm font-semibold transition-colors", mode === "login" ? "bg-brand-500 text-white shadow-sm" : "text-ink-600 hover:text-brand-600")}
                    >
                      Login
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-center text-sm text-ink-500">
                  {mode === "register" ? "Create an account to get started with e-Nirikshan." : "Select your role and sign in with your issued credentials."}
                </p>

                <div className="mt-7 space-y-3">
                  {ROLE_CARDS.map((c) => (
                    <button
                      key={c.role}
                      onClick={() => selectRole(c.role)}
                      className="flex w-full items-center gap-4 rounded-xl2 border border-ink-200 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-cardHover"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                        <c.icon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-bold text-ink-900">
                          {mode === "register" ? "Register As " : "Login As "}{c.title}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-500">{c.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {mode === "register" && (
                  <p className="mt-6 text-center text-xs text-ink-400">This is a demo prototype — no real credentials are required.</p>
                )}
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <button onClick={backToSelect} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600">
                  <ArrowLeft size={15} /> Back to role selection
                </button>
                <h1 className="font-display text-2xl font-bold text-ink-900">
                  {mode === "register" ? "Register as " : "Login as "}{ROLE_LABELS[selectedRole]}
                </h1>
                <p className="mt-1.5 mb-6 text-sm text-ink-500">
                  {mode === "register"
                    ? "Fill in your details to continue — this is a demo registration, no verification needed."
                    : "Enter the credentials provided by your System Administrator to continue."}
                </p>

                {mode === "register" ? (
                  <>
                    {selectedRole === ROLES.DISTRICT_AUTHORITY && <DistrictAuthorityForm onSubmit={handleRegisterSubmit(selectedRole)} />}
                    {selectedRole === ROLES.MP && <MpForm onSubmit={handleRegisterSubmit(selectedRole)} />}
                    {selectedRole === ROLES.CITIZEN && <CitizenForm onSubmit={handleRegisterSubmit(selectedRole)} />}
                    {selectedRole === ROLES.SNA && <SnaForm onSubmit={handleRegisterSubmit(selectedRole)} />}
                    {selectedRole === ROLES.IDA && <IdaForm onSubmit={handleRegisterSubmit(selectedRole)} />}
                  </>
                ) : (
                  <SimpleLoginForm onSubmit={handleLoginSubmit(selectedRole)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    <Modal
      open={!!generatedCredentials}
      onClose={() => setGeneratedCredentials(null)}
      title="Account created successfully"
      subtitle="Save these credentials before closing this window."
      centered
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Username</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <p className="break-all font-mono text-2xl font-bold text-ink-900">{generatedCredentials?.username}</p>
            <button
              type="button"
              onClick={() => copyCredential("username", generatedCredentials.username)}
              className="shrink-0 rounded-lg p-2 text-brand-700 hover:bg-brand-100"
              aria-label="Copy username"
              title="Copy username"
            >
              {copiedCredential === "username" ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Password</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <p className="break-all font-mono text-2xl font-bold text-ink-900">{generatedCredentials?.password}</p>
            <button
              type="button"
              onClick={() => copyCredential("password", generatedCredentials.password)}
              className="shrink-0 rounded-lg p-2 text-brand-700 hover:bg-brand-100"
              aria-label="Copy password"
              title="Copy password"
            >
              {copiedCredential === "password" ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        <Button className="w-full" size="lg" onClick={() => setGeneratedCredentials(null)}>
          Close and continue to login
        </Button>
      </div>
    </Modal>
    </>
  );
}
