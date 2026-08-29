import { useEffect, useRef, useState } from "react";
import { classNames } from "../../utils/format";

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  numericValue,
  suffix = "",
  prefix = "",
  trend,
  tone = "navy",
  formatFn,
}) {
  const animated = useCountUp(numericValue ?? 0);
  const displayValue =
    numericValue != null ? (formatFn ? formatFn(animated) : `${prefix}${animated.toLocaleString("en-IN")}${suffix}`) : value;

  const toneMap = {
    navy: "bg-navy-50 text-navy-600",
    green: "bg-risk-lowBg text-risk-low",
    purple: "bg-violet-50 text-violet-600",
    amber: "bg-risk-mediumBg text-risk-medium",
    red: "bg-risk-highBg text-risk-high",
  };

  return (
    <div className="group rounded-xl2 border border-ink-200 bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover">
      <div className="flex items-start justify-between">
        <div className={classNames("flex h-10 w-10 items-center justify-center rounded-lg", toneMap[tone])}>
          {Icon && <Icon size={20} />}
        </div>
        {trend != null && (
          <span
            className={classNames(
              "flex items-center gap-0.5 text-xs font-semibold",
              trend >= 0 ? "text-risk-low" : "text-risk-high"
            )}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-ink-900 tabular-nums">{displayValue}</p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
    </div>
  );
}
