"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { easeInOutCubic } from "../buttons/TabButton";
import SadFaceIcon from "@/public/icons/SadFaceIcon";
import HappyFaceIcon from "@/public/icons/HappyFaceIcon";
import { useToastContext } from "../contexts/ToastContext";

export default function Toast() {
  const {toast, toggleToast} = useToastContext();
  const mainRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: easeInOutCubic, duration: .4, delay: 0 } });

    tl.to(mainRef.current, { 
      transform: toast.showToast ? "translateY(0)" : "translateY(-150%)"
    })

  }, { scope: mainRef, dependencies: [toast.showToast] })

  const getToastMessage = () => {
    if (toast.isError) {
      return !toast.msg ?  
        "Something went wrong, please try again"
        : toast.msg;
    } else {
      return !toast.msg ?
        "Deleted items are farther than they appear"
        : toast.msg;
    }
  }

  const getToastTitle = () => {
    if (toast.isError) {
      return toast.title.trim() === "" ?  
        "Platform Error"
        : toast.title;
    } else {
      return toast.title.trim() === "" ?
        "Action Successful"
        : toast.title;
    }
  }

  return (
    <div
      ref={mainRef}
      className={`fixed right-[0.75rem] top-[0.75rem] rounded-[10px] 
        text-label-14 border-x-4 bg-myWhite border border-tab-gray
        z-[60] w-[17.5rem] py-[0.9375rem] px-[0.625rem] translate-y-[-150%]
        ${toast.isError ? "border-x-accent" : "border-x-sec-accent"} `}>
      <div className="flex gap-x-[0.625rem]">
        <div
          className={`min-w-[2.25rem] h-[2.25rem] rounded-[6px]
              ${toast.isError ? "bg-accent/20" : "bg-sec-accent/20"}
              flex justify-center items-center
            `} >
          {toast.isError ? <SadFaceIcon /> : <HappyFaceIcon />}
        </div>
        <div className="flex flex-col gap-y-1.5">
          <span className="text-dark-gray-label">{ getToastTitle() }</span>

          {/* toast message */}
          <span className="w-[87%]">{ getToastMessage() }</span>

          <button 
            onClick={() => toggleToast(false)}
            className="hidden md:block w-fit mt-[0.5625rem] border border-tab-gray rounded-[20px] 
              px-[0.8rem] py-0.5">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}