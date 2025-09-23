"use client";

import { useSlate } from "slate-react";
import { myElements } from "./myElements";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import LogoIcon from "@/public/icons/LogoIcon";

interface Props {
  navHeight?: number;
  display: boolean;
  closeMenu: () => void;
  variant: "navbar" | "extended";
}

export default function ElementsMenu({ navHeight, display, closeMenu, variant }: Props) {
  const editor = useSlate();
  const mainRef = useRef(null);
  const isExtended = variant === "extended";

  useGSAP(() => {
    if (!mainRef.current) return;
    const main = mainRef.current as HTMLDivElement;

    if (display) {
      gsap.set(main, { pointerEvents: "all" });

      gsap.to(main, {
        opacity: 1,
        duration: .2
      })
    } else {
      gsap.set(main, { pointerEvents: "none" });

      gsap.to(main, {
        opacity: 0,
        duration: .2
      })
    }

  }, { scope: mainRef, dependencies: [display] })

  return (
    <div
      ref={mainRef}
      style={{ top: navHeight ? (navHeight + 5) + "px" : '' }}
      className={`
        ${isExtended ? "w-[15.25rem] relative h-[18.4rem] py-[0.75rem]" : 'absolute w-[12rem] p-[0.75rem]'}
        right-0 bg-dark-gray border-2 border-border-gray
        rounded-[12px] text-myWhite text-label-14 opacity-0 pointer-events-none overflow-clip
      `}
    >
      <span className={`${isExtended ? "px-[0.75rem]" : ""} text-label-small text-dark-gray-label block mb-[0.5rem]`}>
        {isExtended ? "Thoughts AI" : "Switch to"}
      </span>

      {/* ===== Random Thought label ===== */}
      {
        isExtended ?
          <div className="px-[0.75rem]">
            <button className="w-full text-left flex items-center h-[1.875rem]
                gap-x-1 hover:bg-dark-gray-hover rounded-[6px] mb-[0.75rem]">
              <LogoIcon color="#fff" />
              <span>Random Thought</span>
            </button>
            <span className="block w-full h-[1px] bg-dark-gray-fg" />
          </div> : null
      }

      <div className={`
          ${isExtended ?
          "h-full pb-[6rem] overflow-y-scroll overflow-x-clip pt-[0.75rem] px-[0.75rem]"
          : ""}
          flex flex-col gap-y-0 
        `}>

        {/* ===== Blocks ===== */}
        {
          isExtended &&
          <span className="text-label-small text-dark-gray-label block mb-[0.5rem]">
            Blocks
          </span>
        }

        {
          myElements.map(({ name, handleClick, shortCutLabel, icon: Icon }, i) => (
            <button
              key={name + '-' + i}
              className="
                relative w-full text-left flex items-center min-h-[1.875rem]
                gap-x-1.5 hover:bg-dark-gray-hover pl-1 rounded-[6px]
              "
              onClick={() => {
                handleClick(editor);
                closeMenu();
              }} >
              <Icon small={true} />
              <span>{name}</span>
              {isExtended && shortCutLabel ?
                <span className="absolute text-[0.625rem] text-dark-gray-label right-1.5 top-1/2 -translate-y-1/2">
                  {shortCutLabel}
                </span> : null
              }
            </button>
          ))
        }
      </div>

      {
        isExtended &&
        <div className="absolute z-1 left-0 w-full bottom-0 h-[2.25rem] bg-dark-gray border-t border-t-dark-gray-fg px-[0.75rem] flex items-center">
          <button
            className="
                relative w-full text-left flex items-center min-h-[1.5rem]
                gap-x-1.5 hover:bg-dark-gray-hover rounded-[5px] pl-1
              "
            onClick={() => {
              closeMenu();
            }} >
            <span className="text-label-small text-dark-gray-label">{`type "/" instead`}</span>
            <span className="absolute text-[0.625rem] text-dark-gray-label right-1.5 top-1/2 -translate-y-1/2">
              ecs
            </span>
          </button>
        </div>
      }
    </div>
  )
}