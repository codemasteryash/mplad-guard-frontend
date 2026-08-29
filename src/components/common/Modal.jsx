import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, onClose, title, subtitle, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 sm:pt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`relative z-10 w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-xl2 bg-surface shadow-2xl`}
          >
            <div className="flex items-start justify-between border-b border-ink-100 px-6 py-5">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
