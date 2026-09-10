import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Copy, Eye, EyeOff, UserPlus } from "lucide-react";
import { registerCitizen } from "../services/api";
import { useAuth, ROLES } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Logo from "../components/common/Logo";

function Field({ label, value, onChange, type = "text", required, placeholder, autoComplete, allowPasswordToggle }) {
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
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
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

export default function CitizenRegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredUser, setRegisteredUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email && !form.phone) {
      setError("Enter an email address or phone number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { user } = await registerCitizen(form);
      login(ROLES.CITIZEN, { ...user, name: user.fullName });
      push("Citizen account created successfully.", "success");
      setRegisteredUser(user);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-xl2 border border-ink-200 bg-white p-6 shadow-card sm:p-8">
          <Link to="/login" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600">
            <ArrowLeft size={15} /> Back to sign in
          </Link>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><UserPlus size={21} /></div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900">Create citizen account</h1>
              <p className="mt-1 text-sm text-ink-500">Register to file and track public grievances.</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name" value={form.fullName} onChange={update("fullName")} required placeholder="Your full name" autoComplete="name" />
            <Field label="Email" value={form.email} onChange={update("email")} type="email" placeholder="you@example.com" autoComplete="email" />
            <Field label="Phone" value={form.phone} onChange={update("phone")} type="tel" placeholder="10-digit phone number" autoComplete="tel" />
            <Field label="Password" value={form.password} onChange={update("password")} type="password" required placeholder="Create a password" autoComplete="new-password" allowPasswordToggle />
            {error && <p className="rounded-lg bg-risk-highBg px-3 py-2 text-sm text-risk-high">{error}</p>}
            {registeredUser ? (
              <div className="space-y-4 rounded-lg border border-risk-lowBorder bg-risk-lowBg p-4">
                <div><p className="text-sm font-semibold text-risk-low">Account created successfully</p><p className="mt-1 text-xs text-ink-700">Save this username. You will need it to sign in.</p></div>
                <div className="flex items-center gap-2 rounded-lg border border-risk-lowBorder bg-white p-2"><code className="min-w-0 flex-1 truncate px-2 text-sm font-semibold text-ink-900">{registeredUser.username}</code><button type="button" onClick={async () => { await navigator.clipboard.writeText(registeredUser.username); setCopied(true); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button></div>
                <Button type="button" className="w-full" size="lg" onClick={() => navigate("/dashboard", { replace: true })}>Continue to dashboard</Button>
              </div>
            ) : (
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
