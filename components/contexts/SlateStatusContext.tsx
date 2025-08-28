"use client";

import { createContext, PropsWithChildren, SetStateAction, useContext, useState } from "react";

export type SlateStatusTypes = "loading" | "saving" | "saved" | "idle" | "error";

interface SlateStatus {
  status: SlateStatusTypes;
  setStatus: React.Dispatch<SetStateAction<SlateStatusTypes>>
}

const SlateContext = createContext<SlateStatus | null>(null);

export const useSlateStatusContext = () => {
  const context = useContext(SlateContext);
  if (!context) {
    throw new Error("useSlateStatusContext must be used within a SlateStatusContextProvider");
  };

  return context;
}

export default function SlateStatusContextProvider({children}: PropsWithChildren) {
  const [status, setStatus] = useState<SlateStatusTypes>("idle");

  return (
    <SlateContext.Provider value={{status, setStatus}}>
      {children}
    </SlateContext.Provider>
  )
}