import { useMemo, useRef, useState } from "react";
import { UploadCloud, FileText, X, Info, ImageIcon, MessageSquareWarning } from "lucide-react";
import { useAuth, ROLES } from "../context/AuthContext";
import { useDataStore } from "../context/DataStoreContext";
import { useToast } from "../context/ToastContext";
import { STATES, COMPLAINT_CATEGORIES } from "../data/mockData";
import { formatDate, classNames } from "../utils/format";
import { StatusBadge } from "../components/common/Badge";
import Button from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";

const TIPS = [
  "Provide correct details of location and project.",
  "Upload clear images or documents if available.",
  "Your complaint will be reviewed by the authority.",
];

function FileDropzone({ files, setFiles }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (list) => {
    const next = Array.from(list).map((file) => ({
      file,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={classNames(
          "flex flex-col items-center justify-center rounded-xl2 border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-brand-400 bg-brand-50" : "border-ink-200 bg-canvas/40"
        )}
      >
        <UploadCloud size={28} className="mb-2 text-ink-400" />
        <p className="text-sm text-ink-600">Drag &amp; drop files here</p>
        <p className="my-1 text-xs text-ink-400">or</p>
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
        />
        <p className="mt-3 text-[11px] text-ink-400">Supported formats: JPG, PNG, PDF, DOC, DOCX (max 10MB each)</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2">
              {f.preview ? (
                <img src={f.preview} alt={f.name} className="h-9 w-9 rounded object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded bg-ink-100 text-ink-500">
                  <FileText size={16} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink-800">{f.name}</p>
                <p className="text-[10px] text-ink-400">{(f.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setFiles((prev) => (prev[i]?.preview && URL.revokeObjectURL(prev[i].preview), prev.filter((_, idx) => idx !== i)))}
                className="text-ink-400 hover:text-risk-high"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CitizenComplaintForm() {
  const { profile } = useAuth();
  const { addComplaint } = useDataStore();
  const { push } = useToast();
  const [form, setForm] = useState({
    state: profile?.state || "",
    districtCode: "",
    pincode: "",
    projectId: "",
    category: COMPLAINT_CATEGORIES[0],
    description: "",
  });
  const [files, setFiles] = useState([]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    addComplaint({
      ...form,
      submittedBy: profile?.name,
      files: files.map((f) => f.name),
    });
    push("Complaint submitted. You can track its status below.", "success");
    setForm({ state: profile?.state || "", districtCode: "", pincode: "", projectId: "", category: COMPLAINT_CATEGORIES[0], description: "" });
    setFiles([]);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr_0.9fr]">
      <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
        <h3 className="mb-4 font-display text-base font-bold text-ink-900">Complaint Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                State <span className="text-risk-high">*</span>
              </span>
              <select
                value={form.state}
                onChange={(e) => set("state")(e.target.value)}
                required
                className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
              >
                <option value="">Select State</option>
                {STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                District Code <span className="text-risk-high">*</span>
              </span>
              <input
                value={form.districtCode}
                onChange={(e) => set("districtCode")(e.target.value)}
                required
                placeholder="e.g. 11001"
                className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                Pincode <span className="text-risk-high">*</span>
              </span>
              <input
                value={form.pincode}
                onChange={(e) => set("pincode")(e.target.value)}
                required
                placeholder="Enter Pincode"
                className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">Project ID (if known)</span>
              <input
                value={form.projectId}
                onChange={(e) => set("projectId")(e.target.value)}
                placeholder="e.g. MP/2024/00123"
                className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Complaint Category</span>
            <select
              value={form.category}
              onChange={(e) => set("category")(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            >
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              Complaint Description <span className="text-risk-high">*</span>
            </span>
            <textarea
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              required
              rows={4}
              placeholder="Describe your complaint in detail..."
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            />
          </label>
          <Button type="submit" className="w-full" size="lg">
            Submit Complaint
          </Button>
        </form>
      </div>

      <div className="rounded-xl2 border border-ink-200 bg-white p-5 shadow-card">
        <h3 className="mb-1 font-display text-base font-bold text-ink-900">Upload Evidence</h3>
        <p className="mb-4 text-xs text-ink-500">You can upload images or documents (max size 10MB each)</p>
        <FileDropzone files={files} setFiles={setFiles} />
      </div>

      <div className="h-fit rounded-xl2 border border-brand-200 bg-brand-50 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-brand-800">
          <Info size={16} /> Important Tips
        </h3>
        <ul className="space-y-3">
          {TIPS.map((t, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-brand-800">
              <ImageIcon size={14} className="mt-0.5 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComplaintsTable({ complaints, editable, onStatusChange }) {
  if (complaints.length === 0) {
    return <EmptyState icon={MessageSquareWarning} title="No complaints found" description="Nothing to show here yet." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-canvas/50 text-xs uppercase tracking-wide text-ink-500">
            <th className="px-5 py-3 font-semibold">Complaint ID</th>
            <th className="px-5 py-3 font-semibold">Category</th>
            <th className="px-5 py-3 font-semibold">District Code</th>
            <th className="px-5 py-3 font-semibold">Project ID</th>
            <th className="px-5 py-3 font-semibold">Submitted On</th>
            <th className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id} className="border-b border-ink-50">
              <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-navy-700">{c.id}</td>
              <td className="px-5 py-3.5 text-ink-700">{c.category}</td>
              <td className="px-5 py-3.5 text-ink-700">{c.districtCode}</td>
              <td className="px-5 py-3.5 text-ink-700">{c.projectId || "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-ink-700">{formatDate(c.submittedOn)}</td>
              <td className="px-5 py-3.5">
                {editable ? (
                  <select
                    value={c.status}
                    onChange={(e) => onStatusChange(c.id, e.target.value)}
                    className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs focus:border-brand-500"
                  >
                    {["Open", "Under Review", "Resolved"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={c.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ComplaintPage() {
  const { role, profile } = useAuth();
  const { complaints, updateComplaintStatus } = useDataStore();

  const scoped = useMemo(() => {
    if (role === ROLES.DISTRICT_AUTHORITY) return complaints.filter((c) => c.districtCode === profile?.districtCode);
    return complaints;
  }, [role, complaints, profile]);

  const isDA = role === ROLES.DISTRICT_AUTHORITY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">{isDA ? "Complaints Review" : "File a Complaint"}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {isDA
            ? `Citizen complaints filed for ${profile?.district || "your district"}.`
            : "Help us improve transparency by reporting issues related to MPLADS projects."}
        </p>
      </div>

      {!isDA && <CitizenComplaintForm />}

      <div className="overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink-900">{isDA ? "All District Complaints" : "My Complaints"}</h3>
        </div>
        <ComplaintsTable complaints={scoped} editable={isDA} onStatusChange={updateComplaintStatus} />
      </div>
    </div>
  );
}
