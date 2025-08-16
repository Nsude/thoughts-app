"use client"

import ClassicButton from "@/components/buttons/ClassicButton";
import TabButton from "@/components/buttons/TabButton";
import LogoIcon from "@/public/icons/LogoIcon";
import MicrophoneIcon from "@/public/icons/MicrophoneIcon";
import PlusIcon from "@/public/icons/PlusIcon";
import TextIcon from "@/public/icons/TextIcon";

export default function ThoughtDocument() {

  return (
    <div className="flex justify-center items-center">
      <div className="relative h-[47.75rem] w-[39.375rem] bg-myWhite border border-border-gray/60 rounded-2xl pt-[4.25rem]">

        {/* Header */}
        <div className="absolute top-0 left-0 w-full px-[1.125rem] h-[4.25rem] flex justify-between items-center">
          <h3 className="text-title text-fade-gray">Core</h3>
          <span className="flex items-center gap-x-1.5">
            <ClassicButton icon={<LogoIcon />} text="Refine" />
            <ClassicButton icon={<PlusIcon />} />
          </span>
        </div>

        {/* Tabs */}
        <div className="absolute bottom-[0.9375rem] left-1/2 -translate-x-1/2">
          <TabButton
            tabIcon1={<MicrophoneIcon />}
            tabIcon2={<TextIcon />}
            handleClick={(tab) => { }}
          />
        </div>

        {/* Suprise Me */}
        <div className="absolute bottom-[1.125rem] right-[1.125rem]">
          <ClassicButton icon={<LogoIcon />} />
        </div>
      </div>
    </div>
  )
}