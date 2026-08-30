import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { IDA_AGENCY_OPTIONS } from "../../data/idaData";
import { formatFullINR, formatDate } from "../../utils/format";

export default function AssignIAModal({ open, onClose, project, onAssign }) {
  const [form, setForm] = useState({
    agency: IDA_AGENCY_OPTIONS[0],
    iaOfficer: "",
    expectedStartDate: "",
    expectedCompletionDate: "",
    notes: "",
  });

  if (!project) return null;

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(project.id, form);
    setForm({ agency: IDA_AGENCY_OPTIONS[0], iaOfficer: "", expectedStartDate: "", expectedCompletionDate: "", notes: "" });
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Implementing Agency" subtitle="This updates the project immediately.">
      <div className="mb-4 rounded-lg bg-canvas px-3.5 py-3 text-sm">
        <p className="font-semibold text-ink-900">{project.projectId}</p>
        <p className="text-ink-600">{project.description}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
          <span>District: {project.district}</span>
          <span>Amount: {formatFullINR(project.amountAllocated)}</span>
          <span>Sanctioned: {formatDate(project.startDate)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Select Implementing Agency *</span>
          <select
            value={form.agency}
            onChange={(e) => set("agency")(e.target.value)}
            required
            className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
          >
            {IDA_AGENCY_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">IA Officer *</span>
          <input
            value={form.iaOfficer}
            onChange={(e) => set("iaOfficer")(e.target.value)}
            required
            placeholder="e.g. Executive Engineer, PWD Division"
            className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Expected Start Date *</span>
            <input
              type="date"
              value={form.expectedStartDate}
              onChange={(e) => set("expectedStartDate")(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Expected Completion *</span>
            <input
              type="date"
              value={form.expectedCompletionDate}
              onChange={(e) => set("expectedCompletionDate")(e.target.value)}
              required
              className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Notes (optional)</span>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
            rows={3}
            placeholder="Any special instructions for the implementing agency..."
            className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500"
          />
        </label>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Assign Agency
          </Button>
        </div>
      </form>
    </Modal>
  );
}
