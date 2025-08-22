"use client";

import { useSlate } from "slate-react";
import { myElements } from "./myElements";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

interface Props {
  navHeight: number;
  display: boolean;
  closeMenu: () => void;
}

export default function ElementsMenu({navHeight, display, closeMenu}: Props) {
  const editor = useSlate();
  const mainRef = useRef(null);

  useGSAP(() => {
    if (!mainRef.current) return;
    const main = mainRef.current as HTMLDivElement;

    if (display) {
      gsap.set(main, {pointerEvents: "all"});

      gsap.to(main, {
        opacity: 1,
        duration: .2
      })
    } else {
      gsap.set(main, {pointerEvents: "none"});

      gsap.to(main, {
        opacity: 0,
        duration: .2
      })
    }

  }, { scope: mainRef, dependencies: [display]})

  return (
    <div 
      ref={mainRef}
      style={{top: (navHeight + 5) + "px"}}
      className={`
        absolute right-0 w-[13.625rem] bg-dark-gray border-2 border-border-gray
        rounded-[12px] p-[0.75rem] text-myWhite text-label-14 opacity-0 pointer-events-none
      `}
      >
      <span className="text-dark-gray-label block mb-[0.5rem]">Switch to</span>
      <div className="flex flex-col">
        {
          myElements.map(({name, handleClick, shortCutLabel, icon: Icon}, i) => (
            <button 
              key={name + '-' + i}
              className="
                relative w-full text-left flex items-center h-[1.875rem]
                gap-x-1.5 hover:bg-dark-gray-hover pl-1 rounded-[6px]
              "
              onClick={() => {
                handleClick(editor);
                closeMenu();
              }} >
                <Icon small={true} />
                <span>{name}</span>
                { shortCutLabel &&
                  <span className="absolute text-[0.625rem] text-dark-gray-label right-1.5 top-1/2 -translate-y-1/2">
                    {shortCutLabel}
                  </span>
                }
            </button>
          ))
        }
      </div>
    </div>
  )
}