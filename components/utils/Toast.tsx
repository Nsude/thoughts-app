"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { easeInOutCubic } from "../buttons/TabButton";

interface Props {
  icon: React.ReactNode;
  msg: string;
  showToast: boolean;
}

export default function Toast({ icon, msg, showToast }: Props) {
  const mainRef = useRef(null);

  useGSAP(() => {
    if (!showToast) return;

    const tl = gsap.timeline({defaults: {ease: easeInOutCubic, duration: .6, delay: 0}});

    tl.set(mainRef.current, {opacity: 1});
    tl.to(mainRef.current, {transform: "translateY(0)"})

    setTimeout(() => {
      tl.to(mainRef.current, { transform: "translateY(-150%)" });
    }, 4000)

  }, {scope: mainRef, dependencies: [showToast]})

  return (
    <div ref={mainRef} className="fixed opacity-0 -translate-y-[150%] pointer-events-none top-[0.75rem] left-[0.75rem] z-1 flex gap-x-2 items-center p-[0.5rem] w-[14.5rem] bg-accent rounded-[0.375rem]">
      <span className="rounded-[0.25rem] bg-myBlack h-[2.5rem] aspect-square flex justify-center items-center">
        {icon}
      </span>
      <span className="w-full text-[0.875rem]">{msg}</span>
    </div>
  )
}