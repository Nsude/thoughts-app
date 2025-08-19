"use client"

import ClassicButton from "@/components/buttons/ClassicButton";
import TabButton, { easeInOutCubic } from "@/components/buttons/TabButton";
import SlateEditor from "@/components/SlateEditor";
import LogoIcon from "@/public/icons/LogoIcon";
import MicrophoneIcon from "@/public/icons/MicrophoneIcon";
import PlusIcon from "@/public/icons/PlusIcon";
import TextIcon from "@/public/icons/TextIcon";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

export default function ThoughtDocument() {
  const [tab, setTab] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const placeholderRef = useRef(null);

  // switch placeholder depending on selected tab
  useGSAP(() => {
    const con = placeholderRef.current;
    if (!con) return;

    gsap.to(con, {
      yPercent: tab * -150,
      duration: .4,
      ease: easeInOutCubic
    })

  }, {dependencies: [tab]})

  return (
    <div>
      <div className="relative">
        <span 
        className="absolute z-0 h-[47.75rem] w-[37.125rem] rounded-2xl bg-[#DCDCDC] -top-[0.8125rem] left-[1.125rem]" />
        <span 
        className="absolute -z-1 h-[47.75rem] w-[34.875rem] rounded-2xl bg-[#C9C9C9] -top-[1.625rem] left-[2.25rem]" />
      </div>

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

          {/* ===== BODY ===== */}
          <div className="relative my-slateContainer px-[1.125rem] mt-[2rem] w-full overflow-clip">
            {/* Placeholder msg */}

            <div className="absolute w-full overflow-clip" 
            style={{
              pointerEvents: isEmpty ? "all" : 'none',
              opacity: isEmpty ? "1" : '0'
              }}>
              <div ref={placeholderRef} className=" relative flex flex-col">
                <span className="text-fade-gray"> Let's hear it... </span>
                <span className="text-fade-gray absolute -bottom-[150%]"> Write or type '/' for commands... </span>
              </div>
            </div>

            <SlateEditor 
              handleClick={() => setTab(1)} 
              handleValueChange={
                (value) => {
                  value[0].children[0].text.trim() === "" ? setIsEmpty(true) : setIsEmpty(false);
                }
              } />

          </div>

          {/* Tabs */}
          <div className="absolute bottom-[0.9375rem] left-1/2 -translate-x-1/2">
            <TabButton
              tabIcon1={<MicrophoneIcon />}
              tabIcon2={<TextIcon />}
              handleClick={(tab) => setTab(tab)}
              preselectTab={tab}
            />
          </div>

          {/* Suprise Me */}
          <div className="absolute bottom-[1.125rem] right-[1.125rem]">
            <ClassicButton icon={<LogoIcon />} />
          </div>
        </div>
      </div>
    </div>
  )
}