import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, warning: AlertTriangle, info: Info };
const COLORS = {
  success: "border-risk-lowBorder bg-risk-lowBg text-risk-low",
  warning: "border-risk-mediumBorder bg-risk-mediumBg text-risk-medium",
  info: "border-brand-200 bg-brand-50 text-brand-700",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-cardHover ${COLORS[t.type]}`}
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm font-medium">{t.message}</p>
                <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100">
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
