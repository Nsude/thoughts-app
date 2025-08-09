"use client";

import NoBgButton from "../buttons/NoBgButton";
import SearchIcon from "@/public/icons/SearchIcon";
import DbArrowLeft from "@/public/icons/DbArrowLeft";
import TabButton from "../buttons/TabButton";
import Logo from "../Logo";
import NavMenuItem from "./NavMenuItem";
import NewThoughtIcon from "@/public/icons/NewThoughtIcon";
import ExploreIcon from "@/public/icons/ExploreIcon";

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
      <div className="flex flex-col w-full mt-[2.5rem]">
        <NavMenuItem icon={<NewThoughtIcon />} label="New Thought" />
        <NavMenuItem icon={<ExploreIcon />} label="Explore" />
      </div>

      {/* profile */}
      <div className="flex justify-center items-center absolute border-t border-myGray bottom-0 left-0 w-full h-[4.5rem]">
        profile/settings
      </div>
    </div>
  )
}