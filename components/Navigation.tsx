"use client";

import LogoMark from "@/public/LogoMark";
import NoBgButton from "./buttons/NoBgButton";
import SearchIcon from "@/public/icons/SearchIcon";
import DbArrowLeft from "@/public/icons/DbArrowLeft";
import TabButton from "./buttons/TabButton";

export default function Naviation() {
  return (
    <div className="w-full h-full">
      {/* search & logo */}
      <div className="flex w-full h-fit justify-between items-center mb-[1.75rem]">
        <div className="flex items-center gap-x-1.5 ">
          <LogoMark size={18} />
          <span className="text-[1.4rem] cursor-default">thoughts</span>
        </div>

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

      {/* profile */}
      <div className="flex justify-center items-center absolute border-t border-myGray bottom-0 left-0 w-full h-[4.5rem]">
        profile/settings
      </div>
    </div>
  )
}