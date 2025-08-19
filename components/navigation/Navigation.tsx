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
import { useRouter } from "next/navigation";

export default function Naviation() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const signOut = useAction(api.auth.signOut);
  const router = useRouter();

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
          tab1="Public"
          tab2="Private"
          handleClick={(tab) => {}}
        />
      </div>

      {/* Menu Items */}
      <div className="flex flex-col w-full my-[2.5rem]">
        <NavMenuItem icon={<NewThoughtIcon />} label="New Thought" />
        <NavMenuItem icon={<ExploreIcon />} label="Explore" />
      </div>

      {/* Thoughts */}
      <div className="w-full max-h-[38.5%]">
        <span className="block mb-[0.75rem] text-fade-gray">Your Thoughts</span>
        <div className="flex flex-col h-[90%] overflow-y-scroll snap-y slim-scrollbar">
          {/* Thoughts go here */}
        </div>
      </div>

      {/* Thoughts */}
      <div className="w-full max-h-[14%] mt-[2.5rem]">
        <span className="block mb-[0.75rem] text-fade-gray">Shared</span>
        <div className="flex flex-col h-[95%] overflow-y-scroll snap-y slim-scrollbar reduce-sb-height">
          {/* Thoughts go here */}
        </div>
      </div>

      {/* profile */}
      <div className="flex bg-myWhite z-[2] items-center absolute border-t border-myGray bottom-0 left-0 w-full h-[4.5rem] p-[0.9375rem] justify-between">
        {/* not logged in */}
        <ProfileDisplay 
          userName={currentUser?.name || currentUser?.email || "name"} 
          accoutType={"Freeloader"} />
        <NoBgButton icon={<LogoutIcon />} handleClick={handleSignout} />
      </div>
    </div>
  )
}