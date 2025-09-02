"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ThoughtId, User, Version } from "../app.models";
import VersionItem from "./VersionItem";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { easeInOutCubic } from "../buttons/TabButton";

export default function Versions() {
  const [selected, setSelected] = useState<Id<"versions">>("" as Id<"versions">);
  const [indicatorPos, setIndicatorPos] = useState({y: 0});
  const spanRef = useRef(null);
  const mainRef = useRef(null);
  
  // convex query
  const thoughtVersions = false;

  const handleVersionClick = (e: React.MouseEvent, id: Id<"versions">) => {
    setSelected(id);
    const target = e.target as HTMLElement;
    const main = mainRef.current ? mainRef.current as HTMLSpanElement : null; 
    
    if (!main) return;

    const {top: targetTop} = target.getBoundingClientRect();
    const {top: mainTop} = main.getBoundingClientRect();
    
    setIndicatorPos({y: targetTop - mainTop});
  }

  useGSAP(() => {
    const indicator = spanRef.current;
    if (!indicator) return;

    gsap.to(spanRef.current, {
      top: `${indicatorPos.y}px`,
      duration: .4,
      ease: easeInOutCubic
    })

  }, {scope: mainRef, dependencies: [indicatorPos]})

  if (!thoughtVersions) return null;

  return (
    <div ref={mainRef} className="relative pr-[2rem] flex items-center justify-between gap-x-3">
      {/* ==== Versions ==== */}
      <div className="flex flex-col gap-y-[0.9375rem] items-end h-fit">
        
      </div>

      <div className="absolute top-0 right-0 w-[3px] h-full bg-border-gray rounded-3xls">
        <span ref={spanRef}
          className="absolute top-0 bg-myBlack w-full block h-[2.5rem]" />
      </div>
    </div>
  )
}