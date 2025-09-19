"use client";

import { Id } from "@/convex/_generated/dataModel";
import { createContext, PropsWithChildren, SetStateAction, useContext, useState } from "react";
import ShareThoughtModal from "../utility/ShareThoughtModal";

type State = {
  thoughtId: Id<"thoughts">;
  isPrivate: boolean;
  display: boolean;
  thoughtLink: string;
}

type Props = {
  state: State;
  toggleDisplay: (display: boolean) => void;
  toggleAccess: (isPrivate: boolean) => Promise<any>;
}

const ShareThoughtContext = createContext<Props | null>(null);

export const useShareThoughtContext = () => {
  const context = useContext(ShareThoughtContext);
  if (!context) throw new Error("Share Thought context must be used within the provider");

  return context;
}

const ShareThoughtProvider = ({children}: PropsWithChildren) => {
  const [state, setShareState] = useState<State>({
    thoughtId: "" as Id<"thoughts">,
    display: false,
    isPrivate: true,
    thoughtLink: ""
  })

  const toggleDisplay = (display: boolean) => {
    setShareState(prev => ({ ...prev, display }));
  }

  const toggleAccess = async (isPrivate: boolean) => {
    if (state.isPrivate === isPrivate) return;
    return await new Promise(resolve => setTimeout(() => {
      setShareState(prev => ({ ...prev, isPrivate, thoughtLink: !isPrivate ? "link": "" }));
      resolve(null);
    }, 2000));
  }

  return (
    <ShareThoughtContext.Provider value={{state, toggleDisplay, toggleAccess}}>
      <ShareThoughtModal />
      {children}
    </ShareThoughtContext.Provider>
  )
}

export default ShareThoughtProvider;