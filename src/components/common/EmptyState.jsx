export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-400">
          <Icon size={26} />
        </div>
      )}
      <h4 className="font-display text-base font-semibold text-ink-900">{title}</h4>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 8 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-ink-100 px-4 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton h-4 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl2 border border-ink-200 bg-surface p-5">
      <div className="skeleton mb-4 h-10 w-10 rounded-lg" />
      <div className="skeleton mb-2 h-6 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  );
}
