"use client";

import DeleteIcon from "@/public/icons/DeleteIcon";
import ClassicButton from "../buttons/ClassicButton";
import CloseIcon from "@/public/icons/CloseIcon";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

interface Props {
  display: boolean;
  onConfirm: (choice: boolean) => void;
}

export default function ConfirmationModal({display, onConfirm}: Props) {
  const mainRef = useRef(null);

  useGSAP(() => {
    if (!mainRef.current) return;

    gsap.to(mainRef.current, {
      opacity: display ? 1 : 0,
      duration: .4
    })

  }, {scope: mainRef, dependencies: [display]})

  return (
    <div 
      style={{ pointerEvents: display ? "all" : "none" }}
      ref={mainRef} 
      className=" opacity-0
      fixed z-30 left-0 top-0 bg-myWhite/10 backdrop-blur-[5px]
      w-screen h-screen flex justify-center items-center
    ">

      <span 
        className="
        absolute top-1/2 left-1/2 -translate-1/2 bg-border-gray h-[13rem] w-[21.5rem] rounded-[20px] z-[8]" />

      {/* modal */}
      <div 
        className=" relative z-10
        p-[1.25rem] rounded-[20px] w-[24rem] bg-myWhite flex flex-col gap-y-[1.5625rem] border border-border-gray/30
      ">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-y-[0.25rem]">
            <span>Dialogue</span>
            <span className="text-dark-gray-label text-label-small">Confirmation Modal</span>
          </div>

          <ClassicButton 
            icon={<CloseIcon size={24} color="black" />} 
            handleClick={() => onConfirm(false)} />
        </div>

        <span>Did you mean to delete that?</span>
        
        <div className="flex items-center gap-x-[3px]">
          <ClassicButton 
            handleClick={() => onConfirm(true)} 
            text="Yes" 
            icon={<DeleteIcon />} />

          <ClassicButton 
            text="No" 
            icon={<CloseIcon size={24} color="black" />} 
            handleClick={() => onConfirm(false)} />
        </div>
      </div>

    </div>
  )
} 