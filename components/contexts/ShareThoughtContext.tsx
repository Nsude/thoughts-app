"use client";

import { Id } from "@/convex/_generated/dataModel";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ShareThoughtModal from "../utility/ShareThoughtModal";
import { ThoughtId } from "../app.models";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToastContext } from "./ToastContext";

type State = {
  thoughtId: Id<"thoughts">;
  isPrivate: boolean;
  display: boolean;
  thoughtLink: string;
}

type Props = {
  state: State;
  shareThoughtActions: {
    toggleDisplay(display: boolean): void;
    setThoughtId(thoughtId: ThoughtId): void;
    toggleAccess(isPrivate: boolean): Promise<unknown>;
  }
}

const ShareThoughtContext = createContext<Props | null>(null);

export const useShareThoughtContext = () => {
  const context = useContext(ShareThoughtContext);
  if (!context) throw new Error("Share Thought context must be used within the provider");

  return context;
}

const ShareThoughtProvider = ({ children }: PropsWithChildren) => {
  const [state, setShareState] = useState<State>({
    thoughtId: "new" as ThoughtId,
    display: false,
    isPrivate: true,
    thoughtLink: ""
  })

  const {setToast} = useToastContext();

  // mutations & queries
  const currentThought = 
    useQuery(api.thoughts.getCurrentThought, 
      state.thoughtId !== "new" ? {thoughtId: state.thoughtId} : "skip");
  
  const shareThought = useMutation(api.shareThought.shareThought);
  const makePrivateMutation = useMutation(api.shareThought.makePrivate);

  // init isPrivate on load
  useEffect(() => {
    if (!currentThought) return
    setShareState(prev => ({ ...prev, 
      isPrivate: currentThought.isPrivate, 
      thoughtLink: currentThought.thoughtLink ? currentThought.thoughtLink : ""
    }));
  }, [currentThought, state.thoughtId])

  const makePublic = useCallback( async () => {
    if (state.thoughtId === "new") {
      setToast({
        title: "Error Sharing Thought",
        msg: "You need to open the thought you'd like to share.",
        showToast: true,
        isError: true
      })
      return;
    }

    try {
      await new Promise(async (resolve) => {
        const response = await shareThought({ thoughtId: state.thoughtId });
        setShareState(prev => ({ ...prev, isPrivate: false, thoughtLink: response.link }));
        resolve(response);
      })
    } catch (error) {
      console.error(error);
      setToast({
        title: "Error Creating Link",
        showToast: true,
        isError: true
      })
    }
  }, [setToast, state.thoughtId, shareThought, setShareState])

  const makePrivate = useCallback(async () => {
    try {
      await new Promise(async (resolve) => {
        await makePrivateMutation({ thoughtId: state.thoughtId });
        setShareState(prev => ({ ...prev, isPrivate: true, thoughtLink: "" }));
        resolve(null);
      })
    } catch (error) {
      console.error(error);
      setToast({
        title: "Error Making Private",
        showToast: true,
        isError: true
      })
    }
  }, [setToast, state.thoughtId, makePrivateMutation, setShareState])

  const shareThoughtActions = useMemo(() => ({
    toggleDisplay(display: boolean) {
      setShareState(prev => ({ ...prev, display }));
    },

    setThoughtId(thoughtId: ThoughtId) {
      setShareState(prev => ({ ...prev, thoughtId }));
    },

    async toggleAccess(isPrivate: boolean) {
      if (state.isPrivate === isPrivate) return;

      if (!isPrivate) {
        await makePublic();
      } else {
        await makePrivate();
      }
    }
  }), [state.isPrivate, makePublic, makePrivate]);


  return (
    <ShareThoughtContext.Provider value={{ state, shareThoughtActions}}>
      <ShareThoughtModal />
      {children}
    </ShareThoughtContext.Provider>
  )
}

export default ShareThoughtProvider;