"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, PropsWithChildren, SetStateAction, useContext, useState } from "react";
import { SlateStatusTypes } from "../app.models";

interface SlateStatus {
  slateStatus: SlateStatusTypes;
  setSlateStatus: React.Dispatch<SetStateAction<SlateStatusTypes>>
  currentContent: any[];
  setCurrentContent: React.Dispatch<SetStateAction<any[]>>
  allowContent: boolean,
  setAllowContent: React.Dispatch<SetStateAction<boolean>>
  versionSwitched: boolean,
  setVersionSwitched: React.Dispatch<SetStateAction<boolean>>
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
  const [slateStatus, setSlateStatus] = useState<SlateStatusTypes>("idle");
  const [allowContent, setAllowContent] = useState(false);
  const [versionSwitched, setVersionSwitched] = useState(false);
  // used mainly to display transcribed audio on slate
  const [currentContent, setCurrentContent] = useState<any[]>([]);

  return (
    <SlateContext.Provider value={{
      slateStatus, 
      setSlateStatus, 
      currentContent, 
      setCurrentContent,
      allowContent,
      setAllowContent,
      versionSwitched,
      setVersionSwitched
      }}>
      {children}
    </SlateContext.Provider>
  )
}