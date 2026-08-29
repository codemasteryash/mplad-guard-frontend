import { classNames } from "../../utils/format";

const VARIANTS = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20",
  outline: "bg-white text-navy-700 border border-ink-200 hover:border-brand-400 hover:text-brand-600",
  ghost: "bg-transparent text-navy-700 hover:bg-ink-100",
  danger: "bg-risk-high text-white hover:bg-red-700",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  iconPosition = "left",
  children,
  ...props
}) {
  return (
    <Component
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
    </Component>
  );
}
