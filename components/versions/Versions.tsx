"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ThoughtId, User, Version } from "../app.models";
import VersionItem from "./VersionItem";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { easeInOutCubic } from "../buttons/TabButton";

const versionPlaceHolder:Version = {
  _id: "12347" as Id<"versions">,
  _creationTime: Date.now(),
  updatedThought: "shld" as Id<"thought_documents">,
  isCore: true,
  versionNumber: 1,
  thoughtId: "ss" as ThoughtId,
  changeLabel: "Heavy",
  updatedAt: Date.now(),
  modifiedBy: "" as Id<"users">
}

export default function Versions() {
  const [selected, setSelected] = useState<Id<"versions">>("" as Id<"versions">);
  const [indicatorPos, setIndicatorPos] = useState({y: 0});
  const spanRef = useRef(null);
  const mainRef = useRef(null);

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
      top: `${indicatorPos.y - 4}px`,
      duration: .4,
      ease: easeInOutCubic
    })

  }, {scope: mainRef, dependencies: [indicatorPos]})

  return (
    <div ref={mainRef} className="relative pr-[2rem] flex items-center justify-between gap-x-3">
      <div className="flex flex-col gap-y-[0.9375rem] items-end h-fit">
        <VersionItem 
          key={"dhlaldfla"}
          version={versionPlaceHolder} 
          selectedVersion={selected} 
          handleClick={handleVersionClick} />

        <VersionItem 
          key={"duaohfal"}
        version={{...versionPlaceHolder, isCore: 
        false, versionNumber: 2, changeLabel: "Light", _id: "12356" as Id<"versions">}} 
          selectedVersion={selected}
          handleClick={handleVersionClick}/>

        <VersionItem 
          key={"doufowaeoh"}
          version={{...versionPlaceHolder, isCore: false, 
          versionNumber: 3, changeLabel: "Heavy", _id: "12eh6" as Id<"versions">}} 
          selectedVersion={selected}
          handleClick={handleVersionClick} />

        <VersionItem
          key={"douehfalhd"} 
          version={{...versionPlaceHolder, isCore: false, 
          versionNumber: 4, changeLabel: "Light", _id: "1sflsh56" as Id<"versions">}} 
          selectedVersion={selected}
          handleClick={handleVersionClick} />

        <VersionItem 
          key={"dkhuoshs"}
          version={{...versionPlaceHolder, isCore: false, 
          versionNumber: 5, changeLabel: "Mid", _id: "nvlah12356" as Id<"versions">}} 
          selectedVersion={selected}
          handleClick={handleVersionClick} />

        <VersionItem 
          key={"dahdkbadd"}
          version={{...versionPlaceHolder, isCore: false, 
          versionNumber: 6, changeLabel: "Heavy", _id: "dhkshaldfa6" as Id<"versions">}} 
          selectedVersion={selected}
          handleClick={handleVersionClick} />

        <VersionItem 
          key={"dhlsdadiwoweoiw"}
          version={{...versionPlaceHolder, isCore: false, 
          versionNumber: 7, changeLabel: "Light", _id: "dhsakfhfgheoia" as Id<"versions">}} 
          selectedVersion={selected}
          handleClick={handleVersionClick} />
      </div>

      <div className="absolute top-0 right-0 w-[3px] h-full bg-border-gray rounded-3xls">
        <span ref={spanRef}
          className="absolute top-0 bg-myBlack w-full block h-[2.5rem]" />
      </div>
    </div>
  )
}