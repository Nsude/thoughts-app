"use client";

import LogoMark from "@/public/LogoMark";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function Logo({collapse}: {collapse?: boolean}) {
  const markRef = useRef(null);

  useGSAP(() => {
    if (!markRef.current) return;
    gsap.to(markRef.current, {
      x: collapse ? 5 : 0,
      duration: .25,
      ease: "power3.out"
    })
  }, {dependencies: [collapse]})

  return (
    <div className="flex items-center gap-x-1.5 ">
      <span ref={markRef}>
        <LogoMark size={18} />
      </span>
      <span 
        style={{opacity: collapse ? 0 : 1}}
        className="text-[1.4rem] cursor-default">thoughts</span>
    </div>
  )
}