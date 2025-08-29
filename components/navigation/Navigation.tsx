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
import { useCallback, useEffect, useRef, useState } from "react";
import Thought from "./Thought";
import { Id } from "@/convex/_generated/dataModel";
import OptionsModal from "./OptionsModal";

export default function Naviation() {
  const [isPrivate, setIsPrivate] = useState(true);
  const currentUser = useQuery(api.users.getCurrentUser);
  const thoughts = useQuery(api.thoughts.getUserThoughts, { isPrivate });
  const signOut = useAction(api.auth.signOut);
  const router = useRouter();
  const [optionsModal, setOptionsModal] = useState({
    display: false, y: 0,
  });

  const currentThoughtId = useRef<Id<"thoughts">>(null);

  useEffect(() => {
    if (currentUser !== undefined && !currentUser) {
      redirect("/login");
    }
  }, [currentUser])

  const prevThoughtId = useRef<Id<"thoughts">>(null);
  let modalTimeout:NodeJS.Timeout;

  // ==== Display and hide thought edit options ====
  const handleThoughtEditOptions = useCallback((e: React.MouseEvent) => {
    const { target } = e;
    const svg = target as SVGElement;
    const button = svg.parentElement?.parentElement;
    if (!button) return;

    const { top, height } = button.getBoundingClientRect();
    const prevId = prevThoughtId.current;
    const currentId = currentThoughtId.current;
    setOptionsModal((prev) => {
      return { 
        display: prevId === currentId || prevId === null ? !prev.display : true, 
        y: top + (height - 5) 
      }
    });

    // reset the prev pos
    clearTimeout(modalTimeout)
    modalTimeout = setTimeout(() => {
      prevThoughtId.current = currentThoughtId.current
    }, 10)
  }, [])

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
      <div className="w-full max-h-[38.5%] overflow-y-scroll">
        <span
          className="block mb-[0.75rem] text-fade-gray">
          Your Thoughts
        </span>

        <div className="relative flex flex-col h-[90%] overflow-y-scroll snap-y slim-scrollbar">
          {/* Thoughts go here */}
          {
            thoughts && thoughts.slice().reverse().map((item, i) => (
              <Thought 
                key={"thought_" + i} 
                fresh={item._creationTime > (Date.now() - 300000)} 
                label={item.description || "Untitled Thought"} 
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

          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
          <Thought 
            label="Hello"
            handleClick={() => {}}
            handleEditClick={(e) => {
              handleThoughtEditOptions(e);
            }}
          />
        </div>
      </div>

      {/* ==== Options Modal ==== */}
      <OptionsModal {...optionsModal} thoughtId={currentThoughtId.current as Id<"thoughts">} />

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
        flex bg-myWhite z-[2] items-center absolute border-t border-myGray bottom-0 left-0 w-full h-[4.5rem] p-[0.9375rem] justify-between">
        {/* not logged in */}
        <ProfileDisplay
          userName={currentUser?.name?.split(" ")[0] || currentUser?.email || "name"}
          accoutType={"Freeloader"} />
        <NoBgButton icon={<LogoutIcon />} handleClick={handleSignout} />
      </div>
    </div>
  )
}