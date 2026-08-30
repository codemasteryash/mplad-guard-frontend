import { classNames } from "../../utils/format";

const RISK_STYLES = {
  Low: "bg-risk-lowBg text-risk-low border-risk-lowBorder",
  Medium: "bg-risk-mediumBg text-risk-medium border-risk-mediumBorder",
  High: "bg-risk-highBg text-risk-high border-risk-highBorder",
};

export function RiskBadge({ level, size = "md" }) {
  const sizeClass = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        sizeClass,
        RISK_STYLES[level] || RISK_STYLES.Low
      )}
    >
      <span
        className={classNames(
          "h-1.5 w-1.5 rounded-full",
          level === "High" ? "bg-risk-high" : level === "Medium" ? "bg-risk-medium" : "bg-risk-low"
        )}
      />
      {level}
    </span>
  );
}

const STATUS_STYLES = {
  Recommended: "bg-navy-50 text-navy-600 border-navy-100",
  Sanctioned: "bg-brand-50 text-brand-700 border-brand-200",
  "Work in Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-risk-lowBg text-risk-low border-risk-lowBorder",
  Delayed: "bg-risk-highBg text-risk-high border-risk-highBorder",
  Pending: "bg-risk-mediumBg text-risk-medium border-risk-mediumBorder",
  Approved: "bg-risk-lowBg text-risk-low border-risk-lowBorder",
  Open: "bg-risk-highBg text-risk-high border-risk-highBorder",
  "Under Review": "bg-risk-mediumBg text-risk-medium border-risk-mediumBorder",
  Resolved: "bg-risk-lowBg text-risk-low border-risk-lowBorder",
  "Not Verified": "bg-ink-100 text-ink-600 border-ink-200",
  "Pending Review": "bg-risk-mediumBg text-risk-medium border-risk-mediumBorder",
  Verified: "bg-risk-lowBg text-risk-low border-risk-lowBorder",
  Flagged: "bg-risk-highBg text-risk-high border-risk-highBorder",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        STATUS_STYLES[status] || "bg-ink-100 text-ink-700 border-ink-200"
      )}
    >
      {status}
    </span>
  );
}
