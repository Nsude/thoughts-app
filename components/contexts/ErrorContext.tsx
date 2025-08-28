"use client";

import { createContext, PropsWithChildren, useContext, useState } from "react";

interface ErrorState {
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const ErrorContext = createContext<ErrorState | null>(null);

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useErrorContext must be used within ErrorProvider");
  return ctx;
};

export function ErrorProvider({ children }: PropsWithChildren) {
  const [error, setError] = useState<string | null>(null);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
}
