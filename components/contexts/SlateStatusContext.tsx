"use client";

import { createContext, PropsWithChildren, SetStateAction, useContext, useState } from "react";
import { SlateStatusTypes } from "../app.models";

interface SlateStatus {
  slateStatus: SlateStatusTypes;
  setSlateStatus: React.Dispatch<SetStateAction<SlateStatusTypes>>
  currentContent: any[];
  setCurrentContent: React.Dispatch<SetStateAction<any[]>>
  isSourceAudio: boolean,
  setIsSourceAudio: React.Dispatch<SetStateAction<boolean>>
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
  const [isSourceAudio, setIsSourceAudio] = useState(false);
  // used mainly to display transcribed audio on slate
  const [currentContent, setCurrentContent] = useState<any[]>([]);

  return (
    <SlateContext.Provider value={{
      slateStatus, 
      setSlateStatus, 
      currentContent, 
      setCurrentContent,
      isSourceAudio,
      setIsSourceAudio
      }}>
      {children}
    </SlateContext.Provider>
  )
}