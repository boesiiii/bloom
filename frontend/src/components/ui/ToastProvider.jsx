import { Check } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [confirmation, setConfirmation] = useState(null);
  const timeoutRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setConfirmation(null);
  }, []);

  const show = useCallback(
    (message, options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setConfirmation({ id, message, tone: options.tone || "success" });
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => dismiss(), options.duration || 2600);
    },
    [dismiss]
  );

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const value = useMemo(
    () => ({
      show,
      success: (message, options) => show(message, { ...options, tone: "success" })
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {confirmation ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/18 px-6 backdrop-blur-[2px]" role="presentation">
          <div
            className="success-dialog-card w-full max-w-xs rounded-lg border border-leaf-100 bg-white p-5 text-center shadow-2xl shadow-stone-900/20"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-dialog-title"
          >
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-leaf-100">
              <div className="success-check-ring grid h-14 w-14 place-items-center rounded-full bg-leaf-700 text-white">
                <Check className="success-check-icon h-8 w-8" aria-hidden="true" />
              </div>
            </div>
            <h2 id="success-dialog-title" className="mt-4 text-2xl font-bold text-stone-950">
              Done
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{confirmation.message}</p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-5 min-h-11 w-full rounded-lg bg-leaf-700 px-4 text-sm font-semibold text-white active:scale-[0.99]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
