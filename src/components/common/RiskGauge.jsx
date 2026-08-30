import { classNames } from "../../utils/format";

export default function RiskGauge({ score, level, size = 192 }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = level === "High" ? "#EF4444" : level === "Medium" ? "#F5A524" : "#22C55E";

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ height: size, width: size }}>
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle cx="90" cy="90" r={radius} stroke="#EBEFF5" strokeWidth="14" fill="none" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke={color}
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <p className="font-display text-4xl font-extrabold text-ink-900">
          {score}
          <span className="text-base font-medium text-ink-400">/100</span>
        </p>
        <p
          className={classNames(
            "mt-1 text-sm font-bold",
            level === "High" ? "text-risk-high" : level === "Medium" ? "text-risk-medium" : "text-risk-low"
          )}
        >
          {level} Risk
        </p>
      </div>
    </div>
  );
}
