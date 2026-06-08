import { useCallback, useEffect, useRef, useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success", duration = 2000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ open: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast((currentToast) => ({ ...currentToast, open: false }));
      toastTimerRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return { toast, showToast };
}
