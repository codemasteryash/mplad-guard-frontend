import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, LogOut, Plus, ShieldCheck, Users, X } from "lucide-react";
import { createStaffAccount } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";

const STAFF_ROLES = ["MINISTRY", "STATE_NODAL", "DISTRICT_AUTHORITY", "MP", "IMPLEMENTING_AGENCY"];
const initialForm = { role: "DISTRICT_AUTHORITY", fullName: "", officerId: "", password: "", email: "", phone: "", designation: "", state: "", district: "" };

function Field({ label, value, onChange, type = "text", required = false }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}{required && " *"}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" /></label>;
}

export default function AdminDashboardPage() {
  const [form, setForm] = useState(initialForm);
  const [createdUsers, setCreatedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { profile, logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value));
      const { user } = await createStaffAccount(payload);
      setCreatedUsers((current) => [user, ...current]);
      setForm(initialForm);
      push("Staff account created.", "success");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to create staff account.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => { void logout(); navigate("/"); };

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <header className="border-b border-white/10 bg-navy-900/90 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500"><ShieldCheck size={21} /></div><div><p className="font-display text-lg font-bold">e-Nirikshan Control Room</p><p className="text-xs text-white/50">Restricted administration workspace</p></div></div>
          <button onClick={signOut} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"><LogOut size={16} /> Sign out</button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8"><p className="text-sm text-brand-200">Welcome, {profile?.name || "Administrator"}</p><h1 className="mt-1 font-display text-3xl font-bold">System administration</h1><p className="mt-2 max-w-2xl text-sm text-white/60">Provision operational accounts and review this session's administration activity.</p></div>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl2 border border-white/10 bg-white/5 p-5"><Users className="text-brand-300" size={21} /><p className="mt-4 text-3xl font-bold">{createdUsers.length}</p><p className="text-sm text-white/50">Accounts created this session</p></div>
          <div className="rounded-xl2 border border-white/10 bg-white/5 p-5"><Activity className="text-indiagreen" size={21} /><p className="mt-4 text-3xl font-bold">Active</p><p className="text-sm text-white/50">API authorization status</p></div>
          <div className="rounded-xl2 border border-white/10 bg-white/5 p-5"><ShieldCheck className="text-saffron" size={21} /><p className="mt-4 text-3xl font-bold">ADMIN</p><p className="text-sm text-white/50">Current access role</p></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl2 bg-white p-6 text-ink-900 shadow-card"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Provision staff account</h2><p className="mt-1 text-sm text-ink-500">Creates an account through the protected admin API.</p></div><Plus className="text-brand-500" size={21} /></div>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Role *</span><select required value={form.role} onChange={(event) => update("role")(event.target.value)} className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none">{STAFF_ROLES.map((role) => <option key={role}>{role}</option>)}</select></label><Field label="Full name" value={form.fullName} onChange={update("fullName")} required /><Field label="Officer ID" value={form.officerId} onChange={update("officerId")} required /><Field label="Password" value={form.password} onChange={update("password")} type="password" required /><Field label="Designation" value={form.designation} onChange={update("designation")} /><Field label="Email" value={form.email} onChange={update("email")} type="email" /><Field label="Phone" value={form.phone} onChange={update("phone")} /><Field label="State" value={form.state} onChange={update("state")} /><Field label="District" value={form.district} onChange={update("district")} />{error && <p className="sm:col-span-2 rounded-lg bg-risk-highBg px-3 py-2 text-sm text-risk-high">{error}</p>}<Button type="submit" className="sm:col-span-2" disabled={loading}>{loading ? "Creating..." : "Create staff account"}</Button></form>
          </section>
          <section className="rounded-xl2 border border-white/10 bg-white/5 p-6"><div className="mb-5"><h2 className="font-display text-xl font-bold">Recent provisioning</h2><p className="mt-1 text-sm text-white/50">Accounts created during this session.</p></div>{createdUsers.length === 0 ? <div className="flex min-h-40 items-center justify-center text-center text-sm text-white/45">No accounts created yet.</div> : <div className="space-y-3">{createdUsers.map((user) => <div key={user.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"><div><p className="text-sm font-semibold">{user.fullName}</p><p className="text-xs text-white/50">{user.username} · {user.role}</p></div><button onClick={() => setCreatedUsers((current) => current.filter((item) => item.id !== user.id))} aria-label="Dismiss account" className="text-white/40 hover:text-white"><X size={16} /></button></div>)}</div>}</section>
        </div>
      </main>
    </div>
  );
}
