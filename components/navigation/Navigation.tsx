"use client";

import NoBgButton from "../buttons/NoBgButton";
import SearchIcon from "@/public/icons/SearchIcon";
import DbArrowLeft from "@/public/icons/DbArrowLeft";
import TabButton from "../buttons/TabButton";
import Logo from "../Logo";
import NavMenuItem from "./NavMenuItem";
import NewThoughtIcon from "@/public/icons/NewThoughtIcon";
import ExploreIcon from "@/public/icons/ExploreIcon";
import Thought from "./Thought";
import ClassicButton from "../buttons/ClassicButton";
import SettingsIcon from "@/public/icons/SettingsIcon";
import ProfileDisplay from "./ProfileDisplay";

export default function Naviation() {
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
        />
      </div>

      {/* Menu Items */}
      <div className="flex flex-col w-full my-[2.5rem]">
        <NavMenuItem icon={<NewThoughtIcon />} label="New Thought" />
        <NavMenuItem icon={<ExploreIcon />} label="Explore" />
      </div>

      {/* Thoughts */}
      <div className="w-full h-[38.5%]">
        <span className="block mb-[0.75rem] opacity-40">Your Thoughts</span>
        <div className="flex flex-col h-[90%] overflow-y-scroll snap-y slim-scrollbar">
          <Thought label="Stake start-up idea that sucks like your code" fresh={true} />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
          <Thought label="Stake start-up idea that sucks like your code" />
        </div>
      </div>

      {/* Thoughts */}
      <div className="w-full h-[14%] mt-[2.5rem]">
        <span className="block mb-[0.75rem] opacity-40">Collaborations</span>
        <div className="flex flex-col h-[95%] overflow-y-scroll snap-y slim-scrollbar reduce-sb-height">
          <Thought label="Dressing old apps as new" />
          <Thought label="Create minimal roadmaps" />
          <Thought label="Create minimal roadmaps" />
          <Thought label="Create minimal roadmaps" />
          <Thought label="Create minimal roadmaps" />
          <Thought label="Create minimal roadmaps" />
        </div>
      </div>

      {/* profile */}
      <div className="flex bg-myWhite z-[2] items-center absolute border-t border-myGray bottom-0 left-0 w-full h-[4.5rem] p-[0.9375rem] justify-between">
        {/* not logged in */}
        <ProfileDisplay userName="Meshach" accoutType={"Freeloader"} />
        <NoBgButton icon={<SettingsIcon />} />
      </div>
    </div>
  )
}