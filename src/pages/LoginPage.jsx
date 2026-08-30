import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, UserRound, Users, Building2, ClipboardCheck, ArrowLeft, LockKeyhole, CheckSquare, Radar } from "lucide-react";
import { useAuth, ROLES, ROLE_LABELS } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { STATES } from "../data/mockData";
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
    title: "Implementing District Authority",
    desc: "Sanction works, assign agencies, and monitor district execution",
  },
];

function StateSelect({ value, onChange, label = "State", required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required && <span className="text-risk-high">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500"
      >
        <option value="">Select State</option>
        {STATES.map((s) => (
          <option key={s.code} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function DistrictSelect({ state, value, onChange, label = "District", required }) {
  const districts = STATES.find((s) => s.name === state)?.districts || [];
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required && <span className="text-risk-high">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={!state}
        className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 disabled:bg-ink-50 disabled:text-ink-400"
      >
        <option value="">{state ? "Select District" : "Select a state first"}</option>
        {districts.map((d) => (
          <option key={d.code} value={d.name}>
            {d.name} ({d.code})
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, required, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required && <span className="text-risk-high">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500"
      />
    </label>
  );
}

function DistrictAuthorityForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", employeeId: "", state: "", district: "", designation: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === "state" ? { district: "" } : {}) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const districtObj = STATES.find((s) => s.name === form.state)?.districts.find((d) => d.name === form.district);
    onSubmit({
      name: form.name,
      employeeId: form.employeeId,
      state: form.state,
      district: form.district,
      districtCode: districtObj?.code,
      pincode: districtObj?.pincode,
      designation: form.designation || "District Nodal Officer",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Rakesh Sharma" />
      <TextField label="Employee / Officer ID" value={form.employeeId} onChange={set("employeeId")} required placeholder="e.g. DA-2024-0451" />
      <StateSelect value={form.state} onChange={set("state")} required />
      <DistrictSelect state={form.state} value={form.district} onChange={set("district")} required />
      <TextField label="Designation (optional)" value={form.designation} onChange={set("designation")} placeholder="e.g. District Nodal Officer" />
      <Button type="submit" className="w-full" size="lg">
        Login as District Authority
      </Button>
    </form>
  );
}

function IdaForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", employeeId: "", state: "", district: "", designation: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === "state" ? { district: "" } : {}) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const districtObj = STATES.find((s) => s.name === form.state)?.districts.find((d) => d.name === form.district);
    onSubmit({
      name: form.name,
      employeeId: form.employeeId,
      state: form.state,
      district: form.district,
      districtCode: districtObj?.code,
      pincode: districtObj?.pincode,
      designation: form.designation || "Implementing District Authority",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Rakesh Sharma" />
      <TextField label="Employee / Officer ID" value={form.employeeId} onChange={set("employeeId")} required placeholder="e.g. IDA-2026-0451" />
      <StateSelect value={form.state} onChange={set("state")} required />
      <DistrictSelect state={form.state} value={form.district} onChange={set("district")} required />
      <TextField label="Designation (optional)" value={form.designation} onChange={set("designation")} placeholder="e.g. District Collector" />
      <Button type="submit" className="w-full" size="lg">
        Login as IDA
      </Button>
    </form>
  );
}

function SnaForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", employeeId: "", state: "", designation: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      employeeId: form.employeeId,
      state: form.state,
      designation: form.designation || "State Nodal Officer",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Anjali Desai" />
      <TextField label="Employee / Officer ID" value={form.employeeId} onChange={set("employeeId")} required placeholder="e.g. SNA-2026-0451" />
      <StateSelect value={form.state} onChange={set("state")} required />
      <TextField label="Designation (optional)" value={form.designation} onChange={set("designation")} placeholder="e.g. State Nodal Officer" />
      <Button type="submit" className="w-full" size="lg">
        Login as SNA
      </Button>
    </form>
  );
}



function MpForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", house: "Lok Sabha", state: "", constituency: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Anita Verma" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-700">
          House <span className="text-risk-high">*</span>
        </span>
        <div className="flex gap-2">
          {["Lok Sabha", "Rajya Sabha"].map((h) => (
            <button
              type="button"
              key={h}
              onClick={() => set("house")(h)}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                form.house === h ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </label>
      <StateSelect value={form.state} onChange={set("state")} required />
      <TextField label="Constituency" value={form.constituency} onChange={set("constituency")} required placeholder="e.g. North Constituency" />
      <Button type="submit" className="w-full" size="lg">
        Login as MP
      </Button>
    </form>
  );
}

function CitizenForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", mobile: "", state: "", district: "" });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v, ...(k === "state" ? { district: "" } : {}) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Full Name" value={form.name} onChange={set("name")} required placeholder="e.g. Priya Singh" />
      <TextField label="Mobile Number" value={form.mobile} onChange={set("mobile")} required type="tel" placeholder="10-digit mobile number" />
      <StateSelect value={form.state} onChange={set("state")} label="State (optional)" />
      <DistrictSelect state={form.state} value={form.district} onChange={set("district")} label="District (optional)" />
      <Button type="submit" className="w-full" size="lg">
        Login as Citizen
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultRouteForRole = (role) => {
    if (role === ROLES.SNA) return "/sna/dashboard";
    if (role === ROLES.IDA) return "/ida/dashboard";
    return "/dashboard";
  };

  const handleSubmit = (role) => (profile) => {
    login(role, profile);
    push(`Welcome, ${profile.name || "User"}. Logged in as ${ROLE_LABELS[role]}.`, "success");
    navigate(location.state?.from || defaultRouteForRole(role), { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950 p-10 text-white lg:flex">
        <IndiaOutline className="absolute -bottom-16 -right-16 h-96 w-96" fill="white" opacity={0.06} />
        <div className="relative z-10">
          <Logo dark />
          <h2 className="mt-14 font-display text-3xl font-bold leading-snug">
            MPLADS Monitoring System
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
                <p className="mt-1.5 text-sm text-ink-500">Choose how you'd like to access MPLADS Sentinel.</p>

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
                  This is a demo prototype — no real credentials are required.
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
                  Fill in your details to continue — this is a demo login, no verification needed.
                </p>

                {selectedRole === ROLES.DISTRICT_AUTHORITY && <DistrictAuthorityForm onSubmit={handleSubmit(selectedRole)} />}
                {selectedRole === ROLES.MP && <MpForm onSubmit={handleSubmit(selectedRole)} />}
                {selectedRole === ROLES.CITIZEN && <CitizenForm onSubmit={handleSubmit(selectedRole)} />}
                {selectedRole === ROLES.SNA && <SnaForm onSubmit={handleSubmit(selectedRole)} />}
                {selectedRole === ROLES.IDA && <IdaForm onSubmit={handleSubmit(selectedRole)} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
