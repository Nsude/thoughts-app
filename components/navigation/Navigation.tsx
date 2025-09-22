"use client";

import NoBgButton from "../buttons/NoBgButton";
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
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import Thought from "./Thought";
import { Id } from "@/convex/_generated/dataModel";
import OptionsModal from "./OptionsModal";
import { ThoughtId } from "../app.models";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useShareThoughtContext } from "../contexts/ShareThoughtContext";
import LogoMark from "@/public/LogoMark";
import LogoIcon from "@/public/icons/LogoIcon";
import DbArrowRight from "@/public/icons/DbArrowRight";
import { defaultImage } from "@/public/profile-images/allProfiles";



type ModalState = {
  display: boolean;
  y: number;
  isEditing: ThoughtId
}

export type ModalActions =
  | { type: "TOGGLE_DISPLAY", value: boolean }
  | { type: "SET_EDITING", thoughtId: ThoughtId }
  | { type: "SET_POS", pos: number };

const initialState: ModalState = {
  display: false,
  y: 0,
  isEditing: "" as ThoughtId
}

// modal state reducer
const modalReducer = (state: ModalState, action: ModalActions) => {
  switch (action.type) {
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
  const [tab, setTab] = useState(0);
  const { state: shareThoughtState } = useShareThoughtContext();
  const currentUser = useQuery(api.users.getCurrentUser);
  const thoughts = useQuery(api.thoughts.getUserThoughts);
  const signOut = useAction(api.auth.signOut);
  const router = useRouter();
  const { setCurrentContent } = useSlateStatusContext();

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
  const reversedThoughts = useMemo(() => {
    if (!thoughts) return [];
    const isPrivate = tab === 0 ? true : false;
    const privateThoughts = thoughts.filter(thought => thought.isPrivate === isPrivate);
    return privateThoughts.slice().reverse();
  }, [thoughts, tab]);

  const reversedSharedThoughts = useMemo(() => {
    if (!thoughts) return [];
    const sharedThoughts = thoughts.filter(thought => thought.isPrivate === false);
    return sharedThoughts.slice().reverse()
  }, [thoughts]);

  // preselect the right tab for the current selected thought when isPrivate is changed
  useEffect(() => {
    setTab(shareThoughtState.isPrivate ? 0 : 1);
  }, [shareThoughtState.isPrivate])

  // ==== ANIMATE THE THOUGHT FILE LIST ====
  const mainRef = useRef(null);
  const thoughtsRef = useRef<HTMLDivElement>(null);
  const isAnimated = useRef(false);

  useLayoutEffect(() => {
    isAnimated.current = false;
  }, [tab])

  useGSAP(() => {
    if (!mainRef.current || !thoughtsRef.current || isAnimated.current) return;

    const thoughts = thoughtsRef.current.children;
    if (thoughts.length === 0) return

    gsap.set(thoughts, { y: 40, opacity: 0 });

    gsap.set(thoughtsRef.current, { overflowY: "hidden" });

    gsap.to(thoughts, {
      y: 0,
      opacity: 1,
      ease: "power2.inOut",
      stagger: .08
    })

    isAnimated.current = true;

    setTimeout(() => {
      gsap.set(thoughtsRef.current, { overflowY: "scroll" });
    }, 2000)

  }, { scope: mainRef, dependencies: [thoughts, tab] })

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

    modalDispath({ type: "SET_POS", pos: top + height });

    // reset the prev pos
    if (modalTimeout.current) clearTimeout(modalTimeout.current);
    modalTimeout.current = setTimeout(() => {
      prevThoughtId.current = currentThoughtId.current;
    }, 10)
  }, [modalState])

  const handleNewThought = () => {
    setCurrentContent([]); // reset current content
    router.replace("/thoughts/new");
  }

  const handleSignout = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  }

  const [isCollapsed, setIsCollapsed] = useState(false);
  const hideOnCollapse = "hide-on-collapse";
  const showOnCollapse = "show-on-collapse";
  const handleCollapse = () => {
    gsap.to(mainRef.current, {
      width: isCollapsed ? "19%" : "4rem",
      minWidth: isCollapsed ? "18rem" : "4rem",
      duration: .4,
    })

    gsap.to(`.${hideOnCollapse}`, {
      opacity: isCollapsed ? 1 : 0,
      duration: .25,
      delay: isCollapsed ? .25 : 0
    })

    gsap.to(`.${showOnCollapse}`, {
      opacity: isCollapsed ? 0 : 1,
      duration: .25,
      delay: isCollapsed ? 0 : .25
    })

    setIsCollapsed(prev => !prev);
  }

  return (
    <div
      ref={mainRef}
      className="
        relative w-[19%] min-w-[18rem] h-full bg-myWhite p-[0.9375rem] z-[5] 
        border-r-1 border-border-gray/50 text-nowrap">
      {/* search & logo */}
      <div className="relative flex w-full h-fit justify-between items-center mb-[1.75rem]">
        <Logo collapse={isCollapsed} />

        <span 
          role="button"
          data-collapse={isCollapsed} 
          style={{
            left: isCollapsed ? "-3px" : "unset", 
            right: isCollapsed ? "unset" : "0"
          }}
          className="collapse-dashboard-btn absolute right-0">
          <NoBgButton icon={<DbArrowLeft />} handleClick={handleCollapse} />
        </span>
      </div>

      {/* public/private filter */}
      <div className={`${hideOnCollapse}`}>
        <TabButton
          tab1="Private"
          tab2="public"
          handleClick={(tab) => setTab(tab)}
          preselectTab={tab}
        />
      </div>

      {/* Menu Items */}
      <div className={`flex flex-col w-full my-[2.5rem]`}>
        <NavMenuItem
          icon={<NewThoughtIcon />}
          handleClick={handleNewThought}
          hideWord={isCollapsed}
          label="New Thought" />

        <NavMenuItem
          icon={<ExploreIcon />}
          handleClick={() => { }}
          hideWord={isCollapsed}
          label="Explore" />
      </div>

      {/* Thoughts */}
      <div
        className={`${hideOnCollapse} w-full max-h-[38.5%] overflow-y-scroll`}
        onScroll={(e) => {
          // hide modal on scroll
          if (!modalState.display) return
          modalDispath({ type: "TOGGLE_DISPLAY", value: false });
        }}>

        <span
          className="block mb-[0.75rem] text-fade-gray">
          Your Thoughts
        </span>

        <div ref={thoughtsRef} className="relative flex flex-col h-[90%] overflow-y-scroll snap-y overflow-x-hidden slim-scrollbar">
          {/* Thoughts go here */}
          {
            reversedThoughts.map((item) => (
              <Thought
                key={item._id}
                thought={item}
                editing={modalState.isEditing === item._id}
                modalDispath={modalDispath}
                handleClick={() => {
                  setCurrentContent([]) // reset current content
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
      <div
        style={{opacity: reversedSharedThoughts.length > 0 && tab !== 1 ? 1 : 0}}
        className={`${hideOnCollapse} w-full max-h-[14%] mt-[2.5rem]`}>
        <span
          style={{ opacity: (tab === 0 && reversedSharedThoughts.length > 0) ? 1 : 0 }}
          className="block mb-[0.75rem] text-fade-gray">Shared</span>
        <div className="flex flex-col h-[95%] overflow-y-scroll snap-y slim-scrollbar reduce-sb-height">
          {/* Thoughts go here */}
          {
            reversedSharedThoughts.map((item) => (
              <Thought
                key={item._id}
                thought={item}
                editing={modalState.isEditing === item._id}
                modalDispath={modalDispath}
                handleClick={() => {
                  setCurrentContent([]) // reset current content
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

      {/* profile */}
      <ProfileDisplay
        userName={currentUser?.name?.split(" ")[0] || currentUser?.email || "name"}
        accoutType={"Freeloader"} 
        avatarUrl={currentUser?.image || defaultImage.src}
        collapse={isCollapsed} 
        handleSignout={handleSignout}/>
    </div>
  )
}