"use client";

import NoBgButton from "../buttons/NoBgButton";
import SearchIcon from "@/public/icons/SearchIcon";
import DbArrowLeft from "@/public/icons/DbArrowLeft";
import TabButton from "../buttons/TabButton";
import Logo from "../Logo";
import NavMenuItem from "./NavMenuItem";
import NewThoughtIcon from "@/public/icons/NewThoughtIcon";
import ExploreIcon from "@/public/icons/ExploreIcon";
import ProfileDisplay from "./ProfileDisplay";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LogoutIcon from "@/public/icons/LogoutIcon";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Thought from "./Thought";
import { Id } from "@/convex/_generated/dataModel";
import OptionsModal from "./OptionsModal";
import { ThoughtId } from "../app.models";



type ModalState = {
  display: boolean;
  y: number;
  isEditing: ThoughtId
}

export type ModalActions = 
| {type: "TOGGLE_DISPLAY", value: boolean}
| {type: "SET_EDITING", thoughtId: ThoughtId}
| {type: "SET_POS", pos: number};

const initialState:ModalState = {
  display: false,
  y: 0,
  isEditing: "" as ThoughtId
}

// modal state reducer
const modalReducer = (state: ModalState, action: ModalActions) => {
  switch(action.type) {
    case "TOGGLE_DISPLAY":
      return {
        ...state,
        display: action.value
      } as ModalState;
    case "SET_POS":
      return {
        ...state,
        y: action.pos
      } as ModalState;
    case "SET_EDITING":
      return {
        ...state,
        isEditing: action.thoughtId
      } as ModalState;
  }
}

export default function Naviation() {
  const [isPrivate, setIsPrivate] = useState(true);
  const currentUser = useQuery(api.users.getCurrentUser);
  const thoughts = useQuery(api.thoughts.getUserThoughts, { isPrivate });
  const signOut = useAction(api.auth.signOut);
  const router = useRouter();

  // modal central state 
  const [modalState, modalDispath] = useReducer(modalReducer, initialState);
  const currentThoughtId = useRef<ThoughtId>(null);

  useEffect(() => {
    if (currentUser !== undefined && !currentUser) {
      redirect("/login");
    }
  }, [currentUser])

  const prevThoughtId = useRef<Id<"thoughts">>(null);
  let modalTimeout = useRef<NodeJS.Timeout>(null);

  // reverse thoughts array to be last-thought-first display
  const reversedThoughts = useMemo(() => 
      thoughts ? thoughts.slice().reverse() : []
    , [thoughts]);

  // close options modal when the user clicks outside
  useEffect(() => {
    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (!modalState.display) return;
      modalDispath({ type: "TOGGLE_DISPLAY", value: false });
    }

    if (modalState.display) {
      window.addEventListener("mousedown", handleOutsideMouseDown);
      return () => window.removeEventListener("mousedown", handleOutsideMouseDown);
    }
  }, [modalState.display])

  // ==== Display and hide thought edit options ====
  const handleThoughtEditOptions = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest("button");
    if (!button) return;

    const { top, height } = button.getBoundingClientRect();
    const prevId = prevThoughtId.current;
    const currentId = currentThoughtId.current;
    
    modalDispath({ 
      type: "TOGGLE_DISPLAY", 
      value: prevId === currentId || prevId === null ? !modalState.display : true 
    })
    
    modalDispath({type: "SET_POS", pos: top + height});

    // reset the prev pos
    if (modalTimeout.current) clearTimeout(modalTimeout.current);
    modalTimeout.current = setTimeout(() => {
      prevThoughtId.current = currentThoughtId.current;
    }, 10)
  }, [modalState])

  const handleNewThought = () => {
    router.replace("/thoughts/new");
  }

  const handleSignout = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  }

  return (
    <div className="w-full h-full">
      {/* search & logo */}
      <div className="flex w-full h-fit justify-between items-center mb-[1.75rem]">
        <Logo />

        <div className="flex">
          <NoBgButton icon={<SearchIcon />} />
          <NoBgButton icon={<DbArrowLeft />} />
        </div>
      </div>

      {/* public/private filter */}
      <div>
        <TabButton
          tab1="Private"
          tab2="public"
          handleClick={(tab) => setIsPrivate(tab === 0 ? true : false)}
        />
      </div>

      {/* Menu Items */}
      <div className="flex flex-col w-full my-[2.5rem]">
        <NavMenuItem
          icon={<NewThoughtIcon />}
          handleClick={handleNewThought}
          label="New Thought" />

        <NavMenuItem
          icon={<ExploreIcon />}
          handleClick={() => { }}
          label="Explore" />
      </div>

      {/* Thoughts */}
      <div 
        className="w-full max-h-[38.5%] overflow-y-scroll" 
        onScroll={(e) => {
          // hide modal on scroll
          if (!modalState.display) return
          modalDispath({type: "TOGGLE_DISPLAY", value: false});
          }}>

        <span
          className="block mb-[0.75rem] text-fade-gray">
          Your Thoughts
        </span>

        <div className="relative flex flex-col h-[90%] overflow-y-scroll snap-y slim-scrollbar">
          {/* Thoughts go here */}
          {
            reversedThoughts.map((item) => (
              <Thought 
                key={item._id} 
                thought={item}
                editing={modalState.isEditing === item._id}
                modalDispath={modalDispath}
                handleClick={() => {
                  router.replace(`/thoughts/${item._id}`);
                  currentThoughtId.current = item._id;
                }} 
                handleEditClick={(e) => {
                  currentThoughtId.current = item._id;
                  handleThoughtEditOptions(e);
                }} />
            ))
          }
        </div>
      </div>

      {/* ==== Options Modal ==== */}
      <OptionsModal 
        display={modalState.display} y={modalState.y}
        thoughtId={currentThoughtId.current as ThoughtId} 
        modalDispath={modalDispath} />

      {/* Shared Thoughts */}
      <div className="w-full max-h-[14%] mt-[2.5rem]">
        <span className="block mb-[0.75rem] text-fade-gray">Shared</span>
        <div className="flex flex-col h-[95%] overflow-y-scroll snap-y slim-scrollbar reduce-sb-height">
          {/* Thoughts go here */}
        </div>
      </div>

      {/* profile */}
      <div className="
        rounded-[20px]
        flex bg-myWhite z-[2] items-center absolute border-t border-border-gray/55 bottom-0 left-0 w-full h-[4.5rem] p-[0.9375rem] justify-between">
        {/* not logged in */}
        <ProfileDisplay
          userName={currentUser?.name?.split(" ")[0] || currentUser?.email || "name"}
          accoutType={"Freeloader"} />
        <NoBgButton icon={<LogoutIcon />} handleClick={handleSignout} />
      </div>
    </div>
  )
}