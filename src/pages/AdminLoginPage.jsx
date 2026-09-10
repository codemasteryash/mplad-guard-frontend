import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { loginUser } from "../services/api";
import { useAuth, ROLES } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Logo from "../components/common/Logo";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await loginUser(form.username, form.password);
      if (user.role !== ROLES.ADMIN) throw new Error("This account is not authorized for administration.");
      login(ROLES.ADMIN, { ...user, name: user.fullName });
      push("Administrator access granted.", "success");
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo dark /></div>
        <div className="rounded-xl2 border border-white/10 bg-white p-6 shadow-cardHover sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-700"><ShieldCheck size={21} /></div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900">Administration</h1>
              <p className="mt-1 text-sm text-ink-500">Authorized personnel only.</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-700">Username</span><input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="username" className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-700">Password</span><div className="relative"><input required type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 pr-11 text-sm focus:border-brand-500 focus:outline-none" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-700" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <p className="rounded-lg bg-risk-highBg px-3 py-2 text-sm text-risk-high">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Checking access..." : "Continue"}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
