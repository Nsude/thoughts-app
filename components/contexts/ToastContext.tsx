"use client";

import { createContext, PropsWithChildren, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";

interface Toast {
  title: string;
  msg?: string;
  isError: boolean;
  showToast: boolean;
}

const initialToastState:Toast = {
  title: "",
  msg: "",
  isError: false,
  showToast: false
}

interface ToastState {
  toggleToast: (showToast: boolean) => void;
  toast: Toast;
  setToast: React.Dispatch<SetStateAction<Toast>>
}

const ToastContext = createContext<ToastState | null>(null);

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<Toast>(initialToastState);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (toast.showToast) {
      timeoutRef.current = 
        setTimeout(() => setToast(prev => ({...prev, showToast: false})), 3500);
    } else {
      timeoutRef.current = null;
    }

  }, [toast.showToast])

  const toggleToast = useCallback((showToast: boolean) => {
    setToast(prev => ({ ...prev, showToast: showToast }));
  }, [])

  return (
    <ToastContext.Provider value={{ 
      toast,
      setToast,
      toggleToast
    }}>
      {children}
    </ToastContext.Provider>
  );
}
