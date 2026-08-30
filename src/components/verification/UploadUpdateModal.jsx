import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import FileDropzone from "../common/FileDropzone";
import { formatFullINR } from "../../utils/format";

const STATUS_OPTIONS = ["Pending Review", "Verified", "Flagged"];

export default function UploadUpdateModal({ open, project, onClose, onSubmit }) {
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [progressPercent, setProgressPercent] = useState(project?.progressPercent ?? 0);
  const [expenditureAmount, setExpenditureAmount] = useState(
    project ? Math.round(project.amountAllocated * (project.expenditurePercent / 100)) : 0
  );
  const [remarks, setRemarks] = useState("");
  const [verificationDate, setVerificationDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("Pending Review");

  if (!project) return null;

  const resetForm = () => {
    setPhotos([]);
    setDocuments([]);
    setProgressPercent(project.progressPercent);
    setExpenditureAmount(Math.round(project.amountAllocated * (project.expenditurePercent / 100)));
    setRemarks("");
    setVerificationDate(new Date().toISOString().slice(0, 10));
    setStatus("Pending Review");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(project, {
      photos,
      documents,
      progressPercent: Number(progressPercent),
      expenditureAmount: Number(expenditureAmount),
      remarks,
      verificationDate,
      status,
    });
    resetForm();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Site Verification Update"
      subtitle={`${project.projectId} — ${project.description}`}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Site Photographs *</p>
          <FileDropzone
            files={photos}
            setFiles={setPhotos}
            accept="image/*"
            hint="Upload multiple geo-tagged site photographs (JPG, PNG — max 10MB each)"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Video / Supporting Document (optional)</p>
          <FileDropzone
            files={documents}
            setFiles={setDocuments}
            accept=".mp4,.mov,.pdf,.doc,.docx"
            hint="Supported formats: MP4, MOV, PDF, DOC, DOCX (max 50MB each)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Current Progress % *</span>
            <input
              type="number"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => setProgressPercent(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Current Expenditure (₹) *</span>
            <input
              type="number"
              min="0"
              max={project.amountAllocated}
              value={expenditureAmount}
              onChange={(e) => setExpenditureAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            />
            <span className="mt-1 block text-[11px] text-ink-400">of {formatFullINR(project.amountAllocated)} allocated</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Verification Date *</span>
            <input
              type="date"
              value={verificationDate}
              onChange={(e) => setVerificationDate(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Verification Status *</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Verification Remarks *</span>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required
            rows={3}
            placeholder="Observations from the site visit — quality, discrepancies, adherence to sanctioned scope, etc."
            className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
          />
        </label>

        <div className="rounded-lg bg-brand-50 px-3.5 py-2.5 text-xs text-brand-800">
          This evidence is stored for administrative review. AI-assisted image comparison and anomaly
          detection will be available once the FastAPI verification service is connected.
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Submit Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
